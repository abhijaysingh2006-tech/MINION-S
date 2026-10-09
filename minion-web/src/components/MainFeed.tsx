'use client';

import React, { useState } from 'react';
import { Play, Pause, Search, Sparkles, TrendingUp, Music, Heart } from 'lucide-react';
import { usePlayerStore } from '@/lib/playerStore';
import { INITIAL_TRACKS, Track } from '@/lib/mockCatalog';

interface MainFeedProps {
  currentTab: string;
}

export const MainFeed: React.FC<MainFeedProps> = ({ currentTab }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleLike } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTracks = INITIAL_TRACKS.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 select-none">
      {/* Top Search Bar (Search View or Home) */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-minion-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tracks, artists, genres, or vibes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#18191E] border border-white/5 text-sm text-white placeholder-minion-textMuted focus:outline-none focus:border-minion-yellow/50 transition-colors"
          />
        </div>

        {/* User Status pill */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Ad-Free Active
          </span>
          <div className="w-9 h-9 rounded-full bg-minion-denim text-white flex items-center justify-center font-bold text-sm border border-white/10">
            M
          </div>
        </div>
      </div>

      {/* Hero Highlight */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-minion-denim to-[#172554] p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-lg">
          <span className="px-2.5 py-0.5 rounded-full bg-minion-yellow text-black text-xs font-extrabold uppercase tracking-wide">
            Featured Mix
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">Pure Grooves & Goggles</h2>
          <p className="text-sm text-white/80">
            The freshest Creative Commons electronic beats, curated for coding, chilling, and high vibes.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => playTrack(INITIAL_TRACKS[0])}
              className="px-6 py-2.5 rounded-full bg-minion-yellow hover:bg-minion-yellowHover text-black font-extrabold text-sm flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-md"
            >
              <Play className="w-4 h-4 fill-current text-black" /> Play Now
            </button>
            <span className="text-xs text-white/60">4 tracks • 12 mins</span>
          </div>
        </div>

        <img
          src={INITIAL_TRACKS[0].coverUrl}
          alt="Featured Cover"
          className="w-48 h-48 rounded-2xl object-cover shadow-2xl border-2 border-white/10 hidden md:block"
        />
      </div>

      {/* Track Grid Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-minion-yellow" />
            {searchQuery ? `Search Results (${filteredTracks.length})` : 'Trending Now on Minion'}
          </h3>
          <span className="text-xs text-minion-textMuted font-medium hover:text-white cursor-pointer">
            View All
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTracks.map((track) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;

            return (
              <div
                key={track.id}
                className="group relative p-3.5 rounded-2xl bg-[#18191E] hover:bg-[#20222A] transition-all duration-200 border border-white/5 flex flex-col cursor-pointer"
                onClick={() => playTrack(track)}
              >
                {/* Track Cover + Hover Play Button */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentTrack?.id === track.id) {
                        togglePlay();
                      } else {
                        playTrack(track);
                      }
                    }}
                    className={`absolute bottom-3 right-3 w-10 h-10 rounded-full bg-minion-yellow text-black flex items-center justify-center shadow-lg transition-all duration-200 ${
                      isThisPlaying
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                    }`}
                    aria-label="Play Track"
                  >
                    {isThisPlaying ? (
                      <Pause className="w-5 h-5 fill-current text-black" />
                    ) : (
                      <Play className="w-5 h-5 fill-current text-black translate-x-0.5" />
                    )}
                  </button>
                </div>

                {/* Track Details */}
                <h4 className="font-bold text-sm text-white truncate group-hover:text-minion-yellow transition-colors">
                  {track.title}
                </h4>
                <p className="text-xs text-minion-textMuted truncate mt-0.5">
                  {track.artistName}
                </p>

                {/* Footer details */}
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-minion-textMuted">
                  <span>Creative Commons</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track.id);
                    }}
                    className={`p-1 hover:text-white transition-colors ${
                      track.isLiked ? 'text-minion-yellow' : ''
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${track.isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Friendly Minion Empty State Note */}
      {filteredTracks.length === 0 && (
        <div className="py-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-minion-yellow/10 text-minion-yellow flex items-center justify-center mx-auto text-2xl font-black">
            👀
          </div>
          <h4 className="text-lg font-bold text-white">Nothing here yet, go find some bangers!</h4>
          <p className="text-xs text-minion-textMuted">
            Try searching for "banana", "acoustic", or "stuart".
          </p>
        </div>
      )}
    </div>
  );
};
