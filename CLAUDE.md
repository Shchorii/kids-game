# Kids Game — CLAUDE.md

## What this is
Hebrew spelling + math + English learning game for kids.
Live at: **gameapp.idanshchori.com**
Repo: github.com/Shchorii/kids-game
Local: ~/sites/kids-game

## Stack
React 18 + Vite + Tailwind + Framer Motion + Vercel (auto-deploy from main) + Vercel KV (Upstash Redis)

## Infra
- Vercel project: `prj_OnAbhSJhajIXwNwMw9iY3BMoFVnp` | team: `team_lpuZ9Gn9aiui3LbCd5hTwRv8`
- GitHub token: in memory
- Vercel token: in memory
- OpenAI API key: in memory (used for English TTS + sentence generation)
- Azure Speech: `kids-game-speech`, region `eastus`, account `idanarmy@gmail.com`
  - Key stored in Vercel env as `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION`

## Three games
1. **/spelling** — Hebrew spelling (ListenAndBuild.jsx) — Azure HilaNeural TTS via /api/tts
2. **/english** — English learning (EnglishGame.jsx) — OpenAI nova TTS via /api/tts-en
3. **/math** — Math game (CalculateGame.jsx)

## English game (most recently worked on)
- 6 thematic categories: animals, food, home, nature, colors, body (110+ words)
- 3 game modes: img2word, listen, translate
- TTS: Web AudioContext + OpenAI nova via /api/tts-en (speed 0.75)
  - AudioContext is unlocked on category/mode tap, then auto-speaks on word load
  - ArrayBuffer cache (_audioCache) — NOT blob URLs
- Sentence button: /api/sentence (GPT-4o-mini), pre-fetched 500ms after word loads
- Wrong answer: specific button turns red, kid retries — does NOT auto-advance
- Correct answer: full-screen celebration overlay, kid presses "Next →"
- Spaced repetition: wrong words replay at end of round

## Stable git tag
`v-stable-english-game` = commit `e8ec8ff` — all features working

## API endpoints
- POST /api/tts — Azure Hebrew TTS (he-IL-HilaNeural)
- POST /api/tts-en — OpenAI English TTS (nova, speed 0.75)
- POST /api/sentence — GPT-4o-mini sentence generation
- GET /api/words — Hebrew word bank
- GET/POST /api/progress — Per-user KV progress
- GET/POST /api/sessions — Math sessions

## Key rules
1. **QA after every deployment** via Desktop Commander (no asking): site 200, all APIs, bundle JS name, runtime logs, Chrome visual click-through with error capture
2. **Stable tag first** before any risky change: `git tag -a v-stable-X HEAD -m "..." && git push origin v-stable-X`
3. **Write files via Desktop Commander** directly — never ask user to run terminal commands
4. **touch-action: manipulation** on all interactive elements (already in index.css globally)
5. **No auto-play without AudioContext unlock** — iOS blocks audio without prior user gesture

## Family
- Lenny (8) — Hebrew spelling game
- Leo (4) — English game (primary user)
- Logan (2)
