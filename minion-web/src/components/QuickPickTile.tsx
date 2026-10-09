'use client';

import React from 'react';
import { Play, Pause } from 'lucide-react';
import { UnifiedTrack } from '@/lib/musicProviders/types';
import { useSoundWaveStore } from '@/lib/soundwaveStore';
import { extractDominantColor } from '@/lib/colorExtractor';

interface QuickPickTileProps {
  track: UnifiedTrack;
  queueList?: UnifiedTrack[];
}

export const QuickPickTile: React.FC<QuickPickTileProps> = ({ track, queueList }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, setHoverGradientColor } =
    useSoundWaveStore();

  const isCurrent = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;

  const handleMouseEnter = async () => {
    const color = await extractDominantColor(track.coverArtwork);
    setHoverGradientColor(color);
  };

  const handleMouseLeave = () => {
    setHoverGradientColor(null);
  };

  const handleClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queueList);
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex items-center h-14 bg-[#232323] hover:bg-[#2F2F2F] rounded-md overflow-hidden cursor-pointer transition-all duration-200 shadow-md ${
        isCurrent ? 'ring-1 ring-[#FFD60A]/60' : ''
      }`}
    >
      {/* 56px Square Cover Art */}
      <div className="w-14 h-14 shrink-0 relative bg-[#181818]">
        <img
          src={track.coverArtwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120'}
          alt={track.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {isCurrentlyPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="w-3 h-3 flex items-end justify-between gap-[1px]">
              <span className="w-[2px] bg-[#FFD60A] h-full animate-pulse" />
              <span className="w-[2px] bg-[#FFD60A] h-2/3 animate-pulse delay-75" />
              <span className="w-[2px] bg-[#FFD60A] h-4/5 animate-pulse delay-150" />
            </span>
          </div>
        )}
      </div>

      {/* Track Title */}
      <div className="flex-1 px-3 min-w-0 flex flex-col justify-center">
        <span
          className={`font-bold text-sm truncate ${
            isCurrent ? 'text-[#FFD60A]' : 'text-white'
          }`}
        >
          {track.title}
        </span>
        <span className="text-xs text-[#B3B3B3] truncate">{track.artist}</span>
      </div>

      {/* Hover Slide-in Play Button (White circle, black icon) */}
      <div className="pr-3 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
          className="w-10 h-10 rounded-full bg-white hover:bg-[#FFD60A] text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-5 h-5 fill-black" />
          ) : (
            <Play className="w-5 h-5 fill-black translate-x-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
