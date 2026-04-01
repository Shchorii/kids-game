// api/sentence.js — generate a simple kid-friendly sentence using OpenAI
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { word } = req.body || {}
  if (!word) return res.status(400).json({ error: 'word required' })
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not set' })

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 60,
        messages: [
          {
            role: 'system',
            content: 'You make simple English sentences for 4-year-old children. Keep sentences very short (5-8 words), positive, and fun. Use common everyday situations. Return ONLY the sentence, nothing else.',
          },
          {
            role: 'user',
            content: `Make one simple sentence using the word "${word}".`,
          },
        ],
        temperature: 0.8,
      }),
    })

    if (!r.ok) throw new Error('OpenAI error ' + r.status)
    const data = await r.json()
    const sentence = data.choices?.[0]?.message?.content?.trim() || ''
    if (!sentence) throw new Error('Empty response')

    return res.status(200).json({ sentence })
  } catch (err) {
    console.error('sentence error:', err)
    // Fallback: simple template sentences
    const fallbacks = {
      cat: 'The cat is very fluffy!',
      dog: 'The dog loves to play!',
      fish: 'The fish swims in water.',
      bird: 'The bird sings a song.',
    }
    const fallback = fallbacks[word] || `I love the ${word}!`
    return res.status(200).json({ sentence: fallback })
  }
}
