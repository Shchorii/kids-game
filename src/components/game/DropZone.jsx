// src/components/game/DropZone.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { splitGraphemes, norm } from '@/lib/hebrew'

export default function DropZone({ placedLetters, wordLength, onRemoveLetter, isCorrect, showHint, correctWord, correctWordNiqqud }) {
  const slots = Array.from({ length: wordLength })
  const correctGraphemes = correctWord ? splitGraphemes(norm(correctWord)) : []
  // Niqqud graphemes for display when letter is placed (e.g. 'בַּ' instead of 'ב')
  const niqqudGraphemes = correctWordNiqqud ? splitGraphemes(correctWordNiqqud) : []

  return (
    <div className="flex justify-center gap-2 flex-wrap my-6">
      {slots.map((_, i) => {
        const filled = i < placedLetters.length
        const letter = placedLetters[i]
        const hinted = showHint && !filled && correctGraphemes[i]

        return (
          <motion.div
            key={i}
            layout
            style={{
              borderColor: isCorrect ? '#10B981' : filled ? '#5B21B6' : '#D8B4FE',
              backgroundColor: isCorrect ? '#ECFDF5' : filled ? '#EDE9FE' : hinted ? '#FFF7ED' : '#FAFAFA',
              boxShadow: isCorrect
                ? '0 4px 0 #10B981'
                : filled
                ? '0 4px 0 #5B21B6'
                : 'inset 0 2px 4px rgba(0,0,0,0.06)',
            }}
            className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-2xl transition-all duration-200"
            whileHover={filled ? { scale: 1.05 } : {}}
            onClick={() => filled && onRemoveLetter(i)}
          >
            <AnimatePresence mode="wait">
              {filled ? (
                <motion.span
                  key={letter + i}
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  className="text-violet-700 cursor-pointer select-none"
                >
                  {niqqudGraphemes[i] || letter}
                </motion.span>
              ) : hinted ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-orange-400 opacity-60 text-xl"
                >
                  {correctGraphemes[i]}
                </motion.span>
              ) : (
                <span className="text-purple-200 text-sm">_</span>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
