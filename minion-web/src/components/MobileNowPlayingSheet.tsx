'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Heart,
  MoreHorizontal,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Mic2,
  Volume2,
  VolumeX,
  Share2,
} from 'lucide-react';
import { useSoundWaveStore } from '@/lib/soundwaveStore';
import { extractDominantColor, DEFAULT_GRADIENT_COLOR } from '@/lib/colorExtractor';

export const MobileNowPlayingSheet: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    shuffle,
    repeat,
    volume,
    isMuted,
    favorites,
    isMobileSheetOpen,
    setIsMobileSheetOpen,
    togglePlay,
    seek,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    toggleMute,
    setVolume,
    toggleLyrics,
    showToast,
  } = useSoundWaveStore();

  const [ambientColor, setAmbientColor] = useState(DEFAULT_GRADIENT_COLOR);

  useEffect(() => {
    if (currentTrack?.coverArtwork) {
      extractDominantColor(currentTrack.coverArtwork).then((color) => {
        setAmbientColor(color);
      });
    }
  }, [currentTrack]);

  if (!isMobileSheetOpen || !currentTrack) return null;

  const isFav = favorites.some((f) => f.id === currentTrack.id);
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="md:hidden fixed inset-0 z-50 flex flex-col justify-between p-6 select-none overflow-y-auto"
      style={{
        background: `linear-gradient(180deg, ${ambientColor} 0%, #121212 60%, #000000 100%)`,
      }}
    >
      {/* 1. TOP HEADER */}
      <header className="flex items-center justify-between pt-2">
        <button
          onClick={() => setIsMobileSheetOpen(false)}
          className="p-2 text-white/80 hover:text-white"
        >
          <ChevronDown className="w-7 h-7" />
        </button>

        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
            Playing from
          </span>
          <p className="text-xs font-bold text-white truncate max-w-[200px]">
            {currentTrack.provider.toUpperCase()} Catalog
          </p>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(currentTrack.trackPageUrl || window.location.href);
            showToast('Track link copied', 'success');
          }}
          className="p-2 text-white/80 hover:text-white"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      {/* 2. LARGE COVER ARTWORK */}
      <div className="my-6 px-4 flex justify-center">
        <div className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-2xl bg-[#181818]">
          <img
            src={
              currentTrack.coverArtwork ||
              'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600'
            }
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 3. TRACK TITLE & LIKE */}
      <div className="flex items-center justify-between px-2 mb-4">
        <div className="min-w-0 flex-1 pr-3">
          <h2 className="text-xl font-black text-white truncate">{currentTrack.title}</h2>
          <p className="text-sm font-semibold text-[#B3B3B3] truncate mt-0.5">
            {currentTrack.artist}
          </p>
        </div>
        <button
          onClick={() => toggleFavorite(currentTrack)}
          className="p-2 shrink-0"
        >
          <Heart
            className={`w-6 h-6 transition-all ${
              isFav ? 'fill-[#FFD60A] text-[#FFD60A]' : 'text-white/70 hover:text-white'
            }`}
          />
        </button>
      </div>

      {/* 4. PROGRESS BAR */}
      <div className="space-y-1 px-2 mb-4">
        <div className="relative h-1.5 bg-white/20 rounded-full cursor-pointer flex items-center">
          <div
            className="h-full bg-[#FFD60A] rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg" />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-white/60">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 5. PLAYBACK CONTROLS */}
      <div className="flex items-center justify-between px-4 mb-6">
        <button
          onClick={toggleShuffle}
          className={`p-2 transition-colors ${
            shuffle ? 'text-[#FFD60A]' : 'text-white/60 hover:text-white'
          }`}
        >
          <Shuffle className="w-5 h-5" />
        </button>

        <button
          onClick={prevTrack}
          className="p-2 text-white hover:scale-110 active:scale-95 transition-all"
        >
          <SkipBack className="w-7 h-7 fill-current" />
        </button>

        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl active:scale-95 transition-all"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 fill-black" />
          ) : (
            <Play className="w-7 h-7 fill-black translate-x-0.5" />
          )}
        </button>

        <button
          onClick={nextTrack}
          className="p-2 text-white hover:scale-110 active:scale-95 transition-all"
        >
          <SkipForward className="w-7 h-7 fill-current" />
        </button>

        <button
          onClick={toggleRepeat}
          className={`p-2 transition-colors ${
            repeat !== 'off' ? 'text-[#FFD60A]' : 'text-white/60 hover:text-white'
          }`}
        >
          {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
        </button>
      </div>

      {/* 6. LYRICS QUICK BUTTON */}
      <div className="flex items-center justify-between px-4 pt-2">
        <button
          onClick={() => {
            setIsMobileSheetOpen(false);
            toggleLyrics();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
        >
          <Mic2 className="w-4 h-4 text-[#FFD60A]" />
          <span>Full Lyrics</span>
        </button>
      </div>
    </div>
  );
};
