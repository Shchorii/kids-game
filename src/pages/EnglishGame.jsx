// src/pages/EnglishGame.jsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Home, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import NamePrompt from '@/components/game/NamePrompt'

// ─── Vocabulary bank — 6 thematic categories ────────────────────────────────
const CATEGORIES = {
  animals: {
    label: 'חיות', emoji: '🐾', color: 'from-green-400 to-emerald-500',
    bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-700',
    words: [
      {w:'cat',e:'🐱',he:'חתול'},{w:'dog',e:'🐶',he:'כלב'},{w:'fish',e:'🐟',he:'דג'},
      {w:'bird',e:'🐦',he:'ציפור'},{w:'cow',e:'🐄',he:'פרה'},{w:'pig',e:'🐷',he:'חזיר'},
      {w:'frog',e:'🐸',he:'צפרדע'},{w:'duck',e:'🦆',he:'ברווז'},{w:'bear',e:'🐻',he:'דוב'},
      {w:'lion',e:'🦁',he:'אריה'},{w:'elephant',e:'🐘',he:'פיל'},{w:'monkey',e:'🐒',he:'קוף'},
      {w:'horse',e:'🐴',he:'סוס'},{w:'sheep',e:'🐑',he:'כבש'},{w:'rabbit',e:'🐰',he:'ארנב'},
      {w:'fox',e:'🦊',he:'שועל'},{w:'owl',e:'🦉',he:'ינשוף'},{w:'snake',e:'🐍',he:'נחש'},
      {w:'turtle',e:'🐢',he:'צב'},{w:'penguin',e:'🐧',he:'פינגווין'},
    ]
  },
  food: {
    label: 'אוכל', emoji: '🍎', color: 'from-red-400 to-orange-500',
    bg: 'from-red-50 to-orange-50', border: 'border-red-200', text: 'text-red-700',
    words: [
      {w:'apple',e:'🍎',he:'תפוח'},{w:'banana',e:'🍌',he:'בננה'},{w:'orange',e:'🍊',he:'תפוז'},
      {w:'grape',e:'🍇',he:'ענב'},{w:'strawberry',e:'🍓',he:'תות'},{w:'watermelon',e:'🍉',he:'אבטיח'},
      {w:'cake',e:'🎂',he:'עוגה'},{w:'cookie',e:'🍪',he:'עוגייה'},{w:'pizza',e:'🍕',he:'פיצה'},
      {w:'bread',e:'🍞',he:'לחם'},{w:'milk',e:'🥛',he:'חלב'},{w:'egg',e:'🥚',he:'ביצה'},
      {w:'cheese',e:'🧀',he:'גבינה'},{w:'ice cream',e:'🍦',he:'גלידה'},{w:'chocolate',e:'🍫',he:'שוקולד'},
      {w:'carrot',e:'🥕',he:'גזר'},{w:'corn',e:'🌽',he:'תירס'},{w:'tomato',e:'🍅',he:'עגבניה'},
    ]
  },
  home: {
    label: 'בית', emoji: '🏠', color: 'from-yellow-400 to-amber-500',
    bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200', text: 'text-yellow-700',
    words: [
      {w:'bed',e:'🛏️',he:'מיטה'},{w:'chair',e:'🪑',he:'כיסא'},{w:'table',e:'🪵',he:'שולחן'},
      {w:'door',e:'🚪',he:'דלת'},{w:'window',e:'🪟',he:'חלון'},{w:'bath',e:'🛁',he:'אמבטיה'},
      {w:'cup',e:'☕',he:'כוס'},{w:'book',e:'📚',he:'ספר'},{w:'ball',e:'⚽',he:'כדור'},
      {w:'clock',e:'🕐',he:'שעון'},{w:'phone',e:'📱',he:'טלפון'},{w:'tv',e:'📺',he:'טלוויזיה'},
      {w:'key',e:'🔑',he:'מפתח'},{w:'lamp',e:'💡',he:'מנורה'},{w:'mirror',e:'🪞',he:'מראה'},
      {w:'bag',e:'👜',he:'תיק'},{w:'pencil',e:'✏️',he:'עיפרון'},{w:'scissors',e:'✂️',he:'מספריים'},
    ]
  },
  nature: {
    label: 'טבע', emoji: '🌍', color: 'from-blue-400 to-cyan-500',
    bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', text: 'text-blue-700',
    words: [
      {w:'sun',e:'☀️',he:'שמש'},{w:'moon',e:'🌙',he:'ירח'},{w:'star',e:'⭐',he:'כוכב'},
      {w:'cloud',e:'☁️',he:'ענן'},{w:'rain',e:'🌧️',he:'גשם'},{w:'snow',e:'❄️',he:'שלג'},
      {w:'tree',e:'🌳',he:'עץ'},{w:'flower',e:'🌸',he:'פרח'},{w:'rainbow',e:'🌈',he:'קשת'},
      {w:'sea',e:'🌊',he:'ים'},{w:'mountain',e:'⛰️',he:'הר'},{w:'fire',e:'🔥',he:'אש'},
      {w:'water',e:'💧',he:'מים'},{w:'leaf',e:'🍃',he:'עלה'},{w:'earth',e:'🌍',he:'כדור הארץ'},
      {w:'river',e:'🏞️',he:'נהר'},{w:'rock',e:'🪨',he:'סלע'},{w:'wind',e:'🌬️',he:'רוח'},
    ]
  },
  colors: {
    label: 'צבעים', emoji: '🎨', color: 'from-purple-400 to-pink-500',
    bg: 'from-purple-50 to-pink-50', border: 'border-purple-200', text: 'text-purple-700',
    words: [
      {w:'red',e:'🔴',he:'אדום'},{w:'blue',e:'🔵',he:'כחול'},{w:'green',e:'🟢',he:'ירוק'},
      {w:'yellow',e:'🟡',he:'צהוב'},{w:'orange',e:'🟠',he:'כתום'},{w:'purple',e:'🟣',he:'סגול'},
      {w:'black',e:'⚫',he:'שחור'},{w:'white',e:'⚪',he:'לבן'},{w:'pink',e:'🩷',he:'ורוד'},
      {w:'brown',e:'🟤',he:'חום'},
    ]
  },
  body: {
    label: 'גוף', emoji: '👤', color: 'from-rose-400 to-red-500',
    bg: 'from-rose-50 to-red-50', border: 'border-rose-200', text: 'text-rose-700',
    words: [
      {w:'eye',e:'👁️',he:'עין'},{w:'ear',e:'👂',he:'אוזן'},{w:'nose',e:'👃',he:'אף'},
      {w:'mouth',e:'👄',he:'פה'},{w:'hand',e:'✋',he:'יד'},{w:'foot',e:'🦶',he:'רגל'},
      {w:'heart',e:'❤️',he:'לב'},{w:'hair',e:'💇',he:'שיער'},{w:'teeth',e:'🦷',he:'שיניים'},
      {w:'arm',e:'💪',he:'זרוע'},{w:'leg',e:'🦵',he:'רגל'},{w:'finger',e:'☝️',he:'אצבע'},
      {w:'back',e:'🔙',he:'גב'},{w:'face',e:'😊',he:'פנים'},
    ]
  },
}

