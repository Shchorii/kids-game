// api/_lib/redis.js — GitHub-as-KV storage backend
//
// Replaces @upstash/redis after the original Upstash store was archived for
// inactivity. Stores the entire KV map as a single JSON file in a private
// GitHub repo (Shchorii/kids-game-storage), accessed via the Contents API.
//
// Wire-compatible subset of @upstash/redis: kv.get(key), kv.set(key, value),
// kv.del(key), kv.keys(pattern). Sufficient for everything api/* uses.
//
// Trade-offs: ~1-2s writes (GitHub commit), 5000 req/hr rate limit. Fine for
// Lenny's scale (<100 ops/day). All writes go to a single file with optimistic
// concurrency via SHA — so concurrent writers retry once on 409.

const REPO = process.env.STORAGE_REPO || 'Shchorii/kids-game-storage'
const FILE = 'kv.json'
const TOKEN = process.env.STORAGE_TOKEN
const BRANCH = 'main'
const API = `https://api.github.com/repos/${REPO}/contents/${FILE}`

async function readAll() {
  const res = await fetch(`${API}?ref=${BRANCH}&_=${Date.now()}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Cache-Control': 'no-cache',
    },
  })
  if (!res.ok) {
    if (res.status === 404) return { data: {}, sha: null }
    throw new Error(`GitHub read failed: ${res.status} ${await res.text()}`)
  }
  const json = await res.json()
  const content = Buffer.from(json.content, 'base64').toString('utf-8').trim()
  let data = {}
  try { data = content ? JSON.parse(content) : {} } catch { data = {} }
  return { data, sha: json.sha }
}

async function writeAll(data, sha) {
  const body = {
    message: `kv update ${new Date().toISOString()}`,
    content: Buffer.from(JSON.stringify(data, null, 0)).toString('base64'),
    branch: BRANCH,
  }
  if (sha) body.sha = sha
  const res = await fetch(API, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub write failed: ${res.status} ${err}`)
  }
  return res.json()
}

export const kv = {
  async get(key) {
    const { data } = await readAll()
    return data[key] ?? null
  },

  async set(key, value) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { data, sha } = await readAll()
        data[key] = value
        await writeAll(data, sha)
        return 'OK'
      } catch (err) {
        const isConflict = String(err.message).includes('409') || String(err.message).includes('422')
        if (attempt === 2 || !isConflict) throw err
        await new Promise((r) => setTimeout(r, 200 * (attempt + 1)))
      }
    }
  },

  async del(key) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { data, sha } = await readAll()
        if (!(key in data)) return 0
        delete data[key]
        await writeAll(data, sha)
        return 1
      } catch (err) {
        const isConflict = String(err.message).includes('409') || String(err.message).includes('422')
        if (attempt === 2 || !isConflict) throw err
        await new Promise((r) => setTimeout(r, 200 * (attempt + 1)))
      }
    }
  },

  async keys(pattern = '*') {
    const { data } = await readAll()
    const allKeys = Object.keys(data)
    if (pattern === '*' || !pattern) return allKeys
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1)
      return allKeys.filter((k) => k.startsWith(prefix))
    }
    return allKeys.filter((k) => k === pattern)
  },

  async ping() {
    const { data } = await readAll()
    return `OK (${Object.keys(data).length} keys)`
  },
}
