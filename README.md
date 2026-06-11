# Leakwire

Gaming news intelligence tracker. V1 covers GTA VI; architecture is multi-game from day one.

> **Positioning:** We track, classify, and summarise the news. You click through to read the original.

---

## Monorepo layout

```
leakwire/
├── web/          Next.js 16 front-end (this is what Vercel deploys)
├── pipeline/     Python ingest pipeline (run via GitHub Actions cron)
└── .github/
    └── workflows/
        ├── ci.yml        Typecheck → lint → test → build on every push/PR
        └── fetch.yml     Cron every 30 min: run pipeline → ping heartbeat
```

---

## Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| Node | ≥ 22 LTS | Next.js 16 requirement |
| pnpm / npm | any recent | package manager |
| Python | ≥ 3.11 | pipeline |

---

## ① Run these migrations in Supabase SQL Editor

Open your Supabase project → **SQL Editor** → paste and run:

```sql
-- Add game column so the schema is multi-game from day one
ALTER TABLE articles ADD COLUMN IF NOT EXISTS game TEXT DEFAULT 'gta6';

-- Add og_image_url so cards can show source thumbnails
ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- Email subscriber list (no external provider in V1 — just Supabase)
CREATE TABLE IF NOT EXISTS subscribers (
  email       TEXT PRIMARY KEY,
  game        TEXT NOT NULL DEFAULT 'gta6',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

After running, verify with:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'articles';
-- Should include: url, title, source, published_at, summary,
-- category, is_relevant, confidence, created_at, game, og_image_url
```

---

## ② Environment variables

### web/.env.local  (copy from web/.env.local.example)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

`NEXT_PUBLIC_` prefix means these are safe to ship to the browser.
The Supabase anon key is intentionally public — row-level security enforces access.

### pipeline/.env  (for local runs; GitHub Secrets for CI)

```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...   ← service key, NOT anon — keep this secret
GEMINI_API_KEY=AIza...
UPTIMEROBOT_HEARTBEAT_URL=https://heartbeat.uptimerobot.com/...
```

---

## ③ Local dev

```bash
cd web
npm install        # or pnpm install
npm run dev        # starts Next.js at http://localhost:3000 with Turbopack
```

The app redirects `/` → `/gta6` automatically.

---

## ④ Vercel deploy

1. Push this repo to GitHub.
2. Import the repo in [vercel.com/new](https://vercel.com/new).
3. Set **Root Directory** to `web`.
4. Add the two `NEXT_PUBLIC_*` env vars in Vercel → Settings → Environment Variables.
5. Deploy. Every push to `main` auto-deploys.

---

## ⑤ Supabase Row Level Security (RLS)

For the `articles` table: read access is public (anon key can SELECT).
For the `subscribers` table: INSERT is public, SELECT/UPDATE/DELETE are restricted.

```sql
-- articles: public read
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read articles"
  ON articles FOR SELECT USING (true);

-- subscribers: public insert only
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert subscribers"
  ON subscribers FOR INSERT WITH CHECK (true);
```

---

## Search Console verification

After deploying, verify site ownership:

1. [search.google.com/search-console](https://search.google.com/search-console) → Add property → URL prefix → `https://your-vercel-url.vercel.app`
2. Choose HTML tag method → copy the `content` value from the meta tag
3. Set env var `NEXT_PUBLIC_GSC_VERIFICATION=your_token_here` in Vercel
4. Redeploy → verify

---

## Key facts baked into the site

| Fact | Value | Source |
|------|-------|--------|
| Release date | November 19, 2026 | Take-Two Feb 2026 earnings call |
| Platforms | PS5, Xbox Series X\|S | Confirmed |
| Protagonists | Lucia & Jason | Trailer 1 |
| Setting | Vice City / Leonida | Trailer 1 |
| Price | Unannounced ($70–80 expected) | Rumour |
| PC | Likely 2027–28 | Rumour |
| Pre-orders | Not yet open | As of build date |
