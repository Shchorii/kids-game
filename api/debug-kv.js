// api/_debug-kv.js — temporary diagnostic endpoint, will remove after fix
import { Redis } from '@upstash/redis'

export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL || ''
  const token = process.env.KV_REST_API_TOKEN || ''
  const out = {
    has_url: !!url,
    url_prefix: url.slice(0, 40),
    url_length: url.length,
    has_token: !!token,
    token_length: token.length,
    other_kv_envs: Object.keys(process.env).filter((k) => k.includes('KV') || k.includes('UPSTASH') || k.includes('REDIS')),
  }
  try {
    const redis = new Redis({ url, token })
    const pong = await redis.ping()
    out.ping = pong
  } catch (err) {
    out.error = String(err?.message || err)
    out.error_cause = String(err?.cause?.message || err?.cause || '')
  }
  return res.status(200).json(out)
}
