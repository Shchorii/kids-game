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

// ── Browser Speech API — uses Apple Carmit on Mac/iPhone, free & high quality ──
export function speakHebrew(text, { rate = 0.85, onStart, onEnd } = {}) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) { reject(new Error('not supported')); return }
    speechSynthesis.cancel()

    const doSpeak = () => {
      const voices = speechSynthesis.getVoices()
      // Priority: Carmit (Apple HQ Hebrew) → any he-IL → any Hebrew
      const voice =
        voices.find(v => v.name === 'Carmit') ||
        voices.find(v => v.lang === 'he-IL' || v.lang === 'he_IL') ||
        voices.find(v => v.lang.startsWith('he'))

      const utt = new SpeechSynthesisUtterance(text)
      utt.lang  = 'he-IL'
      utt.rate  = rate
      utt.pitch = 1.05
      if (voice) utt.voice = voice
      utt.onstart = () => onStart?.()
      utt.onend   = () => { resolve(); onEnd?.() }
      utt.onerror = (e) => { resolve(); onEnd?.() } // never crash
      speechSynthesis.speak(utt)
    }

    if (speechSynthesis.getVoices().length > 0) {
      doSpeak()
    } else {
      speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true })
      setTimeout(doSpeak, 800) // fallback if event never fires
    }
  })
}
