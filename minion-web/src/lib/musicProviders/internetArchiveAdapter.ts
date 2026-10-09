import axios from 'axios';
import { UnifiedTrack } from './types';

export class InternetArchiveAdapter {
  async search(query: string, limit = 10): Promise<UnifiedTrack[]> {
    try {
      const res = await axios.get('https://archive.org/advancedsearch.php', {
        params: {
          q: `(${query}) AND mediatype:(audio)`,
          fl: 'identifier,title,creator,description,year',
          sort: 'downloads desc',
          rows: limit,
          output: 'json',
        },
        timeout: 6000,
      });

      if (!res.data || !res.data.response || !res.data.response.docs) return [];

      return res.data.response.docs.map((doc: any) => {
        const id = doc.identifier;
        return {
          id: `archive:${id}`,
          originalId: id,
          title: doc.title || id,
          artist: doc.creator || 'Internet Archive Live',
          album: doc.year ? `Recording (${doc.year})` : 'Public Audio',
          coverArtwork: `https://archive.org/services/img/${id}`,
          duration: 240,
          durationFormatted: '4:00',
          provider: 'archive',
          playbackType: 'full_audio',
          playbackUrl: `https://archive.org/download/${id}/${id}_vbr.mp3`,
          trackPageUrl: `https://archive.org/details/${id}`,
          license: 'Public Domain / Open Audio Library',
          previewNotice: null,
        } as UnifiedTrack;
      });
    } catch (err: any) {
      console.warn('Internet Archive search failed:', err.message);
      return [];
    }
  }
}
