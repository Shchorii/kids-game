// src/components/game/GameHeader.jsx
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function GameHeader({ stars, current, total, childName }) {
  const navigate = useNavigate()
  const pct = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="mb-6">
      {/* top row */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigate('/')}
          className="w-11 h-11 rounded-2xl bg-white border-2 border-purple-200 flex items-center justify-center shadow-sm hover:bg-purple-50 transition-colors"
        >
          <Home className="w-5 h-5 text-violet-600" />
        </button>

        {childName && (
          <span className="text-lg font-bold text-violet-700">שלום {childName}! 👋</span>
        )}

        {/* stars */}
        <div className="flex items-center gap-1.5 bg-yellow-50 border-2 border-yellow-300 rounded-2xl px-3 py-1.5">
          <span className="text-xl">⭐</span>
          <motion.span
            key={stars}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            className="text-xl font-black text-yellow-700"
          >
            {stars}
          </motion.span>
        </div>
      </div>

      {/* progress */}
      <div className="bg-purple-100 rounded-full h-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        />
      </div>
      {total > 0 && (
        <p className="text-right text-sm font-semibold text-purple-400 mt-1">
          {current} / {total}
        </p>
      )}
    </div>
  )
}
