'use client';

import React from 'react';
import { usePlayerStore } from '@/lib/playerStore';
import { Heart, Music, Disc3, Radio } from 'lucide-react';

export const RightNowPlayingPanel: React.FC = () => {
  const { currentTrack, toggleLike } = usePlayerStore();

  if (!currentTrack) return null;

  return (
    <aside className="w-80 bg-[#121318] border-l border-[#1E2028] p-5 flex flex-col h-full select-none hidden xl:flex">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <span className="text-xs font-bold uppercase tracking-wider text-minion-textMuted flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-minion-yellow animate-pulse" /> Now Playing
        </span>
      </div>

      {/* Large Cover Art */}
      <div className="mt-5 space-y-4">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-start justify-between">
          <div className="overflow-hidden">
            <h3 className="text-lg font-extrabold text-white truncate">{currentTrack.title}</h3>
            <p className="text-sm text-minion-textMuted truncate">{currentTrack.artistName}</p>
          </div>
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
              currentTrack.isLiked ? 'text-minion-yellow' : 'text-minion-textMuted hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${currentTrack.isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* About the Artist Card */}
      <div className="mt-6 p-4 rounded-2xl bg-[#18191E] border border-white/5 space-y-3">
        <span className="text-[11px] font-bold text-minion-textMuted uppercase tracking-wider">
          About The Artist
        </span>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-minion-yellow text-black font-extrabold flex items-center justify-center text-sm">
            {currentTrack.artistName.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{currentTrack.artistName}</h4>
            <p className="text-xs text-minion-textMuted">Verified Minion Artist</p>
          </div>
        </div>
        <p className="text-xs text-white/70 leading-relaxed">
          Crafting royalty-free sonic anthems with zero advertisements or corporate sponsors.
        </p>

        {/* Tip Artist Button */}
        <button
          onClick={() => alert(`Tip session opened for ${currentTrack.artistName}!`)}
          className="w-full py-2 rounded-xl bg-minion-denim hover:bg-minion-denimHover text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          <span>Support & Tip Artist</span>
        </button>
      </div>
    </aside>
  );
};
