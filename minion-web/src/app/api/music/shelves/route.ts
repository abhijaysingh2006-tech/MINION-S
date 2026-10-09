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

const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

export async function GET(request: Request) {
  const now = Date.now();
  if (shelvesCache && now - shelvesCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ shelves: shelvesCache.data });
  }

  try {
    const [trendingRes, newReleasesRes, madeForYouRes, ccPicksRes, classicRes, ytRes] =
      await Promise.allSettled([
        musicService.search('top hits billboard chart'),
        musicService.search('new music releases 2024'),
        musicService.search('chill vibes indie electronic'),
        musicService.search('rock indie acoustic', 'jamendo'),
        musicService.search('classic old time radio vintage', 'archive'),
        musicService.search('popular hits music video', 'youtube'),
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
