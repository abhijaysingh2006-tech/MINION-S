import { create } from 'zustand';
import { UnifiedTrack } from './musicProviders/types';

export type RepeatMode = 'off' | 'all' | 'one';

export interface ToastMessage {
  id: string;
  type: 'info' | 'error' | 'success';
  message: string;
}

export interface CustomPlaylist {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
}

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
  playlists: CustomPlaylist[];
  toasts: ToastMessage[];

  // Navigation State
  activeTab: 'home' | 'search' | 'library' | 'favorites' | 'playlist';
  activePlaylistId: string | null;
  activeProviderFilter: string; // 'all' | 'jamendo' | 'deezer' | 'youtube' | 'archive'
  searchQuery: string;

  // Actions
  setActiveTab: (tab: 'home' | 'search' | 'library' | 'favorites' | 'playlist') => void;
  setActivePlaylistId: (id: string | null) => void;
  setActiveProviderFilter: (provider: string) => void;
  setSearchQuery: (query: string) => void;
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
  createPlaylist: (name: string, description?: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  showToast: (message: string, type?: 'info' | 'error' | 'success') => void;
  dismissToast: (id: string) => void;
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
  playlists: [
    {
      id: 'pl-top-releases',
      name: 'Top 50 Global Releases',
      description: 'Deezer & Jamendo Trending Charts',
      trackIds: [],
    },
    {
      id: 'pl-open-audio',
      name: 'Open Audio & Classic Radio',
      description: 'Internet Archive Public Domain Tracks',
      trackIds: [],
    },
    {
      id: 'pl-cc-lounge',
      name: 'Creative Commons Lounge',
      description: 'Commercial Free Relaxation & Study Beats',
      trackIds: [],
    },
  ],
  toasts: [],

  activeTab: 'home',
  activePlaylistId: null,
  activeProviderFilter: 'all',
  searchQuery: '',

  setActiveTab: (tab) => set({ activeTab: tab }),
  setActivePlaylistId: (id) => set({ activePlaylistId: id, activeTab: 'playlist' }),
  setActiveProviderFilter: (provider) => set({ activeProviderFilter: provider }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setAudioElement: (el) => set({ audioElement: el }),
  setYtPlayer: (player) => set({ ytPlayer: player }),

  showToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 4000);
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

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

    // 1. Direct HTML5 audio (Jamendo, Deezer preview, Archive.org)
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
            console.warn('Playback error:', err);
            set({ isPlaying: false, isLoading: false, playbackError: 'Audio stream currently unavailable' });
            get().showToast('Playback stream error from provider', 'error');
          });
      } else {
        set({ isPlaying: false, isLoading: false, playbackError: 'No direct audio URL provided' });
        get().showToast('Audio URL not available for this track', 'error');
      }
    }

    // 2. Permitted YouTube Iframe player
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
          get().showToast('YouTube player error', 'error');
        }
      }
    }

    // Media Session API integration
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album || 'SoundWave',
          artwork: [{ src: track.coverArtwork, sizes: '512x512', type: 'image/jpeg' }],
        });
      } catch (_) {}
    }
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, queue, audioElement, ytPlayer } = get();
    if (!currentTrack && queue.length > 0) {
      get().playTrack(queue[0]);
      return;
    }
    if (!currentTrack) {
      get().showToast('Select a song to start playing', 'info');
      return;
    }

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
    const { isMuted, audioElement, ytPlayer } = get();
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

  toggleShuffle: () => {
    const nextVal = !get().shuffle;
    set({ shuffle: nextVal });
    get().showToast(nextVal ? 'Shuffle enabled' : 'Shuffle disabled', 'info');
  },

  toggleRepeat: () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const nextIdx = (modes.indexOf(get().repeat) + 1) % modes.length;
    const mode = modes[nextIdx];
    set({ repeat: mode });
    get().showToast(`Repeat mode: ${mode.toUpperCase()}`, 'info');
  },

  toggleFavorite: (track) => {
    const exists = get().favorites.some((t) => t.id === track.id);
    const updated = exists
      ? get().favorites.filter((t) => t.id !== track.id)
      : [track, ...get().favorites];
    set({ favorites: updated });
    get().showToast(exists ? 'Removed from Liked Songs' : 'Added to Liked Songs', 'success');
  },

  createPlaylist: (name, description = '') => {
    if (!name.trim()) return;
    const newPl: CustomPlaylist = {
      id: `pl-${Date.now()}`,
      name: name.trim(),
      description,
      trackIds: [],
    };
    set((state) => ({
      playlists: [...state.playlists, newPl],
      activePlaylistId: newPl.id,
      activeTab: 'playlist',
    }));
    get().showToast(`Created playlist "${name}"`, 'success');
  },

  addTrackToPlaylist: (playlistId, trackId) => {
    set((state) => ({
      playlists: state.playlists.map((pl) =>
        pl.id === playlistId && !pl.trackIds.includes(trackId)
          ? { ...pl, trackIds: [...pl.trackIds, trackId] }
          : pl
      ),
    }));
    get().showToast('Added track to playlist', 'success');
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setPlaybackError: (err) => set({ playbackError: err }),
}));
