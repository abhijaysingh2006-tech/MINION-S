import { NextResponse } from 'next/server';
import { UnifiedMusicService } from '@/lib/musicProviders/unifiedMusicService';
import { UnifiedTrack } from '@/lib/musicProviders/types';

export const dynamic = 'force-dynamic';

const musicService = new UnifiedMusicService();

// In-memory cache for fast shelf responses
let shelvesCache: {
  timestamp: number;
  data: Record<string, UnifiedTrack[]>;
} | null = null;

const CACHE_TTL_MS = 1000 * 60 * 3; // 3 minutes

export async function GET(request: Request) {
  const now = Date.now();
  if (shelvesCache && now - shelvesCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ shelves: shelvesCache.data });
  }

  try {
    // Exclusively load 100% full-length songs: YouTube full tracks, Jamendo full HQ MP3s, Archive full audio
    // NO Deezer 30-second previews on homepage shelves!
    const [trendingRes, newReleasesRes, madeForYouRes, ccPicksRes, classicRes, ytRes] =
      await Promise.allSettled([
        musicService.search('top billboard hits trending songs', 'youtube'),
        musicService.search('latest hit music releases 2024', 'youtube'),
        musicService.search('popular hits official audio', 'youtube'),
        musicService.search('rock indie acoustic', 'jamendo'),
        musicService.search('classic vintage hits', 'archive'),
        musicService.search('trending music videos', 'youtube'),
      ]);

    const getTracks = (res: PromiseSettledResult<any>) =>
      res.status === 'fulfilled' && res.value?.tracks ? res.value.tracks : [];

    const shelvesData: Record<string, UnifiedTrack[]> = {
      trending: getTracks(trendingRes),
      newReleases: getTracks(newReleasesRes),
      madeForYou: getTracks(madeForYouRes),
      creativeCommons: getTracks(ccPicksRes),
      classic: getTracks(classicRes),
      youtube: getTracks(ytRes),
    };

    shelvesCache = {
      timestamp: now,
      data: shelvesData,
    };

    return NextResponse.json({ shelves: shelvesData });
  } catch (err: any) {
    console.error('Shelves API error:', err);
    return NextResponse.json({ shelves: {}, error: err.message }, { status: 500 });
  }
}
