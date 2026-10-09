'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Share2,
  MoreHorizontal,
  Maximize2,
  Mic2,
  UserPlus,
  UserCheck,
  ListMusic,
  ExternalLink,
  Plus,
  Play,
  Check,
  Music,
} from 'lucide-react';
import { useSoundWaveStore } from '@/lib/soundwaveStore';
import { extractDominantColor, DEFAULT_GRADIENT_COLOR } from '@/lib/colorExtractor';

export const NowPlayingPanel: React.FC = () => {
  const {
    currentTrack,
    queue,
    queueIndex,
    isPlaying,
    currentTime,
    isRightPanelOpen,
    setIsRightPanelOpen,
    toggleRightPanel,
    toggleLyrics,
    favorites,
    toggleFavorite,
    playlists,
    addTrackToPlaylist,
    playTrack,
    showToast,
  } = useSoundWaveStore();

  const [cardBgColor, setCardBgColor] = useState(DEFAULT_GRADIENT_COLOR);
  const [lyricsData, setLyricsData] = useState<{
    lyrics: string;
    syncedLyrics?: Array<{ time: number; text: string }>;
    isLoading: boolean;
  }>({
    lyrics: '',
    isLoading: false,
  });
  const [isFollowed, setIsFollowed] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const nextTrack = queue[queueIndex + 1] || null;
  const isFav = currentTrack ? favorites.some((f) => f.id === currentTrack.id) : false;

  // Extract color for the lyrics card background when track changes
  useEffect(() => {
    if (currentTrack?.coverArtwork) {
      extractDominantColor(currentTrack.coverArtwork).then((color) => {
        setCardBgColor(color);
      });
    }
  }, [currentTrack]);

  // Fetch lyrics preview when track changes
  useEffect(() => {
    if (!currentTrack) {
      setLyricsData({ lyrics: '', isLoading: false });
      return;
    }

    let isMounted = true;
    setLyricsData({ lyrics: '', isLoading: true });

    const fetchLyrics = async () => {
      try {
        const cleanTitle = currentTrack.title
          .replace(/\(.*?\)/g, '')
          .replace(/\[.*?\]/g, '')
          .trim();
        const cleanArtist = currentTrack.artist
          .replace(/feat\..*$/i, '')
          .trim();

        const res = await fetch(
          `/api/lyrics?track=${encodeURIComponent(cleanTitle)}&artist=${encodeURIComponent(
            cleanArtist
          )}&duration=${currentTrack.duration}`
        );
        const data = await res.json();

        if (isMounted) {
          setLyricsData({
            lyrics: data.lyrics || '',
            syncedLyrics: data.syncedLyrics || [],
            isLoading: false,
          });
        }
      } catch (err) {
        if (isMounted) {
          setLyricsData({ lyrics: '', isLoading: false });
        }
      }
    };

    fetchLyrics();
    return () => {
      isMounted = false;
    };
  }, [currentTrack]);

  // Compute active 2-3 lines of lyrics for the preview card
  const getPreviewLyricsLines = () => {
    if (lyricsData.isLoading) {
      return ['Loading lyrics preview...', '', ''];
    }
    if (lyricsData.syncedLyrics && lyricsData.syncedLyrics.length > 0) {
      const activeIdx = lyricsData.syncedLyrics.findIndex(
        (line, idx) =>
          currentTime >= line.time &&
          (idx === lyricsData.syncedLyrics!.length - 1 ||
            currentTime < lyricsData.syncedLyrics![idx + 1].time)
      );

      const start = Math.max(0, activeIdx === -1 ? 0 : activeIdx);
      const slice = lyricsData.syncedLyrics.slice(start, start + 3).map((l) => l.text);
      return slice.length > 0 ? slice : ['...', '...', '...'];
    }

    if (lyricsData.lyrics) {
      const lines = lyricsData.lyrics
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      return lines.slice(0, 3);
    }

    return ['Lyrics not available for this track'];
  };

  // If panel is closed or on screens < 1200px (hidden via Tailwind xl:flex)
  if (!isRightPanelOpen) {
    return null;
  }

  if (!currentTrack) {
    return (
      <aside className="hidden xl:flex w-[360px] shrink-0 bg-[#121212] rounded-xl flex-col items-center justify-center p-6 text-center text-[#B3B3B3] select-none shadow-2xl border border-[#1A1A1A]">
        <div className="w-16 h-16 rounded-full bg-[#181818] flex items-center justify-center mb-4 text-[#6A6A6A]">
          <Music className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Now Playing</h3>
        <p className="text-xs text-[#6A6A6A]">Play a song to view artwork, lyrics, and artist details</p>
      </aside>
    );
  }

  const previewLines = getPreviewLyricsLines();

  return (
    <aside className="hidden xl:flex w-[360px] shrink-0 bg-[#121212] rounded-xl flex-col min-h-0 overflow-y-auto p-4 select-none border border-[#1A1A1A] shadow-2xl relative space-y-5">
      {/* 1. PANEL HEADER */}
      <header className="flex items-center justify-between sticky top-0 bg-[#121212]/95 backdrop-blur-md z-20 pb-2 border-b border-[#1E1E1E]">
        <span className="font-bold text-sm text-white truncate max-w-[200px]" title={currentTrack.title}>
          {currentTrack.title}
        </span>
        <div className="flex items-center gap-1">
          {/* Options Menu */}
          <div className="relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              aria-label="Track options"
              className="p-1.5 rounded-full text-[#B3B3B3] hover:text-white hover:bg-[#1E1E1E] transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showOptionsMenu && (
              <div className="absolute right-0 top-8 w-48 bg-[#232323] border border-[#333333] rounded-lg shadow-2xl py-1 z-30 text-xs">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentTrack.trackPageUrl || window.location.href);
                    showToast('Link copied to clipboard', 'success');
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#2F2F2F] flex items-center gap-2 text-white"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#B3B3B3]" /> Copy Track Link
                </button>
                <button
                  onClick={() => {
                    toggleLyrics();
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#2F2F2F] flex items-center gap-2 text-white"
                >
                  <Mic2 className="w-3.5 h-3.5 text-[#B3B3B3]" /> Fullscreen Lyrics
                </button>
              </div>
            )}
          </div>

          {/* Close / Toggle Button */}
          <button
            onClick={toggleRightPanel}
            aria-label="Close panel"
            className="p-1.5 rounded-full text-[#B3B3B3] hover:text-white hover:bg-[#1E1E1E] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. LARGE SQUARE COVER ART (Full width, 12px radius) */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#181818] shadow-2xl group">
        <img
          src={
            currentTrack.coverArtwork ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600'
          }
          alt={currentTrack.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Source Badge overlay */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white border border-white/10">
          {currentTrack.provider.toUpperCase()}
          {currentTrack.provider === 'deezer' && ' • PREVIEW'}
        </div>

        {/* Expand button on hover */}
        <button
          onClick={toggleLyrics}
          aria-label="Full screen lyrics"
          className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 hover:bg-[#FFD60A] text-white hover:text-black opacity-0 group-hover:opacity-100 transition-all shadow-xl"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* 3. TRACK TITLE & ACTIONS */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight line-clamp-2">
              {currentTrack.title}
            </h2>
            <p className="text-sm font-semibold text-[#B3B3B3] hover:text-white transition-colors cursor-pointer truncate mt-1">
              {currentTrack.artist}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pt-1">
            {/* Heart / Like button */}
            <button
              onClick={() => {
                toggleFavorite(currentTrack);
                showToast(
                  isFav ? 'Removed from Liked Songs' : 'Saved to Liked Songs',
                  isFav ? 'info' : 'success'
                );
              }}
              aria-label={isFav ? 'Unlike' : 'Like'}
              className="p-2 rounded-full hover:bg-[#1E1E1E] transition-all"
            >
              <Heart
                className={`w-5 h-5 transition-all ${
                  isFav
                    ? 'fill-[#FFD60A] text-[#FFD60A] scale-110'
                    : 'text-[#B3B3B3] hover:text-white'
                }`}
              />
            </button>

            {/* Add to Playlist button */}
            <div className="relative">
              <button
                onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                aria-label="Add to playlist"
                className="p-2 rounded-full text-[#B3B3B3] hover:text-white hover:bg-[#1E1E1E] transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>

              {showPlaylistMenu && (
                <div className="absolute right-0 bottom-10 w-48 bg-[#232323] border border-[#333333] rounded-lg shadow-2xl py-2 z-30 text-xs">
                  <div className="px-3 pb-1 text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                    Add to Playlist
                  </div>
                  {playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => {
                        addTrackToPlaylist(pl.id, currentTrack.id);
                        setShowPlaylistMenu(false);
                      }}
                      className="w-full px-3 py-1.5 text-left hover:bg-[#2F2F2F] text-white truncate flex items-center justify-between"
                    >
                      <span>{pl.name}</span>
                      {pl.trackIds.includes(currentTrack.id) && (
                        <Check className="w-3.5 h-3.5 text-[#FFD60A]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. LYRICS PREVIEW CARD (Dominant cover color background, 2-3 big bold lines) */}
      <div
        style={{
          backgroundColor: cardBgColor || '#1E2430',
        }}
        className="relative rounded-xl p-4 transition-colors duration-500 overflow-hidden shadow-lg border border-white/5 space-y-2 group"
      >
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/90">
          <span className="flex items-center gap-1.5">
            <Mic2 className="w-4 h-4 text-[#FFD60A]" /> Lyrics Preview
          </span>
          <button
            onClick={toggleLyrics}
            className="text-xs font-bold text-white hover:underline cursor-pointer flex items-center gap-1"
          >
            Show more
          </button>
        </div>

        <div className="space-y-1.5 pt-2">
          {previewLines.map((line, idx) => (
            <p
              key={idx}
              className={`font-black text-base md:text-lg tracking-tight leading-snug line-clamp-1 transition-opacity ${
                idx === 0 ? 'text-white opacity-100' : 'text-white/70'
              }`}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* 5. ABOUT THE ARTIST CARD */}
      <div className="rounded-xl bg-[#181818] p-4 border border-[#232323] space-y-3 shadow-md">
        <div className="flex items-center gap-3">
          <img
            src={
              currentTrack.coverArtwork ||
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150'
            }
            alt={currentTrack.artist}
            className="w-12 h-12 rounded-full object-cover border border-[#333333]"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-white truncate">{currentTrack.artist}</h4>
            <span className="text-[11px] text-[#B3B3B3]">Verified Artist • SoundWave</span>
          </div>
          <button
            onClick={() => {
              setIsFollowed(!isFollowed);
              showToast(isFollowed ? `Unfollowed ${currentTrack.artist}` : `Followed ${currentTrack.artist}`, 'info');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              isFollowed
                ? 'bg-transparent text-[#FFD60A] border border-[#FFD60A]'
                : 'bg-white text-black hover:scale-105'
            }`}
          >
            {isFollowed ? 'Following' : 'Follow'}
          </button>
        </div>
        <p className="text-xs text-[#B3B3B3] line-clamp-3 leading-relaxed">
          Streaming authentic high fidelity tracks across {currentTrack.provider.toUpperCase()} and global digital archives.
        </p>
      </div>

      {/* 6. NEXT IN QUEUE CARD */}
      <div className="rounded-xl bg-[#181818] p-4 border border-[#232323] space-y-2.5 shadow-md">
        <div className="flex items-center justify-between text-xs font-bold text-[#B3B3B3]">
          <span className="flex items-center gap-1.5 text-white">
            <ListMusic className="w-3.5 h-3.5 text-[#FFD60A]" /> Next in queue
          </span>
          <span className="text-[11px] font-normal">{queue.length} in queue</span>
        </div>

        {nextTrack ? (
          <div
            onClick={() => playTrack(nextTrack, queue)}
            className="group/next flex items-center gap-3 p-2 rounded-lg bg-[#202020] hover:bg-[#282828] cursor-pointer transition-all"
          >
            <img
              src={nextTrack.coverArtwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'}
              alt={nextTrack.title}
              className="w-10 h-10 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs text-white truncate group-hover/next:text-[#FFD60A] transition-colors">
                {nextTrack.title}
              </p>
              <p className="text-[11px] text-[#B3B3B3] truncate">{nextTrack.artist}</p>
            </div>
            <Play className="w-4 h-4 text-white opacity-0 group-hover/next:opacity-100 transition-opacity shrink-0" />
          </div>
        ) : (
          <p className="text-xs text-[#6A6A6A] py-1">No more tracks queued up</p>
        )}
      </div>
    </aside>
  );
};
