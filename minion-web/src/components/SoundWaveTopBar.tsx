'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Home,
  Search,
  Compass,
  Bell,
  Users,
  Settings,
  Shield,
  Volume2,
  Sliders,
  LogOut,
  Sparkles,
  X,
} from 'lucide-react';
import { useSoundWaveStore } from '@/lib/soundwaveStore';
import { SoundWaveLogo } from './SoundWaveLogo';

export const SoundWaveTopBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    goBack,
    goForward,
    historyIndex,
    history,
    showToast,
  } = useSoundWaveStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  // Keep local search input synced with store
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce search update to store
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        setSearchQuery(localSearch);
        if (localSearch.trim() && activeTab !== 'search') {
          setActiveTab('search');
        }
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [localSearch]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  return (
    <header className="h-16 px-4 flex items-center justify-between gap-4 select-none z-40 bg-[#000000] text-white">
      {/* 1. LEFT CONTROLS: App Logo, '...' Menu, Back/Forward Arrows */}
      <div className="flex items-center gap-2 min-w-[200px]">
        {/* Brand Icon & '...' Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 rounded-full bg-[#121212] hover:bg-[#1A1A1A] flex items-center justify-center text-[#B3B3B3] hover:text-white transition-all border border-[#1F1F1F]"
            title="Menu options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute top-11 left-0 w-52 bg-[#232323] border border-[#333333] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in-50">
              <div className="px-3 py-2 border-b border-[#333333] flex items-center gap-2">
                <SoundWaveLogo size={20} />
                <span className="text-xs font-bold text-white">SoundWave v3.0</span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('home');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#2F2F2F] text-white flex items-center justify-between"
              >
                <span>Home Feed</span>
                <span className="text-[10px] text-[#6A6A6A]">Ctrl+H</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('search');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#2F2F2F] text-white flex items-center justify-between"
              >
                <span>Search Music</span>
                <span className="text-[10px] text-[#6A6A6A]">Ctrl+F</span>
              </button>
              <button
                onClick={() => {
                  showToast('SoundWave: 100% Legal Ad-Free Music Aggregator', 'info');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#2F2F2F] text-white"
              >
                About SoundWave
              </button>
            </div>
          )}
        </div>

        {/* Back and Forward Navigation History */}
        <div className="flex items-center gap-1.5 ml-1">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              canGoBack
                ? 'bg-[#121212] hover:bg-[#1A1A1A] text-white hover:scale-105'
                : 'bg-[#121212]/50 text-[#6A6A6A] cursor-not-allowed'
            }`}
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goForward}
            disabled={!canGoForward}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              canGoForward
                ? 'bg-[#121212] hover:bg-[#1A1A1A] text-white hover:scale-105'
                : 'bg-[#121212]/50 text-[#6A6A6A] cursor-not-allowed'
            }`}
            title="Go forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. CENTER: Round Home Button + 48px Wide Pill Search Bar */}
      <div className="flex items-center gap-2 max-w-2xl w-full justify-center">
        {/* Round Home Icon Button */}
        <button
          onClick={() => {
            setActiveTab('home');
            setSearchQuery('');
            setLocalSearch('');
          }}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
            activeTab === 'home' && !searchQuery
              ? 'bg-[#1F1F1F] text-[#FFD60A] scale-105 shadow-md'
              : 'bg-[#1F1F1F] text-[#B3B3B3] hover:text-white hover:scale-105'
          }`}
          title="Home"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* Wide Pill Search Input Container (48px high) */}
        <div className="relative flex-1 flex items-center h-12 rounded-full bg-[#1F1F1F] hover:bg-[#242424] focus-within:bg-[#242424] focus-within:ring-2 focus-within:ring-white border border-[#2B2B2B] transition-all px-4 group shadow-inner">
          <Search className="w-5 h-5 text-[#B3B3B3] group-focus-within:text-white shrink-0 mr-3" />
          
          <input
            type="text"
            placeholder="What do you want to play?"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onFocus={() => {
              if (activeTab !== 'search') setActiveTab('search');
            }}
            className="w-full bg-transparent text-sm text-white placeholder-[#B3B3B3] focus:outline-none font-medium"
          />

          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                setSearchQuery('');
              }}
              className="p-1 hover:bg-[#333333] rounded-full text-[#B3B3B3] hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Divider */}
          <div className="w-[1px] h-5 bg-[#383838] mx-2" />

          {/* Browse Icon Button */}
          <button
            onClick={() => {
              setActiveTab('search');
              showToast('Browsing all connected legal music streams', 'info');
            }}
            className="p-1.5 rounded-full hover:bg-[#2E2E2E] text-[#B3B3B3] hover:text-white transition-colors"
            title="Browse all genres & sources"
          >
            <Compass className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. RIGHT CONTROLS: Bell, Friends Activity, User Avatar with Status Dot */}
      <div className="flex items-center justify-end gap-2.5 min-w-[200px]">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-10 h-10 rounded-full bg-[#121212] hover:bg-[#1A1A1A] flex items-center justify-center text-[#B3B3B3] hover:text-white transition-colors relative"
            title="What's New"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FFD60A]" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute top-12 right-0 w-80 bg-[#232323] border border-[#333333] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in-50">
              <div className="flex items-center justify-between pb-3 border-b border-[#333333]">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFD60A]" /> What's New in SoundWave
                </h4>
              </div>
              <div className="mt-3 space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-[#1A1A1A]">
                  <p className="font-bold text-white">Live Karaoke Lyrics Active</p>
                  <p className="text-[#B3B3B3] mt-0.5">High-speed multilingual synced lyrics powered by open LrcLib.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1A1A1A]">
                  <p className="font-bold text-white">Multi-Provider Engine</p>
                  <p className="text-[#B3B3B3] mt-0.5">100% legal music from Jamendo, Deezer, YouTube & Archive.org.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Friends / Activity Icon */}
        <button
          onClick={() => showToast('Friend Activity feed coming in next update', 'info')}
          className="w-10 h-10 rounded-full bg-[#121212] hover:bg-[#1A1A1A] flex items-center justify-center text-[#B3B3B3] hover:text-white transition-colors hidden sm:flex"
          title="Friend Activity"
        >
          <Users className="w-4 h-4" />
        </button>

        {/* User Profile Avatar with Online Status Dot */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFD60A] to-[#2B5BA8] p-0.5 flex items-center justify-center hover:scale-105 transition-transform"
            title="User profile & settings"
          >
            <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center text-xs font-black text-[#FFD60A]">
              SW
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
          </button>

          {isSettingsOpen && (
            <div className="absolute top-12 right-0 w-64 bg-[#232323] border border-[#333333] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in-50 text-xs">
              <div className="px-3 py-2.5 border-b border-[#333333]">
                <p className="font-bold text-white">SoundWave Listener</p>
                <p className="text-[10px] text-[#B3B3B3]">listener@soundwave.app</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFD60A] text-black">
                  Zero Ads Forever
                </span>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    showToast('Audio stream quality set to High Fidelity (320kbps)', 'success');
                    setIsSettingsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#2E2E2E] text-white flex items-center gap-2.5"
                >
                  <Volume2 className="w-4 h-4 text-[#B3B3B3]" />
                  <span>Audio Quality: 320kbps</span>
                </button>

                <button
                  onClick={() => {
                    showToast('Settings saved to local preferences', 'info');
                    setIsSettingsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#2E2E2E] text-white flex items-center gap-2.5"
                >
                  <Sliders className="w-4 h-4 text-[#B3B3B3]" />
                  <span>Equalizer & Normalization</span>
                </button>

                <button
                  onClick={() => {
                    showToast('SoundWave is 100% legal & privacy-focused', 'info');
                    setIsSettingsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#2E2E2E] text-white flex items-center gap-2.5"
                >
                  <Shield className="w-4 h-4 text-[#B3B3B3]" />
                  <span>Privacy & Licenses</span>
                </button>
              </div>

              <div className="border-t border-[#333333] pt-1 mt-1">
                <button
                  onClick={() => {
                    showToast('Signed out of guest session', 'info');
                    setIsSettingsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#2E2E2E] text-red-400 hover:text-red-300 flex items-center gap-2.5 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
