// src/lib/api.js — client-side wrappers for our Vercel API routes

const BASE = '/api'

// ── Words ──────────────────────────────────────────────────────────────────

export async function getWords() {
  const res = await fetch(`${BASE}/words`)
  if (!res.ok) throw new Error('Failed to fetch words')
  return res.json()
}

export async function addWord(wordData) {
  const res = await fetch(`${BASE}/words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wordData),
  })
  if (!res.ok) throw new Error('Failed to add word')
  return res.json()
}

export async function updateWord(id, changes) {
  const res = await fetch(`${BASE}/words/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  })
  if (!res.ok) throw new Error('Failed to update word')
  return res.json()
}

export async function deleteWord(id) {
  const res = await fetch(`${BASE}/words/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete word')
}

// ── Progress ───────────────────────────────────────────────────────────────

export async function getProgress(name) {
  const res = await fetch(`${BASE}/progress?name=${encodeURIComponent(name)}`)
  if (!res.ok) return null
  return res.json()
}

export async function saveProgress(name, data) {
  const res = await fetch(`${BASE}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, ...data }),
  })
  if (!res.ok) throw new Error('Failed to save progress')
  return res.json()
}

// ── Math sessions ──────────────────────────────────────────────────────────

export async function saveMathSession(name, session) {
  const res = await fetch(`${BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, session }),
  })
  if (!res.ok) throw new Error('Failed to save session')
  return res.json()
}

export async function getMathSessions(name) {
  const res = await fetch(`${BASE}/sessions?name=${encodeURIComponent(name)}`)
  if (!res.ok) return []
  return res.json()
}

export async function getLeaderboard() {
  const res = await fetch(`${BASE}/leaderboard`)
  if (!res.ok) return []
  return res.json()
}

// ── TTS ───────────────────────────────────────────────────────────────────

export async function textToSpeech(text) {
  const res = await fetch(`${BASE}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error('TTS failed')
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}