const MODES = [
  { v:'img2word', label:'ראה תמונה → בחר מילה', emoji:'🖼️➡️🔤', desc:'בחר את המילה הנכונה' },
  { v:'listen',   label:'שמע → בחר תמונה',       emoji:'🔊➡️🖼️', desc:'הקשב ובחר את התמונה' },
  { v:'translate',label:'עברית → אנגלית',         emoji:'🇮🇱➡️🇬🇧', desc:'תרגם לאנגלית' },
]

function shuffle(a) { return [...a].sort(() => Math.random() - 0.5) }

function getChoices(correct, pool) {
  const others = shuffle(pool.filter(x => x.w !== correct.w)).slice(0, 3)
  return shuffle([correct, ...others])
}

// Audio cache: word -> blob URL (same pattern as Hebrew game — most iOS-compatible)
const _audioCache = {}
let _currentAudio = null  // track playing instance to prevent duplicates

function stopCurrent() {
  if (_currentAudio) {
    _currentAudio.pause()
    _currentAudio.currentTime = 0
    _currentAudio = null
  }
}

// Pre-fetch audio in background and cache blob URL — so speak() is instant on tap
async function prefetchAudio(word) {
  if (_audioCache[word]) return
  try {
    const r = await fetch('/api/tts-en', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: word }),
    })
    if (!r.ok) return
    const blob = await r.blob()
    _audioCache[word] = URL.createObjectURL(blob)
  } catch {}
}

