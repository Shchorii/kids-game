// src/pages/Leaderboard.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Home, Trophy, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getLeaderboard } from '@/lib/api'
import { getSavedName } from '@/lib/storage'

const RANK_STYLE = [
  { bg: 'from-yellow-400 to-orange-400', emoji: '🥇', text: 'text-white' },
  { bg: 'from-gray-300 to-gray-400', emoji: '🥈', text: 'text-white' },
  { bg: 'from-orange-300 to-orange-500', emoji: '🥉', text: 'text-white' },
]

export default function Leaderboard() {
  const navigate = useNavigate()
  const myName = getSavedName()
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard().then(setPlayers).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto" style={{ background: 'var(--bg)' }}>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-yellow-200 opacity-40 blur-3xl" />
        <div className="absolute -bottom-16 left-0 w-56 h-56 rounded-full bg-orange-200 opacity-30 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <button
          onClick={() => navigate('/')}
          className="w-11 h-11 rounded-2xl bg-white border-2 border-yellow-200 flex items-center justify-center shadow-sm hover:bg-yellow-50 transition-colors"
        >
          <Home className="w-5 h-5 text-yellow-600" />
        </button>
        <h1 className="text-2xl font-black text-yellow-700">🏆 לוח התוצאות</h1>
        <div className="w-11" />
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12 text-lg font-medium">טוען...</div>
      ) : players.length === 0 ? (
        <div className="bg-white rounded-4xl p-12 text-center shadow-md border-2 border-yellow-100">
          <div className="text-6xl mb-3">🏆</div>
          <p className="text-xl font-bold text-gray-600">אין עדיין שחקנים</p>
          <p className="text-gray-400 mt-1">היי הראשון לשחק!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {players.map((player, i) => {
            const style = RANK_STYLE[i] || {}
            const isMe = player.name?.toLowerCase() === myName?.toLowerCase()
            return (
              <motion.div
                key={player.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`rounded-3xl p-4 flex items-center justify-between shadow-md ${
                  i < 3
                    ? `bg-gradient-to-r ${style.bg}`
                    : isMe
                    ? 'bg-violet-50 border-2 border-violet-300'
                    : 'bg-white border-2 border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center">{i < 3 ? style.emoji : `${i + 1}.`}</span>
                  <div>
                    <div className={`font-black text-lg ${i < 3 ? 'text-white' : isMe ? 'text-violet-700' : 'text-gray-800'}`}>
                      {player.name} {isMe && '(את!)'}
                    </div>
                    <div className={`text-xs font-medium ${i < 3 ? 'text-white/70' : 'text-gray-400'}`}>
                      {player.sessions} סשנים • רצף: {player.maxStreak}
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 font-black text-xl ${i < 3 ? 'text-white' : 'text-yellow-600'}`}>
                  <Star className={`w-5 h-5 ${i < 3 ? 'fill-white' : 'fill-yellow-400 text-yellow-400'}`} />
                  {player.totalStars}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
