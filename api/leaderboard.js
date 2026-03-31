// api/leaderboard.js

import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // Scan all session keys
    const keys = await kv.keys('sessions:*')
    const playerStats = []

    for (const k of keys) {
      const sessions = (await kv.get(k)) || []
      if (sessions.length === 0) continue
      const name = sessions[0]?.child_name || k.replace('sessions:', '')
      const totalStars = sessions.reduce((s, ss) => s + (ss.stars_earned || 0), 0)
      const totalCorrect = sessions.reduce((s, ss) => s + (ss.correct_answers || 0), 0)
      const maxStreak = Math.max(...sessions.map((ss) => ss.max_streak || 0), 0)
      playerStats.push({ name, totalStars, totalCorrect, maxStreak, sessions: sessions.length })
    }

    playerStats.sort((a, b) => b.totalStars - a.totalStars)
    return res.status(200).json(playerStats.slice(0, 10))
  } catch (err) {
    console.error('Leaderboard error:', err)
    return res.status(200).json([])
  }
}
