// src/components/game/Mascot.jsx
// Animated owl mascot that reacts emotionally to gameplay
import { motion, AnimatePresence } from 'framer-motion'

const MOODS = {
  idle:    { emoji: '🦉', msg: null },
  correct: { emoji: '🥳', msg: '!' },
  wrong:   { emoji: '😬', msg: '...' },
  streak:  { emoji: '🤩', msg: '🔥' },
  hint:    { emoji: '🤔', msg: '💡' },
  waiting: { emoji: '😴', msg: null },
}

export default function Mascot({ mood = 'idle', streak = 0 }) {
  const m = MOODS[mood] || MOODS.idle

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={mood}
          initial={{ scale: 0.5, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: -10, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className="text-3xl select-none"
        >
          {m.emoji}
        </motion.div>
      </AnimatePresence>

      {/* Speech bubble */}
      <AnimatePresence>
        {m.msg && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 5 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute -top-8 -left-2 bg-white rounded-xl px-2 py-0.5 text-xs font-black shadow-md border border-purple-100 whitespace-nowrap"
          >
            {m.msg}
            {/* bubble tail */}
            <div className="absolute -bottom-1.5 left-3 w-2 h-2 bg-white border-r border-b border-purple-100 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak badge */}
      {streak >= 3 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-3 bg-orange-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center shadow"
        >
          {streak}
        </motion.div>
      )}
    </div>
  )
}
