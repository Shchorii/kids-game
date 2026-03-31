// src/pages/CalculateGame.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, RotateCcw, Mic, MicOff } from 'lucide-react'
import GameHeader from '@/components/game/GameHeader'
import NumberTile from '@/components/game/NumberTile'
import MathDropZone from '@/components/game/MathDropZone'
import SuccessAnimation from '@/components/game/SuccessAnimation'
import SummaryScreen from '@/components/game/SummaryScreen'
import NamePrompt from '@/components/game/NamePrompt'
import { generateDigitTiles } from '@/lib/hebrew'
import { saveProgress, getProgress, saveMathSession } from '@/lib/api'

const DIFFICULTY = {
  1: { name: 'קל מאוד 🌱', range: [1, 10], ops: ['add', 'subtract'] },
  2: { name: 'קל ⭐',        range: [1, 15], ops: ['add', 'subtract'] },
  3: { name: 'בינוני 🌟',    range: [5, 25], ops: ['add', 'subtract'] },
  4: { name: 'קשה 🔥',       range: [10, 40], ops: ['add', 'subtract'] },
  5: { name: 'מאתגר 💫',     range: [20, 60], ops: ['add', 'subtract'] },
  6: { name: 'לוח הכפל 🚀',  range: [1, 10], ops: ['multiply', 'divide'] },
}

function generateProblem(difficulty, existing = []) {
  const level = DIFFICULTY[difficulty]
  if (!level) return { a: 2, b: 1, op: 'add', answer: 3 }
  const [min, max] = level.range

  for (let i = 0; i < 100; i++) {
    let a = Math.floor(Math.random() * (max - min + 1)) + min
    let b = Math.floor(Math.random() * (max - min + 1)) + min
    const op = level.ops[Math.floor(Math.random() * level.ops.length)]
    let answer

    if (op === 'subtract') { if (b > a) [a, b] = [b, a]; answer = a - b }
    else if (op === 'add') { answer = a + b }
    else if (op === 'multiply') { answer = a * b; if (answer > 100) continue }
    else { if (a % b !== 0) continue; answer = a / b }

    if (answer < 0) continue
    const key = `${a}${op}${b}`
    if (existing.some((p) => `${p.a}${p.op}${p.b}` === key)) continue
    return { a, b, op, answer }
  }
  return { a: 2, b: 1, op: 'add', answer: 3 }
}

const OP_SYMBOLS = { add: '+', subtract: '−', multiply: '×', divide: '÷' }
const OP_LABELS  = { add: 'ועוד', subtract: 'פחות', multiply: 'כפול', divide: 'חלקי' }

