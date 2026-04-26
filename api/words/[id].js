// api/words/[id].js — update or delete a single word

import { kv } from '../_lib/redis.js'

const KEY = 'words:custom'

export default async function handler(req, res) {
  const { id } = req.query

  const words = (await kv.get(KEY)) || []

  if (req.method === 'PATCH') {
    const idx = words.findIndex((w) => w.id === id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    words[idx] = { ...words[idx], ...req.body }
    await kv.set(KEY, words)
    return res.status(200).json(words[idx])
  }

  if (req.method === 'DELETE') {
    const filtered = words.filter((w) => w.id !== id)
    await kv.set(KEY, filtered)
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
