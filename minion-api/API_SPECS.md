# Minion REST API Specification (OpenAPI 3.1 Compliant)
**Base URL**: `/api/v1`  
**Authentication**: Bearer JWT (`Authorization: Bearer <access_token>`)  
**Error Format**:
```json
{
  "statusCode": 400,
  "message": "Validation failed / Resource not found",
  "error": "Bad Request",
  "timestamp": "2026-10-09T06:30:00.000Z"
}
```

---

## 1. Authentication & User Profile
- **`POST /api/v1/auth/register`**
  - Public
  - Body: `{ email: string, password: string, username: string, displayName: string }`
  - Response 201: `{ user: User, tokens: { accessToken: string, refreshToken: string } }`
- **`POST /api/v1/auth/login`**
  - Public
  - Body: `{ email: string, password: string }`
  - Response 200: `{ user: User, tokens: { accessToken: string, refreshToken: string } }`
- **`POST /api/v1/auth/oauth/{google|apple}`**
  - Public
  - Body: `{ idToken: string }`
  - Response 200: `{ user: User, tokens: { accessToken: string, refreshToken: string } }`
- **`POST /api/v1/auth/refresh`**
  - Public
  - Body: `{ refreshToken: string }`
  - Response 200: `{ accessToken: string, refreshToken: string }`
- **`GET /api/v1/me`**
  - Required Auth: USER
  - Response 200: User profile object + subscription status + preferences
- **`PATCH /api/v1/me/settings`**
  - Required Auth: USER
  - Body: `{ audioQuality?: 'normal'|'high'|'lossless', normalizeVolume?: boolean, crossfadeSeconds?: number, theme?: 'dark'|'light'|'system' }`

---

## 2. Tracks & Audio Streaming
- **`GET /api/v1/tracks/{id}`**
  - Public / Optional Auth
  - Response 200: `{ id, title, artist, album, coverUrl, duration, lyrics, isLiked }`
- **`GET /api/v1/tracks/{id}/stream`**
  - Optional Auth (Requires PLUS subscription tier for 320kbps stream; free users served up to 160kbps)
  - Returns a temporary signed HLS playlist URL (m3u8), valid for 60 seconds with rate limiting & anti-scrape signature.
- **`POST /api/v1/tracks/{id}/play`**
  - Required Auth: USER
  - Records listening event, updates play count & collaborative filtering graph.
  - Body: `{ playedDurationSeconds: number, completed: boolean }`
- **`GET /api/v1/tracks/{id}/lyrics`**
  - Public
  - Response 200: `{ lyrics: [{ time: 12.4, text: "Banana ba-ba-nana..." }] }`

---

## 3. Catalog & Discovery
- **`GET /api/v1/discovery/home`**
  - Optional Auth
  - Response 200:
    ```json
    {
      "madeForYou": [...],
      "recentlyPlayed": [...],
      "trending": [...],
      "newReleases": [...],
      "featuredGenres": [...]
    }
    ```
- **`GET /api/v1/discovery/search?q={query}&type={track,album,artist,playlist}&cursor={cursor}&limit=20`**
  - Public
  - Powered by Meilisearch typo-tolerant index with instant multi-facet results.
- **`GET /api/v1/discovery/genres`**
  - Public: List of all music genres and mood tags.
- **`GET /api/v1/discovery/genres/{slug}/tracks`**
  - Cursor-based list of tracks tagged with this genre.
- **`GET /api/v1/discovery/wrapped/{year}`**
  - Required Auth: USER
  - Yearly statistics: Top 5 artists, minutes listened, top genres, peak listening hour.

---

## 4. Playlists & Library
- **`GET /api/v1/me/playlists`**
  - Required Auth: USER
  - Returns playlists created by user or followed.
- **`POST /api/v1/playlists`**
  - Required Auth: USER
  - Body: `{ title: string, description?: string, isPublic?: boolean }`
- **`GET /api/v1/playlists/{id}`**
  - Public or Private check
  - Returns playlist metadata and tracks.
- **`POST /api/v1/playlists/{id}/tracks`**
  - Required Auth (Owner or Collaborator)
  - Body: `{ trackId: string, position?: number }`
- **`DELETE /api/v1/playlists/{id}/tracks/{trackId}`**
  - Required Auth (Owner or Collaborator)
- **`POST /api/v1/tracks/{id}/like`** and **`DELETE /api/v1/tracks/{id}/like`**
  - Required Auth: Toggle track in user library.
- **`POST /api/v1/artists/{id}/follow`** and **`DELETE /api/v1/artists/{id}/follow`**
  - Required Auth: Follow / Unfollow artist.

---

## 5. Artists & Uploads
- **`POST /api/v1/artist/verify-request`**
  - Required Auth: USER
  - Applies to become a verified artist with social proofs.
- **`POST /api/v1/artist/tracks/upload`**
  - Required Auth: ARTIST
  - Multipart upload or presigned S3 URL initialization for lossless FLAC/WAV audio & cover image.
  - Automatically triggers background FFmpeg HLS transcoding worker.
  - Body metadata: `{ title: string, albumId?: string, genres: string[], copyrightDeclaration: boolean }`
- **`GET /api/v1/artist/analytics`**
  - Required Auth: ARTIST
  - Returns monthly listeners, daily stream breakdown, geographic listener breakdown, tipping revenue.
- **`POST /api/v1/artist/{id}/tip`**
  - Required Auth: USER
  - Creates a Stripe Checkout / PaymentIntent session for directly supporting an artist.

---

## 6. Subscriptions (Minion Plus)
- **`POST /api/v1/subscriptions/checkout-session`**
  - Required Auth: USER
  - Initiates Stripe Checkout for \$4.99/mo Minion Plus (Zero ads forever, 320kbps audio, offline mobile downloads).
- **`POST /api/v1/subscriptions/webhook`**
  - Stripe signature verification. Handles `customer.subscription.created`, `customer.subscription.deleted`.
