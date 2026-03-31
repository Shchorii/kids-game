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
import { getWords, getProgress, saveProgress } from '@/lib/api'
import { getCachedAudio, setCachedAudio } from '@/lib/storage'
import { textToSpeech } from '@/lib/api'

export default function ListenAndBuild() {
  const [childName, setChildName] = useState(null)
  const [words, setWords] = useState([])
  const [wordIndex, setWordIndex] = useState(0)
  const [letters, setLetters] = useState([])
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
  const [startTime, setStartTime] = useState(null)

  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [progressId, setProgressId] = useState(null)

  const currentWordData = words[wordIndex] || null
  const currentWord = currentWordData ? norm(stripNiqqud(currentWordData.word_plain || '')) : ''
  const totalWords = words.length

  // Load words and progress
  useEffect(() => {
    if (!childName) return
    Promise.all([
      getWords().catch(() => []),
      getProgress(childName).catch(() => null),
    ]).then(([ws, prog]) => {
      const active = ws.filter((w) => w.active !== false)
      const sorted = active.sort((a, b) => (a.level || 1) - (b.level || 1))
      setWords(sorted)
      if (prog) {
        setStars(prog.stars || 0)
        setProgressId(prog.id)
      }
    })
  }, [childName])

  // Generate tiles when word changes
  useEffect(() => {
    if (!currentWord) return
    setLetters(generateLetterTiles(currentWord, 12))
    setPlaced([])
    setHintCount(0)
    setShowHint(false)
    setStartTime(Date.now())
    // Preload audio
    speakWord(true)
  }, [currentWord])

  // Check answer in real-time
  useEffect(() => {
    if (!currentWord || placed.length === 0) return
    const graphemes = splitGraphemes(currentWord)
    if (placed.length === graphemes.length) {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const earned = hintCount === 0 ? 3 : hintCount === 1 ? 2 : 1
      playWinSound()
      setShowSuccess(true)
      setCorrectCount((c) => c + 1)
      setStars((s) => s + earned)
      setTotalTime((t) => t + timeTaken)
      setBestTime((b) => (b === null || timeTaken < b ? timeTaken : b))
      // Save progress
      if (childName) {
        saveProgress(childName, { stars: stars + earned, words_completed: correctCount + 1 }).catch(() => {})
      }
    }
  }, [placed])

  const speakWord = useCallback(async (preloadOnly = false) => {
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
      // Background preload
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
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(currentWord)
        utt.lang = 'he-IL'
        utt.rate = 0.8
        utt.onend = () => setIsPlayingAudio(false)
        speechSynthesis.speak(utt)
      } else {
        setIsPlayingAudio(false)
      }
    }
  }, [currentWord])

  const handleLetterClick = (id, letter) => {
    if (!currentWord) return
    const graphemes = splitGraphemes(currentWord)
    if (placed.length >= graphemes.length) return

    const correctLetter = graphemes[placed.length]
    if (norm(letter) !== norm(correctLetter)) {
      // Wrong letter
      playErrorSound()
      setWrongId(id)
      clearTimeout(wrongTimer.current)
      wrongTimer.current = setTimeout(() => setWrongId(null), 500)
      setWrongCount((c) => c + 1)
      return
    }

    setPlaced((p) => [...p, letter])
    setLetters((ls) => ls.map((l) => (l.id === id ? { ...l, used: true } : l)))
  }

  const handleRemoveLetter = (i) => {
    const removed = placed[i]
    setLetters((ls) => {
      let found = false
      return ls.map((l) => {
        if (!found && l.used && l.letter === removed) { found = true; return { ...l, used: false } }
        return l
      })
    })
    setPlaced((p) => p.filter((_, idx) => idx !== i))
  }

  const handleReset = () => {
    setPlaced([])
    setLetters((ls) => ls.map((l) => ({ ...l, used: false })))
    setShowHint(false)
  }

  const handleHint = () => {
    setShowHint(true)
    setHintCount((h) => h + 1)
    setTimeout(() => setShowHint(false), 3000)
  }

  const handleNextWord = () => {
    setShowSuccess(false)
    if (wordIndex + 1 >= totalWords) {
      setShowSummary(true)
      return
    }
    setWordIndex((i) => i + 1)
  }

  if (!childName) return <NamePrompt title="שמע ובנה 🎧" emoji="🎧" onStart={setChildName} />
  if (showSummary) return (
    <SummaryScreen
      childName={childName} correctCount={correctCount} wrongCount={wrongCount}
      totalWords={totalWords} stars={stars} totalTime={totalTime} bestTime={bestTime}
    />
  )

  const earnedStars = hintCount === 0 ? 3 : hintCount === 1 ? 2 : 1

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto" style={{ background: 'var(--bg)' }}>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-purple-200 opacity-40 blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-56 h-56 rounded-full bg-blue-200 opacity-30 blur-3xl" />
      </div>

      <GameHeader stars={stars} current={wordIndex + 1} total={totalWords} childName={childName} />

      {/* Word display card */}
      <motion.div
        key={currentWord}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-4xl p-6 shadow-lg border-2 border-purple-100 mb-5 text-center"
      >
        <p className="text-sm font-semibold text-purple-300 mb-4">הקשיבי ובני את המילה 👂</p>

        {/* Speak button */}
        <motion.button
          onClick={() => speakWord()}
          disabled={isPlayingAudio}
          whileHover={!isPlayingAudio ? { scale: 1.05 } : {}}
          whileTap={!isPlayingAudio ? { scale: 0.95 } : {}}
          className={`relative mx-auto flex items-center gap-3 font-bold text-xl px-8 py-4 rounded-3xl shadow-md transition-all ${
            isPlayingAudio
              ? 'bg-purple-100 text-purple-400 cursor-wait'
              : 'bg-violet-600 text-white hover:bg-violet-700 shadow-violet-200'
          }`}
        >
          {isPlayingAudio && (
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-violet-400 opacity-50"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}
          <Volume2 className={`w-6 h-6 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
          {isPlayingAudio ? 'מנגן...' : '🔊 הקראת המילה'}
        </motion.button>

        {/* Drop zone */}
        <DropZone
          placedLetters={placed}
          wordLength={splitGraphemes(currentWord).length}
          onRemoveLetter={handleRemoveLetter}
          isCorrect={placed.length > 0 && placed.length === splitGraphemes(currentWord).length}
          showHint={showHint}
          correctWord={currentWord}
        />

        <p className="text-xs text-purple-300 font-medium">לחצי על אות כדי להסיר אותה</p>
      </motion.div>

      {/* Letter tiles */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-5 relative">
        {letters.map((tile, i) => (
          <LetterTile
            key={tile.id}
            letterId={tile.id}
            letter={tile.letter}
            index={i}
            isUsed={tile.used}
            isWrong={wrongId === tile.id}
            onClick={handleLetterClick}
          />
        ))}
        {/* Wrong feedback emoji */}
        <AnimatePresence>
          {wrongId && (
            <motion.div
              initial={{ scale: 0, y: 0 }}
              animate={{ scale: 1.4, y: -50, opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-4xl z-20"
            >
              😬
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        <ActionBtn onClick={() => speakWord()} icon={<Volume2 className="w-5 h-5" />} label="שמעי שוב" color="purple" />
        <ActionBtn onClick={handleHint} icon={<Lightbulb className="w-5 h-5" />} label="רמז" color="yellow" />
        <ActionBtn onClick={handleReset} icon={<RotateCcw className="w-5 h-5" />} label="מחדש" color="red" />
      </div>

      <SuccessAnimation show={showSuccess} onComplete={handleNextWord} stars={earnedStars} />
    </div>
  )
}

function ActionBtn({ onClick, icon, label, color }) {
  const colors = {
    purple: 'bg-purple-50 border-purple-200 text-violet-700 hover:bg-purple-100',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
    red: 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100',
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

// Sounds
function playWinSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[
      [523.25, 0, 0.15],
      [659.25, 0.08, 0.15],
      [783.99, 0.16, 0.25],
    ].forEach(([freq, start, dur]) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      const t = ctx.currentTime + start
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.3, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.01, t + dur)
      osc.start(t)
      osc.stop(t + dur)
    })
  } catch {}
}

function playErrorSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 280
    osc.type = 'sine'
    const t = ctx.currentTime
    gain.gain.setValueAtTime(0.2, t)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25)
    osc.start(t)
    osc.stop(t + 0.25)
  } catch {}
}
