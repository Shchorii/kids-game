// src/pages/ListenAndBuild.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Lightbulb, RotateCcw } from 'lucide-react'
import GameHeader from '@/components/game/GameHeader'
import LetterTile from '@/components/game/LetterTile'
import DropZone from '@/components/game/DropZone'
import SuccessAnimation from '@/components/game/SuccessAnimation'
import SummaryScreen from '@/components/game/SummaryScreen'
import NamePrompt from '@/components/game/NamePrompt'
import { splitGraphemes, norm, stripNiqqud, generateLetterTiles } from '@/lib/hebrew'
import { getWords, saveProgress } from '@/lib/api'
import { getCachedAudio, setCachedAudio } from '@/lib/storage'
import { textToSpeech } from '@/lib/api'

const GRADES = [
  { value: 1, label: "כיתה א׳", emoji: '🌱', color: 'from-green-400 to-emerald-500', border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-700' },
  { value: 2, label: "כיתה ב׳", emoji: '⭐', color: 'from-blue-400 to-cyan-500',    border: 'border-blue-200',  bg: 'bg-blue-50',  text: 'text-blue-700'  },
  { value: 3, label: "כיתה ג׳", emoji: '🚀', color: 'from-purple-500 to-violet-600', border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-700' },
]
const LEVELS = [
  { value: 1, label: 'קל',     emoji: '🟢', desc: 'מילים קצרות' },
  { value: 2, label: 'בינוני', emoji: '🟡', desc: 'מילים בינוניות' },
  { value: 3, label: 'קשה',    emoji: '🔴', desc: 'מילים ארוכות' },
]

export default function ListenAndBuild() {
  const [childName, setChildName]       = useState(null)
  const [grade, setGrade]               = useState(null)
  const [level, setLevel]               = useState(null)
  const [words, setWords]               = useState([])
  const [wordIndex, setWordIndex]       = useState(0)
  const [letters, setLetters]           = useState([])
  const [placed, setPlaced]             = useState([])
  const [wrongId, setWrongId]           = useState(null)
  const wrongTimer                      = useRef(null)
  const [stars, setStars]               = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount]     = useState(0)
  const [hintCount, setHintCount]       = useState(0)
  const [showHint, setShowHint]         = useState(false)
  const [showSuccess, setShowSuccess]   = useState(false)
  const [showSummary, setShowSummary]   = useState(false)
  const [totalTime, setTotalTime]       = useState(0)
  const [bestTime, setBestTime]         = useState(null)
  const [startTime, setStartTime]       = useState(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const currentWordData    = words[wordIndex] || null
  const currentWordDisplay = currentWordData?.word_niqqud || currentWordData?.word_plain || ''
  const currentWord        = currentWordData ? norm(stripNiqqud(currentWordData.word_plain || '')) : ''
  const totalWords         = words.length

  useEffect(() => {
    if (!grade || !level) return
    getWords(grade, level).then((ws) => {
      setWords(ws.sort(() => Math.random() - 0.5))
      setWordIndex(0); setStars(0); setCorrectCount(0); setWrongCount(0)
      setTotalTime(0); setBestTime(null)
    }).catch(() => {})
  }, [grade, level])

  useEffect(() => {
    if (!currentWord) return
    setLetters(generateLetterTiles(currentWord, 12))
    setPlaced([]); setHintCount(0); setShowHint(false); setStartTime(Date.now())
    speakWordFn(true)
  }, [currentWord])

  useEffect(() => {
    if (!currentWord || placed.length === 0) return
    if (placed.length === splitGraphemes(currentWord).length) {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const earned = hintCount === 0 ? 3 : hintCount === 1 ? 2 : 1
      playWinSound(); setShowSuccess(true)
      setCorrectCount((c) => c + 1); setStars((s) => s + earned)
      setTotalTime((t) => t + timeTaken)
      setBestTime((b) => (b === null || timeTaken < b ? timeTaken : b))
    }
  }, [placed])

  const speakWordFn = useCallback(async (preloadOnly = false) => {
    if (!currentWord) return
    const cacheKey = `tts:${currentWord}`
    const cached = getCachedAudio(cacheKey)
    if (cached) {
      if (preloadOnly) return
      setIsPlayingAudio(true)
      const audio = new Audio(cached)
      audio.onended = () => setIsPlayingAudio(false)
      audio.onerror = () => setIsPlayingAudio(false)
      audio.play().catch(() => setIsPlayingAudio(false))
      return
    }
    if (preloadOnly) {
      textToSpeech(currentWord).then((url) => setCachedAudio(cacheKey, url)).catch(() => {})
      return
    }
    setIsPlayingAudio(true)
    try {
      const url = await textToSpeech(currentWord)
      setCachedAudio(cacheKey, url)
      const audio = new Audio(url)
      audio.onended = () => setIsPlayingAudio(false)
      audio.onerror = () => setIsPlayingAudio(false)
      audio.play()
    } catch {
      if ('speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(currentWord)
        utt.lang = 'he-IL'; utt.rate = 0.8
        utt.onend = () => setIsPlayingAudio(false)
        speechSynthesis.speak(utt)
      } else setIsPlayingAudio(false)
    }
  }, [currentWord])

  const handleLetterClick = (id, letter) => {
    if (!currentWord) return
    const graphemes = splitGraphemes(currentWord)
    if (placed.length >= graphemes.length) return
    if (norm(letter) !== norm(graphemes[placed.length])) {
      playErrorSound(); setWrongId(id)
      clearTimeout(wrongTimer.current)
      wrongTimer.current = setTimeout(() => setWrongId(null), 500)
      setWrongCount((c) => c + 1); return
    }
    setPlaced((p) => [...p, letter])
    setLetters((ls) => ls.map((l) => (l.id === id ? { ...l, used: true } : l)))
  }

  const handleRemoveLetter = (i) => {
    const removed = placed[i]
    setLetters((ls) => { let f = false; return ls.map((l) => { if (!f && l.used && l.letter === removed) { f = true; return { ...l, used: false } } return l }) })
    setPlaced((p) => p.filter((_, idx) => idx !== i))
  }

  const handleHint = () => { setShowHint(true); setHintCount((h) => h + 1); setTimeout(() => setShowHint(false), 3000) }
  const handleReset = () => { setPlaced([]); setLetters((ls) => ls.map((l) => ({ ...l, used: false }))); setShowHint(false) }
  const handleNextWord = () => {
    setShowSuccess(false)
    if (wordIndex + 1 >= totalWords) { setShowSummary(true); return }
    setWordIndex((i) => i + 1)
  }

  if (!childName) return <NamePrompt title="שמע ובנה 🎧" emoji="🎧" onStart={setChildName} />

  if (!grade) return (
    <Picker title={`שלום ${childName}! 👋`} subtitle="בחר כיתה" bg="from-emerald-50 to-teal-50">
      {GRADES.map((g, i) => (
        <motion.button key={g.value} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }} onClick={() => setGrade(g.value)}
          className={`w-full flex items-center justify-between bg-white rounded-3xl p-5 shadow-md border-2 ${g.border} hover:shadow-lg transition-all`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center text-2xl shadow-md`}>{g.emoji}</div>
            <span className={`text-xl font-black ${g.text}`}>{g.label}</span>
          </div>
          <span className="text-2xl">←</span>
        </motion.button>
      ))}
    </Picker>
  )

  if (!level) {
    const gi = GRADES.find((g) => g.value === grade)
    return (
      <Picker title={gi.label} subtitle="בחר רמת קושי" onBack={() => setGrade(null)} bg="from-violet-50 to-purple-50">
        {LEVELS.map((lv, i) => (
          <motion.button key={lv.value} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }} onClick={() => setLevel(lv.value)}
            className="w-full flex items-center justify-between bg-white rounded-3xl p-5 shadow-md border-2 border-purple-100 hover:border-purple-300 transition-all">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{lv.emoji}</span>
              <div className="text-right">
                <div className="text-xl font-black text-gray-800">{lv.label}</div>
                <div className="text-sm text-gray-400">{lv.desc}</div>
              </div>
            </div>
            <span className="text-2xl">←</span>
          </motion.button>
        ))}
      </Picker>
    )
  }

  if (showSummary) return <SummaryScreen childName={childName} correctCount={correctCount} wrongCount={wrongCount} totalWords={totalWords} stars={stars} totalTime={totalTime} bestTime={bestTime} />
  if (words.length === 0) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="text-5xl mb-3">⏳</div><p className="text-xl font-bold text-violet-600">טוען מילים...</p></div></div>

  const earnedStars = hintCount === 0 ? 3 : hintCount === 1 ? 2 : 1
  const gradeInfo = GRADES.find((g) => g.value === grade)
  const levelInfo = LEVELS.find((l) => l.value === level)

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto" style={{ background: 'var(--bg)' }}>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-purple-200 opacity-40 blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-56 h-56 rounded-full bg-blue-200 opacity-30 blur-3xl" />
      </div>
      <GameHeader stars={stars} current={wordIndex + 1} total={totalWords} childName={childName} />
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setGrade(null); setLevel(null) }}
          className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 ${gradeInfo.border} ${gradeInfo.bg} ${gradeInfo.text}`}>
          {gradeInfo.emoji} {gradeInfo.label}
        </button>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 ${gradeInfo.border} ${gradeInfo.bg} ${gradeInfo.text}`}>
          {levelInfo.emoji} {levelInfo.label}
        </span>
      </div>
      <motion.div key={currentWord} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-4xl p-6 shadow-lg border-2 border-purple-100 mb-5 text-center">
        <p className="text-sm font-semibold text-purple-300 mb-3">הקשיבי ובני את המילה 👂</p>
        <motion.div key={currentWordDisplay} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-black text-violet-700 mb-4 tracking-wider" style={{ fontFamily: 'Heebo, Arial' }}>
          {currentWordDisplay}
        </motion.div>
        <motion.button onClick={() => speakWordFn()} disabled={isPlayingAudio}
          whileHover={!isPlayingAudio ? { scale: 1.05 } : {}} whileTap={!isPlayingAudio ? { scale: 0.95 } : {}}
          className={`relative mx-auto flex items-center gap-3 font-bold text-lg px-7 py-3.5 rounded-3xl shadow-md transition-all ${
            isPlayingAudio ? 'bg-purple-100 text-purple-400 cursor-wait' : 'bg-violet-600 text-white hover:bg-violet-700'}`}>
          {isPlayingAudio && <motion.div className="absolute inset-0 rounded-3xl border-2 border-violet-400 opacity-50"
            animate={{ scale: [1,1.1,1], opacity: [0.5,0,0.5] }} transition={{ duration: 1.2, repeat: Infinity }} />}
          <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
          {isPlayingAudio ? 'מנגן...' : '🔊 הקראת המילה'}
        </motion.button>
        <DropZone placedLetters={placed} wordLength={splitGraphemes(currentWord).length}
          onRemoveLetter={handleRemoveLetter}
          isCorrect={placed.length > 0 && placed.length === splitGraphemes(currentWord).length}
          showHint={showHint} correctWord={currentWord} />
        <p className="text-xs text-purple-300 font-medium">לחצי על אות כדי להסיר אותה</p>
      </motion.div>
      <div className="flex flex-wrap justify-center gap-2.5 mb-5 relative">
        {letters.map((tile, i) => (
          <LetterTile key={tile.id} letterId={tile.id} letter={tile.letter} index={i}
            isUsed={tile.used} isWrong={wrongId === tile.id} onClick={handleLetterClick} />
        ))}
        <AnimatePresence>
          {wrongId && <motion.div initial={{ scale: 0, y: 0 }} animate={{ scale: 1.4, y: -50, opacity: [1,1,0] }}
            exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-4xl z-20">😬</motion.div>}
        </AnimatePresence>
      </div>
      <div className="flex gap-3 justify-center">
        <ActionBtn onClick={() => speakWordFn()} icon={<Volume2 className="w-5 h-5" />} label="שמעי שוב" color="purple" />
        <ActionBtn onClick={handleHint} icon={<Lightbulb className="w-5 h-5" />} label="רמז" color="yellow" />
        <ActionBtn onClick={handleReset} icon={<RotateCcw className="w-5 h-5" />} label="מחדש" color="red" />
      </div>
      <SuccessAnimation show={showSuccess} onComplete={handleNextWord} stars={earnedStars} />
    </div>
  )
}

function Picker({ title, subtitle, children, onBack, bg = 'from-purple-50 to-violet-50' }) {
  return (
    <div className={`min-h-screen p-5 max-w-md mx-auto bg-gradient-to-br ${bg}`}>
      <div className="pt-4 mb-6">
        {onBack && <button onClick={onBack} className="text-sm text-gray-400 font-medium mb-3 flex items-center gap-1 hover:text-gray-600">→ חזרה</button>}
        <h1 className="text-3xl font-black text-violet-700">{title}</h1>
        <p className="text-gray-400 font-medium mt-1">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function ActionBtn({ onClick, icon, label, color }) {
  const colors = {
    purple: 'bg-purple-50 border-purple-200 text-violet-700 hover:bg-purple-100',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
    red:    'bg-red-50 border-red-200 text-red-600 hover:bg-red-100',
  }
  return (
    <motion.button onClick={onClick} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-colors ${colors[color]}`}>
      {icon}{label}
    </motion.button>
  )
}

function playWinSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[[523.25,0,0.15],[659.25,0.08,0.15],[783.99,0.16,0.25]].forEach(([f,s,d]) => {
      const osc = ctx.createOscillator(), g = ctx.createGain()
      osc.connect(g); g.connect(ctx.destination); osc.frequency.value = f; osc.type = 'sine'
      const t = ctx.currentTime + s
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.3,t+0.01); g.gain.exponentialRampToValueAtTime(0.01,t+d)
      osc.start(t); osc.stop(t+d)
    })
  } catch {}
}

function playErrorSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator(), g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination); osc.frequency.value = 280; osc.type = 'sine'
    const t = ctx.currentTime
    g.gain.setValueAtTime(0.2,t); g.gain.exponentialRampToValueAtTime(0.01,t+0.25)
    osc.start(t); osc.stop(t+0.25)
  } catch {}
}
