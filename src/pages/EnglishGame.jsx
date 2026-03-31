// src/pages/EnglishGame.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import NamePrompt from '@/components/game/NamePrompt'

const VOCAB = [
  { word:'cat',   emoji:'🐱', he:'חתול',   level:1 },
  { word:'dog',   emoji:'🐶', he:'כלב',    level:1 },
  { word:'bird',  emoji:'🐦', he:'ציפור',  level:1 },
  { word:'fish',  emoji:'🐟', he:'דג',     level:1 },
  { word:'cow',   emoji:'🐄', he:'פרה',    level:1 },
  { word:'horse', emoji:'🐴', he:'סוס',    level:1 },
  { word:'frog',  emoji:'🐸', he:'צפרדע', level:1 },
  { word:'lion',  emoji:'🦁', he:'אריה',   level:1 },
  { word:'bear',  emoji:'🐻', he:'דוב',    level:1 },
  { word:'duck',  emoji:'🦆', he:'ברווז',  level:1 },
  { word:'sun',   emoji:'☀️', he:'שמש',   level:1 },
  { word:'moon',  emoji:'🌙', he:'ירח',    level:1 },
  { word:'star',  emoji:'⭐', he:'כוכב',   level:1 },
  { word:'tree',  emoji:'🌳', he:'עץ',     level:1 },
  { word:'house', emoji:'🏠', he:'בית',    level:1 },
  { word:'car',   emoji:'🚗', he:'מכונית', level:1 },
  { word:'book',  emoji:'📚', he:'ספר',    level:1 },
  { word:'ball',  emoji:'⚽', he:'כדור',   level:1 },
  { word:'apple',  emoji:'🍎', he:'תפוח',  level:2 },
  { word:'banana', emoji:'🍌', he:'בננה',  level:2 },
  { word:'orange', emoji:'🍊', he:'תפוז',  level:2 },
  { word:'bread',  emoji:'🍞', he:'לחם',   level:2 },
  { word:'milk',   emoji:'🥛', he:'חלב',   level:2 },
  { word:'egg',    emoji:'🥚', he:'ביצה',  level:2 },
  { word:'cake',   emoji:'🎂', he:'עוגה',  level:2 },
  { word:'pizza',  emoji:'🍕', he:'פיצה',  level:2 },
  { word:'eye',    emoji:'👁️', he:'עין',  level:2 },
  { word:'ear',    emoji:'👂', he:'אוזן',  level:2 },
  { word:'hand',   emoji:'✋', he:'יד',    level:2 },
  { word:'foot',   emoji:'🦶', he:'רגל',   level:2 },
  { word:'red',    emoji:'🔴', he:'אדום',  level:2 },
  { word:'blue',   emoji:'🔵', he:'כחול',  level:2 },
  { word:'green',  emoji:'🟢', he:'ירוק',  level:2 },
  { word:'yellow', emoji:'🟡', he:'צהוב',  level:2 },
  { word:'run',   emoji:'🏃', he:'רץ',    level:3 },
  { word:'jump',  emoji:'🦘', he:'קופץ',  level:3 },
  { word:'swim',  emoji:'🏊', he:'שוחה',  level:3 },
  { word:'sleep', emoji:'😴', he:'ישן',   level:3 },
  { word:'laugh', emoji:'😂', he:'צוחק',  level:3 },
  { word:'dance', emoji:'💃', he:'רוקד',  level:3 },
  { word:'sing',  emoji:'🎤', he:'שר',    level:3 },
  { word:'read',  emoji:'📖', he:'קורא',  level:3 },
  { word:'big',   emoji:'🐘', he:'גדול',  level:3 },
  { word:'small', emoji:'🐭', he:'קטן',   level:3 },
  { word:'hot',   emoji:'🔥', he:'חם',    level:3 },
  { word:'cold',  emoji:'🧊', he:'קר',    level:3 },
  { word:'happy', emoji:'😊', he:'שמח',   level:3 },
  { word:'rain',  emoji:'🌧️', he:'גשם',  level:3 },
]

const LEVELS = [
  { v:1, l:'קל',     e:'🟢', d:'חיות וחפצים'   },
  { v:2, l:'בינוני', e:'🟡', d:'אוכל וצבעים'   },
  { v:3, l:'קשה',    e:'🔴', d:'פעלים ותיאורים' },
]
const MODES = [
  { v:'img2word', l:'תמונה → מילה', e:'🖼️➡️🔤' },
  { v:'word2img', l:'מילה → תמונה', e:'🔤➡️🖼️' },
]

function shuffle(a) { return [...a].sort(() => Math.random() - 0.5) }

function getChoices(correct, pool) {
  const others = shuffle(pool.filter(x => x.word !== correct.word)).slice(0, 3)
  return shuffle([correct, ...others])
}

