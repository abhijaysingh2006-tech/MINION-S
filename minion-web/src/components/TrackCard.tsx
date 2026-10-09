'use client';

import React from 'react';
import { Play, Pause, Heart, MoreHorizontal, Plus } from 'lucide-react';
import { UnifiedTrack } from '@/lib/musicProviders/types';
import { useSoundWaveStore } from '@/lib/soundwaveStore';
import { extractDominantColor } from '@/lib/colorExtractor';

interface TrackCardProps {
  track: UnifiedTrack;
  queueList?: UnifiedTrack[];
  isArtist?: boolean;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, queueList, isArtist = false }) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    favorites,
    toggleFavorite,
    setHoverGradientColor,
    showToast,
  } = useSoundWaveStore();

  const isCurrent = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const isFav = favorites.some((f) => f.id === track.id);

  const handleMouseEnter = async () => {
    const color = await extractDominantColor(track.coverArtwork);
    setHoverGradientColor(color);
  };

  const handleMouseLeave = () => {
    setHoverGradientColor(null);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queueList);
    }
  };

  const providerBadge = () => {
    switch (track.provider) {
      case 'jamendo':
        return <span className="bg-[#10B981]/20 text-[#34D399] text-[10px] font-bold px-1.5 py-0.5 rounded">Jamendo</span>;
      case 'deezer':
        return <span className="bg-[#EF4444]/20 text-[#F87171] text-[10px] font-bold px-1.5 py-0.5 rounded">Deezer</span>;
      case 'youtube':
        return <span className="bg-[#DC2626]/20 text-[#FCA5A5] text-[10px] font-bold px-1.5 py-0.5 rounded">YouTube</span>;
      case 'archive':
        return <span className="bg-[#6B7280]/30 text-[#D1D5DB] text-[10px] font-bold px-1.5 py-0.5 rounded">Archive</span>;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col p-3.5 bg-[#181818] hover:bg-[#282828] rounded-xl cursor-pointer transition-all duration-200 w-[184px] shrink-0 select-none shadow-lg"
    >
      {/* Cover Image Container */}
      <div className="relative w-full aspect-square mb-3.5 overflow-hidden bg-[#121212]">
        <img
          src={track.coverArtwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300'}
          alt={track.title}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isArtist ? 'rounded-full' : 'rounded-lg'
          }`}
          loading="lazy"
        />

        {/* Equalizer overlay when playing */}
        {isCurrentlyPlaying && (
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center ${
              isArtist ? 'rounded-full' : 'rounded-lg'
            }`}
          >
            <span className="w-4 h-4 flex items-end justify-between gap-[2px]">
              <span className="w-[3px] bg-[#FFD60A] h-full animate-pulse" />
              <span className="w-[3px] bg-[#FFD60A] h-2/3 animate-pulse delay-75" />
              <span className="w-[3px] bg-[#FFD60A] h-4/5 animate-pulse delay-150" />
            </span>
          </div>
        )}

        {/* Floating Play Button on Hover (Bottom Right with upward slide) */}
        <div className="absolute right-2 bottom-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 drop-shadow-xl z-10">
          <button
            onClick={handlePlayClick}
            aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
            className="w-11 h-11 rounded-full bg-white hover:bg-[#FFD60A] text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            {isCurrentlyPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black translate-x-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Track Info */}
      <div className="flex flex-col space-y-1">
        <h4
          className={`font-bold text-sm truncate ${
            isCurrent ? 'text-[#FFD60A]' : 'text-white group-hover:text-white'
          }`}
          title={track.title}
        >
          {track.title}
        </h4>
        <p className="text-xs text-[#B3B3B3] line-clamp-2 leading-relaxed">
          {isArtist ? 'Artist' : track.artist || 'Unknown Artist'}
        </p>
      </div>

      {/* Provider & Quick Like Row */}
      <div className="flex items-center justify-between pt-2.5 mt-auto">
        <div>{providerBadge()}</div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(track);
            showToast(
              isFav ? 'Removed from Liked Songs' : 'Added to Liked Songs',
              isFav ? 'info' : 'success'
            );
          }}
          aria-label={isFav ? 'Unlike' : 'Like'}
          className={`p-1 rounded-full transition-all ${
            isFav
              ? 'text-[#FFD60A]'
              : 'text-[#6A6A6A] hover:text-white opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-[#FFD60A]' : ''}`} />
        </button>
      </div>
    </div>
  );
};
