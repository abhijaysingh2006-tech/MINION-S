import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumTitle?: string;
  coverUrl: string;
  audioUrl: string; // YouTube video ID or stream url
  duration: number;
  timestamp?: string;
  views?: number;
  isLiked?: boolean;
}

export type RepeatMode = 'off' | 'all' | 'one';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number; // 0 to 100
  isMuted: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  ytPlayer: any | null;
  likedTrackIds: Set<string>;

  setYtPlayer: (player: any) => void;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (track: Track) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  volume: 80,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  shuffle: false,
  repeat: 'off',
  ytPlayer: null,
  likedTrackIds: new Set<string>(),

  setYtPlayer: (player) => set({ ytPlayer: player }),

  playTrack: (track, newQueue) => {
    const queue = newQueue || get().queue;
    const exists = queue.findIndex((t) => t.id === track.id);
    const updatedQueue = exists >= 0 ? queue : [track, ...queue];
    const index = exists >= 0 ? exists : 0;

    set({
      currentTrack: track,
      queue: updatedQueue,
      queueIndex: index,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration || 0,
    });

    const { ytPlayer } = get();
    if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
      try {
        ytPlayer.loadVideoById(track.id);
        ytPlayer.playVideo();
      } catch (err) {
        console.error('YT play error:', err);
      }
    }

    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artistName,
        album: 'YouTube Music / Minion',
        artwork: [{ src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' }],
      });
    }
  },

  togglePlay: () => {
    const { isPlaying, ytPlayer, currentTrack, queue } = get();
    if (!currentTrack && queue.length > 0) {
      get().playTrack(queue[0]);
      return;
    }
    if (ytPlayer) {
      try {
        if (isPlaying) {
          ytPlayer.pauseVideo();
        } else {
          ytPlayer.playVideo();
        }
      } catch (err) {
        console.error(err);
      }
    }
    set({ isPlaying: !isPlaying });
  },

  seek: (seconds) => {
    const { ytPlayer } = get();
    if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
      ytPlayer.seekTo(seconds, true);
    }
    set({ currentTime: seconds });
  },

  setVolume: (volume) => {
    const { ytPlayer } = get();
    if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
      ytPlayer.setVolume(volume);
      if (volume > 0 && ytPlayer.isMuted && ytPlayer.isMuted()) {
        ytPlayer.unMute();
      }
    }
    set({ volume, isMuted: volume === 0 });
  },

  toggleMute: () => {
    const { isMuted, ytPlayer, volume } = get();
    if (ytPlayer) {
      if (isMuted) {
        ytPlayer.unMute();
      } else {
        ytPlayer.mute();
      }
    }
    set({ isMuted: !isMuted });
  },

  nextTrack: () => {
    const { queue, queueIndex, shuffle, repeat } = get();
    if (queue.length === 0) return;

    if (repeat === 'one') {
      get().seek(0);
      get().ytPlayer?.playVideo();
      return;
    }

    let nextIdx = queueIndex + 1;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeat === 'all') {
        nextIdx = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }
    get().playTrack(queue[nextIdx]);
  },

  prevTrack: () => {
    const { queue, queueIndex, currentTime } = get();
    if (currentTime > 3) {
      get().seek(0);
      return;
    }
    const prevIdx = queueIndex - 1 >= 0 ? queueIndex - 1 : queue.length - 1;
    get().playTrack(queue[prevIdx]);
  },

  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

  toggleRepeat: () =>
    set((state) => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const nextIdx = (modes.indexOf(state.repeat) + 1) % modes.length;
      return { repeat: modes[nextIdx] };
    }),

  toggleLike: (track) =>
    set((state) => {
      const nextLiked = new Set(state.likedTrackIds);
      if (nextLiked.has(track.id)) {
        nextLiked.delete(track.id);
      } else {
        nextLiked.add(track.id);
      }
      return { likedTrackIds: nextLiked };
    }),

  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
}));
