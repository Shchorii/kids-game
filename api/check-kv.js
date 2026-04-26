// api/check-kv.js — diagnostic, will remove after fix verified
import { kv } from './_lib/redis.js'

export default async function handler(req, res) {
  try {
    const pong = await kv.ping()
    // Test a write/read round-trip
    const testKey = '_diagnostic_check'
    const testVal = { ts: Date.now(), source: 'check-kv' }
    await kv.set(testKey, testVal)
    const readBack = await kv.get(testKey)
    await kv.del(testKey)
    return res.status(200).json({
      ok: true,
      ping: pong,
      write_read_roundtrip: readBack,
      backend: 'github-contents',
      repo: process.env.STORAGE_REPO || '(not set)',
    })
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: String(err?.message || err),
      backend: 'github-contents',
      repo: process.env.STORAGE_REPO || '(not set)',
      has_token: !!process.env.STORAGE_TOKEN,
    })
  }
}
