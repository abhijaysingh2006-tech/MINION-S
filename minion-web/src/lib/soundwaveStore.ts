import { create } from 'zustand';
import { UnifiedTrack } from './musicProviders/types';

export type RepeatMode = 'off' | 'all' | 'one';

interface SoundWavePlayerStore {
  currentTrack: UnifiedTrack | null;
  queue: UnifiedTrack[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number; // 0 to 1
  isMuted: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  audioElement: HTMLAudioElement | null;
  ytPlayer: any | null;
  playbackError: string | null;
  favorites: UnifiedTrack[];

  setAudioElement: (el: HTMLAudioElement) => void;
  setYtPlayer: (player: any) => void;
  playTrack: (track: UnifiedTrack, newQueue?: UnifiedTrack[]) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (track: UnifiedTrack) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setPlaybackError: (err: string | null) => void;
}

export const useSoundWaveStore = create<SoundWavePlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  isLoading: false,
  volume: 0.8,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  shuffle: false,
  repeat: 'off',
  audioElement: null,
  ytPlayer: null,
  playbackError: null,
  favorites: [],

  setAudioElement: (el) => set({ audioElement: el }),
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
      isLoading: true,
      currentTime: 0,
      duration: track.duration || 0,
      playbackError: null,
    });

    const { audioElement, ytPlayer } = get();

    // 1. Direct HTML5 audio for Jamendo, Deezer, and Internet Archive
    if (track.playbackType === 'full_audio' || track.playbackType === 'preview_audio') {
      if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
        try { ytPlayer.pauseVideo(); } catch (_) {}
      }
      if (audioElement && track.playbackUrl) {
        audioElement.src = track.playbackUrl;
        audioElement.load();
        audioElement.play()
          .then(() => set({ isPlaying: true, isLoading: false }))
          .catch((err) => {
            console.warn('Playback error:', err.message);
            set({ isPlaying: false, isLoading: false, playbackError: 'Audio stream currently unavailable from provider' });
          });
      }
    }

    // 2. Permitted YouTube player
    if (track.playbackType === 'youtube_embed') {
      if (audioElement) {
        audioElement.pause();
      }
      if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        try {
          ytPlayer.loadVideoById(track.originalId);
          ytPlayer.playVideo();
          set({ isPlaying: true, isLoading: false });
        } catch (err) {
          console.warn('YT play error:', err);
        }
      }
    }

    // Media Session API for Lock Screen & Media Keys
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album || 'SoundWave',
        artwork: [{ src: track.coverArtwork, sizes: '512x512', type: 'image/jpeg' }],
      });
    }
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, queue, audioElement, ytPlayer } = get();
    if (!currentTrack && queue.length > 0) {
      get().playTrack(queue[0]);
      return;
    }
    if (!currentTrack) return;

    if (currentTrack.playbackType === 'youtube_embed') {
      if (ytPlayer) {
        if (isPlaying) ytPlayer.pauseVideo();
        else ytPlayer.playVideo();
      }
    } else if (audioElement) {
      if (isPlaying) audioElement.pause();
      else audioElement.play().catch(console.warn);
    }

    set({ isPlaying: !isPlaying });
  },

  seek: (seconds) => {
    const { currentTrack, audioElement, ytPlayer } = get();
    if (!currentTrack) return;

    if (currentTrack.playbackType === 'youtube_embed' && ytPlayer) {
      ytPlayer.seekTo(seconds, true);
    } else if (audioElement) {
      audioElement.currentTime = seconds;
    }
    set({ currentTime: seconds });
  },

  setVolume: (volume) => {
    const { audioElement, ytPlayer } = get();
    if (audioElement) audioElement.volume = volume;
    if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
      ytPlayer.setVolume(Math.round(volume * 100));
    }
    set({ volume, isMuted: volume === 0 });
  },

  toggleMute: () => {
    const { isMuted, audioElement, ytPlayer, volume } = get();
    const newMuted = !isMuted;
    if (audioElement) audioElement.muted = newMuted;
    if (ytPlayer) {
      if (newMuted) ytPlayer.mute();
      else ytPlayer.unMute();
    }
    set({ isMuted: newMuted });
  },

  nextTrack: () => {
    const { queue, queueIndex, shuffle, repeat } = get();
    if (queue.length === 0) return;

    if (repeat === 'one') {
      get().seek(0);
      get().togglePlay();
      return;
    }

    let nextIdx = queueIndex + 1;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeat === 'all') nextIdx = 0;
      else {
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

  toggleFavorite: (track) =>
    set((state) => {
      const exists = state.favorites.some((t) => t.id === track.id);
      const updated = exists
        ? state.favorites.filter((t) => t.id !== track.id)
        : [track, ...state.favorites];
      return { favorites: updated };
    }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setPlaybackError: (err) => set({ playbackError: err }),
}));
