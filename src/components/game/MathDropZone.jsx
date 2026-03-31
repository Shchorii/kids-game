// src/components/game/MathDropZone.jsx
import { motion, AnimatePresence } from 'framer-motion'

export default function MathDropZone({ placedDigits, answerLength, onRemoveDigit, isCorrect, showHint, correctAnswer }) {
  const slots = Array.from({ length: answerLength })
  const correctDigits = String(correctAnswer).split('')

  return (
    <div className="flex justify-center items-center gap-3 my-6">
      <span className="text-3xl font-black text-gray-400">=</span>
      {slots.map((_, i) => {
        const filled = i < placedDigits.length
        const digit = placedDigits[i]
        const hinted = showHint && !filled && correctDigits[i]

        return (
          <motion.div
            key={i}
            layout
            style={{
              borderColor: isCorrect ? '#10B981' : filled ? '#F97316' : '#FED7AA',
              backgroundColor: isCorrect ? '#ECFDF5' : filled ? '#FFF7ED' : hinted ? '#FEF9C3' : '#FAFAFA',
              boxShadow: isCorrect
                ? '0 4px 0 #10B981'
                : filled
                ? '0 4px 0 #F97316'
                : 'inset 0 2px 4px rgba(0,0,0,0.06)',
            }}
            className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-black text-3xl transition-all duration-200 cursor-pointer"
            onClick={() => filled && onRemoveDigit(i)}
          >
            <AnimatePresence mode="wait">
              {filled ? (
                <motion.span
                  key={digit + i}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  className="text-orange-600"
                >
                  {digit}
                </motion.span>
              ) : hinted ? (
                <span className="text-yellow-400 text-2xl opacity-60">{correctDigits[i]}</span>
              ) : (
                <span className="text-orange-200 text-sm">_</span>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
