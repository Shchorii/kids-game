// src/pages/EnglishGame.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, ArrowRight, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import NamePrompt from '@/components/game/NamePrompt'
import GameHeader from '@/components/game/GameHeader'

// ─── Vocabulary bank ────────────────────────────────────────────────────────
// Each item: { word, emoji, hebrew, level }
const VOCAB = [
  // Level 1 — animals & basic objects
  { word: 'cat',   emoji: '🐱', hebrew: 'חתול',   level: 1 },
  { word: 'dog',   emoji: '🐶', hebrew: 'כלב',    level: 1 },
  { word: 'bird',  emoji: '🐦', hebrew: 'ציפור',  level: 1 },
  { word: 'fish',  emoji: '🐟', hebrew: 'דג',     level: 1 },
  { word: 'cow',   emoji: '🐄', hebrew: 'פרה',    level: 1 },
  { word: 'horse', emoji: '🐴', hebrew: 'סוס',    level: 1 },
  { word: 'sheep', emoji: '🐑', hebrew: 'כבש',    level: 1 },
  { word: 'duck',  emoji: '🦆', hebrew: 'ברווז',  level: 1 },
  { word: 'frog',  emoji: '🐸', hebrew: 'צפרדע', level: 1 },
  { word: 'lion',  emoji: '🦁', hebrew: 'אריה',   level: 1 },
  { word: 'bear',  emoji: '🐻', hebrew: 'דוב',    level: 1 },
  { word: 'sun',   emoji: '☀️', hebrew: 'שמש',    level: 1 },
  { word: 'moon',  emoji: '🌙', hebrew: 'ירח',    level: 1 },
  { word: 'star',  emoji: '⭐', hebrew: 'כוכב',   level: 1 },
  { word: 'tree',  emoji: '🌳', hebrew: 'עץ',     level: 1 },
  { word: 'house', emoji: '🏠', hebrew: 'בית',    level: 1 },
  { word: 'car',   emoji: '🚗', hebrew: 'מכונית', level: 1 },
  { word: 'book',  emoji: '📚', hebrew: 'ספר',    level: 1 },
  { word: 'ball',  emoji: '⚽', hebrew: 'כדור',   level: 1 },
  { word: 'heart', emoji: '❤️', hebrew: 'לב',     level: 1 },
  // Level 2 — food, colors, body parts
  { word: 'apple',  emoji: '🍎', hebrew: 'תפוח',  level: 2 },
  { word: 'banana', emoji: '🍌', hebrew: 'בננה',  level: 2 },
  { word: 'orange', emoji: '🍊', hebrew: 'תפוז',  level: 2 },
  { word: 'bread',  emoji: '🍞', hebrew: 'לחם',   level: 2 },
  { word: 'milk',   emoji: '🥛', hebrew: 'חלב',   level: 2 },
  { word: 'egg',    emoji: '🥚', hebrew: 'ביצה',  level: 2 },
  { word: 'cake',   emoji: '🎂', hebrew: 'עוגה',  level: 2 },
  { word: 'pizza',  emoji: '🍕', hebrew: 'פיצה',  level: 2 },
  { word: 'eye',    emoji: '👁️', hebrew: 'עין',   level: 2 },
  { word: 'ear',    emoji: '👂', hebrew: 'אוזן',  level: 2 },
  { word: 'hand',   emoji: '✋', hebrew: 'יד',    level: 2 },
  { word: 'foot',   emoji: '🦶', hebrew: 'רגל',   level: 2 },
  { word: 'nose',   emoji: '👃', hebrew: 'אף',    level: 2 },
  { word: 'mouth',  emoji: '👄', hebrew: 'פה',    level: 2 },
  { word: 'red',    emoji: '🔴', hebrew: 'אדום',  level: 2 },
  { word: 'blue',   emoji: '🔵', hebrew: 'כחול',  level: 2 },
  { word: 'green',  emoji: '🟢', hebrew: 'ירוק',  level: 2 },
  { word: 'yellow', emoji: '🟡', hebrew: 'צהוב',  level: 2 },
  { word: 'black',  emoji: '⚫', hebrew: 'שחור',  level: 2 },
  { word: 'white',  emoji: '⚪', hebrew: 'לבן',   level: 2 },
  // Level 3 — verbs & actions
  { word: 'run',   emoji: '🏃', hebrew: 'רץ',    level: 3 },
  { word: 'jump',  emoji: '🦘', hebrew: 'קופץ',  level: 3 },
  { word: 'swim',  emoji: '🏊', hebrew: 'שוחה',  level: 3 },
  { word: 'fly',   emoji: '✈️', hebrew: 'עף',    level: 3 },
  { word: 'eat',   emoji: '🍽️', hebrew: 'אוכל',  level: 3 },
  { word: 'sleep', emoji: '😴', hebrew: 'ישן',   level: 3 },
  { word: 'cry',   emoji: '😢', hebrew: 'בוכה',  level: 3 },
  { word: 'laugh', emoji: '😂', hebrew: 'צוחק',  level: 3 },
  { word: 'dance', emoji: '💃', hebrew: 'רוקד',  level: 3 },
  { word: 'sing',  emoji: '🎤', hebrew: 'שר',    level: 3 },
  { word: 'read',  emoji: '📖', hebrew: 'קורא',  level: 3 },
  { word: 'write', emoji: '✏️', hebrew: 'כותב',  level: 3 },
  { word: 'big',   emoji: '🐘', hebrew: 'גדול',  level: 3 },
  { word: 'small', emoji: '🐭', hebrew: 'קטן',   level: 3 },
  { word: 'hot',   emoji: '🔥', hebrew: 'חם',    level: 3 },
  { word: 'cold',  emoji: '🧊', hebrew: 'קר',    level: 3 },
  { word: 'happy', emoji: '😊', hebrew: 'שמח',   level: 3 },
  { word: 'sad',   emoji: '😢', hebrew: 'עצוב',  level: 3 },
  { word: 'rain',  emoji: '🌧️', hebrew: 'גשם',   level: 3 },
  { word: 'snow',  emoji: '❄️', hebrew: 'שלג',   level: 3 },
]

