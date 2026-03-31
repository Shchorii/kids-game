// src/lib/hebrew.js

export const norm = (s) => (s ?? '').normalize('NFC')

export function splitGraphemes(text) {
  if (!text) return []
  const seg = new Intl.Segmenter('he', { granularity: 'grapheme' })
  return Array.from(seg.segment(norm(text)), (s) => s.segment)
}

export const stripNiqqud = (s) => norm(s).replace(/[\u0591-\u05C7]/g, '')

// Hebrew alphabet without final forms (for distractor generation)
export const HEBREW_LETTERS = splitGraphemes('אבגדהוזחטיכלמנסעפצקרשת')

// Auto-compute difficulty from word length
export function wordLevel(word) {
  const len = (word || '').replace(/[\u0591-\u05C7]/g, '').length
  if (len <= 3) return 1
  if (len <= 5) return 2
  return 3
}

// Generate letter tiles: correct letters + distractors to fill grid
export function generateLetterTiles(wordPlain, gridSize = 12) {
  const normalized = norm(stripNiqqud(wordPlain))
  const wordGraphemes = splitGraphemes(normalized)

  const letterCounts = {}
  wordGraphemes.forEach((l) => { letterCounts[l] = (letterCounts[l] || 0) + 1 })

  const unusedLetters = HEBREW_LETTERS.filter((l) => !letterCounts[l])
  const numDistractors = Math.max(0, gridSize - wordGraphemes.length)
  const distractors = unusedLetters.sort(() => Math.random() - 0.5).slice(0, numDistractors)

  const all = [...wordGraphemes, ...distractors]
  return all.sort(() => Math.random() - 0.5).map((letter, i) => ({
    id: `${letter}-${i}-${Math.random().toString(36).slice(2)}`,
    letter,
    used: false,
  }))
}

// Generate digit tiles for math answer
export function generateDigitTiles(answer, gridSize = 12) {
  const answerStr = String(answer)
  const digits = answerStr.split('').map(Number)
  const allDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const distractors = allDigits
    .filter((d) => !digits.includes(d))
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.max(0, gridSize - digits.length))

  return [...digits, ...distractors]
    .sort(() => Math.random() - 0.5)
    .map((n, i) => ({
      id: `${n}-${i}-${Math.random().toString(36).slice(2)}`,
      number: n,
      used: false,
    }))
}
