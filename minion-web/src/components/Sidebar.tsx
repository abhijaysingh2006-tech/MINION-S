'use client';

import React from 'react';
import {
  Home,
  Search,
  Library,
  Heart,
  PlusSquare,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';
import { MinionLogo } from './MinionLogo';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  return (
    <aside className="w-64 bg-minion-bg flex flex-col h-full border-r border-[#1E2028] p-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <MinionLogo size={42} />
        <div>
          <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1.5">
            Minion
            <span className="inline-block w-2 h-2 rounded-full bg-minion-yellow animate-pulse" />
          </span>
          <p className="text-[11px] text-minion-textMuted uppercase font-semibold tracking-wider">
            Music, no interruptions.
          </p>
        </div>
      </div>

      {/* Zero Ads Badge */}
      <div className="mx-2 mb-6 p-3 rounded-xl bg-gradient-to-r from-minion-denim/40 to-minion-denim/10 border border-minion-denim/40 flex items-center gap-2.5">
        <Zap className="w-5 h-5 text-minion-yellow shrink-0" />
        <div className="text-xs">
          <p className="font-semibold text-white">100% Ad-Free</p>
          <p className="text-minion-textMuted text-[10px]">Zero commercial breaks forever</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1">
        <button
          onClick={() => onSelectTab('home')}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'home'
              ? 'bg-minion-surfaceLight text-minion-yellow font-semibold shadow-sm'
              : 'text-minion-textMuted hover:text-white hover:bg-minion-surface/60'
          }`}
        >
          <Home className="w-5 h-5" />
          Home
        </button>

        <button
          onClick={() => onSelectTab('search')}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'search'
              ? 'bg-minion-surfaceLight text-minion-yellow font-semibold shadow-sm'
              : 'text-minion-textMuted hover:text-white hover:bg-minion-surface/60'
          }`}
        >
          <Search className="w-5 h-5" />
          Search & Browse
        </button>

        <button
          onClick={() => onSelectTab('library')}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'library'
              ? 'bg-minion-surfaceLight text-minion-yellow font-semibold shadow-sm'
              : 'text-minion-textMuted hover:text-white hover:bg-minion-surface/60'
          }`}
        >
          <Library className="w-5 h-5" />
          Your Library
        </button>
      </nav>

      <div className="my-5 border-t border-[#1E2028]" />

      {/* Secondary Navigation */}
      <div className="space-y-1">
        <button
          onClick={() => onSelectTab('liked')}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'liked'
              ? 'bg-minion-surfaceLight text-minion-yellow font-semibold'
              : 'text-minion-textMuted hover:text-white hover:bg-minion-surface/60'
          }`}
        >
          <div className="p-1 rounded bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
            <Heart className="w-3.5 h-3.5 fill-current" />
          </div>
          Liked Songs
        </button>

        <button
          onClick={() => onSelectTab('artist-dashboard')}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'artist-dashboard'
              ? 'bg-minion-surfaceLight text-minion-yellow font-semibold'
              : 'text-minion-textMuted hover:text-white hover:bg-minion-surface/60'
          }`}
        >
          <Award className="w-5 h-5 text-minion-yellow" />
          Artist Studio
        </button>

        <button
          onClick={() => onSelectTab('wrapped')}
          className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentTab === 'wrapped'
              ? 'bg-minion-surfaceLight text-minion-yellow font-semibold'
              : 'text-minion-textMuted hover:text-white hover:bg-minion-surface/60'
          }`}
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
          Minion Wrapped
        </button>
      </div>

      {/* Bottom Plus CTA */}
      <div className="mt-auto p-3.5 rounded-xl bg-gradient-to-br from-yellow-500/10 via-minion-yellow/5 to-transparent border border-minion-yellow/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-minion-yellow text-black uppercase">
            Plus
          </span>
          <span className="text-xs font-semibold text-white">Minion Plus</span>
        </div>
        <p className="text-[11px] text-minion-textMuted mb-2.5">
          Offline downloads & 320kbps lossless audio quality.
        </p>
        <button className="w-full py-1.5 px-3 rounded-lg bg-minion-yellow hover:bg-minion-yellowHover text-black text-xs font-bold transition-all shadow-sm">
          Upgrade $4.99/mo
        </button>
      </div>
    </aside>
  );
};
