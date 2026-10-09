export type AudioQuality = 'normal' | 'high' | 'lossless';
export type SubscriptionTier = 'free' | 'plus';
export type RepeatMode = 'off' | 'all' | 'one';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id: string;
  userId?: string | null;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  verified: boolean;
  monthlyListeners: number;
  tipAccountEnabled: boolean;
  createdAt: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
}

export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId?: string | null;
  albumTitle?: string | null;
  coverUrl: string;
  audioUrl: string; // HLS master playlist URL or stream URL
  duration: number; // in seconds
  explicit: boolean;
  playCount: number;
  genres: string[];
  lyrics?: SyncedLyricLine[] | null;
  isLiked?: boolean;
  isPlusOnly?: boolean;
  createdAt: string;
}

export interface SyncedLyricLine {
  time: number; // seconds
  text: string;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  coverUrl: string;
  releaseYear: number;
  tracksCount: number;
  tracks?: Track[];
}

export interface Playlist {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  ownerId: string;
  ownerName: string;
  isPublic: boolean;
  isCollaborative: boolean;
  tracksCount: number;
  tracks?: Track[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaybackState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number; // 0 to 1
  isMuted: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  crossfadeDuration: number; // seconds (0 to 12)
}

export interface ArtistStats {
  artistId: string;
  totalPlays: number;
  monthlyListeners: number;
  topTracks: Track[];
  listenerCountries: { country: string; percentage: number }[];
  dailyPlaysHistory: { date: string; plays: number }[];
  totalTipsRaisedUsd: number;
}
