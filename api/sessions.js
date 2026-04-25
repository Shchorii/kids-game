// api/sessions.js — save & retrieve math sessions

import { kv } from './_lib/redis.js'

function key(name) {
  return `sessions:${name.toLowerCase().trim()}`
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { name } = req.query
    if (!name) return res.status(400).json([])
    const sessions = (await kv.get(key(name))) || []
    return res.status(200).json(sessions)
  }

  if (req.method === 'POST') {
    const { name, session } = req.body || {}
    if (!name || !session) return res.status(400).json({ error: 'name and session required' })
    const sessions = (await kv.get(key(name))) || []
    const newSession = { ...session, id: Date.now().toString(), created_at: new Date().toISOString() }
    sessions.unshift(newSession) // newest first
    if (sessions.length > 50) sessions.splice(50) // keep last 50
    await kv.set(key(name), sessions)
    return res.status(201).json(newSession)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
