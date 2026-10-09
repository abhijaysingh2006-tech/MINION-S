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

  const getProviderTag = (provider: string) => {
    switch (provider) {
      case 'jamendo':
        return { label: 'Jamendo (Full HQ)', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40' };
      case 'deezer':
        return { label: 'Deezer (30s Preview)', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'youtube':
        return { label: 'YouTube Player', badge: 'bg-red-500/20 text-red-300 border-red-500/40' };
      case 'archive':
        return { label: 'Archive.org Open Audio', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      default:
        return { label: 'SoundWave Stream', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    }
  };

  return (
    <footer className="h-20 bg-[#121318] border-t border-[#24252B] px-4 md:px-8 flex items-center justify-between select-none z-50 shrink-0">
      {/* Left: Track Information */}
      <div className="flex items-center gap-3.5 w-[30%] min-w-[200px]">
        {currentTrack ? (
          <>
            <img
              src={currentTrack.coverArtwork}
              alt={currentTrack.title}
              className="w-13 h-13 rounded-xl object-cover shadow-lg border border-white/10"
              style={{ width: '52px', height: '52px' }}
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate hover:text-[#FFD60A] cursor-pointer">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-[#94A3B8] truncate hover:text-white cursor-pointer mt-0.5">
                {currentTrack.artist}
              </p>
              {currentTrack.previewNotice && (
                <span className="text-[10px] text-[#FFD60A] font-semibold block truncate">
                  {currentTrack.previewNotice}
                </span>
              )}
            </div>
            <button
              onClick={() => toggleFavorite(currentTrack)}
              className={`p-1.5 rounded-full hover:bg-white/5 transition-transform hover:scale-110 ${
                isFavorited ? 'text-[#FFD60A]' : 'text-[#64748B] hover:text-white'
              }`}
              aria-label="Toggle Favorite"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </>
        ) : (
          <div className="text-xs text-[#64748B]">Click any song from the catalog to play.</div>
        )}
      </div>

      {/* Center: Controls & Scrubber */}
      <div className="flex flex-col items-center gap-1.5 max-w-xl w-[40%]">
        <div className="flex items-center gap-5">
          <button
            onClick={toggleShuffle}
            className={`p-1 transition-colors ${
              shuffle ? 'text-[#FFD60A]' : 'text-[#94A3B8] hover:text-white'
            }`}
            title="Toggle Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevTrack}
            className="p-1 text-[#94A3B8] hover:text-white transition-colors"
            title="Previous Track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-9 h-9 rounded-full bg-[#FFD60A] hover:bg-[#FFE033] active:scale-95 text-black flex items-center justify-center transition-all shadow-md shadow-[#FFD60A]/20"
            title={isPlaying ? 'Pause' : 'Play'}
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
            className="p-1 text-[#94A3B8] hover:text-white transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-1 transition-colors ${
              repeat !== 'off' ? 'text-[#FFD60A]' : 'text-[#94A3B8] hover:text-white'
            }`}
            title="Toggle Repeat"
          >
            {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrubber Timeline */}
        <div className="w-full flex items-center gap-2.5 text-xs text-[#94A3B8] font-mono">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 bg-[#24252B] hover:bg-[#32343D] rounded-full appearance-none cursor-pointer accent-[#FFD60A]"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume & Provider Badge */}
      <div className="flex items-center justify-end gap-3.5 w-[30%] min-w-[200px]">
        {currentTrack && (
          <div className={`hidden lg:flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getProviderTag(currentTrack.provider).badge}`}>
            <span>{getProviderTag(currentTrack.provider).label}</span>
            {currentTrack.trackPageUrl && (
              <a
                href={currentTrack.trackPageUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline opacity-80"
                title="View on provider site"
              >
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-[#94A3B8] hover:text-white transition-colors p-1"
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
            className="w-20 md:w-24 h-1 bg-[#24252B] rounded-full appearance-none cursor-pointer accent-[#FFD60A]"
          />
        </div>
      </div>
    </footer>
  );
};
