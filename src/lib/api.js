// src/lib/api.js — client-side wrappers for our Vercel API routes

const BASE = '/api'

// ── Words ──────────────────────────────────────────────────────────────────

export async function getWords(grade, level) {
  const params = new URLSearchParams(); if (grade) params.set('grade', grade); if (level) params.set('level', level); const res = await fetch(`${BASE}/words?${params}`)
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

// ── Azure TTS — he-IL-HilaNeural via server, with browser fallback ──
const _audioCache = {}

export async function speakHebrew(text, { onStart, onEnd } = {}) {
  const cacheKey = `azure:${text}`
  try {
    onStart?.()
    // Check cache
    if (_audioCache[cacheKey]) {
      const audio = new Audio(_audioCache[cacheKey])
      audio.onended = () => onEnd?.()
      audio.onerror = () => { _fallback(text, onEnd) }
      return audio.play()
    }
    // Call Azure TTS via server
    const res = await fetch(`${BASE}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) throw new Error('TTS API error')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    _audioCache[cacheKey] = url
    const audio = new Audio(url)
    audio.onended = () => onEnd?.()
    audio.onerror = () => { onEnd?.(); _fallback(text, onEnd) }
    audio.play()
  } catch {
    _fallback(text, onEnd)
  }
}

function _fallback(text, onEnd) {
  // Browser Speech API fallback if Azure fails
  if (!('speechSynthesis' in window)) { onEnd?.(); return }
  speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'he-IL'; utt.rate = 0.85
  const voices = speechSynthesis.getVoices()
  const voice = voices.find(v => v.name === 'Carmit') || voices.find(v => v.lang.startsWith('he'))
  if (voice) utt.voice = voice
  utt.onend = () => onEnd?.()
  speechSynthesis.speak(utt)
}
