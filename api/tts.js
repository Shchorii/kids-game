// api/tts.js — server-side TTS via OpenAI, keeps API key safe

export const config = { runtime: 'nodejs20.x' }

const TTS_VOICE = 'nova'      // Best Hebrew pronunciation
const TTS_MODEL = 'tts-1-hd'
const TTS_SPEED = 0.88

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text } = req.body || {}
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text required' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not set' })
  }

  // Build a natural Hebrew phrase to force correct Israeli pronunciation
  const ttsInput = `המילה היא ${text.trim()}.`

  try {
    const upstream = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        voice: TTS_VOICE,
        speed: TTS_SPEED,
        input: ttsInput,
      }),
    })

    if (!upstream.ok) {
      const err = await upstream.text()
      console.error('OpenAI TTS error:', err)
      return res.status(502).json({ error: 'Upstream TTS error' })
    }

    const audioBuffer = await upstream.arrayBuffer()

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400') // cache 24h
    res.status(200).send(Buffer.from(audioBuffer))
  } catch (err) {
    console.error('TTS handler error:', err)
    res.status(500).json({ error: 'Internal error' })
  }
}
