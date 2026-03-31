// api/tts.js — Azure Cognitive Services TTS with he-IL-HilaNeural
// Free tier: 500,000 chars/month — more than enough for a kids spelling app

const AZURE_REGION = process.env.AZURE_SPEECH_REGION || 'eastus'
const AZURE_KEY    = process.env.AZURE_SPEECH_KEY

const VOICE = 'he-IL-HilaNeural'   // Natural Israeli Hebrew female voice
const RATE  = '0.85'               // Slightly slower for kids
const PITCH = '5Hz'                // Slightly warmer pitch

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text } = req.body || {}
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text required' })
  }

  if (!AZURE_KEY) {
    return res.status(500).json({ error: 'AZURE_SPEECH_KEY not set' })
  }

  // SSML for natural Hebrew pronunciation
  const ssml = `
    <speak version="1.0" xml:lang="he-IL">
      <voice name="${VOICE}">
        <prosody rate="${RATE}" pitch="${PITCH}">
          ${escapeXml(text.trim())}
        </prosody>
      </voice>
    </speak>
  `.trim()

  try {
    const upstream = await fetch(
      `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'kids-game-app',
        },
        body: ssml,
      }
    )

    if (!upstream.ok) {
      const err = await upstream.text()
      console.error('Azure TTS error:', upstream.status, err)
      return res.status(502).json({ error: 'Azure TTS error', status: upstream.status })
    }

    const audioBuffer = await upstream.arrayBuffer()

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=604800') // cache 7 days
    res.status(200).send(Buffer.from(audioBuffer))
  } catch (err) {
    console.error('TTS handler error:', err)
    res.status(500).json({ error: 'Internal error' })
  }
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