const LEVELS = [
  { value: 1, label: 'קל',     emoji: '🟢', desc: 'חיות וחפצים' },
  { value: 2, label: 'בינוני', emoji: '🟡', desc: 'אוכל, צבעים, גוף' },
  { value: 3, label: 'קשה',    emoji: '🔴', desc: 'פעלים ותיאורים' },
]
const MODES = [
  { value: 'img2word', label: 'ראה תמונה → בחר מילה', emoji: '🖼️➡️🔤', desc: 'תמונה מוצגת, בחר מילה באנגלית' },
  { value: 'word2img', label: 'ראה מילה → בחר תמונה', emoji: '🔤➡️🖼️', desc: 'מילה מוצגת, בחר את התמונה הנכונה' },
]

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function getChoices(correct, pool, count = 4) {
  const others = shuffle(pool.filter(v => v.word !== correct.word)).slice(0, count - 1)
  return shuffle([correct, ...others])
}

function speakEnglish(word) {
  if (!('speechSynthesis' in window)) return
  speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(word)
  utt.lang = 'en-US'; utt.rate = 0.85; utt.pitch = 1.1
  const voices = speechSynthesis.getVoices()
  const voice = voices.find(v => v.lang === 'en-US' && v.name.includes('Samantha')) ||
                voices.find(v => v.lang === 'en-US') ||
                voices.find(v => v.lang.startsWith('en'))
  if (voice) utt.voice = voice
  speechSynthesis.speak(utt)
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function EnglishGame() {
  const navigate = useNavigate()
  const [childName, setChildName] = useState(null)
  const [level, setLevel]         = useState(null)
  const [mode, setMode]           = useState(null)
  const [queue, setQueue]         = useState([])
  const [index, setIndex]         = useState(0)
  const [stars, setStars]         = useState(0)
  const [correct, setCorrect]     = useState(0)
  const [wrong, setWrong]         = useState(0)
  const [chosen, setChosen]       = useState(null) // word chosen
  const [result, setResult]       = useState(null) // 'correct' | 'wrong'
  const [showSummary, setShowSummary] = useState(false)
  const nextTimer = useRef(null)

  const pool = VOCAB.filter(v => v.level === level)
  const current = queue[index] || null
  const choices = current ? getChoices(current, pool) : []

  useEffect(() => {
    if (level && mode && pool.length >= 4) {
      setQueue(shuffle(pool).slice(0, 10))
      setIndex(0); setStars(0); setCorrect(0); setWrong(0)
      setChosen(null); setResult(null)
    }
  }, [level, mode])

  useEffect(() => {
    if (current && mode === 'img2word') {
      setTimeout(() => speakEnglish(current.word), 300)
    }
    if (current && mode === 'word2img') {
      setTimeout(() => speakEnglish(current.word), 300)
    }
  }, [current?.word])

  function handleChoice(item) {
    if (chosen) return
    setChosen(item.word)
    const isCorrect = item.word === current.word
    setResult(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) { setStars(s => s + 1); setCorrect(c => c + 1) }
    else setWrong(w => w + 1)
    speakEnglish(current.word)
    nextTimer.current = setTimeout(() => {
      if (index + 1 >= queue.length) { setShowSummary(true) }
      else { setIndex(i => i + 1); setChosen(null); setResult(null) }
    }, isCorrect ? 1200 : 1800)
  }

  if (!childName) return <NamePrompt title="English Time! 🇬🇧" emoji="🔤" onStart={setChildName} />

  if (!level) return (
    <Picker title={`Hello, ${childName}! 👋`} subtitle="בחר רמת קושי" onBack={() => navigate('/')}>
      {LEVELS.map((lv, i) => (
        <motion.button key={lv.value} onClick={() => setLevel(lv.value)}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}
          className="w-full flex items-center gap-4 bg-white rounded-3xl p-5 shadow-md border-2 border-blue-100 hover:border-blue-300 transition-all">
          <span className="text-3xl">{lv.emoji}</span>
          <div className="text-right">
            <div className="text-xl font-black text-gray-800">{lv.label}</div>
            <div className="text-sm text-gray-400">{lv.desc}</div>
          </div>
        </motion.button>
      ))}
    </Picker>
  )

  if (!mode) return (
    <Picker title="בחר מצב משחק" subtitle="" onBack={() => setLevel(null)}>
      {MODES.map((m, i) => (
        <motion.button key={m.value} onClick={() => setMode(m.value)}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}
          className="w-full bg-white rounded-3xl p-6 shadow-md border-2 border-blue-100 hover:border-blue-300 transition-all text-right">
          <div className="text-3xl mb-2">{m.emoji}</div>
          <div className="text-xl font-black text-gray-800 mb-1">{m.label}</div>
          <div className="text-sm text-gray-400">{m.desc}</div>
        </motion.button>
      ))}
    </Picker>
  )

  if (showSummary) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-4xl p-8 shadow-xl text-center max-w-sm w-full border-2 border-blue-100">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-black text-blue-700 mb-2">Well Done!</h2>
        <p className="text-gray-400 mb-6">סיימת את הסבב!</p>
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-black text-green-500">{correct}</div>
            <div className="text-sm text-gray-400">נכון ✅</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-orange-400">{stars}⭐</div>
            <div className="text-sm text-gray-400">כוכבים</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-red-400">{wrong}</div>
            <div className="text-sm text-gray-400">שגוי ❌</div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => { setIndex(0); setChosen(null); setResult(null); setShowSummary(false); setQueue(shuffle(pool).slice(0,10)); setStars(0); setCorrect(0); setWrong(0) }}
            className="py-3 rounded-2xl bg-blue-600 text-white font-black text-lg hover:bg-blue-700 transition-colors">
            שחק שוב 🔄
          </button>
          <button onClick={() => navigate('/')}
            className="py-3 rounded-2xl border-2 border-blue-100 text-gray-500 font-semibold hover:bg-blue-50 transition-colors">
            חזרה הביתה 🏠
          </button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto bg-gradient-to-br from-sky-50 to-indigo-50">
      {/* Floating flags */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {['🇬🇧','⭐','🔤','✏️','📚','🌍'].map((e, i) => (
          <motion.div key={i} className="absolute text-3xl opacity-20"
            style={{ left: `${10 + i*15}%`, top: `${5 + (i%3)*25}%` }}
            animate={{ y: [0,-15,10,-5,0], rotate: [0,5,-5,3,0] }}
            transition={{ duration: 8+i*2, repeat: Infinity, delay: -i*2 }}>
            {e}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pt-2">
        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-2xl bg-white border-2 border-blue-100 flex items-center justify-center shadow-sm">
          <Home className="w-5 h-5 text-blue-500" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-blue-500 bg-white px-3 py-1 rounded-full border-2 border-blue-100">
            {index + 1} / {queue.length}
          </span>
          <span className="text-sm font-bold text-yellow-600 bg-white px-3 py-1 rounded-full border-2 border-yellow-100">
            ⭐ {stars}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-blue-100 rounded-full mb-5 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
          animate={{ width: `${((index) / queue.length) * 100}%` }}
          transition={{ duration: 0.4 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current?.word + mode}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
          className="flex flex-col gap-5">

          {/* Main card */}
          <div className="bg-white rounded-4xl p-6 shadow-lg border-2 border-blue-100 text-center">
            {mode === 'img2word' ? (
              <>
                <p className="text-sm font-semibold text-blue-300 mb-3">מה זה באנגלית? 🤔</p>
                <div className="text-9xl mb-4 select-none">{current?.emoji}</div>
                <p className="text-sm text-gray-300 font-medium">{current?.hebrew}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-blue-300 mb-3">בחר את התמונה הנכונה 👇</p>
                <div className="text-5xl font-black text-blue-700 mb-2 tracking-widest uppercase">
                  {current?.word}
                </div>
                <p className="text-sm text-gray-300 font-medium">{current?.hebrew}</p>
              </>
            )}
            <button onClick={() => speakEnglish(current?.word)}
              className="mt-4 mx-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-600 font-bold text-sm hover:bg-blue-100 transition-colors">
              <Volume2 className="w-4 h-4" /> Listen
            </button>
          </div>

          {/* Choices grid */}
          {mode === 'img2word' ? (
            /* 4 word buttons */
            <div className="grid grid-cols-2 gap-3">
              {choices.map((item) => {
                const isChosen = chosen === item.word
                const isCorrect = result && item.word === current.word
                const isWrong   = result && isChosen && item.word !== current.word
                return (
                  <motion.button key={item.word} onClick={() => handleChoice(item)}
                    whileHover={!chosen ? { scale: 1.04, y: -2 } : {}}
                    whileTap={!chosen ? { scale: 0.96 } : {}}
                    animate={isWrong ? { x: [-4,4,-4,4,0] } : {}}
                    transition={isWrong ? { duration: 0.3 } : {}}
                    className={`py-4 px-3 rounded-3xl border-2 font-black text-xl transition-all shadow-md ${
                      isCorrect ? 'bg-green-100 border-green-400 text-green-700 shadow-green-200' :
                      isWrong   ? 'bg-red-100 border-red-300 text-red-500' :
                      isChosen  ? 'bg-blue-100 border-blue-400 text-blue-700' :
                                  'bg-white border-blue-100 text-gray-700 hover:border-blue-300'
                    }`}>
                    {isCorrect && '✅ '}{isWrong && '❌ '}{item.word}
                  </motion.button>
                )
              })}
            </div>
          ) : (
            /* 4 emoji image buttons */
            <div className="grid grid-cols-2 gap-3">
              {choices.map((item) => {
                const isChosen  = chosen === item.word
                const isCorrect = result && item.word === current.word
                const isWrong   = result && isChosen && item.word !== current.word
                return (
                  <motion.button key={item.word} onClick={() => handleChoice(item)}
                    whileHover={!chosen ? { scale: 1.04, y: -2 } : {}}
                    whileTap={!chosen ? { scale: 0.96 } : {}}
                    animate={isWrong ? { x: [-4,4,-4,4,0] } : {}}
                    transition={isWrong ? { duration: 0.3 } : {}}
                    className={`py-5 rounded-3xl border-2 flex flex-col items-center gap-1 shadow-md transition-all ${
                      isCorrect ? 'bg-green-50 border-green-400 shadow-green-200' :
                      isWrong   ? 'bg-red-50 border-red-300' :
                      isChosen  ? 'bg-blue-50 border-blue-400' :
                                  'bg-white border-blue-100 hover:border-blue-300'
                    }`}>
                    <span className="text-5xl select-none">{item.emoji}</span>
                    {result && (isCorrect || isChosen) && (
                      <span className="text-xs font-bold text-gray-500">{item.word}</span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          )}

          {/* Result feedback */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`text-center py-3 rounded-2xl font-black text-lg ${
                  result === 'correct' ? 'bg-green-100 text-green-700' : 'bg-orange-50 text-orange-600'
                }`}>
                {result === 'correct'
                  ? `✅ Correct! It's a ${current?.word}!`
                  : `❌ The answer is: ${current?.word} ${current?.emoji}`}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Picker({ title, subtitle, children, onBack }) {
  return (
    <div className="min-h-screen p-5 max-w-md mx-auto bg-gradient-to-br from-sky-50 to-blue-50">
      <div className="pt-4 mb-6">
        {onBack && (
          <button onClick={onBack} className="text-sm text-gray-400 font-medium mb-3 flex items-center gap-1 hover:text-gray-600">
            → חזרה
          </button>
        )}
        <h1 className="text-3xl font-black text-blue-700">{title}</h1>
        {subtitle && <p className="text-gray-400 font-medium mt-1">{subtitle}</p>}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}
