// src/components/game/LetterTile.jsx
import { motion } from 'framer-motion'

const TILE_COLORS = [
  { bg: '#EDE9FE', border: '#7C3AED', text: '#5B21B6' },
  { bg: '#FFF7ED', border: '#F97316', text: '#C2410C' },
  { bg: '#ECFDF5', border: '#10B981', text: '#065F46' },
  { bg: '#FEFCE8', border: '#EAB308', text: '#854D0E' },
  { bg: '#FFF1F2', border: '#F43F5E', text: '#9F1239' },
  { bg: '#F0F9FF', border: '#0EA5E9', text: '#075985' },
]

function colorForLetter(letter) {
  const code = letter.charCodeAt(0)
  return TILE_COLORS[code % TILE_COLORS.length]
}

export default function LetterTile({ letterId, letter, display, index, isUsed, isWrong, onClick }) {
  const color = colorForLetter(letter)

  return (
    <motion.button
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={
        isUsed
          ? { scale: 0.85, opacity: 0.3 }
          : isWrong
          ? { x: [-6, 6, -4, 4, 0], scale: 1, opacity: 1 }
          : { scale: 1, opacity: 1 }
      }
      transition={
        isWrong
          ? { duration: 0.35, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 400, damping: 20, delay: index * 0.03 }
      }
      onClick={() => !isUsed && onClick(letterId, letter)}
      disabled={isUsed}
      style={{
        backgroundColor: isUsed ? '#F5F5F5' : color.bg,
        borderColor: isUsed ? '#D1D5DB' : isWrong ? '#EF4444' : color.border,
        color: isUsed ? '#9CA3AF' : color.text,
        boxShadow: isUsed
          ? 'none'
          : isWrong
          ? '0 0 0 3px #FEE2E2, 0 4px 0 #EF4444'
          : `0 4px 0 ${color.border}`,
      }}
      className={`
        relative w-14 h-14 rounded-2xl border-2 font-black text-xl
        select-none cursor-pointer transition-colors duration-150
        ${isUsed ? 'cursor-not-allowed' : 'active:translate-y-1 active:shadow-none'}
      `}
      whileHover={!isUsed ? { scale: 1.08, y: -2 } : {}}
      whileTap={!isUsed ? { scale: 0.92, y: 2 } : {}}
    >
      {display || letter}
    </motion.button>
  )
}
