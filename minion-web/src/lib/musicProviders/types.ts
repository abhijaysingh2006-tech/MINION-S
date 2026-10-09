export type MusicProvider = 'jamendo' | 'deezer' | 'archive' | 'youtube';

export type PlaybackType = 'full_audio' | 'preview_audio' | 'youtube_embed' | 'metadata_only';

export interface UnifiedTrack {
  id: string;                    // Normalized ID (e.g., "jamendo:123", "deezer:456", "yt:789")
  originalId: string;
  title: string;
  artist: string;
  album: string;
  coverArtwork: string;
  duration: number;              // In seconds
  durationFormatted: string;     // e.g. "3:42"
  provider: MusicProvider;
  playbackType: PlaybackType;
  playbackUrl?: string | null;   // Direct playable audio URL (MP3/AAC for HTML5 player)
  trackPageUrl?: string;         // Canonical link
  license?: string | null;       // CC-BY-4.0, Public Domain, All Rights Reserved
  previewNotice?: string | null; // e.g. "30-sec official preview"
  viewsCount?: number;
}

export interface UnifiedSearchResult {
  tracks: UnifiedTrack[];
  providerStatus: {
    jamendo: boolean;
    deezer: boolean;
    archive: boolean;
    youtube: boolean;
  };
  totalCount: number;
}
