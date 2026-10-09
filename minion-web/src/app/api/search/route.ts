import { NextResponse } from 'next/server';
import ytSearch from 'yt-search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || 'top billboard music hits 2024';

  try {
    const results = await ytSearch(q);
    const videos = (results.videos || []).slice(0, 24).map((v) => ({
      id: v.videoId,
      title: v.title,
      artistId: v.author?.name || 'YouTube Artist',
      artistName: v.author?.name || 'Artist',
      albumTitle: 'YouTube Music',
      coverUrl: v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
      audioUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
      duration: v.seconds || 210,
      timestamp: v.timestamp,
      views: v.views,
    }));

    return NextResponse.json({ tracks: videos });
  } catch (error: any) {
    console.error('YouTube search error:', error);
    return NextResponse.json({ error: 'Failed to search YouTube', tracks: [] }, { status: 500 });
  }
}
