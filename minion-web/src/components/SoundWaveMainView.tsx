'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Search,
  Clock,
  Heart,
  Flame,
  Globe2,
  Disc3,
  Loader2,
  Plus,
} from 'lucide-react';
import { useSoundWaveStore } from '@/lib/soundwaveStore';
import { UnifiedTrack } from '@/lib/musicProviders/types';

export const SoundWaveMainView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activePlaylistId,
    playlists,
    activeProviderFilter,
    setActiveProviderFilter,
    searchQuery,
    setSearchQuery,
    currentTrack,
    isPlaying,
    playTrack,
    toggleFavorite,
    favorites,
    showToast,
  } = useSoundWaveStore();

  const [tracks, setTracks] = useState<UnifiedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

  const fetchTracks = async (q: string, provider?: string) => {
    setIsLoading(true);
    try {
      const pParam = provider && provider !== 'all' ? `&provider=${provider}` : '';
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(q || 'top billboard hits')}${pParam}`);
      const data = await res.json();
      if (data.tracks) {
        setTracks(data.tracks);
      } else {
        showToast('No tracks found for this query', 'info');
      }
    } catch (e: any) {
      console.error(e);
      showToast('Error connecting to music providers', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks(searchQuery, activeProviderFilter);
  }, [activeProviderFilter]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => {
      fetchTracks(val, activeProviderFilter);
    }, 450);
    setSearchTimer(timer);
  };

  // Determine which track list to show based on active tab
  let displayedTracks: UnifiedTrack[] = tracks;
  let viewTitle = 'Trending & New Releases';
  let viewSubtitle = 'Discover tracks across Jamendo, Deezer, YouTube & Archive.org';

  if (activeTab === 'favorites') {
    displayedTracks = favorites;
    viewTitle = 'Liked Songs';
    viewSubtitle = `${favorites.length} saved songs in your library`;
  } else if (activeTab === 'search') {
    viewTitle = searchQuery ? `Search Results for "${searchQuery}"` : 'Search & Discover';
    viewSubtitle = 'Query the entire legal music web with zero ads';
  } else if (activeTab === 'library') {
    viewTitle = 'Your Music Library';
    viewSubtitle = `${playlists.length} playlists • ${favorites.length} liked tracks`;
  } else if (activeTab === 'playlist') {
    const pl = playlists.find((p) => p.id === activePlaylistId);
    viewTitle = pl?.name || 'Playlist';
    viewSubtitle = pl?.description || 'Custom SoundWave collection';
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0F0F12] rounded-2xl m-3 ml-0 p-6 md:p-8 flex flex-col text-white select-none border border-[#18191E] shadow-2xl">
      {/* Search Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search songs, artists, Jamendo, Deezer, YouTube..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#18191E] hover:bg-[#202127] focus:bg-[#202127] border border-[#24252B] focus:border-[#FFD60A] text-sm text-white placeholder-[#64748B] focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Quick Filter Source Pills */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
          {[
            { id: 'all', label: 'All Sources' },
            { id: 'jamendo', label: 'Jamendo' },
            { id: 'deezer', label: 'Deezer' },
            { id: 'youtube', label: 'YouTube' },
            { id: 'archive', label: 'Archive.org' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActiveProviderFilter(p.id);
                showToast(`Filter: ${p.label}`, 'info');
              }}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                activeProviderFilter === p.id
                  ? 'bg-[#FFD60A] text-black shadow-md scale-105'
                  : 'bg-[#18191E] text-[#94A3B8] hover:text-white border border-[#24252B]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#18191E] via-[#1E2028] to-[#121318] p-6 md:p-8 border border-[#24252B] mb-8 shadow-xl">
        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="px-2.5 py-0.5 rounded-full bg-[#FFD60A] text-black text-[10px] font-black uppercase tracking-wider">
            100% Ad-Free
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            {viewTitle}
          </h1>
          <p className="text-xs md:text-sm text-[#94A3B8]">
            {viewSubtitle}
          </p>
        </div>
      </div>

      {/* Quick Mix Cards (Home View) */}
      {activeTab === 'home' && !searchQuery && (
        <section className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FFD60A]" /> Featured Collections
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {[
              { title: 'Top 50 Global Hits', query: 'popular billboard songs', provider: 'all', icon: Flame },
              { title: 'Electronic & Synth', query: 'electronic dance music', provider: 'jamendo', icon: Disc3 },
              { title: 'Classic Open Audio', query: 'classic radio live', provider: 'archive', icon: Globe2 },
              { title: 'Chill Acoustic Vibes', query: 'acoustic chill indie', provider: 'deezer', icon: Heart },
            ].map((mix, idx) => {
              const MixIcon = mix.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveProviderFilter(mix.provider);
                    handleSearchChange(mix.query);
                  }}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-[#18191E] hover:bg-[#24252B] border border-[#24252B] hover:border-[#FFD60A]/40 cursor-pointer transition-all shadow-md"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0F0F12] flex items-center justify-center text-[#FFD60A] shrink-0 group-hover:scale-110 transition-transform">
                    <MixIcon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs md:text-sm text-white truncate flex-1">
                    {mix.title}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#94A3B8]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFD60A]" />
          <p className="text-sm font-semibold">Aggregating music from live providers...</p>
        </div>
      )}

      {/* Track List Table */}
      {!isLoading && (
        <div className="space-y-4">
          <div className="w-full">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-2.5 border-b border-[#24252B] text-xs font-bold text-[#64748B] uppercase tracking-wider">
              <span className="col-span-1">#</span>
              <span className="col-span-6 md:col-span-4">Title</span>
              <span className="hidden md:block col-span-3">Artist & Album</span>
              <span className="col-span-2 hidden md:block">Source & License</span>
              <span className="col-span-5 md:col-span-2 text-right flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5" /> Duration
              </span>
            </div>

            {/* Track Rows */}
            <div className="divide-y divide-transparent mt-1 space-y-1">
              {displayedTracks.map((track, idx) => {
                const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                const isFavorited = favorites.some((f) => f.id === track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, displayedTracks)}
                    className={`group grid grid-cols-12 items-center px-4 py-3 rounded-xl cursor-pointer transition-all ${
                      currentTrack?.id === track.id
                        ? 'bg-[#24252B] text-white ring-1 ring-[#FFD60A]/40'
                        : 'hover:bg-[#18191E] text-[#94A3B8]'
                    }`}
                  >
                    {/* Index / Play Action */}
                    <div className="col-span-1 text-sm font-bold text-[#64748B]">
                      <span className="group-hover:hidden">{idx + 1}</span>
                      <button className="hidden group-hover:block text-white">
                        {isThisPlaying ? (
                          <Pause className="w-4 h-4 fill-current text-[#FFD60A]" />
                        ) : (
                          <Play className="w-4 h-4 fill-current text-[#FFD60A]" />
                        )}
                      </button>
                    </div>

                    {/* Cover Art & Title */}
                    <div className="col-span-6 md:col-span-4 flex items-center gap-3.5 overflow-hidden">
                      <img
                        src={track.coverArtwork}
                        alt={track.title}
                        className="w-11 h-11 rounded-lg object-cover shrink-0 shadow-md border border-white/5"
                      />
                      <div className="overflow-hidden">
                        <p
                          className={`text-sm font-bold truncate ${
                            currentTrack?.id === track.id ? 'text-[#FFD60A]' : 'text-white'
                          }`}
                        >
                          {track.title}
                        </p>
                        <p className="text-xs text-[#94A3B8] truncate md:hidden">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    {/* Artist & Album */}
                    <div className="hidden md:block col-span-3 text-xs text-[#94A3B8] truncate">
                      <span className="text-white font-medium block truncate">{track.artist}</span>
                      <span className="text-[#64748B] truncate block">{track.album}</span>
                    </div>

                    {/* Source & License Badge */}
                    <div className="hidden md:block col-span-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#0F0F12] text-[#FFD60A] border border-[#24252B]">
                        {track.provider}
                      </span>
                      {track.previewNotice && (
                        <span className="block text-[10px] text-indigo-400 font-semibold truncate mt-0.5">
                          {track.previewNotice}
                        </span>
                      )}
                    </div>

                    {/* Favorite and Duration */}
                    <div className="col-span-5 md:col-span-2 flex items-center justify-end gap-3 text-xs text-[#94A3B8] font-mono">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(track);
                        }}
                        className={`p-1 transition-colors ${
                          isFavorited
                            ? 'text-[#FFD60A]'
                            : 'opacity-0 group-hover:opacity-100 hover:text-white'
                        }`}
                        title={isFavorited ? 'Remove favorite' : 'Add favorite'}
                      >
                        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                      </button>
                      <span>{track.durationFormatted}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {displayedTracks.length === 0 && (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#18191E] flex items-center justify-center mx-auto text-xl text-[#FFD60A]">
                  ♪
                </div>
                <p className="text-base font-bold text-white">No songs in this view</p>
                <p className="text-xs text-[#94A3B8]">
                  Search for your favorite artist above or pick a different source.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
