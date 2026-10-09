'use client';

import React, { useState } from 'react';
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
  FolderPlus,
  Check,
  X,
} from 'lucide-react';
import { SoundWaveLogo } from './SoundWaveLogo';
import { useSoundWaveStore } from '@/lib/soundwaveStore';

export const SoundWaveSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activePlaylistId,
    setActivePlaylistId,
    activeProviderFilter,
    setActiveProviderFilter,
    playlists,
    createPlaylist,
    showToast,
  } = useSoundWaveStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  const providers = [
    { id: 'all', label: 'All Sources' },
    { id: 'jamendo', label: 'Jamendo' },
    { id: 'deezer', label: 'Deezer' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'archive', label: 'Archive.org' },
  ];

  return (
    <aside className="w-[240px] md:w-[260px] bg-[#000000] p-3 flex flex-col gap-2 h-full select-none text-[#94A3B8] shrink-0 border-r border-[#18191E]">
      {/* Top Box: Brand & Main Navigation */}
      <div className="bg-[#18191E] rounded-2xl p-4 flex flex-col gap-3 border border-[#24252B]/60 shadow-lg">
        {/* Brand Header */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer py-1 group"
        >
          <SoundWaveLogo size={36} />
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5 group-hover:text-[#FFD60A] transition-colors">
              SoundWave
            </span>
            <span className="text-[10px] text-[#FFD60A] font-bold tracking-widest uppercase block">
              Music, No Limits
            </span>
          </div>
        </div>

        {/* Primary Navigation Buttons */}
        <nav className="flex flex-col gap-1.5 font-semibold text-sm pt-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all ${
              activeTab === 'home'
                ? 'bg-[#24252B] text-[#FFD60A] font-bold shadow'
                : 'hover:text-white hover:bg-[#202127]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all ${
              activeTab === 'search'
                ? 'bg-[#24252B] text-[#FFD60A] font-bold shadow'
                : 'hover:text-white hover:bg-[#202127]'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Search & Discover</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all ${
              activeTab === 'library'
                ? 'bg-[#24252B] text-[#FFD60A] font-bold shadow'
                : 'hover:text-white hover:bg-[#202127]'
            }`}
          >
            <Library className="w-5 h-5" />
            <span>Your Library</span>
          </button>
        </nav>
      </div>

      {/* Library & Provider Drawer Box */}
      <div className="bg-[#18191E] rounded-2xl flex-1 p-4 flex flex-col gap-4 overflow-hidden border border-[#24252B]/60 shadow-lg">
        {/* Connected Sources Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
              Music Sources
            </span>
            <span className="w-2 h-2 rounded-full bg-[#FFD60A] animate-pulse" />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {providers.map((p) => {
              const isSelected = activeProviderFilter === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProviderFilter(p.id);
                    showToast(`Filtering by ${p.label}`, 'info');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#FFD60A] text-black shadow-md scale-105'
                      : 'bg-[#24252B] text-[#94A3B8] hover:text-white hover:bg-[#2e3038]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Liked Songs Entry */}
        <div
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
            activeTab === 'favorites'
              ? 'bg-[#24252B] text-white ring-1 ring-[#FFD60A]/40'
              : 'hover:bg-[#202127] text-[#94A3B8] hover:text-white'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center text-white shrink-0 shadow">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">Liked Songs</p>
            <p className="text-[11px] text-[#94A3B8] truncate">Favorites Playlist</p>
          </div>
        </div>

        {/* Playlists Header & Create Button */}
        <div className="border-t border-[#24252B] pt-3 flex flex-col gap-2 flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Playlists
            </span>
            <button
              onClick={() => setIsCreating(true)}
              className="p-1 rounded-lg hover:bg-[#24252B] text-[#FFD60A] hover:text-white transition-colors"
              title="Create new playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Playlist Creation Input */}
          {isCreating && (
            <form onSubmit={handleCreateSubmit} className="flex items-center gap-1.5 bg-[#0F0F12] p-1.5 rounded-xl border border-[#FFD60A]/50">
              <input
                type="text"
                autoFocus
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full bg-transparent text-xs text-white px-2 focus:outline-none placeholder-[#64748B]"
              />
              <button
                type="submit"
                className="p-1 rounded bg-[#FFD60A] text-black hover:bg-yellow-400"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="p-1 rounded hover:bg-white/10 text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Scrollable Playlists List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {playlists.map((pl) => {
              const isSelected = activeTab === 'playlist' && activePlaylistId === pl.id;
              return (
                <div
                  key={pl.id}
                  onClick={() => setActivePlaylistId(pl.id)}
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#24252B] text-[#FFD60A] font-bold'
                      : 'hover:bg-[#202127] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#24252B] flex items-center justify-center text-[#FFD60A] shrink-0 text-xs font-bold">
                    ♪
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold truncate text-white">{pl.name}</p>
                    <p className="text-[10px] text-[#64748B] truncate">{pl.description || 'Custom playlist'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
