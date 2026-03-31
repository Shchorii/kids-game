// api/words.js — word management stored in Vercel KV

import { kv } from '@vercel/kv'

const KEY = 'words:all'

// Default starter words for first run
const DEFAULT_WORDS = [
  { id: '1', word_plain: 'בית', level: 1, active: true },
  { id: '2', word_plain: 'ילד', level: 1, active: true },
  { id: '3', word_plain: 'ספר', level: 1, active: true },
  { id: '4', word_plain: 'כלב', level: 1, active: true },
  { id: '5', word_plain: 'חתול', level: 2, active: true },
  { id: '6', word_plain: 'עפרון', level: 2, active: true },
  { id: '7', word_plain: 'שולחן', level: 2, active: true },
  { id: '8', word_plain: 'מחברת', level: 2, active: true },
  { id: '9', word_plain: 'מכונית', level: 3, active: true },
  { id: '10', word_plain: 'אופניים', level: 3, active: true },
  { id: '11', word_plain: 'רכבת', level: 3, active: true },
  { id: '12', word_plain: 'ילדה', level: 1, active: true },
  { id: '13', word_plain: 'אמא', level: 1, active: true },
  { id: '14', word_plain: 'אבא', level: 1, active: true },
  { id: '15', word_plain: 'שמש', level: 1, active: true },
]

async function getWords() {
  try {
    const words = await kv.get(KEY)
    if (!words) {
      await kv.set(KEY, DEFAULT_WORDS)
      return DEFAULT_WORDS
    }
    return words
  } catch {
    return DEFAULT_WORDS
  }
}

async function setWords(words) {
  await kv.set(KEY, words)
}

export default async function handler(req, res) {
  // GET /api/words
  if (req.method === 'GET') {
    const words = await getWords()
    return res.status(200).json(words)
  }

  // POST /api/words
  if (req.method === 'POST') {
    const { word_plain, word_niqqud, level, active = true } = req.body || {}
    if (!word_plain) return res.status(400).json({ error: 'word_plain required' })

    const words = await getWords()
    const newWord = {
      id: Date.now().toString(),
      word_plain: word_plain.trim(),
      word_niqqud: word_niqqud?.trim() || null,
      level: level || 1,
      active,
      created_at: new Date().toISOString(),
    }
    words.push(newWord)
    await setWords(words)
    return res.status(201).json(newWord)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
