// api/tts-en.js — OpenAI TTS for English (nova voice, warm & clear for kids)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text } = req.body || {}
  if (!text) return res.status(400).json({ error: 'text required' })
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not set' })

  try {
    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'nova',      // warm, friendly — best for kids
        input: text.trim(),
        speed: 0.75,         // slightly slower, clearer for learners
      }),
    })

    if (!r.ok) {
      const err = await r.text()
      console.error('OpenAI TTS error:', r.status, err)
      return res.status(502).json({ error: 'TTS error' })
    }

    const buf = await r.arrayBuffer()
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=604800') // cache 7 days
    return res.status(200).send(Buffer.from(buf))
  } catch (err) {
    console.error('TTS handler error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
