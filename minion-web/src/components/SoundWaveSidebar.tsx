'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Library,
  Plus,
  Heart,
  Search,
  ListFilter,
  Volume2,
  Trash2,
  Play,
  ListPlus,
  User,
  Disc,
  X,
  Check,
} from 'lucide-react';
import { useSoundWaveStore, CustomPlaylist } from '@/lib/soundwaveStore';

export const SoundWaveSidebar: React.FC = () => {
  const {
    isLeftRailExpanded,
    toggleLeftRail,
    leftRailWidth,
    setLeftRailWidth,
    activeTab,
    setActiveTab,
    activePlaylistId,
    setActivePlaylistId,
    playlists,
    favorites,
    createPlaylist,
    deletePlaylist,
    playTrack,
    currentTrack,
    isPlaying,
    showToast,
  } = useSoundWaveStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'playlists' | 'artists' | 'albums'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    playlist: CustomPlaylist | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    playlist: null,
  });

  // Resizing state
  const isResizingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingRef.current) {
        setLeftRailWidth(e.clientX - 8); // subtract outer gap
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = 'default';
    };

    const handleClickOutside = () => {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [setLeftRailWidth]);

  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, pl: CustomPlaylist) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      playlist: pl,
    });
  };

  // Followed demo artists
  const followedArtists = [
    { name: 'Coldplay', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200', type: 'Artist' },
    { name: 'The Weeknd', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200', type: 'Artist' },
    { name: 'Guru Randhawa', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200', type: 'Artist' },
  ];

  const filteredPlaylists = playlists.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      style={{ width: isLeftRailExpanded ? `${leftRailWidth}px` : '72px' }}
      className="relative flex flex-col bg-[#121212] rounded-xl border border-[#1F1F1F] p-2 select-none shrink-0 transition-all duration-150 h-full overflow-hidden shadow-floating"
    >
      {/* 1. TOP HEADER: Library Toggle & '+' Create Playlist */}
      <div className="flex items-center justify-between px-2 py-3 border-b border-[#1F1F1F]/60">
        <button
          onClick={toggleLeftRail}
          className="flex items-center gap-3 text-sm font-bold text-[#B3B3B3] hover:text-white transition-colors group"
          title={isLeftRailExpanded ? 'Collapse Your Library' : 'Expand Your Library (Ctrl+B)'}
        >
          <Library className="w-6 h-6 group-hover:text-white" />
          {isLeftRailExpanded && <span className="font-bold">Your Library</span>}
        </button>

        {isLeftRailExpanded && (
          <button
            onClick={() => setIsCreating(true)}
            className="w-8 h-8 rounded-full hover:bg-[#1F1F1F] flex items-center justify-center text-[#B3B3B3] hover:text-white transition-all hover:scale-105"
            title="Create playlist"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. EXPANDED CONTROLS: Filter Chips (Playlists, Artists, Albums) + Mini Search & Sort */}
      {isLeftRailExpanded && (
        <div className="py-2.5 px-1 space-y-2 border-b border-[#1F1F1F]/60">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['all', 'playlists', 'artists', 'albums'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  activeFilter === filter
                    ? 'bg-[#232323] text-white border border-[#333333]'
                    : 'bg-transparent text-[#B3B3B3] hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search in Library & Sort Button */}
          <div className="flex items-center justify-between pt-1">
            {isSearchOpen ? (
              <div className="flex items-center gap-2 bg-[#1F1F1F] rounded-lg px-2 py-1 w-full border border-[#2B2B2B]">
                <Search className="w-3.5 h-3.5 text-[#B3B3B3]" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search in Library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-[#6A6A6A] focus:outline-none"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-[#B3B3B3] hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-1.5 rounded-full hover:bg-[#1F1F1F] text-[#B3B3B3] hover:text-white transition-colors"
                  title="Search in Library"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  onClick={() => showToast('Sorted by Recents', 'info')}
                  className="flex items-center gap-1.5 text-xs text-[#B3B3B3] hover:text-white font-medium px-2 py-1 rounded hover:bg-[#1F1F1F] transition-colors"
                >
                  <span>Recents</span>
                  <ListFilter className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. NEW PLAYLIST INPUT FORM */}
      {isCreating && isLeftRailExpanded && (
        <form
          onSubmit={handleCreateSubmit}
          className="mt-2 flex items-center gap-1.5 bg-[#1F1F1F] p-2 rounded-xl border border-[#FFD60A]/50 animate-in fade-in"
        >
          <input
            type="text"
            autoFocus
            placeholder="Playlist title..."
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            className="w-full bg-transparent text-xs text-white px-2 focus:outline-none placeholder-[#6A6A6A]"
          />
          <button
            type="submit"
            className="p-1 rounded bg-[#FFD60A] text-black hover:bg-yellow-400 font-bold"
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

      {/* 4. SCROLLABLE LIBRARY ITEMS LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 mt-2 pr-1">
        {/* Liked Songs Tile */}
        {activeFilter === 'all' || activeFilter === 'playlists' ? (
          <div
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
              activeTab === 'favorites'
                ? 'bg-[#232323] text-white shadow'
                : 'hover:bg-[#1A1A1A] text-[#B3B3B3] hover:text-white'
            }`}
            title="Liked Songs"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center text-white shrink-0 shadow">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            {isLeftRailExpanded && (
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-white truncate">Liked Songs</p>
                <p className="text-xs text-[#B3B3B3] truncate">
                  Playlist • {favorites.length} songs
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Custom Playlists */}
        {(activeFilter === 'all' || activeFilter === 'playlists') &&
          filteredPlaylists.map((pl) => {
            const isSelected = activeTab === 'playlist' && activePlaylistId === pl.id;
            return (
              <div
                key={pl.id}
                onClick={() => setActivePlaylistId(pl.id)}
                onContextMenu={(e) => handleContextMenu(e, pl)}
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all group ${
                  isSelected
                    ? 'bg-[#232323] text-white shadow'
                    : 'hover:bg-[#1A1A1A] text-[#B3B3B3] hover:text-white'
                }`}
                title={pl.name}
              >
                <img
                  src={pl.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
                  alt={pl.name}
                  className="w-12 h-12 rounded-lg object-cover shrink-0 shadow border border-white/5"
                />
                {isLeftRailExpanded && (
                  <div className="overflow-hidden flex-1">
                    <p
                      className={`text-sm font-bold truncate ${
                        isSelected ? 'text-[#FFD60A]' : 'text-white group-hover:text-white'
                      }`}
                    >
                      {pl.name}
                    </p>
                    <p className="text-xs text-[#B3B3B3] truncate">
                      Playlist • SoundWave User
                    </p>
                  </div>
                )}
                {/* Playing Equalizer Indicator */}
                {isPlaying && isSelected && isLeftRailExpanded && (
                  <div className="text-[#FFD60A] shrink-0">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}

        {/* Followed Artists (Circular Covers) */}
        {(activeFilter === 'all' || activeFilter === 'artists') &&
          followedArtists.map((artist, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActiveTab('search');
                showToast(`Viewing artist ${artist.name}`, 'info');
              }}
              className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-[#1A1A1A] text-[#B3B3B3] hover:text-white transition-all"
              title={artist.name}
            >
              <img
                src={artist.image}
                alt={artist.name}
                className="w-12 h-12 rounded-full object-cover shrink-0 shadow border border-white/5"
              />
              {isLeftRailExpanded && (
                <div className="overflow-hidden flex-1">
                  <p className="text-sm font-bold text-white truncate">{artist.name}</p>
                  <p className="text-xs text-[#B3B3B3] truncate">Artist</p>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* 5. RIGHT-CLICK CONTEXT MENU MODAL */}
      {contextMenu.visible && contextMenu.playlist && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed w-48 bg-[#232323] border border-[#333333] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in-50 text-xs"
        >
          <button
            onClick={() => {
              if (contextMenu.playlist) setActivePlaylistId(contextMenu.playlist.id);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2E2E2E] text-white flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 text-[#FFD60A]" />
            <span>Play Playlist</span>
          </button>
          <button
            onClick={() => {
              showToast('Playlist added to queue', 'success');
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2E2E2E] text-white flex items-center gap-2"
          >
            <ListPlus className="w-3.5 h-3.5 text-[#B3B3B3]" />
            <span>Add to Queue</span>
          </button>
          <div className="border-t border-[#333333] my-1" />
          <button
            onClick={() => {
              if (contextMenu.playlist) deletePlaylist(contextMenu.playlist.id);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Playlist</span>
          </button>
        </div>
      )}

      {/* 6. DRAGGABLE RESIZER HANDLE */}
      {isLeftRailExpanded && (
        <div
          onMouseDown={handleStartResize}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-[#FFD60A]/40 transition-colors z-20"
          title="Drag to resize library panel"
        />
      )}
    </aside>
  );
};
