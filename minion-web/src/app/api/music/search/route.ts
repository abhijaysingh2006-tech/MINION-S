import { NextResponse } from 'next/server';
import { UnifiedMusicService } from '@/lib/musicProviders/unifiedMusicService';
import { MusicProvider } from '@/lib/musicProviders/types';

const musicService = new UnifiedMusicService();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || 'top billboard hits';
  const provider = (searchParams.get('provider') as MusicProvider) || undefined;

  try {
    const result = await musicService.search(q, provider);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Unified music API error:', err);
    return NextResponse.json(
      { tracks: [], providerStatus: { jamendo: false, deezer: false, archive: false, youtube: false }, error: err.message },
      { status: 500 }
    );
  }
}
