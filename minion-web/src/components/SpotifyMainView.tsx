'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Search, Clock, Heart, Sparkles, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { usePlayerStore, Track } from '@/lib/playerStore';

interface SpotifyMainViewProps {
  currentTab: string;
}

export const SpotifyMainView: React.FC<SpotifyMainViewProps> = ({ currentTab }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleLike, likedTrackIds } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch YouTube music tracks
  const fetchMusic = async (query: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.tracks) {
        setTracks(data.tracks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMusic('Top global trending music hits 2024');
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeout) clearTimeout(searchTimeout);
    const t = setTimeout(() => {
      fetchMusic(val || 'Top global trending music hits 2024');
    }, 450);
    setSearchTimeout(t);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1e3264]/40 via-[#121212] to-[#121212] rounded-lg m-2 ml-0 p-6 flex flex-col text-white select-none">
      {/* Top Navbar */}
      <header className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-[#b3b3b3] hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-[#b3b3b3] hover:text-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Spotify-style Search Input */}
          <div className="relative w-80 md:w-96">
            <Search className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="What do you want to play? (Any song on YouTube)"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-white text-sm text-white placeholder-[#757575] transition-all"
            />
          </div>
        </div>

        {/* Profile / Tier Avatar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-white">
            Ad-Free YouTube Engine
          </span>
          <button className="w-8 h-8 rounded-full bg-[#535353] flex items-center justify-center text-white">
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          {searchQuery ? `Results for "${searchQuery}"` : 'Good afternoon'}
        </h1>
        <p className="text-sm text-[#b3b3b3]">
          Unlimited music streaming straight from YouTube with zero audio commercials or video popups.
        </p>
      </div>

      {/* Grid of Quick Mixes (Spotify style) */}
      {!searchQuery && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {[
            { title: 'Today’s Top Hits', query: "Today's top hits" },
            { title: 'Chill Vibes & Lofi', query: 'Chill lofi study beats' },
            { title: 'Hip-Hop Drive', query: 'Popular hip hop rap hits' },
            { title: 'Rock & Metal Classics', query: 'Classic rock greatest hits' },
            { title: 'Electronic / EDM', query: 'EDM festival dance music' },
            { title: 'Acoustic Morning', query: 'Acoustic guitar morning songs' },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSearchQuery(item.title);
                fetchMusic(item.query);
              }}
              className="group flex items-center bg-[#282828]/60 hover:bg-[#282828] rounded overflow-hidden cursor-pointer transition-colors shadow"
            >
              <div className="w-16 h-16 bg-[#333333] shrink-0 flex items-center justify-center text-2xl font-bold">
                🎵
              </div>
              <span className="font-bold text-sm px-4 truncate flex-1">{item.title}</span>
              <button className="mr-3 w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg transition-all translate-y-1 group-hover:translate-y-0">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center gap-3 py-12 text-[#b3b3b3]">
          <div className="w-6 h-6 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Fetching tracks from YouTube...</span>
        </div>
      )}

      {/* Spotify Tracks Table */}
      {!isLoading && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Songs & Videos</h2>

          <div className="w-full">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-2 border-b border-white/10 text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider">
              <span className="col-span-1">#</span>
              <span className="col-span-6 md:col-span-5">Title</span>
              <span className="hidden md:block col-span-3">Artist / Channel</span>
              <span className="col-span-5 md:col-span-3 text-right flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5" /> Time
              </span>
            </div>

            {/* Track rows */}
            <div className="divide-y divide-transparent mt-1">
              {tracks.map((track, idx) => {
                const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                const isLiked = likedTrackIds.has(track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, tracks)}
                    className="group grid grid-cols-12 items-center px-4 py-2.5 rounded-md hover:bg-[#2a2a2a]/70 cursor-pointer transition-colors"
                  >
                    {/* Index / Play Button */}
                    <div className="col-span-1 text-sm font-semibold text-[#b3b3b3]">
                      <span className="group-hover:hidden">{idx + 1}</span>
                      <button className="hidden group-hover:block text-white">
                        {isThisPlaying ? (
                          <Pause className="w-4 h-4 fill-current text-[#1db954]" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                      </button>
                    </div>

                    {/* Title & Cover */}
                    <div className="col-span-6 md:col-span-5 flex items-center gap-3 overflow-hidden">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p
                          className={`text-sm font-semibold truncate ${
                            currentTrack?.id === track.id ? 'text-[#1db954]' : 'text-white'
                          }`}
                        >
                          {track.title}
                        </p>
                        <p className="text-xs text-[#b3b3b3] truncate md:hidden">
                          {track.artistName}
                        </p>
                      </div>
                    </div>

                    {/* Artist / Channel */}
                    <div className="hidden md:block col-span-3 text-sm text-[#b3b3b3] truncate">
                      {track.artistName}
                    </div>

                    {/* Heart & Duration */}
                    <div className="col-span-5 md:col-span-3 flex items-center justify-end gap-4 text-xs text-[#b3b3b3] font-mono">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track);
                        }}
                        className={`transition-colors ${
                          isLiked ? 'text-[#1db954]' : 'opacity-0 group-hover:opacity-100 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      </button>
                      <span>{track.timestamp || '3:30'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
