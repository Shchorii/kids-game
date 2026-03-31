// api/words.js — word management with built-in bank + custom words

import { kv } from '@vercel/kv'

const CUSTOM_KEY = 'words:custom'

const BUILT_IN_WORDS = [
  // ══ כיתה א׳ — רמה 1 (2-3 אותיות) ══
  { word_plain: 'יד',   word_niqqud: 'יָד',    grade: 1, level: 1 },
  { word_plain: 'בן',   word_niqqud: 'בֵּן',   grade: 1, level: 1 },
  { word_plain: 'בת',   word_niqqud: 'בַּת',   grade: 1, level: 1 },
  { word_plain: 'גן',   word_niqqud: 'גַּן',   grade: 1, level: 1 },
  { word_plain: 'עץ',   word_niqqud: 'עֵץ',    grade: 1, level: 1 },
  { word_plain: 'פה',   word_niqqud: 'פֶּה',   grade: 1, level: 1 },
  { word_plain: 'שם',   word_niqqud: 'שָׁם',   grade: 1, level: 1 },
  { word_plain: 'חם',   word_niqqud: 'חַם',    grade: 1, level: 1 },
  { word_plain: 'קר',   word_niqqud: 'קַר',    grade: 1, level: 1 },
  { word_plain: 'כן',   word_niqqud: 'כֵּן',   grade: 1, level: 1 },
  { word_plain: 'לא',   word_niqqud: 'לֹא',    grade: 1, level: 1 },
  { word_plain: 'זה',   word_niqqud: 'זֶה',    grade: 1, level: 1 },
  { word_plain: 'גם',   word_niqqud: 'גַּם',   grade: 1, level: 1 },
  { word_plain: 'אם',   word_niqqud: 'אִם',    grade: 1, level: 1 },
  { word_plain: 'רק',   word_niqqud: 'רַק',    grade: 1, level: 1 },
  // ══ כיתה א׳ — רמה 2 (3-4 אותיות) ══
  { word_plain: 'בית',  word_niqqud: 'בַּיִת',  grade: 1, level: 2 },
  { word_plain: 'ילד',  word_niqqud: 'יֶלֶד',  grade: 1, level: 2 },
  { word_plain: 'ספר',  word_niqqud: 'סֵפֶר',  grade: 1, level: 2 },
  { word_plain: 'כלב',  word_niqqud: 'כֶּלֶב', grade: 1, level: 2 },
  { word_plain: 'שמש',  word_niqqud: 'שֶׁמֶשׁ', grade: 1, level: 2 },
  { word_plain: 'חלב',  word_niqqud: 'חָלָב',  grade: 1, level: 2 },
  { word_plain: 'לחם',  word_niqqud: 'לֶחֶם',  grade: 1, level: 2 },
  { word_plain: 'ירח',  word_niqqud: 'יָרֵחַ', grade: 1, level: 2 },
  { word_plain: 'אמא',  word_niqqud: 'אִמָּא', grade: 1, level: 2 },
  { word_plain: 'אבא',  word_niqqud: 'אַבָּא', grade: 1, level: 2 },
  { word_plain: 'כיסא', word_niqqud: 'כִּסֵּא', grade: 1, level: 2 },
  { word_plain: 'ביצה', word_niqqud: 'בֵּיצָה', grade: 1, level: 2 },
  { word_plain: 'פרח',  word_niqqud: 'פֶּרַח',  grade: 1, level: 2 },
  { word_plain: 'ענן',  word_niqqud: 'עָנָן',  grade: 1, level: 2 },
  { word_plain: 'דג',   word_niqqud: 'דָּג',   grade: 1, level: 2 },
  // ══ כיתה א׳ — רמה 3 (4-5 אותיות) ══
  { word_plain: 'ילדה',  word_niqqud: 'יַלְדָּה',  grade: 1, level: 3 },
  { word_plain: 'שולחן', word_niqqud: 'שֻׁלְחָן', grade: 1, level: 3 },
  { word_plain: 'חלון',  word_niqqud: 'חַלּוֹן',  grade: 1, level: 3 },
  { word_plain: 'עפרון', word_niqqud: 'עִפָּרוֹן', grade: 1, level: 3 },
  { word_plain: 'מטוס',  word_niqqud: 'מָטוֹס',   grade: 1, level: 3 },
  { word_plain: 'כוכב',  word_niqqud: 'כּוֹכָב',  grade: 1, level: 3 },
  { word_plain: 'ספרים', word_niqqud: 'סְפָרִים', grade: 1, level: 3 },
  { word_plain: 'ילדים', word_niqqud: 'יְלָדִים', grade: 1, level: 3 },
  { word_plain: 'אוזן',  word_niqqud: 'אֹזֶן',    grade: 1, level: 3 },
  { word_plain: 'עיניים', word_niqqud: 'עֵינַיִם', grade: 1, level: 3 },
  // ══ כיתה ב׳ — רמה 1 (3-4 אותיות) ══
  { word_plain: 'ים',   word_niqqud: 'יָם',    grade: 2, level: 1 },
  { word_plain: 'הר',   word_niqqud: 'הַר',    grade: 2, level: 1 },
  { word_plain: 'גזר',  word_niqqud: 'גֶּזֶר',  grade: 2, level: 1 },
  { word_plain: 'דבש',  word_niqqud: 'דְּבַשׁ', grade: 2, level: 1 },
  { word_plain: 'נהר',  word_niqqud: 'נָהָר',  grade: 2, level: 1 },
  { word_plain: 'שדה',  word_niqqud: 'שָׂדֶה',  grade: 2, level: 1 },
  { word_plain: 'כיתה', word_niqqud: 'כִּתָּה', grade: 2, level: 1 },
  { word_plain: 'מורה', word_niqqud: 'מוֹרָה', grade: 2, level: 1 },
  { word_plain: 'תיק',  word_niqqud: 'תִּיק',  grade: 2, level: 1 },
  { word_plain: 'חדר',  word_niqqud: 'חֶדֶר',  grade: 2, level: 1 },
  { word_plain: 'עוגה', word_niqqud: 'עוּגָה', grade: 2, level: 1 },
  { word_plain: 'תות',  word_niqqud: 'תּוּת',  grade: 2, level: 1 },
  { word_plain: 'ענב',  word_niqqud: 'עֵנָב',  grade: 2, level: 1 },
  // ══ כיתה ב׳ — רמה 2 (4-5 אותיות) ══
  { word_plain: 'תפוח',  word_niqqud: 'תַּפּוּחַ', grade: 2, level: 2 },
  { word_plain: 'תפוז',  word_niqqud: 'תַּפּוּז',  grade: 2, level: 2 },
  { word_plain: 'לימון', word_niqqud: 'לִימוֹן',  grade: 2, level: 2 },
  { word_plain: 'בננה',  word_niqqud: 'בַּנָּנָה', grade: 2, level: 2 },
  { word_plain: 'כובע',  word_niqqud: 'כּוֹבַע',  grade: 2, level: 2 },
  { word_plain: 'מעיל',  word_niqqud: 'מְעִיל',   grade: 2, level: 2 },
  { word_plain: 'שעון',  word_niqqud: 'שָׁעוֹן',  grade: 2, level: 2 },
  { word_plain: 'חנות',  word_niqqud: 'חֲנוּת',   grade: 2, level: 2 },
  { word_plain: 'תלמיד', word_niqqud: 'תַּלְמִיד', grade: 2, level: 2 },
  { word_plain: 'חולצה', word_niqqud: 'חֻלְצָה',  grade: 2, level: 2 },
  { word_plain: 'ארנב',  word_niqqud: 'אַרְנָב',  grade: 2, level: 2 },
  { word_plain: 'חגיגה', word_niqqud: 'חֲגִיגָה', grade: 2, level: 2 },
  { word_plain: 'אגם',   word_niqqud: 'אֲגַם',    grade: 2, level: 2 },
  // ══ כיתה ב׳ — רמה 3 (5-6 אותיות) ══
  { word_plain: 'מחברת',  word_niqqud: 'מַחְבֶּרֶת', grade: 2, level: 3 },
  { word_plain: 'רכבת',   word_niqqud: 'רַכֶּבֶת',   grade: 2, level: 3 },
  { word_plain: 'מכונית', word_niqqud: 'מְכוֹנִית',  grade: 2, level: 3 },
  { word_plain: 'ארוחה',  word_niqqud: 'אֲרוּחָה',   grade: 2, level: 3 },
  { word_plain: 'נעלים',  word_niqqud: 'נַעֲלַיִם',  grade: 2, level: 3 },
  { word_plain: 'גרביים', word_niqqud: 'גַּרְבַּיִם', grade: 2, level: 3 },
  { word_plain: 'ספרייה', word_niqqud: 'סִפְרִיָּה', grade: 2, level: 3 },
  { word_plain: 'מגרש',   word_niqqud: 'מִגְרָשׁ',   grade: 2, level: 3 },
  { word_plain: 'מטבח',   word_niqqud: 'מִטְבָּח',   grade: 2, level: 3 },
  { word_plain: 'אוטובוס', word_niqqud: 'אוֹטוֹבּוּס', grade: 2, level: 3 },
  { word_plain: 'אופניים', word_niqqud: 'אוֹפַנַּיִם', grade: 2, level: 3 },
  // ══ כיתה ג׳ — רמה 1 (3-4 אותיות) ══
  { word_plain: 'פיל',   word_niqqud: 'פִּיל',     grade: 3, level: 1 },
  { word_plain: 'נמר',   word_niqqud: 'נָמֵר',    grade: 3, level: 1 },
  { word_plain: 'זאב',   word_niqqud: 'זְאֵב',    grade: 3, level: 1 },
  { word_plain: 'קוף',   word_niqqud: 'קוֹף',     grade: 3, level: 1 },
  { word_plain: 'דב',    word_niqqud: 'דֹּב',     grade: 3, level: 1 },
  { word_plain: 'צבי',   word_niqqud: 'צְבִי',    grade: 3, level: 1 },
  { word_plain: 'עכבר',  word_niqqud: 'עַכְבָּר', grade: 3, level: 1 },
  { word_plain: 'ינשוף', word_niqqud: 'יַנְשׁוּף', grade: 3, level: 1 },
  { word_plain: 'ברבור', word_niqqud: 'בַּרְבּוּר', grade: 3, level: 1 },
  { word_plain: 'שועל',  word_niqqud: 'שׁוּעָל',   grade: 3, level: 1 },
  { word_plain: 'תוכי',  word_niqqud: 'תּוּכִּי',  grade: 3, level: 1 },
  // ══ כיתה ג׳ — רמה 2 (4-6 אותיות) ══
  { word_plain: 'טלפון',   word_niqqud: 'טֶלֶפוֹן',   grade: 3, level: 2 },
  { word_plain: 'מחשב',    word_niqqud: 'מַחְשֵׁב',   grade: 3, level: 2 },
  { word_plain: 'מקרר',    word_niqqud: 'מְקָרֵר',    grade: 3, level: 2 },
  { word_plain: 'תנור',    word_niqqud: 'תַּנּוּר',   grade: 3, level: 2 },
  { word_plain: 'עיתון',   word_niqqud: 'עִיתּוֹן',   grade: 3, level: 2 },
  { word_plain: 'מכתב',    word_niqqud: 'מִכְתָּב',   grade: 3, level: 2 },
  { word_plain: 'חברים',   word_niqqud: 'חֲבֵרִים',   grade: 3, level: 2 },
  { word_plain: 'ברכה',    word_niqqud: 'בְּרָכָה',   grade: 3, level: 2 },
  { word_plain: 'אריה',    word_niqqud: 'אַרְיֵה',    grade: 3, level: 2 },
  { word_plain: 'אוצר',    word_niqqud: 'אוֹצָר',     grade: 3, level: 2 },
  { word_plain: 'מטוסים',  word_niqqud: 'מָטוֹסִים',  grade: 3, level: 2 },
  { word_plain: 'תלמידים', word_niqqud: 'תַּלְמִידִים', grade: 3, level: 2 },
  // ══ כיתה ג׳ — רמה 3 (6+ אותיות) ══
  { word_plain: 'טלוויזיה',  word_niqqud: 'טֶלֶוִיזְיָה',   grade: 3, level: 3 },
  { word_plain: 'ירושלים',   word_niqqud: 'יְרוּשָׁלַיִם',  grade: 3, level: 3 },
  { word_plain: 'משפחה',     word_niqqud: 'מִשְׁפָּחָה',    grade: 3, level: 3 },
  { word_plain: 'מכנסיים',   word_niqqud: 'מִכְנָסַיִם',    grade: 3, level: 3 },
  { word_plain: 'כוכבים',    word_niqqud: 'כּוֹכָבִים',     grade: 3, level: 3 },
  { word_plain: 'חיות',      word_niqqud: 'חַיּוֹת',        grade: 3, level: 3 },
  { word_plain: 'עננים',     word_niqqud: 'עֲנָנִים',       grade: 3, level: 3 },
  { word_plain: 'הורים',     word_niqqud: 'הוֹרִים',        grade: 3, level: 3 },
  { word_plain: 'חברות',     word_niqqud: 'חַבְרוּת',       grade: 3, level: 3 },
].map((w, i) => ({ ...w, id: `builtin_${i + 1}`, active: true, builtin: true }))

async function getCustomWords() {
  try { return (await kv.get(CUSTOM_KEY)) || [] } catch { return [] }
}
async function setCustomWords(words) { await kv.set(CUSTOM_KEY, words) }

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { grade, level } = req.query
    const custom = await getCustomWords()
    let words = [...BUILT_IN_WORDS, ...custom].filter((w) => w.active !== false)
    if (grade) words = words.filter((w) => w.grade === parseInt(grade))
    if (level) words = words.filter((w) => w.level === parseInt(level))
    return res.status(200).json(words)
  }
  if (req.method === 'POST') {
    const { word_plain, word_niqqud, grade = 1, level = 1 } = req.body || {}
    if (!word_plain) return res.status(400).json({ error: 'word_plain required' })
    const custom = await getCustomWords()
    const newWord = {
      id: `custom_${Date.now()}`,
      word_plain: word_plain.trim(),
      word_niqqud: word_niqqud?.trim() || null,
      grade: parseInt(grade), level: parseInt(level),
      active: true, builtin: false,
      created_at: new Date().toISOString(),
    }
    custom.push(newWord)
    await setCustomWords(custom)
    return res.status(201).json(newWord)
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
