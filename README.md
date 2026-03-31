# משחק המילים של נטע 🎮

Hebrew spelling + math game for kids. Built with React + Vite + Vercel KV.

## Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Vercel Serverless Functions
- **Storage**: Vercel KV (Redis)
- **TTS**: OpenAI `tts-1-hd` via server-side API route
- **Domain**: `gameapp.idanshchori.com`

## Setup

### 1. Install deps
```bash
npm install
```

### 2. Environment variables (Vercel dashboard)
```
OPENAI_API_KEY=sk-...
KV_REST_API_URL=...       # from Vercel KV store
KV_REST_API_TOKEN=...     # from Vercel KV store
```

### 3. Create Vercel KV store
- Vercel dashboard → Storage → Create → KV
- Connect to this project — env vars auto-populate

### 4. DNS
- Vercel dashboard → Domains → `idanshchori.com`
- Add record: `gameapp` → points to this project
- (Auto-handled since idanshchori.com nameservers are on Vercel)

### 5. Deploy
```bash
git push  # Vercel auto-deploys from main
```

## Local dev
```bash
npm run dev
```
> Note: TTS and KV won't work locally without `.env.local` with the above keys.

## Pages
| Route | Description |
|-------|-------------|
| `/` | Home — game picker |
| `/spelling` | שמע ובנה — Hebrew spelling |
| `/math` | משחק חשבון — math game |
| `/admin` | Word management |
| `/leaderboard` | Scores |
