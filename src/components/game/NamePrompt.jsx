// src/components/game/NamePrompt.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSavedName, saveName } from '@/lib/storage'

export default function NamePrompt({ title, emoji, onStart }) {
  const saved = getSavedName()
  const [mode, setMode] = useState(saved ? 'returning' : 'new') // 'returning' | 'new'
  const [name, setName] = useState('')

  function handleContinue() {
    // Continue with saved name
    onStart(saved)
  }

  function handleNewStart() {
    if (!name.trim()) return
    saveName(name.trim())
    onStart(name.trim())
  }

  function switchToNew() {
    setMode('new')
    setName('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-purple-200 opacity-40 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-orange-200 opacity-40 blur-3xl" />
      </div>

      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="bg-white rounded-5xl shadow-xl p-8 max-w-sm w-full relative z-10 border-2 border-purple-100"
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{emoji}</div>
          <h1 className="text-2xl font-black text-violet-700">{title}</h1>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'returning' ? (
            /* ── Returning player ── */
            <motion.div key="returning"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <p className="text-center text-gray-400 font-medium mb-2">ברוך הבא בחזרה,</p>
              <div className="text-center text-3xl font-black text-violet-700 mb-6">
                {saved} 👋
              </div>
              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full text-xl font-black py-4 rounded-2xl bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-200 transition-all mb-3"
              >
                המשך! 🚀
              </motion.button>
              <button
                onClick={switchToNew}
                className="w-full text-sm font-semibold py-2.5 rounded-2xl border-2 border-purple-100 text-gray-400 hover:bg-purple-50 hover:text-violet-600 transition-all"
              >
                שחקן אחר? לחץ כאן
              </button>
            </motion.div>
          ) : (
            /* ── New player ── */
            <motion.div key="new"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <p className="text-center text-gray-400 font-medium mb-5">מה שמך?</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNewStart()}
                placeholder="כתוב את שמך..."
                autoFocus
                className="w-full text-center text-2xl font-bold p-4 rounded-2xl border-2 border-purple-200 mb-4 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-violet-700 placeholder:text-purple-200"
              />
              <motion.button
                onClick={handleNewStart}
                disabled={!name.trim()}
                whileHover={name.trim() ? { scale: 1.03, y: -2 } : {}}
                whileTap={name.trim() ? { scale: 0.97 } : {}}
                className={`w-full text-xl font-black py-4 rounded-2xl shadow-md transition-all mb-3 ${
                  name.trim()
                    ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-violet-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                בואו נתחיל! 🚀
              </motion.button>
              {saved && (
                <button
                  onClick={() => setMode('returning')}
                  className="w-full text-sm font-semibold py-2.5 rounded-2xl border-2 border-purple-100 text-gray-400 hover:bg-purple-50 hover:text-violet-600 transition-all"
                >
                  ← חזור ל{saved}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
