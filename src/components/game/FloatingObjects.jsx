// src/components/game/FloatingObjects.jsx
// Thematic floating objects based on grade + level — brings the "world" to life
import { useEffect, useRef, memo } from 'react'
import { motion } from 'framer-motion'

// Each grade/level gets its own floating universe
const THEMES = {
  '1-1': { emojis: ['🌳','🌙','⭐','💧','🌸','🌿','✨'], bg: 'from-lime-50 to-emerald-50' },
  '1-2': { emojis: ['🏠','🐕','📚','🌞','🥚','🌺','🦋'], bg: 'from-yellow-50 to-amber-50' },
  '1-3': { emojis: ['✏️','🚀','⭐','🌙','📖','🌈','💡'], bg: 'from-purple-50 to-violet-50' },
  '2-1': { emojis: ['🌊','⛰️','🌾','🍯','🌻','🐝','🦋'], bg: 'from-sky-50 to-blue-50' },
  '2-2': { emojis: ['🍎','🍊','🍋','🍌','🍓','🍇','🥝'], bg: 'from-orange-50 to-red-50' },
  '2-3': { emojis: ['🚂','🚗','🚲','🚌','✈️','🚀','⚓'], bg: 'from-cyan-50 to-teal-50' },
  '3-1': { emojis: ['🐘','🦊','🐺','🐒','🦉','🦢','🐯','🦁'], bg: 'from-green-50 to-emerald-50' },
  '3-2': { emojis: ['📱','💻','❄️','📰','💌','🏆','⚡','🔮'], bg: 'from-indigo-50 to-blue-50' },
  '3-3': { emojis: ['🌍','👨‍👩‍👧','🌆','💫','🌠','🏛️','📡','🎭'], bg: 'from-rose-50 to-pink-50' },
}

const DEFAULT_THEME = { emojis: ['⭐','✨','💫','🌟','🎈','🎀','🎊'], bg: 'from-purple-50 to-violet-50' }

function FloatingItem({ emoji, index, total }) {
  const startX = (index / total) * 100
  const size   = 20 + Math.random() * 22
  const dur    = 12 + Math.random() * 18  // 12-30s per cycle
  const delay  = -(Math.random() * dur)   // negative so they start mid-flight
  const yAmpl  = 30 + Math.random() * 50  // vertical drift amplitude

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${startX + (Math.random() - 0.5) * 15}%`,
        top:  `${10 + Math.random() * 75}%`,
        fontSize: size,
        opacity: 0.55 + Math.random() * 0.3,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))',
      }}
      animate={{
        y: [0, -yAmpl, yAmpl * 0.5, -yAmpl * 0.3, 0],
        x: [0, 12, -8, 15, 0],
        rotate: [0, 8, -5, 10, 0],
        scale:  [1, 1.08, 0.95, 1.05, 1],
      }}
      transition={{
        duration: dur,
        delay: delay,
        repeat: Infinity,
        ease: 'easeInOut',
        times: [0, 0.25, 0.5, 0.75, 1],
      }}
    >
      {emoji}
    </motion.div>
  )
}

export function getThemeBg(grade, level) {
  const key = `${grade}-${level}`
  return (THEMES[key] || DEFAULT_THEME).bg
}

export default memo(function FloatingObjects({ grade, level }) {
  const key = `${grade}-${level}`
  const theme = THEMES[key] || DEFAULT_THEME
  // Show 5-7 objects, repeating emojis if needed
  const count = 6
  const items = Array.from({ length: count }, (_, i) => theme.emojis[i % theme.emojis.length])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {items.map((emoji, i) => (
        <FloatingItem key={`${key}-${i}`} emoji={emoji} index={i} total={count} />
      ))}
    </div>
  )
})
