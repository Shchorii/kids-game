// src/components/game/NamePrompt.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { getSavedName, saveName } from '@/lib/storage'

export default function NamePrompt({ title, emoji, onStart }) {
  const [name, setName] = useState(getSavedName)

  function handleSubmit() {
    if (!name.trim()) return
    saveName(name.trim())
    onStart(name.trim())
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
        className="bg-white rounded-5xl shadow-xl p-10 max-w-sm w-full relative z-10 border-2 border-purple-100"
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{emoji}</div>
          <h1 className="text-3xl font-black text-violet-700">{title}</h1>
          <p className="text-gray-500 mt-2 font-medium">איך קוראים לך?</p>
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="כתוב את שמך..."
          autoFocus
          className="w-full text-center text-2xl font-bold p-4 rounded-2xl border-2 border-purple-200 mb-5 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-violet-700 placeholder:text-purple-200"
        />

        <motion.button
          onClick={handleSubmit}
          disabled={!name.trim()}
          whileHover={name.trim() ? { scale: 1.03, y: -2 } : {}}
          whileTap={name.trim() ? { scale: 0.97 } : {}}
          className={`w-full text-2xl font-black py-4 rounded-2xl shadow-md transition-all duration-200 ${
            name.trim()
              ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-violet-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          בואו נתחיל! 🚀
        </motion.button>
      </motion.div>
    </div>
  )
}
