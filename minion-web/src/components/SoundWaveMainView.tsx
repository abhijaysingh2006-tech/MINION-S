'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  ArrowLeft,
  Flame,
  Sparkles,
  Music2,
  Radio,
  Globe2,
  Clock,
  Heart,
  Loader2,
  Layers,
  Search,
  X,
} from 'lucide-react';
import { useSoundWaveStore } from '@/lib/soundwaveStore';
import { UnifiedTrack } from '@/lib/musicProviders/types';
import { QuickPickTile } from './QuickPickTile';
import { ShelfSection } from './ShelfSection';
import { TrackCard } from './TrackCard';
import { PlaylistDetailView } from './PlaylistDetailView';
import { extractDominantColor, DEFAULT_GRADIENT_COLOR } from '@/lib/colorExtractor';

export const SoundWaveMainView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activePlaylistId,
    playlists,
    activeProviderFilter,
    setActiveProviderFilter,
    activeCategoryFilter,
    setActiveCategoryFilter,
    searchQuery,
    setSearchQuery,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleFavorite,
    favorites,
    showToast,
    selectedSection,
    setSelectedSection,
    hoverGradientColor,
  } = useSoundWaveStore();

  const [shelves, setShelves] = useState<{
    trending: UnifiedTrack[];
    newReleases: UnifiedTrack[];
    madeForYou: UnifiedTrack[];
    creativeCommons: UnifiedTrack[];
    classic: UnifiedTrack[];
    youtube: UnifiedTrack[];
  }>({
    trending: [],
    newReleases: [],
    madeForYou: [],
    creativeCommons: [],
    classic: [],
    youtube: [],
  });

  const [sectionTracks, setSectionTracks] = useState<UnifiedTrack[]>([]);
  const [isSectionLoading, setIsSectionLoading] = useState(false);
  const [isShelvesLoading, setIsShelvesLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<UnifiedTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentCoverGradient, setCurrentCoverGradient] = useState(DEFAULT_GRADIENT_COLOR);

  // Load all shelves data on mount
  useEffect(() => {
    let isMounted = true;
    const fetchShelves = async () => {
      setIsShelvesLoading(true);
      try {
        const res = await fetch('/api/music/shelves');
        const data = await res.json();
        if (isMounted && data.shelves) {
          setShelves({
            trending: data.shelves.trending || [],
            newReleases: data.shelves.newReleases || [],
            madeForYou: data.shelves.madeForYou || [],
            creativeCommons: data.shelves.creativeCommons || [],
            classic: data.shelves.classic || [],
            youtube: data.shelves.youtube || [],
          });
        }
      } catch (err) {
        console.error('Failed to load shelves:', err);
      } finally {
        if (isMounted) setIsShelvesLoading(false);
      }
    };

    fetchShelves();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update dominant color when current track changes
  useEffect(() => {
    if (currentTrack?.coverArtwork) {
      extractDominantColor(currentTrack.coverArtwork).then((color) => {
        setCurrentCoverGradient(color);
      });
    }
  }, [currentTrack]);

  // Handle section tracks fetching when "Show all" is active
  useEffect(() => {
    if (activeTab === 'section' && selectedSection) {
      setIsSectionLoading(true);
      const fetchSection = async () => {
        try {
          const pParam =
            selectedSection.provider && selectedSection.provider !== 'all'
              ? `&provider=${selectedSection.provider}`
              : '';
          const res = await fetch(
            `/api/music/search?q=${encodeURIComponent(selectedSection.query)}${pParam}`
          );
          const data = await res.json();
          setSectionTracks(data.tracks || []);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSectionLoading(false);
        }
      };
      fetchSection();
    }
  }, [activeTab, selectedSection]);

  // Handle Search Query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const pParam =
          activeProviderFilter && activeProviderFilter !== 'all'
            ? `&provider=${activeProviderFilter}`
            : '';
        const res = await fetch(
          `/api/music/search?q=${encodeURIComponent(searchQuery)}${pParam}`
        );
        const data = await res.json();
        setSearchResults(data.tracks || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, activeProviderFilter]);

  // Derive quick-pick tracks from trending + favorites (up to 8 items for 2x4 grid)
  const quickPickTracks: UnifiedTrack[] = React.useMemo(() => {
    const list = [...(favorites.length > 0 ? favorites : []), ...shelves.trending];
    // Remove duplicates
    const unique = Array.from(new Map(list.map((t) => [t.id, t])).values());
    return unique.slice(0, 8);
  }, [favorites, shelves.trending]);

  // Top gradient color: prioritize hovered tile, then current track, then slate fallback
  const ambientBgColor = hoverGradientColor || currentCoverGradient || '#1E293B';

  return (
    <div className="flex-1 overflow-y-auto rounded-xl bg-[#121212] min-h-0 flex flex-col text-white relative shadow-2xl overflow-x-hidden">
      {/* 1. TOP AMBIENT GRADIENT (Fading within first 300px) */}
      <div
        className="absolute top-0 left-0 right-0 h-[340px] pointer-events-none transition-all duration-700 ease-out z-0"
        style={{
          background: `linear-gradient(180deg, ${ambientBgColor} 0%, rgba(18, 18, 18, 0.9) 70%, #121212 100%)`,
          opacity: 0.65,
        }}
      />

      <div className="relative z-10 flex flex-col p-3 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* 2. FILTER CHIPS ROWS */}
        <div className="flex flex-col gap-3">
          {/* Row 1: All, Music, Podcasts */}
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'music', label: 'Music' },
              { id: 'podcasts', label: 'Podcasts' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id as any)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 ${
                  activeCategoryFilter === cat.id
                    ? 'bg-white text-black shadow-md scale-105'
                    : 'bg-[#2A2A2A]/80 text-[#B3B3B3] hover:text-white hover:bg-[#333333]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Row 2: Source Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Sources' },
              { id: 'jamendo', label: 'Jamendo' },
              { id: 'deezer', label: 'Deezer' },
              { id: 'youtube', label: 'YouTube' },
              { id: 'archive', label: 'Archive.org' },
            ].map((src) => (
              <button
                key={src.id}
                onClick={() => {
                  setActiveProviderFilter(src.id);
                  showToast(`Filter: ${src.label}`, 'info');
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeProviderFilter === src.id
                    ? 'bg-[#FFD60A] text-black shadow-md'
                    : 'bg-[#1F1F1F]/90 text-[#B3B3B3] hover:text-white border border-[#2D2D2D] hover:border-[#444444]'
                }`}
              >
                {src.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. CONDITIONAL MAIN VIEW CONTENT */}

        {/* LIKED SONGS VIEW */}
        {activeTab === 'favorites' && (
          <PlaylistDetailView
            type="favorites"
            title="Liked Songs"
            description="Auto-saved favorite tracks in your SoundWave collection"
            ownerName="User"
            tracks={favorites}
          />
        )}

        {/* CUSTOM PLAYLIST VIEW */}
        {activeTab === 'playlist' && (
          (() => {
            const pl = playlists.find((p) => p.id === activePlaylistId) || playlists[0];
            const plTracks = favorites.filter((f) => pl?.trackIds.includes(f.id));
            return (
              <PlaylistDetailView
                type="playlist"
                title={pl?.name || 'My Playlist'}
                description={pl?.description || 'Custom playlist created by you'}
                ownerName="User"
                coverUrl={pl?.coverUrl}
                tracks={plTracks.length > 0 ? plTracks : favorites.slice(0, 10)}
                isCustomPlaylist={true}
                playlistId={pl?.id}
              />
            );
          })()
        )}

        {/* ARTIST DETAIL VIEW */}
        {activeTab === 'artist' && (
          <PlaylistDetailView
            type="artist"
            title={currentTrack?.artist || 'Featured Artist'}
            description="Official streaming collection across global providers and SoundWave."
            ownerName="Verified Artist"
            coverUrl={currentTrack?.coverArtwork}
            tracks={
              shelves.trending.filter((t) => t.artist === currentTrack?.artist).length > 0
                ? shelves.trending.filter((t) => t.artist === currentTrack?.artist)
                : shelves.trending.slice(0, 10)
            }
          />
        )}

        {/* ALBUM DETAIL VIEW */}
        {activeTab === 'album' && (
          <PlaylistDetailView
            type="album"
            title={currentTrack?.album || 'Featured Album'}
            description={`Studio album by ${currentTrack?.artist || 'SoundWave Artist'}`}
            ownerName={currentTrack?.artist || 'SoundWave'}
            coverUrl={currentTrack?.coverArtwork}
            tracks={shelves.newReleases.slice(0, 12)}
          />
        )}

        {/* LIBRARY OVERVIEW VIEW */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Music Library</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Liked Songs card */}
              <div
                onClick={() => setActiveTab('favorites')}
                className="group p-4 rounded-xl bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] hover:scale-[1.02] cursor-pointer transition-all shadow-xl col-span-2 flex flex-col justify-between h-[200px]"
              >
                <div>
                  <h3 className="text-2xl font-black text-white">Liked Songs</h3>
                  <p className="text-xs text-purple-200 mt-1">{favorites.length} saved songs</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-200">Auto-saved</span>
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-black translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Custom Playlists cards */}
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => {
                    useSoundWaveStore.getState().setActivePlaylistId(pl.id);
                    setActiveTab('playlist');
                  }}
                  className="group p-3.5 bg-[#181818] hover:bg-[#282828] rounded-xl cursor-pointer transition-all shadow-lg flex flex-col space-y-3"
                >
                  <div className="w-full aspect-square rounded-lg bg-[#202020] overflow-hidden flex items-center justify-center">
                    {pl.coverUrl ? (
                      <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover" />
                    ) : (
                      <Music2 className="w-10 h-10 text-[#6A6A6A]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white truncate">{pl.name}</h4>
                    <p className="text-xs text-[#B3B3B3] truncate">{pl.description || 'Playlist • SoundWave'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION VIEW (When "Show all" was clicked on any shelf) */}
        {activeTab === 'section' && selectedSection && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('home')}
                className="p-2 rounded-full bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white transition-all hover:scale-105"
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  {selectedSection.title}
                </h1>
                <p className="text-xs text-[#B3B3B3] mt-1">
                  Full collection from {selectedSection.provider.toUpperCase()} & global catalog
                </p>
              </div>
            </div>

            {isSectionLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="p-3.5 bg-[#181818] rounded-xl animate-pulse space-y-3">
                    <div className="w-full aspect-square bg-[#242424] rounded-lg" />
                    <div className="h-4 bg-[#282828] rounded w-3/4" />
                    <div className="h-3 bg-[#242424] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {sectionTracks.map((track) => (
                  <TrackCard key={track.id} track={track} queueList={sectionTracks} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEARCH RESULTS VIEW */}
        {(activeTab === 'search' || searchQuery.trim() !== '') && activeTab !== 'section' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {searchQuery ? `Results for "${searchQuery}"` : 'Search SoundWave'}
              </h2>

              {/* Inline mobile-friendly search bar */}
              <div className="relative flex items-center h-11 sm:h-12 rounded-full bg-[#1F1F1F] hover:bg-[#252525] focus-within:bg-[#252525] focus-within:ring-2 focus-within:ring-[#FFD60A] border border-[#333333] px-4 max-w-md w-full transition-all">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD60A] mr-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Artists, songs, or podcasts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-[#888888] focus:outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-[#333333] rounded-full text-[#B3B3B3] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#B3B3B3]">
                <Loader2 className="w-8 h-8 animate-spin text-[#FFD60A]" />
                <p className="text-sm font-semibold">Searching legal music sources across YouTube, Deezer & Jamendo...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.map((track) => (
                  <TrackCard key={track.id} track={track} queueList={searchResults} />
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="text-center py-16 text-[#B3B3B3]">
                <p className="text-base font-semibold">No results found for &ldquo;{searchQuery}&rdquo;</p>
                <p className="text-xs mt-1">Try another search term or switch source filters above.</p>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-white">Browse all genres & styles</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {[
                    { label: 'Bollywood & Hindi', query: 'bollywood hits', color: 'from-[#EC4899] to-[#BE185D]' },
                    { label: 'Punjabi Hits', query: 'punjabi hits', color: 'from-[#F59E0B] to-[#D97706]' },
                    { label: 'Global Pop', query: 'top billboard pop hits', color: 'from-[#10B981] to-[#047857]' },
                    { label: 'Hip-Hop & Rap', query: 'hip hop hits', color: 'from-[#6366F1] to-[#4338CA]' },
                    { label: 'Romantic Melodies', query: 'romantic songs', color: 'from-[#EF4444] to-[#B91C1C]' },
                    { label: 'Dance & EDM', query: 'dance edm club hits', color: 'from-[#8B5CF6] to-[#6D28D9]' },
                    { label: 'Rock & Metal', query: 'rock classics', color: 'from-[#64748B] to-[#334155]' },
                    { label: 'Lo-Fi & Chill', query: 'lofi chill beats', color: 'from-[#14B8A6] to-[#0F766E]' },
                    { label: 'Acoustic & Indie', query: 'indie acoustic songs', color: 'from-[#F97316] to-[#C2410C]' },
                    { label: 'Devotional & Spiritual', query: 'devotional songs', color: 'from-[#3B82F6] to-[#1D4ED8]' },
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => setSearchQuery(cat.query)}
                      className={`h-24 sm:h-28 rounded-xl p-3.5 flex flex-col justify-between text-left font-bold text-white bg-gradient-to-br ${cat.color} hover:scale-[1.03] transition-all shadow-lg overflow-hidden group`}
                    >
                      <span className="text-sm sm:text-base leading-snug">{cat.label}</span>
                      <div className="flex items-center justify-end">
                        <span className="text-[11px] font-semibold text-white/80 group-hover:text-white flex items-center gap-1">
                          Explore &rarr;
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HOME VIEW (Quick-Pick Grid + All 7 Required Shelves) */}
        {activeTab === 'home' && !searchQuery.trim() && (
          <>
            {/* Quick-Pick 2x4 Grid (56px high tiles) */}
            {quickPickTracks.length > 0 && (
              <section className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                  {quickPickTracks.map((track) => (
                    <QuickPickTile key={track.id} track={track} queueList={quickPickTracks} />
                  ))}
                </div>
              </section>
            )}

            {/* 1. Trending Now Shelf */}
            <ShelfSection
              title="Trending Now"
              subtitle="Top charts and trending hits across Deezer & Jamendo"
              tracks={shelves.trending}
              isLoading={isShelvesLoading}
              query="top hits billboard chart"
              provider="all"
            />

            {/* 2. New Releases Shelf */}
            <ShelfSection
              title="New Releases"
              subtitle="Latest tracks and fresh official audio"
              tracks={shelves.newReleases}
              isLoading={isShelvesLoading}
              query="new music releases 2024"
              provider="all"
            />

            {/* 3. Made for You Shelf */}
            <ShelfSection
              title="Made for You"
              subtitle="Personalized selection based on your listening taste"
              tracks={shelves.madeForYou}
              isLoading={isShelvesLoading}
              query="chill vibes indie electronic"
              provider="all"
            />

            {/* 4. Creative Commons Picks Shelf */}
            <ShelfSection
              title="Creative Commons Picks"
              subtitle="Royalty-free masterpieces and independent artists via Jamendo"
              tracks={shelves.creativeCommons}
              isLoading={isShelvesLoading}
              query="rock indie acoustic"
              provider="jamendo"
            />

            {/* 5. Classic and Public Domain Shelf */}
            <ShelfSection
              title="Classic and Public Domain"
              subtitle="Historical archives, vintage radio broadcasts & live recordings"
              tracks={shelves.classic}
              isLoading={isShelvesLoading}
              query="classic old time radio vintage"
              provider="archive"
            />

            {/* 6. Popular on YouTube Shelf */}
            <ShelfSection
              title="Popular on YouTube"
              subtitle="Streamed directly through the official YouTube IFrame Player"
              tracks={shelves.youtube}
              isLoading={isShelvesLoading}
              query="popular hits music video"
              provider="youtube"
            />

            {/* 7. Recently Played / Liked Songs Shelf */}
            {favorites.length > 0 && (
              <ShelfSection
                title="Recently Played & Liked"
                subtitle="Your saved favorites and recent listening history"
                tracks={favorites}
                isLoading={false}
                query="favorites"
                provider="all"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
