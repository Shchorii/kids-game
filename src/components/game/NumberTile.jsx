// src/components/game/NumberTile.jsx
import { motion } from 'framer-motion'

const NUM_COLORS = [
  { bg: '#EDE9FE', border: '#7C3AED', text: '#5B21B6' }, // 0
  { bg: '#FFF7ED', border: '#F97316', text: '#C2410C' }, // 1
  { bg: '#ECFDF5', border: '#10B981', text: '#065F46' }, // 2
  { bg: '#FEFCE8', border: '#EAB308', text: '#854D0E' }, // 3
  { bg: '#FFF1F2', border: '#F43F5E', text: '#9F1239' }, // 4
  { bg: '#F0F9FF', border: '#0EA5E9', text: '#075985' }, // 5
  { bg: '#F5F3FF', border: '#8B5CF6', text: '#4C1D95' }, // 6
  { bg: '#FFF7ED', border: '#FB923C', text: '#9A3412' }, // 7
  { bg: '#F0FDF4', border: '#22C55E', text: '#14532D' }, // 8
  { bg: '#FEF9C3', border: '#CA8A04', text: '#713F12' }, // 9
]

export default function NumberTile({ numberId, number, index, isUsed, isWrong, onClick }) {
  const color = NUM_COLORS[number] || NUM_COLORS[0]

  return (
    <motion.button
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={
        isUsed
          ? { scale: 0.85, opacity: 0.3 }
          : isWrong
          ? { x: [-6, 6, -4, 4, 0], scale: 1 }
          : { scale: 1, opacity: 1 }
      }
      transition={
        isWrong
          ? { duration: 0.35 }
          : { type: 'spring', stiffness: 400, damping: 20, delay: index * 0.03 }
      }
      onClick={() => !isUsed && onClick(numberId, number)}
      disabled={isUsed}
      style={{
        backgroundColor: isUsed ? '#F5F5F5' : color.bg,
        borderColor: isUsed ? '#D1D5DB' : isWrong ? '#EF4444' : color.border,
        color: isUsed ? '#9CA3AF' : color.text,
        boxShadow: isUsed ? 'none' : `0 4px 0 ${color.border}`,
      }}
      className={`
        w-14 h-14 rounded-2xl border-2 font-black text-2xl
        select-none transition-colors duration-150
        ${isUsed ? 'cursor-not-allowed' : 'cursor-pointer active:translate-y-1 active:shadow-none'}
      `}
      whileHover={!isUsed ? { scale: 1.08, y: -2 } : {}}
      whileTap={!isUsed ? { scale: 0.92, y: 2 } : {}}
    >
      {number}
    </motion.button>
  )
}