// speak() — stops any current audio first to prevent duplicates
function speak(word) {
  if (!word) return
  stopCurrent()
  if (_audioCache[word]) {
    const audio = new Audio(_audioCache[word])
    _currentAudio = audio
    audio.onended = () => { _currentAudio = null }
    audio.onerror = () => { _currentAudio = null; _browserFallback(word) }
    audio.play().catch(() => { _currentAudio = null; _browserFallback(word) })
    return
  }
  fetch('/api/tts-en', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: word }),
  }).then(r => r.blob()).then(blob => {
    const url = URL.createObjectURL(blob)
    _audioCache[word] = url
    stopCurrent()
    const audio = new Audio(url)
    _currentAudio = audio
    audio.onended = () => { _currentAudio = null }
    audio.onerror = () => { _currentAudio = null; _browserFallback(word) }
    audio.play().catch(() => { _currentAudio = null; _browserFallback(word) })
  }).catch(() => _browserFallback(word))
}

function _browserFallback(word) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(word)
  u.lang = 'en-US'; u.rate = 0.85
  const v = window.speechSynthesis.getVoices()
  const voice = v.find(x => x.name === 'Samantha') || v.find(x => x.lang === 'en-US')
  if (voice) u.voice = voice
  window.speechSynthesis.speak(u)
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function EnglishGame() {
  const nav = useNavigate()
  const [name, setName]         = useState(null)
  const [catKey, setCatKey]     = useState(null)  // selected category
  const [mode, setMode]         = useState(null)
  const [queue, setQueue]       = useState([])
  const [idx, setIdx]           = useState(0)
  const [stars, setStars]       = useState(0)
  const [mistakes, setMistakes] = useState([])  // for spaced repetition
  const [chosen, setChosen]         = useState(null)
  const [result, setResult]         = useState(null)
  const [done, setDone]             = useState(false)
  const [phase, setPhase]           = useState('main') // 'main' | 'review'
  const [celebrating, setCelebrating] = useState(false)  // full-screen correct moment
  const [wrongChosen, setWrongChosen] = useState(null)   // track the wrong pick
  const [sentence, setSentence]       = useState(null)   // AI-generated sentence
  const [sentenceLoading, setSentenceLoading] = useState(false)

  const nextTimer = useRef(null)
  const _prefetchedSentence = useRef(null)

  const cat  = catKey ? CATEGORIES[catKey] : null
  const pool = cat ? cat.words : []
  const cur  = queue[idx] || null
  const opts = cur ? getChoices(cur, pool.length >= 4 ? pool : Object.values(CATEGORIES).flatMap(c => c.words)) : []

  // Build queue when category + mode selected
  useEffect(() => {
    if (catKey && mode && pool.length >= 4) {
      setQueue(shuffle(pool).slice(0, Math.min(10, pool.length)))
      setIdx(0); setStars(0); setMistakes([])
      setChosen(null); setResult(null); setDone(false); setPhase('main'); setCelebrating(false); setWrongChosen(null)
    }
  }, [catKey, mode])

  // On new word: auto-speak + reset sentence + pre-fetch sentence
  useEffect(() => {
    if (!cur) return
    setSentence(null)
    setSentenceLoading(false)
    _prefetchedSentence.current = null
    stopCurrent()  // stop any audio from previous word
    // Pre-fetch audio so Listen button is instant; auto-speak fires after fetch
    prefetchAudio(cur.w).then(() => speak(cur.w))
    // Pre-fetch sentence in background
    const sentFetch = setTimeout(() => {
      fetch('/api/sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: cur.w }),
      }).then(r => r.json()).then(data => {
        if (data.sentence) {
          _prefetchedSentence.current = { word: cur.w, sentence: data.sentence }
        }
      }).catch(() => {})
    }, 500)
    return () => { clearTimeout(autoSpeak); clearTimeout(sentFetch) }
  }, [cur?.w, mode])

  async function fetchSentence() {
    if (!cur || sentenceLoading) return
    // Use prefetched sentence instantly if available
    if (_prefetchedSentence.current?.word === cur.w && _prefetchedSentence.current?.sentence) {
      const s = _prefetchedSentence.current.sentence
      setSentence(s)
      setSentenceLoading(false)
      setTimeout(() => speak(s), 200)
      return
    }
    // Otherwise fetch (fallback)
    setSentenceLoading(true)
    try {
      const r = await fetch('/api/sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: cur.w }),
      })
      const data = await r.json()
      if (data.sentence) {
        setSentence(data.sentence)
        setTimeout(() => speak(data.sentence), 200)
      }
    } catch { setSentence('I love the ' + cur.w + '!') }
    setSentenceLoading(false)
  }

  function next() {
    const nextIdx = idx + 1
    if (nextIdx >= queue.length) {
      if (phase === 'main' && mistakes.length > 0) {
        // Spaced repetition: review mistakes
        setQueue(shuffle(mistakes))
        setIdx(0); setChosen(null); setResult(null); setPhase('review')
      } else {
        setDone(true)
      }
    } else {
      setIdx(nextIdx); setChosen(null); setResult(null)
    }
  }

  function pick(item) {
    // If already correct, block
    if (result === 'ok' || !cur) return
    // If this specific wrong option was already tried, block that button only
    if (wrongChosen === item.w) return

    const win = item.w === cur.w
    if (win) {
      // CORRECT — celebrate, let kid press Next themselves
      setChosen(item.w)
      setResult('ok')
      setWrongChosen(null)
      setStars(s => s + 1)
      playWin()
      speak(cur.w)
      setTimeout(() => setCelebrating(true), 300)
    } else {
      // WRONG — shake, mark that specific button, kid must try again
      setWrongChosen(item.w)
      setResult('bad')
      setMistakes(m => m.find(x => x.w === cur.w) ? m : [...m, cur])
      playErr()
      // Clear wrong state after shake so they can try other options
      setTimeout(() => setResult(null), 1000)
    }
  }

  function handleNext() {
    setCelebrating(false)
    setChosen(null)
    setResult(null)
    setWrongChosen(null)
    next()
  }

  if (!name) return <NamePrompt title="English Time! 🇬🇧" emoji="🔤" onStart={setName} />

  // ── Category picker ─────────────────────────────────────────────────────────
  if (!catKey) return (
    <div className="min-h-screen p-4 max-w-lg mx-auto bg-gradient-to-br from-sky-50 to-indigo-50">
      <div className="flex items-center justify-between pt-4 mb-6">
        <button onClick={() => nav('/')} className="w-10 h-10 rounded-2xl bg-white border-2 border-blue-100 flex items-center justify-center shadow-sm">
          <Home className="w-5 h-5 text-blue-500" />
        </button>
        <h1 className="text-2xl font-black text-blue-700">Hello {name}! 👋</h1>
        <div className="w-10" />
      </div>
      <p className="text-center text-gray-400 font-medium mb-5">בחר קטגוריה</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Object.entries(CATEGORIES).map(([key, c], i) => (
          <motion.button key={key} onClick={() => setCatKey(key)}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
            whileHover={{ scale:1.04, y:-3 }} whileTap={{ scale:0.96 }}
            className={`flex flex-col items-center gap-2 bg-white rounded-3xl p-5 shadow-md border-2 ${c.border} hover:shadow-lg transition-all`}>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-3xl shadow-md`}>
              {c.emoji}
            </div>
            <span className={`font-black text-sm ${c.text}`}>{c.label}</span>
            <span className="text-xs text-gray-400">{c.words.length} מילים</span>
          </motion.button>
        ))}
      </div>
    </div>
  )

  // ── Mode picker ──────────────────────────────────────────────────────────────
  if (!mode) return (
    <div className={`min-h-screen p-4 max-w-md mx-auto bg-gradient-to-br ${cat.bg}`}>
      <div className="flex items-center justify-between pt-4 mb-6">
        <button onClick={() => setCatKey(null)} className="w-10 h-10 rounded-2xl bg-white border-2 border-blue-100 flex items-center justify-center shadow-sm">
          <Home className="w-5 h-5 text-blue-500" />
        </button>
        <h1 className="text-xl font-black text-gray-700">{cat.emoji} {cat.label}</h1>
        <div className="w-10" />
      </div>
      <p className="text-center text-gray-400 font-medium mb-5">בחר מצב משחק</p>
      <div className="flex flex-col gap-3">
        {MODES.map((m, i) => (
          <motion.button key={m.v} onClick={() => setMode(m.v)}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.1 }}
            whileHover={{ scale:1.02, y:-2 }} whileTap={{ scale:0.98 }}
            className={`w-full flex items-center gap-4 bg-white rounded-3xl p-5 shadow-md border-2 ${cat.border} hover:shadow-lg transition-all`}>
            <span className="text-3xl">{m.emoji}</span>
            <div className="text-right">
              <div className={`font-black text-lg ${cat.text}`}>{m.label}</div>
              <div className="text-sm text-gray-400">{m.desc}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )

  // ── Summary screen ───────────────────────────────────────────────────────────
  if (done) {
    const total = stars
    const pct = Math.round((total / queue.length) * 100)
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50">
        <motion.div initial={{ scale:0.7, opacity:0 }} animate={{ scale:1, opacity:1 }}
          transition={{ type:'spring', stiffness:300, damping:20 }}
          className="bg-white rounded-4xl p-8 shadow-xl text-center max-w-sm w-full border-2 border-blue-100">
          <motion.div animate={{ rotate:[0,15,-15,10,-10,0] }} transition={{ delay:0.3, duration:0.8 }}
            className="text-7xl mb-3">
            {pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪'}
          </motion.div>
          <h2 className="text-3xl font-black text-blue-700 mb-1">
            {pct >= 80 ? 'Amazing!' : pct >= 50 ? 'Well Done!' : 'Keep Trying!'}
          </h2>
          <p className="text-gray-400 mb-5">{pct}% נכון</p>
          <div className="flex justify-center gap-5 mb-6">
            <div><div className="text-3xl font-black text-green-500">{stars}</div><div className="text-xs text-gray-400">נכון ✅</div></div>
            <div><div className="text-3xl font-black text-orange-400">{mistakes.length}</div><div className="text-xs text-gray-400">שגוי ❌</div></div>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setCatKey(catKey); setMode(null) }}
              className={`py-3.5 rounded-2xl bg-gradient-to-br ${cat.color} text-white font-black text-lg shadow-md`}>
              שחק שוב 🔄
            </button>
            <button onClick={() => { setCatKey(null); setMode(null) }}
              className="py-3.5 rounded-2xl border-2 border-blue-100 text-gray-500 font-semibold">
              קטגוריה אחרת 📂
            </button>
            <button onClick={() => nav('/')}
              className="py-2 text-gray-400 text-sm font-medium">
              חזרה הביתה 🏠
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Game screen ──────────────────────────────────────────────────────────────
  const progress = queue.length > 0 ? (idx / queue.length) * 100 : 0

  return (
    <div className={`min-h-screen flex flex-col p-3 sm:p-5 max-w-lg mx-auto bg-gradient-to-br ${cat.bg}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => { setCatKey(null); setMode(null) }}
          className="w-10 h-10 rounded-2xl bg-white border-2 border-blue-100 flex items-center justify-center shadow-sm flex-shrink-0">
          <Home className="w-5 h-5 text-blue-500" />
        </button>
        <div className="flex items-center gap-2">
          {phase === 'review' && (
            <span className="text-xs font-black bg-orange-100 text-orange-600 border border-orange-200 px-2 py-1 rounded-full">
              🔁 חזרה
            </span>
          )}
          <span className={`text-sm font-black bg-white px-3 py-1 rounded-full border-2 ${cat.border} ${cat.text}`}>
            {idx + 1}/{queue.length}
          </span>
          <span className="text-sm font-black bg-white px-3 py-1 rounded-full border-2 border-yellow-200 text-yellow-600">
            ⭐{stars}
          </span>
        </div>
        <button onClick={() => { setIdx(0); setChosen(null); setResult(null); setQueue(shuffle(pool).slice(0,Math.min(10,pool.length))); setStars(0); setMistakes([]); setPhase('main') }}
          className="w-10 h-10 rounded-2xl bg-white border-2 border-blue-100 flex items-center justify-center shadow-sm flex-shrink-0">
          <RotateCcw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-white/60 rounded-full mb-4 overflow-hidden">
        <motion.div className={`h-full bg-gradient-to-r ${cat.color} rounded-full`}
          animate={{ width: progress + '%' }} transition={{ duration: 0.4 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={cur?.w + mode}
          initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-4 flex-1">

          {/* Word card */}
          <div className="bg-white rounded-4xl shadow-lg border-2 border-white/80 p-5 text-center">
            {mode === 'img2word' && (
              <>
                <p className={`text-sm font-bold mb-2 ${cat.text}`}>מה זה באנגלית? 🤔</p>
                <div className="text-8xl sm:text-9xl my-2 select-none leading-none">{cur?.e}</div>
                <p className="text-sm text-gray-300 mt-1">{cur?.he}</p>
              </>
            )}
            {mode === 'listen' && (
              <>
                <p className={`text-sm font-bold mb-3 ${cat.text}`}>האזן ובחר תמונה 👂</p>
                <motion.button onClick={() => speak(cur?.w)}
                  whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  className={`mx-auto flex items-center gap-3 px-8 py-5 rounded-3xl bg-gradient-to-br ${cat.color} text-white font-black text-xl shadow-lg`}>
                  <Volume2 className="w-7 h-7" /> Listen!
                </motion.button>
                <p className="text-xs text-gray-300 mt-3">לחץ שוב לשמיעה חוזרת</p>
              </>
            )}
            {mode === 'translate' && (
              <>
                <p className={`text-sm font-bold mb-2 ${cat.text}`}>מה זה באנגלית? 🇬🇧</p>
                <div className="text-4xl sm:text-5xl font-black text-gray-800 my-3 tracking-wide">{cur?.he}</div>
                <p className="text-xs text-gray-300">בחר את התרגום הנכון</p>
              </>
            )}
            <div className="mt-3 flex flex-col items-center gap-2 w-full">
              <button onClick={fetchSentence} disabled={sentenceLoading}
                className={`mx-auto flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm shadow-sm transition-all ${
                  sentenceLoading
                    ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-wait'
                    : 'bg-white border-2 border-purple-200 text-purple-600 hover:bg-purple-50'
                }`}>
                {sentenceLoading ? '💭 thinking...' : '🗣️ Use in a sentence'}
              </button>
              {sentence && cur && (
                <div className="w-full mt-1 px-4 py-3 rounded-2xl bg-purple-50 border-2 border-purple-200 text-center">
                  <p className="text-base font-semibold text-gray-700 leading-relaxed">
                    {sentence.split(new RegExp('(' + cur.w + ')', 'i')).map((part, i) =>
                      part.toLowerCase() === cur.w.toLowerCase()
                        ? <span key={i} className={`font-black underline decoration-2 ${cat.text}`}>{part}</span>
                        : <span key={i}>{part}</span>
                    )}
                  </p>
                  <button onClick={() => speak(sentence)} className="mt-2 text-xs text-purple-400 flex items-center gap-1 mx-auto">
                    <Volume2 className="w-3 h-3" /> hear it again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Choices */}
          {mode === 'img2word' || mode === 'translate' ? (
            // Word choice buttons
            <div className="grid grid-cols-2 gap-3">
              {opts.map(item => {
                const isc = chosen === item.w
                const win = !!result && item.w === cur?.w
                const lose = !!result && isc && item.w !== cur?.w
                return (
                  <motion.button key={item.w}
                    onClick={() => pick(item)}
                    disabled={result === 'ok' || wrongChosen === item.w}
                    style={{ touchAction: 'manipulation' }}
                    whileHover={result !== 'ok' && wrongChosen !== item.w ? { scale:1.04, y:-3 } : {}}
                    whileTap={result !== 'ok' && wrongChosen !== item.w ? { scale:0.95 } : {}}
                    animate={wrongChosen === item.w ? { x:[-6,6,-6,6,0] } : win ? { scale:[1,1.1,1] } : {}}
                    transition={{ duration:0.3 }}
                    className={`py-5 px-3 rounded-3xl border-2 font-black text-lg sm:text-xl shadow-md transition-all leading-tight ${
                      win             ? 'bg-green-100 border-green-500 text-green-700 shadow-green-200 scale-105' :
                      wrongChosen === item.w ? 'bg-red-100 border-red-400 text-red-500 opacity-70' :
                                        'bg-white border-gray-200 text-gray-700 hover:border-blue-300 active:bg-blue-50'
                    }`}>
                    {win && '✅ '}{wrongChosen === item.w && '❌ '}{item.w}
                  </motion.button>
                )
              })}
            </div>
          ) : (
            // Emoji image choice grid
            <div className="grid grid-cols-2 gap-3">
              {opts.map(item => {
                const isc = chosen === item.w
                const win = !!result && item.w === cur?.w
                const lose = !!result && isc && item.w !== cur?.w
                return (
                  <motion.button key={item.w}
                    onClick={() => pick(item)}
                    disabled={result === 'ok' || wrongChosen === item.w}
                    style={{ touchAction: 'manipulation' }}
                    whileHover={result !== 'ok' && wrongChosen !== item.w ? { scale:1.04, y:-3 } : {}}
                    whileTap={result !== 'ok' && wrongChosen !== item.w ? { scale:0.95 } : {}}
                    animate={wrongChosen === item.w ? { x:[-6,6,-6,6,0] } : win ? { scale:[1,1.1,1] } : {}}
                    transition={{ duration:0.3 }}
                    className={`py-4 sm:py-6 rounded-3xl border-2 flex flex-col items-center gap-2 shadow-md transition-all ${
                      win             ? 'bg-green-50 border-green-500 shadow-green-200 scale-105' :
                      wrongChosen === item.w ? 'bg-red-50 border-red-400 opacity-70' :
                                        'bg-white border-gray-200 hover:border-blue-300 active:bg-blue-50'
                    }`}>
                    <span className="text-5xl sm:text-6xl select-none leading-none">{item.e}</span>
                    {win && <span className="text-sm font-black text-green-600">{item.w}</span>}
                    {wrongChosen === item.w && <span className="text-sm font-black text-red-500">❌</span>}
                  </motion.button>
                )
              })}
            </div>
          )}

          {/* Result feedback */}
          {/* Wrong answer hint */}
          <AnimatePresence>
            {wrongChosen && result === null && (
              <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
                className="text-center py-3 px-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-600 font-black text-base">
                ❌ Try again! Listen carefully 👂
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
      {/* Full-screen celebration overlay */}
      <AnimatePresence>
        {celebrating && cur && (
          <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale:0.3, y:60 }}
              animate={{ scale:1, y:0 }}
              exit={{ scale:0.3, y:60 }}
              transition={{ type:'spring', stiffness:300, damping:20 }}
              className="bg-white rounded-4xl p-8 text-center max-w-xs w-full shadow-2xl"
            >
              {/* Bouncing emoji */}
              <motion.div
                animate={{ y:[0,-20,0,-12,0], scale:[1,1.2,1,1.1,1] }}
                transition={{ duration:0.8, repeat:2 }}
                className="text-8xl mb-4 select-none"
              >
                {cur.e}
              </motion.div>
              {/* Stars burst */}
              <motion.div className="text-3xl mb-3"
                animate={{ scale:[0,1.3,1] }} transition={{ delay:0.2, duration:0.4 }}>
                ⭐⭐⭐
              </motion.div>
              <motion.div
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
                className={`text-3xl font-black mb-1 ${cat.text}`}
              >
                {['Amazing! 🎉', 'Perfect! 🔥', 'Well done! ⭐', 'Correct! 🏆'][stars % 4]}
              </motion.div>
              <motion.div
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
                className="text-xl font-black text-gray-600 mb-6"
              >
                {cur.he} = <span className={cat.text}>{cur.w}</span>
              </motion.div>
              <motion.button
                onClick={handleNext}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
                whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                style={{ touchAction: 'manipulation' }}
                className={`w-full py-4 rounded-2xl bg-gradient-to-br ${cat.color} text-white font-black text-xl shadow-lg`}
              >
                Next →
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function playWin() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[[523,0,0.12],[659,0.08,0.12],[784,0.16,0.2]].forEach(([f,s,d]) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination); o.frequency.value = f; o.type = 'sine'
      const t = ctx.currentTime + s
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.3,t+0.01); g.gain.exponentialRampToValueAtTime(0.001,t+d)
      o.start(t); o.stop(t+d)
    })
  } catch {}
}

function playErr() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination); o.frequency.value = 250; o.type = 'sine'
    const t = ctx.currentTime
    g.gain.setValueAtTime(0.2,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.25)
    o.start(t); o.stop(t+0.25)
  } catch {}
}
