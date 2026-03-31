// api/progress.js

import { kv } from '@vercel/kv'

function key(name) {
  return `progress:${name.toLowerCase().trim()}`
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { name } = req.query
    if (!name) return res.status(400).json({ error: 'name required' })
    const data = (await kv.get(key(name))) || {
      name,
      stars: 0,
      words_completed: 0,
      math_stars: 0,
    }
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { name, ...updates } = req.body || {}
    if (!name) return res.status(400).json({ error: 'name required' })
    const existing = (await kv.get(key(name))) || { name, stars: 0, words_completed: 0, math_stars: 0 }
    const updated = { ...existing, ...updates, name }
    await kv.set(key(name), updated)
    return res.status(200).json(updated)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
