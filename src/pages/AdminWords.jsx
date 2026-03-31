// src/pages/AdminWords.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Home, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getWords, addWord, updateWord, deleteWord } from '@/lib/api'

const LEVEL_COLORS = {
  1: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'קל' },
  2: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: 'בינוני' },
  3: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', label: 'קשה' },
}

function calcLevel(word) {
  const len = (word || '').replace(/[\u0591-\u05C7]/g, '').length
  if (len <= 3) return 1
  if (len <= 5) return 2
  return 3
}

export default function AdminWords() {
  const navigate = useNavigate()
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [newWord, setNewWord] = useState('')
  const [newNiqqud, setNewNiqqud] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getWords().then(setWords).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleAdd() {
    if (!newWord.trim()) return
    setSaving(true)
    try {
      const level = calcLevel(newWord.trim())
      const created = await addWord({
        word_plain: newWord.trim(),
        word_niqqud: newNiqqud.trim() || null,
        level,
        active: true,
      })
      setWords((ws) => [...ws, created])
      setNewWord('')
      setNewNiqqud('')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(word) {
    const updated = await updateWord(word.id, { active: !word.active })
    setWords((ws) => ws.map((w) => (w.id === word.id ? { ...w, active: !w.active } : w)))
  }

  async function handleDelete(id) {
    if (!confirm('למחוק את המילה?')) return
    await deleteWord(id)
    setWords((ws) => ws.filter((w) => w.id !== id))
  }

  const level = calcLevel(newWord)
  const lc = LEVEL_COLORS[level]

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto" style={{ background: 'var(--bg)' }}>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-purple-200 opacity-30 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <button
          onClick={() => navigate('/')}
          className="w-11 h-11 rounded-2xl bg-white border-2 border-purple-100 flex items-center justify-center shadow-sm hover:bg-purple-50 transition-colors"
        >
          <Home className="w-5 h-5 text-violet-500" />
        </button>
        <h1 className="text-2xl font-black text-violet-700">ניהול מילים ✏️</h1>
        <div className="w-11" />
      </div>

      {/* Add word form */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-4xl p-5 shadow-md border-2 border-purple-100 mb-5"
      >
        <h2 className="font-black text-gray-700 mb-4 text-lg">הוספת מילה חדשה</h2>
        <div className="flex flex-col gap-3">
          <input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="מילה (בלי ניקוד)..."
            className="w-full text-lg p-3 rounded-2xl border-2 border-purple-200 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 font-bold text-gray-700"
          />
          <input
            value={newNiqqud}
            onChange={(e) => setNewNiqqud(e.target.value)}
            placeholder="עם ניקוד (אופציונלי)..."
            className="w-full text-lg p-3 rounded-2xl border-2 border-purple-100 focus:outline-none focus:border-violet-300 font-medium text-gray-600"
          />
          <div className="flex items-center gap-3">
            {newWord.trim() && (
              <span className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 ${lc.bg} ${lc.border} ${lc.text}`}>
                {lc.label} ({newWord.replace(/[\u0591-\u05C7]/g, '').length} אותיות)
              </span>
            )}
            <motion.button
              onClick={handleAdd}
              disabled={!newWord.trim() || saving}
              whileHover={newWord.trim() ? { scale: 1.03 } : {}}
              whileTap={newWord.trim() ? { scale: 0.97 } : {}}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                newWord.trim() && !saving
                  ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              {saving ? 'שומר...' : 'הוסף'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Word list */}
      <div className="bg-white rounded-4xl p-5 shadow-md border-2 border-purple-100">
        <h2 className="font-black text-gray-700 mb-4 text-lg">
          מילים קיימות ({words.length})
        </h2>

        {loading ? (
          <div className="text-center text-gray-400 py-6">טוען...</div>
        ) : words.length === 0 ? (
          <div className="text-center text-gray-400 py-6">אין מילים עדיין</div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {words.map((word) => {
                const lc2 = LEVEL_COLORS[word.level] || LEVEL_COLORS[1]
                return (
                  <motion.div
                    key={word.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: word.active ? 1 : 0.5, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-colors ${
                      word.active ? 'bg-white border-purple-100' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggle(word)}
                        className={`transition-colors ${word.active ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-400'}`}
                      >
                        {word.active
                          ? <CheckCircle className="w-6 h-6" />
                          : <XCircle className="w-6 h-6" />}
                      </button>
                      <div>
                        <span className="font-black text-xl text-gray-800">
                          {word.word_niqqud || word.word_plain}
                        </span>
                        {word.word_niqqud && (
                          <span className="text-xs text-gray-400 mr-2">({word.word_plain})</span>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${lc2.bg} ${lc2.border} ${lc2.text}`}>
                        {lc2.label}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(word.id)}
                      className="text-red-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
