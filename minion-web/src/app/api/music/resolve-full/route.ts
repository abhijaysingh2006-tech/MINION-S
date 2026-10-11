import { NextResponse } from 'next/server';
import axios from 'axios';
import YouTubeScraper from 'youtube-sr';

export const dynamic = 'force-dynamic';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

// In-memory cache for resolved songs to avoid redundant API queries
const resolvedCache = new Map<string, { videoId: string; title: string; duration: number }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';
  const artist = searchParams.get('artist') || '';
  const q = searchParams.get('q') || `${artist} ${title}`.trim();

  if (!q) {
    return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
  }

  const cacheKey = q.toLowerCase();
  if (resolvedCache.has(cacheKey)) {
    return NextResponse.json(resolvedCache.get(cacheKey));
  }

  // 1. Try Google YouTube Data API v3
  if (YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'your_youtube_api_key_here') {
    try {
      const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: `${q} official audio`,
          type: 'video',
          videoCategoryId: '10', // Music category
          maxResults: 1,
          key: YOUTUBE_API_KEY,
        },
        timeout: 5000,
      });

      if (res.data?.items && res.data.items.length > 0) {
        const item = res.data.items[0];
        const videoId = item.id?.videoId;
        if (videoId) {
          const result = {
            videoId,
            title: item.snippet?.title || q,
            duration: 210,
          };
          resolvedCache.set(cacheKey, result);
          return NextResponse.json(result);
        }
      }
    } catch (err: any) {
      console.warn('YouTube Data API v3 resolve error:', err.message);
    }
  }

  // 2. High-reliability fallback using youtube-sr
  try {
    const videos = await YouTubeScraper.search(`${q} audio`, { limit: 1, type: 'video' });
    if (videos && videos.length > 0 && videos[0]?.id) {
      const v = videos[0];
      const result = {
        videoId: v.id as string,
        title: v.title || q,
        duration: Math.round((v.duration || 210000) / 1000),
      };
      resolvedCache.set(cacheKey, result);
      return NextResponse.json(result);
    }
  } catch (err: any) {
    console.warn('YouTube scraper resolve error:', err.message);
  }

  return NextResponse.json({ error: 'Could not resolve full track' }, { status: 404 });
}
