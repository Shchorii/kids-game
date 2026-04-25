// src/pages/AdminWords.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Home, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getWords, addWord, deleteWord } from '@/lib/api'

const GRADE_LABELS = { 1: "כיתה א׳", 2: "כיתה ב׳", 3: "כיתה ג׳" }
const LEVEL_LABELS = { 1: 'קל', 2: 'בינוני', 3: 'קשה' }
const LEVEL_COLORS = {
  1: { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700'  },
  2: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  3: { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-600'    },
}
const GRADE_COLORS = {
  1: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  2: { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700'    },
  3: { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700'  },
}

export default function AdminWords() {
  const navigate = useNavigate()
  const [allWords, setAllWords]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [filterGrade, setFilterGrade] = useState(null)
  const [filterLevel, setFilterLevel] = useState(null)
  const [tab, setTab]                 = useState('builtin')
  const [newWord, setNewWord]         = useState('')
  const [newNiqqud, setNewNiqqud]     = useState('')
  const [newGrade, setNewGrade]       = useState(1)
  const [newLevel, setNewLevel]       = useState(1)
  const [saving, setSaving]           = useState(false)

  useEffect(() => {
    getWords().then(setAllWords).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = allWords.filter((w) => {
    if (filterGrade && w.grade !== filterGrade) return false
    if (filterLevel && w.level !== filterLevel) return false
    if (tab === 'builtin') return w.builtin
    if (tab === 'custom')  return !w.builtin
    return true
  })

  async function handleAdd() {
    if (!newWord.trim()) return
    setSaving(true)
    try {
      const created = await addWord({ word_plain: newWord.trim(), word_niqqud: newNiqqud.trim() || null, grade: newGrade, level: newLevel })
      setAllWords((ws) => [...ws, created])
      setNewWord(''); setNewNiqqud('')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('למחוק את המילה?')) return
    await deleteWord(id)
    setAllWords((ws) => ws.filter((w) => w.id !== id))
  }

  const builtinCount = allWords.filter((w) => w.builtin).length
  const customCount  = allWords.filter((w) => !w.builtin).length

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto" style={{ background: 'var(--bg)' }}>
      <div className="flex items-center justify-between mb-5 pt-2">
        <button onClick={() => navigate('/')} className="w-11 h-11 rounded-2xl bg-white border-2 border-purple-100 flex items-center justify-center shadow-sm hover:bg-purple-50 transition-colors">
          <Home className="w-5 h-5 text-violet-500" />
        </button>
        <h1 className="text-2xl font-black text-violet-700">ניהול מילים ✏️</h1>
        <div className="w-11" />
      </div>
      <div className="flex gap-2 mb-4">
        {[{key:'builtin',label:`מובנות (${builtinCount})`},{key:'custom',label:`מותאמות (${customCount})`},{key:'add',label:'+ הוסף'}].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-2xl font-bold text-sm transition-all ${tab === t.key ? 'bg-violet-600 text-white shadow-md' : 'bg-white border-2 border-purple-100 text-gray-600 hover:bg-purple-50'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab !== 'add' && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {[null,1,2,3].map((g) => (
            <button key={`g${g}`} onClick={() => setFilterGrade(g === filterGrade ? null : g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${filterGrade === g && g !== null ? `${GRADE_COLORS[g].bg} ${GRADE_COLORS[g].border} ${GRADE_COLORS[g].text}` : 'bg-white border-gray-200 text-gray-500'}`}>
              {g === null ? 'כל הכיתות' : GRADE_LABELS[g]}
            </button>
          ))}
          <div className="w-full flex gap-2 mt-1">
            {[null,1,2,3].map((l) => (
              <button key={`l${l}`} onClick={() => setFilterLevel(l === filterLevel ? null : l)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${filterLevel === l && l !== null ? `${LEVEL_COLORS[l].bg} ${LEVEL_COLORS[l].border} ${LEVEL_COLORS[l].text}` : 'bg-white border-gray-200 text-gray-500'}`}>
                {l === null ? 'כל הרמות' : LEVEL_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
      )}
      {tab === 'add' && (
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="bg-white rounded-4xl p-5 shadow-md border-2 border-purple-100 mb-5">
          <h2 className="font-black text-gray-700 mb-4 text-lg">הוספת מילה מותאמת אישית</h2>
          <div className="flex flex-col gap-3">
            <input value={newWord} onChange={(e) => setNewWord(e.target.value)} placeholder="מילה ללא ניקוד *"
              className="w-full text-lg p-3 rounded-2xl border-2 border-purple-200 focus:outline-none focus:border-violet-400 font-bold text-gray-700" />
            <input value={newNiqqud} onChange={(e) => setNewNiqqud(e.target.value)} placeholder="עם ניקוד (אופציונלי — לדוגמה: בַּיִת)"
              className="w-full text-lg p-3 rounded-2xl border-2 border-purple-100 focus:outline-none focus:border-violet-300 text-gray-600" style={{ fontFamily: 'Heebo, Arial' }} />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 mb-1 block">כיתה</label>
                <select value={newGrade} onChange={(e) => setNewGrade(parseInt(e.target.value))} className="w-full p-2.5 rounded-2xl border-2 border-purple-100 font-bold text-gray-700 focus:outline-none">
                  <option value={1}>כיתה א׳</option><option value={2}>כיתה ב׳</option><option value={3}>כיתה ג׳</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 mb-1 block">רמה</label>
                <select value={newLevel} onChange={(e) => setNewLevel(parseInt(e.target.value))} className="w-full p-2.5 rounded-2xl border-2 border-purple-100 font-bold text-gray-700 focus:outline-none">
                  <option value={1}>קל</option><option value={2}>בינוני</option><option value={3}>קשה</option>
                </select>
              </div>
            </div>
            <motion.button onClick={handleAdd} disabled={!newWord.trim() || saving}
              whileHover={newWord.trim() ? { scale: 1.02 } : {}} whileTap={newWord.trim() ? { scale: 0.98 } : {}}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all ${newWord.trim() && !saving ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
              <Plus className="w-5 h-5" />{saving ? 'שומר...' : 'הוסף מילה'}
            </motion.button>
          </div>
        </motion.div>
      )}
      {tab !== 'add' && (
        <div className="bg-white rounded-4xl p-5 shadow-md border-2 border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-700 text-lg">{tab === 'builtin' ? 'מילים מובנות' : 'מילים מותאמות'} ({filtered.length})</h2>
            {tab === 'builtin' && <div className="flex items-center gap-1 text-xs text-gray-400 font-medium"><Lock className="w-3 h-3" /> לקריאה בלבד</div>}
          </div>
          {loading ? <p className="text-center text-gray-400 py-6">טוען...</p> : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-6">{tab === 'custom' ? 'אין מילים מותאמות עדיין.' : 'אין מילים'}</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
              <AnimatePresence>
                {filtered.map((word) => {
                  const gc = GRADE_COLORS[word.grade] || GRADE_COLORS[1]
                  const lc = LEVEL_COLORS[word.level] || LEVEL_COLORS[1]
                  return (
                    <motion.div key={word.id} layout initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0, scale:0.9 }}
                      className="flex items-center justify-between p-3 rounded-2xl border-2 border-purple-50 bg-purple-50/30 hover:bg-purple-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-black text-xl text-gray-800" style={{ fontFamily: 'Heebo, Arial' }}>{word.word_niqqud || word.word_plain}</div>
                          {word.word_niqqud && <div className="text-xs text-gray-400">({word.word_plain})</div>}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${gc.bg} ${gc.border} ${gc.text}`}>{GRADE_LABELS[word.grade]}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${lc.bg} ${lc.border} ${lc.text}`}>{LEVEL_LABELS[word.level]}</span>
                          {word.label && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg border bg-orange-50 border-orange-200 text-orange-700">📝 {word.label}</span>
                          )}
                          {word.expires_at && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg border bg-amber-50 border-amber-200 text-amber-700">
                              ⏳ עד {new Date(word.expires_at).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                      {!word.builtin && <button onClick={() => handleDelete(word.id)} className="text-red-300 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
