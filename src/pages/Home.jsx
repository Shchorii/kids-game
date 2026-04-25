// src/pages/Home.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Headphones, Calculator, Trophy, Settings, Star, BookOpen, Flame } from 'lucide-react'
import { getSavedName } from '@/lib/storage'
import { getProgress, getWords } from '@/lib/api'

const GAME_CARDS = [
  {
    path: '/spelling',
    title: 'שמע ובנה',
    desc: 'הקשיבי ובני את המילה',
    emoji: '🎧',
    Icon: Headphones,
    gradient: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-200',
    bg: '#EDE9FE',
  },
  {
    path: '/english',
    title: 'אנגלית',
    emoji: '🇬🇧',
    desc: 'ראה תמונה ובחר מילה',
    Icon: null,
    gradient: 'from-blue-400 to-indigo-500',
    shadow: 'shadow-blue-200',
    bg: '#EFF6FF',
  },
  {
    path: '/math',
    title: 'משחק חשבון',
    emoji: '🧮',
    desc: 'חשבי וענה נכון',
    Icon: Calculator,
    gradient: 'from-orange-400 to-coral-500',
    shadow: 'shadow-orange-200',
    bg: '#FFF7ED',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const name = getSavedName()
  const [progress, setProgress] = useState(null)
  const [dictation, setDictation] = useState(null) // { label, count, expiresAt }

  useEffect(() => {
    if (name) getProgress(name).then(setProgress).catch(() => {})
  }, [name])

  useEffect(() => {
    // Find any active (non-expired) dictation list
    getWords().then((ws) => {
      const labeled = ws.filter((w) => w.label) // expires_at already filtered server-side
      if (!labeled.length) return
      // Group by label, pick the one with the soonest expiry
      const byLabel = labeled.reduce((acc, w) => {
        ;(acc[w.label] = acc[w.label] || []).push(w)
        return acc
      }, {})
      const [label, words] = Object.entries(byLabel)
        .sort(([, a], [, b]) => {
          const ea = a[0].expires_at ? new Date(a[0].expires_at).getTime() : Infinity
          const eb = b[0].expires_at ? new Date(b[0].expires_at).getTime() : Infinity
          return ea - eb
        })[0]
      setDictation({ label, count: words.length, expiresAt: words[0].expires_at })
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen p-5 max-w-md mx-auto" style={{ background: 'var(--bg)' }}>
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-purple-200 opacity-50 blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-56 h-56 rounded-full bg-orange-200 opacity-40 blur-3xl" />
        <div className="absolute -bottom-16 right-1/3 w-48 h-48 rounded-full bg-yellow-200 opacity-40 blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 pt-2"
      >
        <div>
          <h1 className="text-3xl font-black text-violet-700 leading-tight">
            {name ? `שלום ${name}! 👋` : '🎮 משחק המילים'}
          </h1>
          <p className="text-gray-400 font-medium text-sm mt-0.5">
            בחרי משחק והתחילי ללמוד
          </p>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="w-11 h-11 rounded-2xl bg-white border-2 border-purple-100 flex items-center justify-center shadow-sm hover:bg-purple-50 transition-colors"
        >
          <Settings className="w-5 h-5 text-violet-400" />
        </button>
      </motion.div>

      {/* Stats bar */}
      {progress && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-7"
        >
          <StatPill icon={<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />} value={progress.stars || 0} label="כוכבים" color="yellow" />
          <StatPill icon={<BookOpen className="w-4 h-4 text-violet-500" />} value={progress.words_completed || 0} label="מילים" color="purple" />
          <StatPill icon={<span className="text-sm">🧮</span>} value={progress.math_stars || 0} label="חשבון" color="orange" />
        </motion.div>
      )}

      {/* Dictation banner — appears only while there's an active dictation list */}
      {dictation && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 280, damping: 22 }}
          onClick={() => navigate(`/spelling?label=${encodeURIComponent(dictation.label)}`)}
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.97 }}
          className="relative w-full overflow-hidden rounded-4xl p-5 mb-5 shadow-lg shadow-orange-200 text-right border-2 border-orange-300 bg-gradient-to-br from-orange-400 via-red-400 to-rose-500"
        >
          <motion.div
            className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-yellow-300 opacity-30 blur-2xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.45, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-white/25 backdrop-blur flex items-center justify-center shadow-md flex-shrink-0">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-black text-white leading-tight">הכתבה השבועית 🔥</div>
              <div className="text-xs text-white/90 font-bold mt-0.5">{dictation.label}</div>
              <div className="text-xs text-white/75 font-medium mt-0.5">{dictation.count} מילים · התאמני לפני יום חמישי!</div>
            </div>
            <span className="text-3xl">📝</span>
          </div>
        </motion.button>
      )}

      {/* Game cards */}
      <div className="flex flex-col gap-4 mb-6">
        {GAME_CARDS.map((card, i) => (
          <motion.button
            key={card.path}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 280, damping: 22 }}
            onClick={() => navigate(card.path)}
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="relative overflow-hidden bg-white rounded-4xl p-6 shadow-lg border-2 border-transparent text-right"
            style={{ borderColor: '#EDE9FE' }}
          >
            {/* bg blob */}
            <div
              className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full opacity-15 blur-xl"
              style={{ background: card.bg }}
            />
            <div className="relative flex items-center gap-4">
              <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow} flex-shrink-0`}>
                {card.Icon ? <card.Icon className="w-8 h-8 text-white" /> : <span className="text-2xl">{card.emoji}</span>}
              </div>
              <div className="flex-1">
                <div className="text-xl font-black text-gray-800">{card.title}</div>
                <div className="text-sm text-gray-400 font-medium mt-0.5">{card.desc}</div>
              </div>
              <span className="text-3xl">{card.emoji}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Leaderboard link */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={() => navigate('/leaderboard')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-4xl p-5 flex items-center justify-between shadow-lg shadow-orange-100"
      >
        <div className="text-right">
          <div className="text-xl font-black text-white">לוח התוצאות</div>
          <div className="text-sm text-white/80 font-medium">תתחרי עם שחקנים אחרים!</div>
        </div>
        <Trophy className="w-10 h-10 text-white" />
      </motion.button>
    </div>
  )
}

function StatPill({ icon, value, label, color }) {
  const colors = {
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    purple: 'bg-purple-50 border-purple-200 text-violet-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  }
  return (
    <div className={`flex-1 flex items-center gap-1.5 rounded-2xl border-2 px-3 py-2 ${colors[color]}`}>
      {icon}
      <span className="font-black text-lg">{value}</span>
      <span className="text-xs font-medium opacity-70">{label}</span>
    </div>
  )
}
