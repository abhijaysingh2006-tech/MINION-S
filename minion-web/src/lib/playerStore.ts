import { create } from 'zustand';
import { Track, INITIAL_TRACKS } from './mockCatalog';

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  audioElement: HTMLAudioElement | null;
  isFullScreenNowPlaying: boolean;
  isLyricsOpen: boolean;

  setAudioElement: (element: HTMLAudioElement) => void;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (trackId: string) => void;
  toggleFullScreenNowPlaying: () => void;
  toggleLyrics: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: INITIAL_TRACKS[0],
  queue: INITIAL_TRACKS,
  queueIndex: 0,
  isPlaying: false,
  volume: 0.85,
  isMuted: false,
  currentTime: 0,
  duration: INITIAL_TRACKS[0].duration,
  shuffle: false,
  repeat: 'off',
  audioElement: null,
  isFullScreenNowPlaying: false,
  isLyricsOpen: false,

  setAudioElement: (element) => set({ audioElement: element }),

  playTrack: (track, newQueue) => {
    const { audioElement } = get();
    const updatedQueue = newQueue || get().queue;
    const index = updatedQueue.findIndex((t) => t.id === track.id);

    set({
      currentTrack: track,
      queue: updatedQueue,
      queueIndex: index >= 0 ? index : 0,
      isPlaying: true,
      currentTime: 0,
    });

    if (audioElement) {
      audioElement.src = track.audioUrl;
      audioElement.play().catch(console.error);
    }

    // Media Session API for OS lock screen / media keys
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artistName,
        album: track.albumTitle || 'Minion Music',
        artwork: [
          { src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' },
        ],
      });
    }
  },

  togglePlay: () => {
    const { isPlaying, audioElement, currentTrack, queue } = get();
    if (!currentTrack && queue.length > 0) {
      get().playTrack(queue[0]);
      return;
    }
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play().catch(console.error);
      }
    }
    set({ isPlaying: !isPlaying });
  },

  seek: (seconds) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.currentTime = seconds;
    }
    set({ currentTime: seconds });
  },

  setVolume: (volume) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.volume = volume;
    }
    set({ volume, isMuted: volume === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume, audioElement } = get();
    const newMuted = !isMuted;
    if (audioElement) {
      audioElement.muted = newMuted;
    }
    set({ isMuted: newMuted });
  },

  nextTrack: () => {
    const { queue, queueIndex, shuffle, repeat } = get();
    if (queue.length === 0) return;

    if (repeat === 'one') {
      get().seek(0);
      const { audioElement } = get();
      audioElement?.play();
      return;
    }

    let nextIndex = queueIndex + 1;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }
    get().playTrack(queue[nextIndex]);
  },

  prevTrack: () => {
    const { queue, queueIndex, currentTime } = get();
    if (currentTime > 3) {
      get().seek(0);
      return;
    }
    const prevIndex = queueIndex - 1 >= 0 ? queueIndex - 1 : queue.length - 1;
    get().playTrack(queue[prevIndex]);
  },

  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

  toggleRepeat: () =>
    set((state) => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const nextIdx = (modes.indexOf(state.repeat) + 1) % modes.length;
      return { repeat: modes[nextIdx] };
    }),

  toggleLike: (trackId) =>
    set((state) => ({
      queue: state.queue.map((t) => (t.id === trackId ? { ...t, isLiked: !t.isLiked } : t)),
      currentTrack:
        state.currentTrack?.id === trackId
          ? { ...state.currentTrack, isLiked: !state.currentTrack.isLiked }
          : state.currentTrack,
    })),

  toggleFullScreenNowPlaying: () =>
    set((state) => ({ isFullScreenNowPlaying: !state.isFullScreenNowPlaying })),

  toggleLyrics: () => set((state) => ({ isLyricsOpen: !state.isLyricsOpen })),

  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
}));
