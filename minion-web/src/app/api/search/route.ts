import { NextResponse } from 'next/server';
import YouTube from 'youtube-sr';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || 'top billboard hits 2024';

  try {
    const videos = await YouTube.search(q, { limit: 25, type: 'video' });

    const tracks = videos.map((v) => ({
      id: v.id,
      title: v.title || 'Untitled',
      artistId: v.channel?.name || 'Artist',
      artistName: v.channel?.name || 'YouTube Music',
      albumTitle: 'YouTube',
      coverUrl: v.thumbnail?.url || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      audioUrl: `https://www.youtube.com/watch?v=${v.id}`,
      duration: Math.round((v.duration || 210000) / 1000),
      timestamp: v.durationFormatted || '3:30',
      views: v.views,
    }));

    return NextResponse.json({ tracks });
  } catch (error: any) {
    console.error('YouTube search error:', error);
    return NextResponse.json({ error: error.message, tracks: [] }, { status: 500 });
  }
}
