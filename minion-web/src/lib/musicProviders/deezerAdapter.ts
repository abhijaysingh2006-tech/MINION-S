import axios from 'axios';
import { UnifiedTrack } from './types';

export class DeezerAdapter {
  async search(query: string, limit = 15): Promise<UnifiedTrack[]> {
    try {
      const res = await axios.get('https://api.deezer.com/search', {
        params: {
          q: query,
          limit,
        },
        timeout: 6000,
      });

      if (!res.data || !res.data.data) return [];

      return res.data.data.map((item: any) => {
        const dur = Number(item.duration) || 30;
        const mins = Math.floor(dur / 60);
        const secs = dur % 60;

        return {
          id: `deezer:${item.id}`,
          originalId: String(item.id),
          title: item.title_short || item.title,
          artist: item.artist?.name || 'Unknown Artist',
          album: item.album?.title || 'Single',
          coverArtwork: item.album?.cover_medium || item.artist?.picture_medium || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
          duration: dur,
          durationFormatted: `${mins}:${secs < 10 ? '0' : ''}${secs}`,
          provider: 'deezer',
          playbackType: item.preview ? 'preview_audio' : 'metadata_only',
          playbackUrl: item.preview || null, // Permitted 30-second official preview MP3 clip
          trackPageUrl: item.link || `https://www.deezer.com/track/${item.id}`,
          license: 'Standard Commercial License (Deezer Preview)',
          previewNotice: 'Official 30s High-Quality Preview',
        } as UnifiedTrack;
      });
    } catch (err: any) {
      console.warn('Deezer API search failed:', err.message);
      return [];
    }
  }
}
