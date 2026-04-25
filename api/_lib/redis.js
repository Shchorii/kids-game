// api/_lib/redis.js — shared Upstash Redis client
// Migrated from @vercel/kv (deprecated after Upstash marketplace migration)
// Wire-compatible: both libs use the same JSON serialization on set/get.
import { Redis } from '@upstash/redis'

export const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})