export default function CalculateGame() {
  const [childName, setChildName] = useState(null)
  const [difficulty, setDifficulty] = useState(null)
  const [problems, setProblems] = useState([])
  const [problemIndex, setProblemIndex] = useState(0)
  const [tiles, setTiles] = useState([])
  const [placed, setPlaced] = useState([])
  const [wrongId, setWrongId] = useState(null)
  const wrongTimer = useRef(null)

  const [stars, setStars] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [hintCount, setHintCount] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [totalTime, setTotalTime] = useState(0)
  const [bestTime, setBestTime] = useState(null)
  const [maxStreak, setMaxStreak] = useState(0)
  const [streak, setStreak] = useState(0)
  const [startTime, setStartTime] = useState(null)

  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  const current = problems[problemIndex] || null
  const totalProblems = 10

  // Setup voice recognition
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = 'he-IL'
    r.continuous = false
    r.interimResults = false
    r.onresult = (e) => {
      const t = e.results[0][0].transcript
      handleVoiceAnswer(t)
    }
    r.onend = () => setIsListening(false)
    r.onerror = () => setIsListening(false)
    recognitionRef.current = r
  }, [])

  // When difficulty chosen, generate session
  useEffect(() => {
    if (!difficulty) return
    const ps = []
    for (let i = 0; i < totalProblems; i++) ps.push(generateProblem(difficulty, ps))
    setProblems(ps)
    setProblemIndex(0)
    setStars(0); setCorrectCount(0); setWrongCount(0)
    setStreak(0); setMaxStreak(0); setTotalTime(0); setBestTime(null)
  }, [difficulty])

  // Load tiles when problem changes
  useEffect(() => {
    if (!current) return
    setTiles(generateDigitTiles(current.answer, 12))
    setPlaced([])
    setHintCount(0)
    setShowHint(false)
    setStartTime(Date.now())
  }, [current])

  // Check answer
  useEffect(() => {
    if (!current) return
    const answerStr = String(current.answer)
    if (placed.length === answerStr.length && placed.join('') === answerStr) {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const earned = hintCount === 0 ? 3 : hintCount === 1 ? 2 : 1
      playWinSound()
      setShowSuccess(true)
      setCorrectCount((c) => c + 1)
      setStars((s) => s + earned)
      setStreak((s) => { const ns = s + 1; setMaxStreak((m) => Math.max(m, ns)); return ns })
      setTotalTime((t) => t + timeTaken)
      setBestTime((b) => (b === null || timeTaken < b ? timeTaken : b))
    }
  }, [placed])

  const handleTileClick = (id, number) => {
    if (!current) return
    const answerStr = String(current.answer)
    if (placed.length >= answerStr.length) return

    const correctDigit = parseInt(answerStr[placed.length])
    if (number !== correctDigit) {
      playErrorSound()
      setWrongId(id)
      clearTimeout(wrongTimer.current)
      wrongTimer.current = setTimeout(() => setWrongId(null), 500)
      setWrongCount((c) => c + 1)
      setStreak(0)
      return
    }

    setPlaced((p) => [...p, number])
    setTiles((ts) => ts.map((t) => (t.id === id ? { ...t, used: true } : t)))
  }

  const handleRemoveDigit = (i) => {
    const removed = placed[i]
    setTiles((ts) => {
      let found = false
      return ts.map((t) => {
        if (!found && t.used && t.number === removed) { found = true; return { ...t, used: false } }
        return t
      })
    })
    setPlaced((p) => p.filter((_, idx) => idx !== i))
  }

  const handleVoiceAnswer = useCallback((transcript) => {
    if (!current) return
    const match = transcript.match(/\d+/)
    if (!match) return
    const voiced = parseInt(match[0])
    if (voiced === current.answer) {
      // treat as correct — place all digits
      const digits = String(current.answer).split('').map(Number)
      setPlaced(digits)
    }
  }, [current])

  const handleReset = () => {
    setPlaced([])
    setTiles((ts) => ts.map((t) => ({ ...t, used: false })))
    setShowHint(false)
  }

  const handleHint = () => {
    setShowHint(true)
    setHintCount((h) => h + 1)
    setTimeout(() => setShowHint(false), 3000)
  }

  const handleNextProblem = async () => {
    setShowSuccess(false)
    if (problemIndex + 1 >= totalProblems) {
      // Save session
      if (childName) {
        const session = {
          child_name: childName,
          difficulty_level: difficulty,
          correct_answers: correctCount + 1,
          wrong_answers: wrongCount,
          stars_earned: stars,
          max_streak: maxStreak,
          total_time: totalTime,
          best_time: bestTime,
        }
        saveMathSession(childName, session).catch(() => {})
        saveProgress(childName, { math_stars: stars }).catch(() => {})
      }
      setShowSummary(true)
      return
    }
    setProblemIndex((i) => i + 1)
  }

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  if (!childName) return <NamePrompt title="משחק חשבון 🧮" emoji="🧮" onStart={setChildName} />

  // Difficulty picker
  if (!difficulty) return (
    <div className="min-h-screen p-5 max-w-md mx-auto" style={{ background: 'var(--bg)' }}>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-orange-200 opacity-40 blur-3xl" />
        <div className="absolute -bottom-16 left-0 w-56 h-56 rounded-full bg-yellow-200 opacity-40 blur-3xl" />
      </div>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-black text-orange-600 text-center mb-2 mt-4"
      >
        שלום {childName}! 👋
      </motion.h1>
      <p className="text-center text-gray-400 font-medium mb-8">בחר רמת קושי</p>
      <div className="flex flex-col gap-3">
        {Object.entries(DIFFICULTY).map(([lvl, cfg], i) => (
          <motion.button
            key={lvl}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ scale: 1.02, x: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setDifficulty(parseInt(lvl))}
            className="bg-white rounded-3xl p-5 shadow-md border-2 border-orange-100 flex items-center justify-between font-bold text-xl text-gray-800 hover:border-orange-300 transition-colors"
          >
            <span>{cfg.name}</span>
            <span className="text-sm font-medium text-gray-400">
              {parseInt(lvl) < 6 ? `${cfg.range[0]}–${cfg.range[1]}` : '×÷'}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )

  if (showSummary) return (
    <SummaryScreen
      childName={childName} correctCount={correctCount} wrongCount={wrongCount}
      totalWords={totalProblems} stars={stars} totalTime={totalTime} bestTime={bestTime}
    />
  )

  const earnedStars = hintCount === 0 ? 3 : hintCount === 1 ? 2 : 1

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto" style={{ background: 'var(--bg)' }}>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-orange-200 opacity-40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-yellow-200 opacity-30 blur-3xl" />
      </div>

      <GameHeader stars={stars} current={problemIndex + 1} total={totalProblems} childName={childName} />

      {/* Stats row */}
      <div className="flex gap-2 mb-4 text-sm font-bold">
        <span className="bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full">✓ {correctCount}</span>
        <span className="bg-red-50 border border-red-200 text-red-600 px-3 py-1 rounded-full">✗ {wrongCount}</span>
        <motion.span
          animate={streak > 0 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1, repeat: streak > 0 ? Infinity : 0 }}
          className="bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1 rounded-full"
        >
          🔥 {streak}
        </motion.span>
      </div>

      {/* Problem card */}
      {current && (
        <motion.div
          key={problemIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-4xl p-6 shadow-lg border-2 border-orange-100 mb-5 text-center"
        >
          {/* Visual dots for simple addition/subtraction */}
          {(current.op === 'add' || current.op === 'subtract') && current.a <= 20 && current.b <= 20 && (
            <div className="flex justify-center gap-6 mb-4">
              <Dots count={current.a} color="#7C3AED" />
              <Dots count={current.b} color="#F97316" />
            </div>
          )}

          {/* Equation */}
          <div className="flex items-center justify-center gap-4 mb-2" dir="ltr">
            <span className="text-5xl font-black text-violet-700">{current.a}</span>
            <span className="text-4xl font-black text-red-500">{OP_SYMBOLS[current.op]}</span>
            <span className="text-5xl font-black text-orange-600">{current.b}</span>
          </div>
          <p className="text-gray-400 text-sm font-medium mb-2">
            {current.a} {OP_LABELS[current.op]} {current.b} = ?
          </p>

          <MathDropZone
            placedDigits={placed}
            answerLength={String(current.answer).length}
            onRemoveDigit={handleRemoveDigit}
            isCorrect={placed.join('') === String(current.answer) && placed.length > 0}
            showHint={showHint}
            correctAnswer={current.answer}
          />
        </motion.div>
      )}

      {/* Number tiles */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-5">
        {tiles.map((tile, i) => (
          <NumberTile
            key={tile.id}
            numberId={tile.id}
            number={tile.number}
            index={i}
            isUsed={tile.used}
            isWrong={wrongId === tile.id}
            onClick={handleTileClick}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        <ActionBtn onClick={toggleVoice} color={isListening ? 'red' : 'green'}
          icon={isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          label={isListening ? 'עצור' : 'ענה בקול'} />
        <ActionBtn onClick={handleHint} icon={<Lightbulb className="w-5 h-5" />} label="רמז" color="yellow" />
        <ActionBtn onClick={handleReset} icon={<RotateCcw className="w-5 h-5" />} label="מחדש" color="gray" />
      </div>

      <SuccessAnimation show={showSuccess} onComplete={handleNextProblem} stars={earnedStars} />
    </div>
  )
}

function Dots({ count, color }) {
  if (count > 15) return null
  return (
    <div className="flex flex-wrap gap-1 max-w-[80px] justify-center">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.02 }}
          style={{ background: color }}
          className="w-3.5 h-3.5 rounded-full opacity-80"
        />
      ))}
    </div>
  )
}

function ActionBtn({ onClick, icon, label, color }) {
  const colors = {
    purple: 'bg-purple-50 border-purple-200 text-violet-700 hover:bg-purple-100',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
    red: 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100',
    green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
    gray: 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100',
  }
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-colors ${colors[color]}`}
    >
      {icon}{label}
    </motion.button>
  )
}

function playWinSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[[523.25, 0, 0.15], [659.25, 0.08, 0.15], [783.99, 0.16, 0.25]].forEach(([f, s, d]) => {
      const osc = ctx.createOscillator(); const g = ctx.createGain()
      osc.connect(g); g.connect(ctx.destination)
      osc.frequency.value = f; osc.type = 'sine'
      const t = ctx.currentTime + s
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.3, t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.01, t + d)
      osc.start(t); osc.stop(t + d)
    })
  } catch {}
}

function playErrorSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator(); const g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.frequency.value = 280; osc.type = 'sine'
    const t = ctx.currentTime
    g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.25)
    osc.start(t); osc.stop(t + 0.25)
  } catch {}
}
