import YouTube from 'youtube-sr';
import { UnifiedTrack } from './types';

export class YouTubeAdapter {
  async search(query: string, limit = 12): Promise<UnifiedTrack[]> {
    try {
      const videos = await YouTube.search(query, { limit, type: 'video' });

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
          playbackUrl: null, // Audio extraction is never used; compliant official embed playback
          trackPageUrl: `https://www.youtube.com/watch?v=${v.id}`,
          license: 'Standard YouTube License (Permitted IFrame Embed)',
          previewNotice: 'Official YouTube Permitted Player',
          viewsCount: v.views,
        } as UnifiedTrack;
      });
    } catch (err: any) {
      console.warn('YouTube adapter search failed:', err.message);
      return [];
    }
  }
}
