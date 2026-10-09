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
  Maximize2,
  ListMusic,
  Tv,
} from 'lucide-react';
import { usePlayerStore } from '@/lib/playerStore';

export const SpotifyPlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    shuffle,
    repeat,
    likedTrackIds,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
  } = usePlayerStore();

  const isLiked = currentTrack ? likedTrackIds.has(currentTrack.id) : false;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="h-20 bg-[#000000] border-t border-[#121212] px-4 flex items-center justify-between select-none z-50">
      {/* Left: Track Details */}
      <div className="flex items-center gap-3.5 w-[30%] min-w-[180px]">
        {currentTrack ? (
          <>
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-14 h-14 rounded object-cover shadow"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-[#b3b3b3] truncate hover:underline hover:text-white cursor-pointer mt-0.5">
                {currentTrack.artistName}
              </p>
            </div>
            <button
              onClick={() => toggleLike(currentTrack)}
              className={`p-1 hover:scale-105 transition-transform ${
                isLiked ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              aria-label="Save to your Liked Songs"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </>
        ) : (
          <div className="text-xs text-[#6a6a6a]">No track selected. Click any YouTube song to play.</div>
        )}
      </div>

      {/* Center: Controls + Spotify Scrubber */}
      <div className="flex flex-col items-center gap-2 max-w-xl w-[40%]">
        <div className="flex items-center gap-5">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${
              shuffle ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
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
            className="w-8 h-8 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center transition-transform"
          >
            {isPlaying ? (
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
              repeat !== 'off' ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrubber Bar */}
        <div className="w-full flex items-center gap-2 text-[11px] text-[#a7a7a7] font-mono">
          <span>{formatTime(currentTime)}</span>
          <div className="relative flex-1 group flex items-center cursor-pointer">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-white group-hover:accent-[#1db954]"
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Sound & Devices */}
      <div className="flex items-center justify-end gap-3 w-[30%] min-w-[180px] text-[#b3b3b3]">
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#242424] text-[#1db954]">
          YouTube Stream
        </span>

        <button
          onClick={toggleMute}
          className="hover:text-white transition-colors ml-2"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : volume < 50 ? (
            <Volume1 className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        <input
          type="range"
          min={0}
          max={100}
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-24 h-1 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-white hover:accent-[#1db954]"
        />
      </div>
    </footer>
  );
};
