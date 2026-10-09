'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Search,
  Clock,
  Heart,
  TrendingUp,
  Radio,
  Flame,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useSoundWaveStore } from '@/lib/soundwaveStore';
import { UnifiedTrack, MusicProvider } from '@/lib/musicProviders/types';

interface SoundWaveMainViewProps {
  currentTab: string;
  providerFilter?: string;
}

export const SoundWaveMainView: React.FC<SoundWaveMainViewProps> = ({ currentTab, providerFilter }) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleFavorite,
    favorites,
  } = useSoundWaveStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<UnifiedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [providerStatus, setProviderStatus] = useState<any>({});
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

  const fetchTracks = async (q: string, provider?: string) => {
    setIsLoading(true);
    try {
      const pParam = provider && provider !== 'all' ? `&provider=${provider}` : '';
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(q || 'top billboard hits')}${pParam}`);
      const data = await res.json();
      if (data.tracks) {
        setTracks(data.tracks);
        setProviderStatus(data.providerStatus || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks(searchQuery, providerFilter);
  }, [providerFilter]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => {
      fetchTracks(val, providerFilter);
    }, 450);
    setSearchTimer(timer);
  };

  const displayedTracks = currentTab === 'favorites' ? favorites : tracks;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1e3264]/40 via-[#121212] to-[#121212] rounded-xl m-2 ml-0 p-6 flex flex-col text-white select-none">
      {/* Top Navbar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Jamendo, Deezer, YouTube & Archive..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#1ed760] text-sm text-white placeholder-[#757575] transition-all"
          />
        </div>

        {/* Live Provider Status Badges */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[#a7a7a7] font-semibold hidden lg:inline">Providers:</span>
          <span className="px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 font-bold">
            Jamendo
          </span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold">
            Deezer
          </span>
          <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 font-bold">
            YouTube
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
            Archive.org
          </span>
        </div>
      </header>

      {/* Hero Welcome / Section Banner */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-[#1ed760] text-black">
            SoundWave Unified Catalog
          </span>
          {providerFilter && providerFilter !== 'all' && (
            <span className="text-xs uppercase font-bold text-[#1ed760]">
              Filtered by {providerFilter.toUpperCase()}
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
          {currentTab === 'favorites'
            ? 'Your Favorite Tracks'
            : searchQuery
            ? `Results for "${searchQuery}"`
            : 'Trending Discoveries'}
        </h1>
        <p className="text-xs md:text-sm text-[#b3b3b3] mt-1">
          Zero ads, legal streaming from open licenses, official previews, and permitted video embeds.
        </p>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex items-center gap-3 py-16 justify-center text-[#b3b3b3]">
          <div className="w-7 h-7 border-2 border-[#1ed760] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Aggregating music from live providers...</span>
        </div>
      )}

      {/* Track Table */}
      {!isLoading && (
        <div className="space-y-4">
          <div className="w-full">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-2 border-b border-white/10 text-xs font-bold text-[#b3b3b3] uppercase tracking-wider">
              <span className="col-span-1">#</span>
              <span className="col-span-6 md:col-span-4">Title</span>
              <span className="hidden md:block col-span-3">Artist & Album</span>
              <span className="col-span-2 hidden md:block">Source & License</span>
              <span className="col-span-5 md:col-span-2 text-right flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5" /> Duration
              </span>
            </div>

            {/* Track Rows */}
            <div className="divide-y divide-transparent mt-1">
              {displayedTracks.map((track, idx) => {
                const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                const isFavorited = favorites.some((f) => f.id === track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, displayedTracks)}
                    className={`group grid grid-cols-12 items-center px-4 py-2.5 rounded-lg hover:bg-[#282828]/80 cursor-pointer transition-all ${
                      currentTrack?.id === track.id ? 'bg-[#242424]' : ''
                    }`}
                  >
                    {/* Index / Play action */}
                    <div className="col-span-1 text-sm font-semibold text-[#b3b3b3]">
                      <span className="group-hover:hidden">{idx + 1}</span>
                      <button className="hidden group-hover:block text-white">
                        {isThisPlaying ? (
                          <Pause className="w-4 h-4 fill-current text-[#1ed760]" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                      </button>
                    </div>

                    {/* Title & Cover */}
                    <div className="col-span-6 md:col-span-4 flex items-center gap-3 overflow-hidden">
                      <img
                        src={track.coverArtwork}
                        alt={track.title}
                        className="w-10 h-10 rounded object-cover shrink-0 shadow"
                      />
                      <div className="overflow-hidden">
                        <p
                          className={`text-sm font-semibold truncate ${
                            currentTrack?.id === track.id ? 'text-[#1ed760]' : 'text-white'
                          }`}
                        >
                          {track.title}
                        </p>
                        <p className="text-xs text-[#b3b3b3] truncate md:hidden">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    {/* Artist & Album */}
                    <div className="hidden md:block col-span-3 text-xs text-[#b3b3b3] truncate">
                      <span className="text-white font-medium block truncate">{track.artist}</span>
                      <span className="text-[#8e8e8e] truncate block">{track.album}</span>
                    </div>

                    {/* Source & License badge */}
                    <div className="hidden md:block col-span-2 text-xs">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#333333] text-[#1ed760]">
                        {track.provider}
                      </span>
                      {track.license && (
                        <span className="block text-[10px] text-[#7d7d7d] truncate mt-0.5">
                          {track.license}
                        </span>
                      )}
                    </div>

                    {/* Favorite and Duration */}
                    <div className="col-span-5 md:col-span-2 flex items-center justify-end gap-3 text-xs text-[#b3b3b3] font-mono">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(track);
                        }}
                        className={`transition-colors ${
                          isFavorited ? 'text-[#1ed760]' : 'opacity-0 group-hover:opacity-100 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                      </button>
                      <span>{track.durationFormatted}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {displayedTracks.length === 0 && (
              <div className="py-20 text-center space-y-3">
                <p className="text-lg font-bold text-white">No tracks found</p>
                <p className="text-xs text-[#b3b3b3]">
                  Try searching for artists like Coldplay, Queen, or select "All Sources".
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