function speak(word) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(word)
  u.lang = 'en-US'; u.rate = 0.85
  const voices = window.speechSynthesis.getVoices()
  const voice = voices.find(v => v.name === 'Samantha') || voices.find(v => v.lang === 'en-US')
  if (voice) u.voice = voice
  window.speechSynthesis.speak(u)
}

export default function EnglishGame() {
  const nav = useNavigate()
  const [name, setName]     = useState(null)
  const [level, setLevel]   = useState(null)
  const [mode, setMode]     = useState(null)
  const [queue, setQueue]   = useState([])
  const [idx, setIdx]       = useState(0)
  const [stars, setStars]   = useState(0)
  const [ok, setOk]         = useState(0)
  const [bad, setBad]       = useState(0)
  const [chosen, setChosen] = useState(null)
  const [result, setResult] = useState(null)
  const [done, setDone]     = useState(false)

  const pool = VOCAB.filter(x => x.level === level)
  const cur  = queue[idx] || null
  const opts = cur ? getChoices(cur, pool) : []

  useEffect(() => {
    if (level && mode && pool.length >= 4) {
      setQueue(shuffle(pool).slice(0, 10))
      setIdx(0); setStars(0); setOk(0); setBad(0)
      setChosen(null); setResult(null); setDone(false)
    }
  }, [level, mode])

  useEffect(() => {
    if (cur) setTimeout(() => speak(cur.word), 400)
  }, [cur?.word])

  function pick(item) {
    if (chosen || !cur) return
    setChosen(item.word)
    const win = item.word === cur.word
    setResult(win ? 'ok' : 'bad')
    if (win) { setStars(s => s + 1); setOk(o => o + 1) } else setBad(b => b + 1)
    speak(cur.word)
    setTimeout(() => {
      if (idx + 1 >= queue.length) setDone(true)
      else { setIdx(i => i + 1); setChosen(null); setResult(null) }
    }, win ? 1200 : 1800)
  }

  if (!name) return <NamePrompt title="English Time! 🇬🇧" emoji="🔤" onStart={setName} />

  if (!level) return (
    <Screen title={'Hello ' + name + '! 👋'} sub="Choose level" back={() => nav('/')}>
      {LEVELS.map((lv, i) => (
        <Row key={lv.v} i={i} onClick={() => setLevel(lv.v)}>
          <span className="text-2xl">{lv.e}</span>
          <div className="text-right">
            <div className="font-black text-gray-800">{lv.l}</div>
            <div className="text-sm text-gray-400">{lv.d}</div>
          </div>
        </Row>
      ))}
    </Screen>
  )

  if (!mode) return (
    <Screen title="Game Mode" sub="" back={() => setLevel(null)}>
      {MODES.map((m, i) => (
        <Row key={m.v} i={i} onClick={() => setMode(m.v)}>
          <span className="text-3xl">{m.e}</span>
          <span className="font-black text-gray-800 text-lg">{m.l}</span>
        </Row>
      ))}
    </Screen>
  )

  if (done) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
        className="bg-white rounded-4xl p-8 shadow-xl text-center max-w-sm w-full border-2 border-blue-100">
        <div className="text-6xl mb-3">🎉</div>
        <h2 className="text-3xl font-black text-blue-700 mb-1">Well Done!</h2>
        <div className="flex justify-center gap-6 my-5">
          <div><div className="text-3xl font-black text-green-500">{ok}</div><div className="text-sm text-gray-400">נכון ✅</div></div>
          <div><div className="text-3xl font-black text-yellow-500">{stars}⭐</div><div className="text-sm text-gray-400">כוכבים</div></div>
          <div><div className="text-3xl font-black text-red-400">{bad}</div><div className="text-sm text-gray-400">שגוי ❌</div></div>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => {
            setQueue(shuffle(pool).slice(0,10)); setIdx(0); setStars(0)
            setOk(0); setBad(0); setChosen(null); setResult(null); setDone(false)
          }} className="py-3 rounded-2xl bg-blue-600 text-white font-black text-lg">שחק שוב 🔄</button>
          <button onClick={() => nav('/')} className="py-3 rounded-2xl border-2 border-blue-100 text-gray-500 font-semibold">חזרה 🏠</button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto bg-gradient-to-br from-sky-50 to-indigo-50">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {['🇬🇧','⭐','🔤','✏️','📚'].map((e, i) => (
          <motion.div key={i} className="absolute text-3xl opacity-20"
            style={{ left: (10 + i * 18) + '%', top: (5 + (i % 3) * 25) + '%' }}
            animate={{ y: [0,-15,10,0] }} transition={{ duration: 8+i*2, repeat:Infinity, delay:-i*2 }}>
            {e}
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-4 pt-2">
        <button onClick={() => nav('/')} className="w-10 h-10 rounded-2xl bg-white border-2 border-blue-100 flex items-center justify-center shadow-sm">
          <Home className="w-5 h-5 text-blue-500" />
        </button>
        <div className="flex gap-2">
          <span className="text-sm font-bold text-blue-500 bg-white px-3 py-1 rounded-full border-2 border-blue-100">{idx+1}/{queue.length}</span>
          <span className="text-sm font-bold text-yellow-600 bg-white px-3 py-1 rounded-full border-2 border-yellow-100">⭐{stars}</span>
        </div>
      </div>
      <div className="h-2 bg-blue-100 rounded-full mb-5 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
          animate={{ width: (idx / queue.length * 100) + '%' }} transition={{ duration: 0.4 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={cur?.word + mode} initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} className="flex flex-col gap-4">
          <div className="bg-white rounded-4xl p-6 shadow-lg border-2 border-blue-100 text-center">
            {mode === 'img2word' ? (
              <>
                <p className="text-sm font-semibold text-blue-300 mb-2">מה זה באנגלית? 🤔</p>
                <div className="text-9xl mb-3 select-none">{cur?.emoji}</div>
                <p className="text-sm text-gray-300">{cur?.he}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-blue-300 mb-2">בחר את התמונה הנכונה 👇</p>
                <div className="text-5xl font-black text-blue-700 mb-2 tracking-widest">{cur?.word}</div>
                <p className="text-sm text-gray-300">{cur?.he}</p>
              </>
            )}
            <button onClick={() => cur && speak(cur.word)}
              className="mt-3 mx-auto flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-600 font-bold text-sm">
              <Volume2 className="w-4 h-4" /> Listen
            </button>
          </div>

          {mode === 'img2word' ? (
            <div className="grid grid-cols-2 gap-3">
              {opts.map(item => {
                const isc  = chosen === item.word
                const win  = !!result && item.word === cur?.word
                const lose = !!result && isc && item.word !== cur?.word
                return (
                  <motion.button key={item.word} onClick={() => pick(item)}
                    whileHover={!chosen ? { scale:1.04, y:-2 } : {}}
                    whileTap={!chosen ? { scale:0.96 } : {}}
                    animate={lose ? { x:[-4,4,-4,0] } : {}}
                    className={'py-4 px-3 rounded-3xl border-2 font-black text-xl shadow-md transition-all ' +
                      (win ? 'bg-green-100 border-green-400 text-green-700' :
                       lose ? 'bg-red-100 border-red-300 text-red-500' :
                       isc  ? 'bg-blue-100 border-blue-400 text-blue-700' :
                               'bg-white border-blue-100 text-gray-700')}>
                    {win && '✅ '}{lose && '❌ '}{item.word}
                  </motion.button>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {opts.map(item => {
                const isc  = chosen === item.word
                const win  = !!result && item.word === cur?.word
                const lose = !!result && isc && item.word !== cur?.word
                return (
                  <motion.button key={item.word} onClick={() => pick(item)}
                    whileHover={!chosen ? { scale:1.04, y:-2 } : {}}
                    whileTap={!chosen ? { scale:0.96 } : {}}
                    animate={lose ? { x:[-4,4,-4,0] } : {}}
                    className={'py-5 rounded-3xl border-2 flex flex-col items-center gap-1 shadow-md ' +
                      (win ? 'bg-green-50 border-green-400' :
                       lose ? 'bg-red-50 border-red-300' :
                       isc  ? 'bg-blue-50 border-blue-400' : 'bg-white border-blue-100')}>
                    <span className="text-5xl select-none">{item.emoji}</span>
                    {result && (win || isc) && <span className="text-xs font-bold text-gray-500">{item.word}</span>}
                  </motion.button>
                )
              })}
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className={'text-center py-3 rounded-2xl font-black text-lg ' + (result === 'ok' ? 'bg-green-100 text-green-700' : 'bg-orange-50 text-orange-600')}>
                {result === 'ok' ? '✅ Correct! It\'s a ' + cur?.word + '!' : '❌ The answer is: ' + cur?.word + ' ' + cur?.emoji}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Screen({ title, sub, children, back }) {
  return (
    <div className="min-h-screen p-5 max-w-md mx-auto bg-gradient-to-br from-sky-50 to-blue-50">
      <div className="pt-4 mb-6">
        {back && <button onClick={back} className="text-sm text-gray-400 mb-3 flex items-center gap-1 hover:text-gray-600">→ חזרה</button>}
        <h1 className="text-3xl font-black text-blue-700">{title}</h1>
        {sub && <p className="text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function Row({ children, onClick, i }) {
  return (
    <motion.button onClick={onClick}
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.1 }}
      whileHover={{ scale:1.03, y:-3 }} whileTap={{ scale:0.97 }}
      className="w-full flex items-center gap-4 bg-white rounded-3xl p-5 shadow-md border-2 border-blue-100 hover:border-blue-300 transition-all">
      {children}
    </motion.button>
  )
}
