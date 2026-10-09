# Minion Music Platform Architecture & Developer Guide
Tagline: *"Music, no interruptions."*

---

## 1. Executive Summary & Brand Identity
- **Name**: Minion
- **Tagline**: "Music, no interruptions."
- **Brand Palette**:
  - Primary Yellow: `#FFD60A` (play buttons, highlights, active states)
  - Denim Blue: `#2B5BA8` (secondary accents, badges, badges)
  - Near-Black Canvas: `#0F0F12` (dark-first luxury backdrop)
  - Crisp White: `#F8FAFC` (high-contrast typography meeting WCAG AA)
- **Zero Ads Philosophy**: Fully ad-free for all users. Revenue is driven cleanly by optional **Minion Plus** subscriptions ($4.99/mo for offline downloads & 320kbps lossless audio) and direct **Artist Tipping** with 0% platform take.

---

## 2. Directory Structure
```
minion-music-app/
├── .github/workflows/ci.yml       # GitHub Actions CI/CD pipeline
├── docker-compose.yml             # Postgres, Redis, Meilisearch, MinIO S3
├── packages/
│   ├── types/                     # Shared TypeScript types for web, mobile & backend
│   │   ├── package.json
│   │   └── src/index.ts
│   └── ui/
│       └── minion-logo.svg        # Official Minion SVG vector asset & icon
├── minion-api/                    # NestJS REST API Backend
│   ├── package.json
│   ├── API_SPECS.md               # Complete OpenAPI 3.1 endpoint specification
│   ├── prisma/schema.prisma       # Complete PostgreSQL schema & relations
│   └── src/
│       ├── transcoder.ts          # FFmpeg multi-bitrate HLS adaptive transcoder
│       ├── catalog-ingestion.service.ts # Jamendo & Creative Commons music ingestion
│       └── recommendations.service.ts   # Hybrid collaborative filtering & content AI engine
├── minion-web/                    # Next.js App Router Web Platform
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── app/page.tsx           # Full responsive 3-column music player UI
│       ├── lib/playerStore.ts     # Zustand audio state + Media Session API
│       ├── lib/mockCatalog.ts     # Royalty-free music catalog with synced lyrics
│       └── components/
│           ├── MinionLogo.tsx     # Vector brand component
│           ├── Sidebar.tsx        # Navigation with zero-ad badge & plus CTA
│           ├── MainFeed.tsx       # Music discovery, search, and mixes
│           ├── PlayerBar.tsx      # Persistent scrubber, volume, and playback controls
│           ├── RightNowPlayingPanel.tsx # Now playing details & artist tipping
│           ├── SyncedLyricsModal.tsx    # Live synchronized lyrics display
│           ├── ArtistDashboard.tsx      # Upload flow, analytics, fan tips
│           └── MinionWrapped.tsx        # Yearly stats & ad-free minutes saved
└── minion-mobile/                 # React Native (Expo) Cross-Platform Mobile App
    ├── package.json
    ├── app.json                   # iOS / Android com.minion.app config & background audio
    └── src/App.tsx                # Expo AV mobile player, bottom tabs, mini player
```

---

## 3. How to Run Locally

### Step 1: Start Databases & Infrastructure
```bash
docker-compose up -d
```
Starts:
- **PostgreSQL 16** on `localhost:5432`
- **Redis 7** on `localhost:6379`
- **Meilisearch** on `localhost:7700`
- **MinIO S3** on `localhost:9000`

### Step 2: Run Backend
```bash
cd minion-api
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

### Step 3: Run Web Experience
```bash
cd minion-web
npm install
npm run dev
```
Navigate to `http://localhost:3000` to interact with the full Minion music player.

### Step 4: Run Mobile App (iOS / Android)
```bash
cd minion-mobile
npm install
npx expo start
```
Scan the QR code with Expo Go on iOS or Android.
