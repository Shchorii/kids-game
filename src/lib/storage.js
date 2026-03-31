// src/lib/storage.js — localStorage helpers

const NAME_KEY = 'kids_game_child_name'

export function getSavedName() {
  try { return localStorage.getItem(NAME_KEY) || '' }
  catch { return '' }
}

export function saveName(name) {
  try { localStorage.setItem(NAME_KEY, name) }
  catch {}
}

export function clearName() {
  try { localStorage.removeItem(NAME_KEY) }
  catch {}
}

// Audio cache — store base64 blobs in memory (per-session)
const _audioCache = new Map()

export function getCachedAudio(key) {
  return _audioCache.get(key) || null
}

export function setCachedAudio(key, url) {
  _audioCache.set(key, url)
}
