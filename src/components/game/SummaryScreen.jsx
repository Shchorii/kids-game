// src/components/game/SummaryScreen.jsx
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function SummaryScreen({ childName, correctCount, wrongCount, totalWords, stars, totalTime, bestTime }) {
  const navigate = useNavigate()
  const accuracy = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0

  const medals = [
    { threshold: 90, emoji: '🥇', label: 'מדהים!' },
    { threshold: 70, emoji: '🥈', label: 'כל הכבוד!' },
    { threshold: 0,  emoji: '🥉', label: 'טוב מאוד!' },
  ]
  const medal = medals.find((m) => accuracy >= m.threshold)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="bg-white rounded-5xl shadow-xl p-8 max-w-sm w-full text-center border-2 border-purple-100">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-7xl mb-3"
        >
          {medal.emoji}
        </motion.div>

        <h2 className="text-3xl font-black text-violet-700 mb-1">{medal.label}</h2>
        {childName && (
          <p className="text-lg text-gray-500 mb-6">{childName}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Stat label="נכון" value={correctCount} color="green" />
          <Stat label="טעויות" value={wrongCount} color="red" />
          <Stat label="כוכבים" value={`${stars} ⭐`} color="yellow" />
          <Stat label="דיוק" value={`${accuracy}%`} color="purple" />
          {bestTime !== null && bestTime !== undefined && (
            <Stat label="שיא" value={`${bestTime}s ⚡`} color="blue" colSpan />
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-2xl border-2 border-purple-200 text-violet-700 font-bold hover:bg-purple-50 transition-colors"
          >
            🏠 בית
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 rounded-2xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors shadow-md"
          >
            שחק שוב 🎮
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function Stat({ label, value, color, colSpan }) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  return (
    <div className={`rounded-2xl border-2 p-3 ${colors[color]} ${colSpan ? 'col-span-2' : ''}`}>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs font-semibold opacity-70">{label}</div>
    </div>
  )
}
