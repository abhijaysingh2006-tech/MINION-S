'use client';

import React from 'react';
import {
  Home,
  Search,
  Library,
  Heart,
  Plus,
  Radio,
  Disc3,
  Flame,
  Globe2,
} from 'lucide-react';
import { SoundWaveLogo } from './SoundWaveLogo';

interface SoundWaveSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeProviderFilter?: string;
  onSelectProviderFilter?: (provider: string) => void;
}

export const SoundWaveSidebar: React.FC<SoundWaveSidebarProps> = ({
  currentTab,
  onSelectTab,
  activeProviderFilter,
  onSelectProviderFilter,
}) => {
  return (
    <aside className="w-64 md:w-72 bg-[#000000] p-2 flex flex-col gap-2 h-full select-none text-[#b3b3b3] shrink-0">
      {/* Top Brand & Navigation Box */}
      <div className="bg-[#121212] rounded-xl p-4 flex flex-col gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <SoundWaveLogo size={34} />
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              SoundWave
            </span>
            <span className="text-[10px] text-[#1ed760] font-semibold tracking-wider uppercase block">
              Stream Without Limits
            </span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex flex-col gap-2 font-semibold text-sm pt-2">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex items-center gap-4 px-3 py-2 rounded-lg transition-colors ${
              currentTab === 'home'
                ? 'bg-[#242424] text-white font-bold'
                : 'hover:text-white hover:bg-[#181818]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onSelectTab('search')}
            className={`flex items-center gap-4 px-3 py-2 rounded-lg transition-colors ${
              currentTab === 'search'
                ? 'bg-[#242424] text-white font-bold'
                : 'hover:text-white hover:bg-[#181818]'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Search & Discover</span>
          </button>
        </nav>
      </div>

      {/* Library & Provider Channels */}
      <div className="bg-[#121212] rounded-xl flex-1 p-4 flex flex-col gap-4 overflow-hidden">
        {/* Library Header */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => onSelectTab('library')}
            className="flex items-center gap-3 text-sm font-bold text-white hover:text-[#1ed760] transition-colors"
          >
            <Library className="w-5 h-5" />
            <span>Your Library</span>
          </button>
          <button className="p-1.5 rounded-full hover:bg-[#282828] text-[#b3b3b3] hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Legal Provider Filter Chips */}
        <div>
          <p className="text-[11px] font-bold text-[#717171] uppercase tracking-wider px-2 mb-2">
            Connected Music Sources
          </p>
          <div className="flex flex-wrap gap-1.5 px-1">
            {[
              { id: 'all', label: 'All Sources' },
              { id: 'jamendo', label: 'Jamendo' },
              { id: 'deezer', label: 'Deezer' },
              { id: 'youtube', label: 'YouTube' },
              { id: 'archive', label: 'Archive.org' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectProviderFilter?.(p.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  activeProviderFilter === p.id
                    ? 'bg-[#1ed760] text-black font-bold'
                    : 'bg-[#242424] text-[#b3b3b3] hover:text-white hover:bg-[#2e2e2e]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liked Songs Tile */}
        <div
          onClick={() => onSelectTab('favorites')}
          className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
            currentTab === 'favorites' ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
          }`}
        >
          <div className="w-11 h-11 rounded-md bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center text-white shrink-0 shadow">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">Liked Songs</p>
            <p className="text-xs text-[#a7a7a7] truncate">Playlist • Auto-saved</p>
          </div>
        </div>

        {/* Curated Playlists */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 border-t border-white/5 pt-3">
          {[
            { title: 'Top 50 Global Releases', desc: 'Deezer & Jamendo Charts', icon: Flame },
            { title: 'Open Audio & Classic Radio', desc: 'Internet Archive Public Domain', icon: Globe2 },
            { title: 'Creative Commons Lounge', desc: 'Commercial Free Streaming', icon: Disc3 },
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                onClick={() => onSelectTab('search')}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1e1e1e] cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded bg-[#242424] flex items-center justify-center text-[#1ed760] shrink-0">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                  <p className="text-[11px] text-[#7d7d7d] truncate">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
