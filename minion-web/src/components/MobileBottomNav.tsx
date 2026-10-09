'use client';

import React from 'react';
import { Home, Search, Library, Play, Pause, Heart } from 'lucide-react';
import { useSoundWaveStore } from '@/lib/soundwaveStore';

export const MobileBottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentTrack,
    isPlaying,
    togglePlay,
    favorites,
    toggleFavorite,
    setIsMobileSheetOpen,
    duration,
    currentTime,
  } = useSoundWaveStore();

  const isFav = currentTrack ? favorites.some((f) => f.id === currentTrack.id) : false;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="md:hidden flex flex-col z-50 fixed bottom-0 left-0 right-0 select-none">
      {/* 1. COMPACT MINI-PLAYER ABOVE TAB BAR */}
      {currentTrack && (
        <div
          onClick={() => setIsMobileSheetOpen(true)}
          className="mx-2 mb-1.5 p-2 bg-[#1E1E1E]/95 backdrop-blur-lg rounded-xl flex items-center justify-between border border-[#333333] shadow-2xl cursor-pointer"
        >
          {/* Cover & Title */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <img
              src={
                currentTrack.coverArtwork ||
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'
              }
              alt={currentTrack.title}
              className="w-10 h-10 rounded-lg object-cover bg-[#121212] shrink-0"
            />
            <div className="min-w-0 flex-1 truncate">
              <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
              <p className="text-[10px] text-[#B3B3B3] truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Actions: Heart & Play */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(currentTrack);
              }}
              className="p-2 text-[#B3B3B3] hover:text-white"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-[#FFD60A] text-[#FFD60A]' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black translate-x-0.5" />
              )}
            </button>
          </div>

          {/* Micro Progress Bar on Bottom of Mini-player */}
          <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFD60A] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* 2. BOTTOM 3-TAB BAR (Home, Search, Library) */}
      <nav className="h-16 bg-[#000000]/95 backdrop-blur-md border-t border-[#1F1F1F] flex items-center justify-around px-4">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'home' ? 'text-[#FFD60A]' : 'text-[#888888] hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'search' ? 'text-[#FFD60A]' : 'text-[#888888] hover:text-white'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-bold">Search</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'library' || activeTab === 'favorites' || activeTab === 'playlist'
              ? 'text-[#FFD60A]'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          <Library className="w-5 h-5" />
          <span className="text-[10px] font-bold">Your Library</span>
        </button>
      </nav>
    </div>
  );
};
