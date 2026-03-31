// src/components/game/SuccessAnimation.jsx
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const EMOJIS = ['⭐', '🌟', '✨', '🎉', '🎊', '💫', '🌈', '🎈']
const PRAISE = [
  'מצוין! 🎉',
  'כל הכבוד! ⭐',
  'יפה מאוד! 🌟',
  'אלופה! 👑',
  'מדהים! 💫',
  'נכון! 🌈',
  'וואו! 🎊',
]

function randomPraise() {
  return PRAISE[Math.floor(Math.random() * PRAISE.length)]
}

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#5B21B6', '#F97316', '#EAB308', '#10B981', '#F43F5E', '#0EA5E9'][i % 6],
    size: 8 + Math.random() * 8,
    delay: Math.random() * 0.3,
    duration: 0.7 + Math.random() * 0.5,
    rotate: Math.random() * 360,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: '-10px', opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  )
}

export default function SuccessAnimation({ show, onComplete, stars = 3 }) {
  const praise = useRef(randomPraise())
  const timerRef = useRef(null)

  useEffect(() => {
    if (show) {
      praise.current = randomPraise()
      timerRef.current = setTimeout(onComplete, 1800)
    }
    return () => clearTimeout(timerRef.current)
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(91,33,182,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={onComplete}
        >
          <Confetti />
          <motion.div
            initial={{ scale: 0.4, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="bg-white rounded-5xl px-12 py-10 text-center shadow-2xl relative z-10"
          >
            <div className="text-6xl mb-3">
              {Array.from({ length: stars }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 400 }}
                  className="inline-block"
                >
                  ⭐
                </motion.span>
              ))}
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-3xl font-black text-violet-700"
            >
              {praise.current}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
