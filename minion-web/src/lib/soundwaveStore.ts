import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  coverUrl?: string;
}

export interface NavigationHistoryEntry {
  tab: 'home' | 'search' | 'library' | 'favorites' | 'playlist' | 'artist' | 'album' | 'section';
  meta?: any;
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

  // Dynamic Theme Accent
  dynamicColor: string;
  hoverGradientColor: string | null;
  setHoverGradientColor: (color: string | null) => void;

  // Lyrics & Mobile Sheet State
  isLyricsOpen: boolean;
  isMobileSheetOpen: boolean;
  setIsMobileSheetOpen: (open: boolean) => void;
  toggleMobileSheet: () => void;

  // 3-Panel Layout & Navigation State
  isLeftRailExpanded: boolean;
  leftRailWidth: number; // in pixels
  isRightPanelOpen: boolean;
  activeTab: 'home' | 'search' | 'library' | 'favorites' | 'playlist' | 'artist' | 'album' | 'section';
  activePlaylistId: string | null;
  selectedSection: { title: string; query: string; provider: string } | null;
  activeProviderFilter: string; // 'all' | 'jamendo' | 'deezer' | 'youtube' | 'archive'
  activeCategoryFilter: 'all' | 'music' | 'podcasts';
  searchQuery: string;

  // History State (Back / Forward)
  history: NavigationHistoryEntry[];
  historyIndex: number;

  // Actions
  toggleLeftRail: () => void;
  setLeftRailWidth: (width: number) => void;
  toggleRightPanel: () => void;
  setIsRightPanelOpen: (open: boolean) => void;
  navigate: (entry: NavigationHistoryEntry) => void;
  goBack: () => void;
  goForward: () => void;
  setActiveTab: (tab: 'home' | 'search' | 'library' | 'favorites' | 'playlist' | 'artist' | 'album' | 'section') => void;
  setActivePlaylistId: (id: string | null) => void;
  setSelectedSection: (sec: { title: string; query: string; provider: string } | null) => void;
  setActiveProviderFilter: (provider: string) => void;
  setActiveCategoryFilter: (cat: 'all' | 'music' | 'podcasts') => void;
  setSearchQuery: (query: string) => void;
  toggleLyrics: () => void;
  setIsLyricsOpen: (open: boolean) => void;
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
  deletePlaylist: (playlistId: string) => void;
  showToast: (message: string, type?: 'info' | 'error' | 'success') => void;
  dismissToast: (id: string) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setPlaybackError: (err: string | null) => void;
}

export const useSoundWaveStore = create<SoundWavePlayerStore>()(
  persist(
    (set, get) => ({
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
          coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
        },
        {
          id: 'pl-open-audio',
          name: 'Open Audio & Classic Radio',
          description: 'Internet Archive Public Domain Tracks',
          trackIds: [],
          coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300',
        },
        {
          id: 'pl-cc-lounge',
          name: 'Creative Commons Lounge',
          description: 'Commercial Free Relaxation & Study Beats',
          trackIds: [],
          coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
        },
      ],
      toasts: [],
      dynamicColor: '#2A2A2A',
      hoverGradientColor: null,
      setHoverGradientColor: (color) => set({ hoverGradientColor: color }),

      isLyricsOpen: false,
      isMobileSheetOpen: false,
      setIsMobileSheetOpen: (open) => set({ isMobileSheetOpen: open }),
      toggleMobileSheet: () => set((state) => ({ isMobileSheetOpen: !state.isMobileSheetOpen })),

      // 3-panel state
      isLeftRailExpanded: true,
      leftRailWidth: 300,
      isRightPanelOpen: true,
      activeTab: 'home',
      activePlaylistId: null,
      selectedSection: null,
      activeProviderFilter: 'all',
      activeCategoryFilter: 'all',
      searchQuery: '',

      history: [{ tab: 'home' }],
      historyIndex: 0,

      toggleLeftRail: () => set((state) => ({ isLeftRailExpanded: !state.isLeftRailExpanded })),
      setLeftRailWidth: (width) => set({ leftRailWidth: Math.max(220, Math.min(480, width)) }),
      toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),
      setIsRightPanelOpen: (open) => set({ isRightPanelOpen: open }),

      navigate: (entry) => {
        const { history, historyIndex } = get();
        const nextHistory = history.slice(0, historyIndex + 1);
        nextHistory.push(entry);
        set({
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
          activeTab: entry.tab,
          activePlaylistId: entry.meta?.playlistId || null,
          selectedSection: entry.meta?.section || null,
        });
      },

      goBack: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const nextIndex = historyIndex - 1;
          const entry = history[nextIndex];
          set({
            historyIndex: nextIndex,
            activeTab: entry.tab,
            activePlaylistId: entry.meta?.playlistId || null,
            selectedSection: entry.meta?.section || null,
          });
        }
      },

      goForward: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const nextIndex = historyIndex + 1;
          const entry = history[nextIndex];
          set({
            historyIndex: nextIndex,
            activeTab: entry.tab,
            activePlaylistId: entry.meta?.playlistId || null,
            selectedSection: entry.meta?.section || null,
          });
        }
      },

      setActiveTab: (tab) => {
        get().navigate({ tab });
      },

      setActivePlaylistId: (id) => {
        get().navigate({ tab: 'playlist', meta: { playlistId: id } });
      },

      setSelectedSection: (sec) => {
        get().navigate({ tab: 'section', meta: { section: sec } });
      },

      setActiveProviderFilter: (provider) => set({ activeProviderFilter: provider }),
      setActiveCategoryFilter: (cat) => set({ activeCategoryFilter: cat }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleLyrics: () => set((state) => ({ isLyricsOpen: !state.isLyricsOpen })),
      setIsLyricsOpen: (open) => set({ isLyricsOpen: open }),
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
        get().showToast(exists ? 'Removed from Liked Songs' : 'Saved to Liked Songs', 'success');
      },

      createPlaylist: (name, description = '') => {
        if (!name.trim()) return;
        const newPl: CustomPlaylist = {
          id: `pl-${Date.now()}`,
          name: name.trim(),
          description,
          trackIds: [],
          coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
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

      deletePlaylist: (playlistId) => {
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== playlistId),
          activeTab: state.activePlaylistId === playlistId ? 'home' : state.activeTab,
          activePlaylistId: state.activePlaylistId === playlistId ? null : state.activePlaylistId,
        }));
        get().showToast('Playlist deleted', 'info');
      },

      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setPlaybackError: (err) => set({ playbackError: err }),
    }),
    {
      name: 'soundwave-user-library-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        playlists: state.playlists,
        volume: state.volume,
        shuffle: state.shuffle,
        repeat: state.repeat,
        isLeftRailExpanded: state.isLeftRailExpanded,
        leftRailWidth: state.leftRailWidth,
        isRightPanelOpen: state.isRightPanelOpen,
      }),
    }
  )
);
