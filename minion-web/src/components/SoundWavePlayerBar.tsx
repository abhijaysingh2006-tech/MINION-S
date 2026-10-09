'use client';

import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useSoundWaveStore } from '@/lib/soundwaveStore';

export const SoundWavePlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    playbackError,
    volume,
    isMuted,
    currentTime,
    duration,
    shuffle,
    repeat,
    favorites,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
  } = useSoundWaveStore();

  const isFavorited = currentTrack
    ? favorites.some((f) => f.id === currentTrack.id)
    : false;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const providerBadge = (provider: string) => {
    switch (provider) {
      case 'jamendo':
        return { label: 'Jamendo (Full Audio)', bg: 'bg-pink-500/20 text-pink-400 border-pink-500/30' };
      case 'deezer':
        return { label: 'Deezer (30s HQ Preview)', bg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' };
      case 'youtube':
        return { label: 'YouTube (Official Player)', bg: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'archive':
        return { label: 'Archive.org (Public Domain)', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      default:
        return { label: 'SoundWave Stream', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
  };

  return (
    <footer className="h-24 bg-[#000000] border-t border-[#181818] px-4 md:px-6 flex items-center justify-between select-none z-50">
      {/* Left: Track Information */}
      <div className="flex items-center gap-3.5 w-[30%] min-w-[200px]">
        {currentTrack ? (
          <>
            <img
              src={currentTrack.coverArtwork}
              alt={currentTrack.title}
              className="w-14 h-14 rounded-md object-cover shadow-lg border border-white/5"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-[#b3b3b3] truncate hover:text-white cursor-pointer mt-0.5">
                {currentTrack.artist}
              </p>
              {currentTrack.previewNotice && (
                <span className="text-[10px] text-[#1ed760] font-semibold block truncate">
                  {currentTrack.previewNotice}
                </span>
              )}
            </div>
            <button
              onClick={() => toggleFavorite(currentTrack)}
              className={`p-1.5 transition-transform hover:scale-110 ${
                isFavorited ? 'text-[#1ed760]' : 'text-[#727272] hover:text-white'
              }`}
              aria-label="Add to Favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </>
        ) : (
          <div className="text-xs text-[#6a6a6a]">Select any track from the feed to start listening.</div>
        )}
      </div>

      {/* Center: Controls, Scrubber & Status */}
      <div className="flex flex-col items-center gap-2 max-w-xl w-[40%]">
        <div className="flex items-center gap-5">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${
              shuffle ? 'text-[#1ed760]' : 'text-[#727272] hover:text-white'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevTrack}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-9 h-9 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center transition-transform shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-current text-black" />
            ) : (
              <Play className="w-4 h-4 fill-current text-black translate-x-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`transition-colors ${
              repeat !== 'off' ? 'text-[#1ed760]' : 'text-[#727272] hover:text-white'
            }`}
          >
            {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrubber Bar */}
        <div className="w-full flex items-center gap-2.5 text-xs text-[#a7a7a7] font-mono">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 bg-[#3e3e3e] hover:bg-[#5e5e5e] rounded-full appearance-none cursor-pointer accent-[#1ed760]"
          />
          <span>{formatTime(duration)}</span>
        </div>

        {/* Error message or provider alert if any */}
        {playbackError && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{playbackError}</span>
          </div>
        )}
      </div>

      {/* Right: Sound & Provider Badge */}
      <div className="flex items-center justify-end gap-3 w-[30%] min-w-[200px]">
        {currentTrack && (
          <div className={`hidden lg:flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${providerBadge(currentTrack.provider).bg}`}>
            <span>{providerBadge(currentTrack.provider).label}</span>
            {currentTrack.trackPageUrl && (
              <a
                href={currentTrack.trackPageUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline opacity-80"
              >
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        )}

        <button
          onClick={toggleMute}
          className="text-[#b3b3b3] hover:text-white transition-colors"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : volume < 0.5 ? (
            <Volume1 className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-24 h-1 bg-[#3e3e3e] rounded-full appearance-none cursor-pointer accent-white hover:accent-[#1ed760]"
        />
      </div>
    </footer>
  );
};
