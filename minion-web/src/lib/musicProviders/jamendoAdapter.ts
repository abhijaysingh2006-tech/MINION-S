import axios from 'axios';
import { UnifiedTrack } from './types';

export class JamendoAdapter {
  // Public client_id provided by Jamendo for free developer sandbox access
  private clientId = process.env.JAMENDO_CLIENT_ID || 'c34b17a1';

  async search(query: string, limit = 15): Promise<UnifiedTrack[]> {
    try {
      const res = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
        params: {
          client_id: this.clientId,
          format: 'json',
          limit,
          namesearch: query,
          include: 'licenses musicinfo',
          audioformat: 'mp32', // Full HQ MP3 streaming
        },
        timeout: 6000,
      });

      if (!res.data || !res.data.results) return [];

      return res.data.results.map((item: any) => {
        const dur = Number(item.duration) || 180;
        const mins = Math.floor(dur / 60);
        const secs = dur % 60;

        return {
          id: `jamendo:${item.id}`,
          originalId: item.id,
          title: item.name,
          artist: item.artist_name,
          album: item.album_name || 'Single',
          coverArtwork: item.image || item.album_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
          duration: dur,
          durationFormatted: `${mins}:${secs < 10 ? '0' : ''}${secs}`,
          provider: 'jamendo',
          playbackType: 'full_audio',
          playbackUrl: item.audio, // 100% legal full audio stream URL
          trackPageUrl: item.shareurl || `https://www.jamendo.com/track/${item.id}`,
          license: item.license_ccurl ? 'Creative Commons' : 'Jamendo Free License',
          previewNotice: null,
        } as UnifiedTrack;
      });
    } catch (err: any) {
      console.warn('Jamendo API search failed:', err.message);
      return [];
    }
  }
}
