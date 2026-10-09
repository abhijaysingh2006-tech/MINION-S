'use client';

import React from 'react';
import {
  Home,
  Search,
  Library,
  Plus,
  Heart,
  Music2,
  Bookmark,
  Radio,
  ListMusic,
} from 'lucide-react';
import { MinionLogo } from './MinionLogo';

interface SpotifySidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const SpotifySidebar: React.FC<SpotifySidebarProps> = ({ currentTab, onSelectTab }) => {
  return (
    <aside className="w-72 bg-[#000000] p-2 flex flex-col gap-2 h-full select-none text-[#b3b3b3]">
      {/* Top Box: Home & Search */}
      <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-5">
        <div className="flex items-center gap-3 px-2">
          <MinionLogo size={32} />
          <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
            Minion
          </span>
          <span className="text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded bg-[#1db954] text-black uppercase ml-auto">
            Zero Ads
          </span>
        </div>

        <nav className="flex flex-col gap-4 font-semibold text-sm">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex items-center gap-4 px-2 transition-colors ${
              currentTab === 'home' ? 'text-white' : 'hover:text-white'
            }`}
          >
            <Home className="w-6 h-6" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onSelectTab('search')}
            className={`flex items-center gap-4 px-2 transition-colors ${
              currentTab === 'search' ? 'text-white' : 'hover:text-white'
            }`}
          >
            <Search className="w-6 h-6" />
            <span>Search YouTube</span>
          </button>
        </nav>
      </div>

      {/* Library Box */}
      <div className="bg-[#121212] rounded-lg flex-1 p-4 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => onSelectTab('library')}
            className="flex items-center gap-3 text-sm font-semibold hover:text-white transition-colors"
          >
            <Library className="w-6 h-6" />
            <span>Your Library</span>
          </button>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded-full hover:bg-[#242424] hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills (Playlists, Artists, Albums) */}
        <div className="flex items-center gap-2 px-1">
          <button className="px-3 py-1 rounded-full bg-[#242424] text-xs font-semibold text-white hover:bg-[#2a2a2a]">
            Playlists
          </button>
          <button className="px-3 py-1 rounded-full bg-[#242424] text-xs font-semibold text-white hover:bg-[#2a2a2a]">
            Artists
          </button>
        </div>

        {/* Playlists list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          <div
            onClick={() => onSelectTab('liked')}
            className={`flex items-center gap-3 p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer transition-colors ${
              currentTab === 'liked' ? 'bg-[#242424]' : ''
            }`}
          >
            <div className="w-12 h-12 rounded bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center text-white shrink-0">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">Liked Songs</p>
              <p className="text-xs text-[#a7a7a7] truncate">Playlist • YouTube Favorites</p>
            </div>
          </div>

          {[
            { title: "Today's Top Global Hits", author: 'Minion / YouTube', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100' },
            { title: 'Lofi Chill Study Beats', author: 'YouTube Lofi', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100' },
            { title: 'Hip Hop Classics & Modern', author: 'Minion Curated', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer transition-colors"
            >
              <img src={item.cover} alt={item.title} className="w-12 h-12 rounded object-cover shrink-0" />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                <p className="text-xs text-[#a7a7a7] truncate">Playlist • {item.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
