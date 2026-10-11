import axios from 'axios';
import YouTubeScraper from 'youtube-sr';
import { UnifiedTrack } from './types';
import { searchYouTubeDirect } from './youtubeWebSearch';

export class YouTubeAdapter {
  private apiKey = process.env.YOUTUBE_API_KEY || '';

  async search(query: string, limit = 15): Promise<UnifiedTrack[]> {
    // 1. If an official YouTube Data API v3 key is provided, use Google endpoint
    if (this.apiKey && this.apiKey !== 'your_youtube_api_key_here') {
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q: `${query} music`,
            type: 'video',
            videoCategoryId: '10',
            maxResults: limit,
            key: this.apiKey,
          },
          timeout: 6000,
        });

        if (response.data?.items && response.data.items.length > 0) {
          return response.data.items.map((item: any) => {
            const videoId = item.id?.videoId;
            const snippet = item.snippet;

            return {
              id: `youtube:${videoId}`,
              originalId: videoId,
              title: snippet?.title || 'YouTube Music Track',
              artist: snippet?.channelTitle || 'YouTube Artist',
              album: 'Official YouTube Release',
              coverArtwork:
                snippet?.thumbnails?.high?.url ||
                snippet?.thumbnails?.medium?.url ||
                `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              duration: 210,
              durationFormatted: '3:30',
              provider: 'youtube',
              playbackType: 'youtube_embed',
              playbackUrl: null,
              trackPageUrl: `https://www.youtube.com/watch?v=${videoId}`,
              license: 'Standard YouTube License (Official Data API v3)',
              previewNotice: 'YouTube Data API v3 Official Video',
            } as UnifiedTrack;
          });
        }
      } catch (err: any) {
        console.warn(
          'YouTube Data API v3 note:',
          err.response?.data?.error?.message || err.message
        );
      }
    }

    // 2. High-reliability direct web search (zero credentials, no browseId failure)
    try {
      const directResults = await searchYouTubeDirect(query, limit);
      if (directResults && directResults.length > 0) {
        return directResults.map((v) => ({
          id: `youtube:${v.id}`,
          originalId: v.id,
          title: v.title,
          artist: v.artist,
          album: 'YouTube Music Track',
          coverArtwork: v.thumbnail,
          duration: v.duration,
          durationFormatted: v.durationFormatted,
          provider: 'youtube',
          playbackType: 'youtube_embed',
          playbackUrl: null,
          trackPageUrl: `https://www.youtube.com/watch?v=${v.id}`,
          license: 'Standard YouTube License (Permitted Embed)',
          previewNotice: 'Official YouTube Permitted Player',
        }));
      }
    } catch (e: any) {
      console.warn('Direct YouTube web search fallback error:', e.message);
    }

    // 3. Fallback to youtube-sr if available
    try {
      const videos = await YouTubeScraper.search(query, { limit, type: 'video' });
      return videos.map((v) => {
        const durSec = Math.round((v.duration || 210000) / 1000);
        return {
          id: `youtube:${v.id}`,
          originalId: v.id,
          title: v.title || 'Untitled Video',
          artist: v.channel?.name || 'YouTube Creator',
          album: 'YouTube Video',
          coverArtwork: v.thumbnail?.url || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
          duration: durSec,
          durationFormatted: v.durationFormatted || '3:30',
          provider: 'youtube',
          playbackType: 'youtube_embed',
          playbackUrl: null,
          trackPageUrl: `https://www.youtube.com/watch?v=${v.id}`,
          license: 'Standard YouTube License (Permitted Embed)',
          previewNotice: 'Official YouTube Permitted Player',
          viewsCount: v.views,
        } as UnifiedTrack;
      });
    } catch (e: any) {
      console.warn('YouTube scraper search error:', e.message);
      return [];
    }
  }
}
