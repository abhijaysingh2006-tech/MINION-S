'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { UnifiedTrack } from '@/lib/musicProviders/types';
import { TrackCard } from './TrackCard';
import { useSoundWaveStore } from '@/lib/soundwaveStore';

interface ShelfSectionProps {
  title: string;
  subtitle?: string;
  tracks: UnifiedTrack[];
  isLoading?: boolean;
  isArtistShelf?: boolean;
  query?: string;
  provider?: string;
}

export const ShelfSection: React.FC<ShelfSectionProps> = ({
  title,
  subtitle,
  tracks,
  isLoading = false,
  isArtistShelf = false,
  query = '',
  provider = 'all',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const { setSelectedSection, setActiveTab } = useSoundWaveStore();

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 20);
    }
  };

  const scrollBy = (offset: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleShowAll = () => {
    setSelectedSection({
      title,
      query: query || title,
      provider,
    });
    setActiveTab('section');
  };

  if (!isLoading && tracks.length === 0) {
    return null;
  }

  return (
    <section className="relative group/shelf mb-8">
      {/* Shelf Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white hover:underline cursor-pointer" onClick={handleShowAll}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[#B3B3B3] mt-0.5">{subtitle}</p>
          )}
        </div>
        <button
          onClick={handleShowAll}
          className="text-xs font-bold text-[#B3B3B3] hover:text-white transition-colors tracking-wide hover:underline cursor-pointer"
        >
          Show all
        </button>
      </div>

      {/* Shelf Container with Hover Left/Right Arrows */}
      <div className="relative">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => scrollBy(-600)}
            aria-label="Scroll left"
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#181818]/95 hover:bg-[#282828] text-white flex items-center justify-center shadow-2xl border border-[#2D2D2D] opacity-0 group-hover/shelf:opacity-100 transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => scrollBy(600)}
            aria-label="Scroll right"
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#181818]/95 hover:bg-[#282828] text-white flex items-center justify-center shadow-2xl border border-[#2D2D2D] opacity-0 group-hover/shelf:opacity-100 transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Horizontal Track List / Skeletons */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex items-stretch gap-4 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
        >
          {isLoading ? (
            // Skeleton loaders for cards
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-[184px] shrink-0 p-3.5 bg-[#181818] rounded-xl animate-pulse space-y-3"
              >
                <div className="w-full aspect-square bg-[#242424] rounded-lg" />
                <div className="h-4 bg-[#282828] rounded w-3/4" />
                <div className="h-3 bg-[#242424] rounded w-1/2" />
              </div>
            ))
          ) : (
            tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                queueList={tracks}
                isArtist={isArtistShelf}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};
