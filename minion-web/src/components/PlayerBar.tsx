'use client';

import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Maximize2,
  ListMusic,
  FileText,
} from 'lucide-react';
import { usePlayerStore } from '@/lib/playerStore';

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    shuffle,
    repeat,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    toggleFullScreenNowPlaying,
    toggleLyrics,
    isLyricsOpen,
  } = usePlayerStore();

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  if (!currentTrack) return null;

  return (
    <footer className="h-24 bg-[#14151B] border-t border-[#20222A] px-5 flex items-center justify-between select-none z-50">
      {/* Left: Track Info */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[200px]">
        <img
          src={currentTrack.coverUrl}
          alt={currentTrack.title}
          className="w-14 h-14 rounded-lg object-cover shadow-md border border-white/5"
        />
        <div className="overflow-hidden">
          <h4 className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
            {currentTrack.title}
          </h4>
          <p className="text-xs text-minion-textMuted truncate hover:text-white cursor-pointer">
            {currentTrack.artistName}
          </p>
        </div>
        <button
          onClick={() => toggleLike(currentTrack.id)}
          className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${
            currentTrack.isLiked ? 'text-minion-yellow' : 'text-minion-textMuted hover:text-white'
          }`}
          aria-label="Like Track"
        >
          <Heart className={`w-4 h-4 ${currentTrack.isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Center: Controls & Scrubber */}
      <div className="flex flex-col items-center gap-2 max-w-xl w-2/4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full transition-colors ${
              shuffle ? 'text-minion-yellow' : 'text-minion-textMuted hover:text-white'
            }`}
            aria-label="Toggle Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevTrack}
            className="p-1.5 text-minion-textMuted hover:text-white transition-colors"
            aria-label="Previous Track"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-minion-yellow hover:bg-minion-yellowHover text-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-minion-yellow/20"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current text-black" />
            ) : (
              <Play className="w-5 h-5 fill-current text-black translate-x-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 text-minion-textMuted hover:text-white transition-colors"
            aria-label="Next Track"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-1.5 rounded-full transition-colors ${
              repeat !== 'off' ? 'text-minion-yellow' : 'text-minion-textMuted hover:text-white'
            }`}
            aria-label="Toggle Repeat"
          >
            {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2.5 text-xs text-minion-textMuted font-mono">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 bg-[#2C2E38] rounded-lg appearance-none cursor-pointer accent-minion-yellow"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Extra Controls & Volume */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
        <button
          onClick={toggleLyrics}
          className={`p-2 rounded-lg transition-colors ${
            isLyricsOpen
              ? 'bg-minion-yellow/20 text-minion-yellow'
              : 'text-minion-textMuted hover:text-white hover:bg-white/5'
          }`}
          title="Synced Lyrics"
          aria-label="Lyrics"
        >
          <FileText className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullScreenNowPlaying}
          className="p-2 rounded-lg text-minion-textMuted hover:text-white hover:bg-white/5 transition-colors"
          title="Full-screen player"
          aria-label="Full-screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={toggleMute}
            className="text-minion-textMuted hover:text-white transition-colors"
            aria-label="Volume Mute"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
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
            className="w-20 h-1 bg-[#2C2E38] rounded-lg appearance-none cursor-pointer accent-minion-yellow"
          />
        </div>
      </div>
    </footer>
  );
};
