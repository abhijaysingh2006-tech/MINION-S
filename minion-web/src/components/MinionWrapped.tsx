'use client';

import React from 'react';
import { Sparkles, Trophy, Music, Clock, Headphones } from 'lucide-react';
import { MinionLogo } from './MinionLogo';

export const MinionWrapped: React.FC = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto h-full select-none">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-minion-yellow via-amber-500 to-minion-denim p-8 md:p-12 text-black shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="flex items-center gap-2">
            <MinionLogo size={36} />
            <span className="font-black text-xl tracking-wider uppercase">Minion Wrapped 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            You listened to 24,810 minutes of pure, uninterrupted music.
          </h1>
          <p className="text-sm font-semibold opacity-90">
            0 commercials interrupted your flow this year. That is 42 hours of ads saved compared to typical services!
          </p>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-white/20 blur-2xl pointer-events-none" />
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Artist */}
        <div className="bg-[#18191E] p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-minion-yellow text-sm font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4" /> Top Artist
          </div>
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300"
              alt="DJ Stuart"
              className="w-16 h-16 rounded-full object-cover border-2 border-minion-yellow"
            />
            <div>
              <h3 className="text-lg font-bold text-white">DJ Stuart</h3>
              <p className="text-xs text-minion-textMuted">Top 0.5% of listeners</p>
            </div>
          </div>
          <p className="text-xs text-white/70">
            You played DJ Stuart's tracks 842 times.
          </p>
        </div>

        {/* Top Genre */}
        <div className="bg-[#18191E] p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-minion-yellow text-sm font-bold uppercase tracking-wider">
            <Music className="w-4 h-4" /> Top Genre Vibe
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">Synthwave & Electro</h3>
            <p className="text-xs text-minion-textMuted mt-1">
              Followed by Acoustic Chill and Indie Funk.
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-minion-yellow w-3/4 rounded-full" />
          </div>
        </div>

        {/* Peak Listening Time */}
        <div className="bg-[#18191E] p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-minion-yellow text-sm font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" /> Peak Listening
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">11:00 PM</h3>
            <p className="text-xs text-minion-textMuted mt-1">
              Night owl vibes! Midnight Goggle Drive was your soundtrack.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Headphones className="w-4 h-4" /> 184 Night Sessions
          </div>
        </div>
      </div>

      {/* Shareable Card Banner */}
      <div className="p-6 rounded-2xl bg-[#18191E] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-white">Share Your 2026 Wrapped</h4>
          <p className="text-xs text-minion-textMuted">Generate a story-ready image for Instagram, X, or TikTok.</p>
        </div>
        <button
          onClick={() => alert('Wrapped snapshot copied to clipboard!')}
          className="px-6 py-2.5 rounded-xl bg-minion-yellow text-black font-extrabold text-sm hover:bg-minion-yellowHover transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Share Wrapped Card
        </button>
      </div>
    </div>
  );
};
