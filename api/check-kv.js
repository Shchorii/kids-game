// api/check-kv.js — diagnostic, will remove
import { Redis } from '@upstash/redis'

export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL || ''
  try {
    const redis = new Redis({ url, token: process.env.KV_REST_API_TOKEN })
    const pong = await redis.ping()
    return res.status(200).json({ ok: true, host: url.replace('https://', ''), ping: pong })
  } catch (err) {
    return res.status(500).json({
      ok: false,
      host: url.replace('https://', ''),
      error: String(err?.message || err),
      cause: String(err?.cause?.message || err?.cause || ''),
    })
  }
}
