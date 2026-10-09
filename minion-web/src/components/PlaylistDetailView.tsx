'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Shuffle,
  Heart,
  MoreHorizontal,
  Clock,
  Search,
  ArrowLeft,
  Trash2,
  Share2,
  ListPlus,
  Music,
  UserCheck,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { UnifiedTrack } from '@/lib/musicProviders/types';
import { useSoundWaveStore } from '@/lib/soundwaveStore';
import { extractDominantColor, DEFAULT_GRADIENT_COLOR } from '@/lib/colorExtractor';

interface PlaylistDetailViewProps {
  type: 'playlist' | 'favorites' | 'artist' | 'album';
  title: string;
  description?: string;
  coverUrl?: string;
  ownerName?: string;
  tracks: UnifiedTrack[];
  isCustomPlaylist?: boolean;
  playlistId?: string;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  type,
  title,
  description,
  coverUrl,
  ownerName = 'SoundWave',
  tracks,
  isCustomPlaylist = false,
  playlistId,
}) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    favorites,
    toggleFavorite,
    deletePlaylist,
    setActiveTab,
    shuffle,
    toggleShuffle,
    showToast,
  } = useSoundWaveStore();

  const [dominantColor, setDominantColor] = useState(DEFAULT_GRADIENT_COLOR);
  const [filterQuery, setFilterQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Extract vibrant dominant color for the large header gradient
  useEffect(() => {
    if (coverUrl) {
      extractDominantColor(coverUrl).then((color) => {
        setDominantColor(color);
      });
    } else if (type === 'favorites') {
      setDominantColor('#4C1D95'); // Deep purple for Liked Songs
    }
  }, [coverUrl, type]);

  // Compute total duration in minutes & seconds
  const totalSeconds = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalMinutes = Math.floor(totalSeconds / 60);

  // Filter tracks if searching within the table
  const filteredTracks = tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (t.album && t.album.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const isCurrentPlaylistPlaying =
    isPlaying && currentTrack && tracks.some((t) => t.id === currentTrack.id);

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    if (isCurrentPlaylistPlaying) {
      togglePlay();
    } else {
      playTrack(tracks[0], tracks);
    }
  };

  const getSourceBadge = (provider: string) => {
    switch (provider) {
      case 'jamendo':
        return <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">Jamendo</span>;
      case 'deezer':
        return <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded">Deezer</span>;
      case 'youtube':
        return <span className="bg-red-600/20 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded">YouTube</span>;
      case 'archive':
        return <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">Archive.org</span>;
      default:
        return <span className="bg-gray-500/20 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded">SoundWave</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* 1. LARGE DYNAMIC GRADIENT HEADER */}
      <div
        className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-end gap-6 transition-colors duration-700"
        style={{
          background: `linear-gradient(180deg, ${dominantColor} 0%, rgba(18, 18, 18, 0.95) 100%)`,
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => setActiveTab('home')}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all hover:scale-105 z-20"
          title="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* 232px High-Res Cover Artwork */}
        <div
          className={`w-44 h-44 md:w-[232px] md:h-[232px] shrink-0 overflow-hidden shadow-2xl relative bg-[#181818] mt-6 md:mt-0 ${
            type === 'artist' ? 'rounded-full' : 'rounded-xl'
          }`}
        >
          {type === 'favorites' ? (
            <div className="w-full h-full bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#FFD60A] flex items-center justify-center shadow-inner">
              <Heart className="w-24 h-24 text-white fill-white drop-shadow-xl" />
            </div>
          ) : (
            <img
              src={
                coverUrl ||
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600'
              }
              alt={title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Collection Meta Info */}
        <div className="flex-1 flex flex-col justify-end space-y-2 select-none">
          <span className="text-xs font-black uppercase tracking-widest text-white/90">
            {type === 'artist' ? 'Verified Artist' : type.toUpperCase()}
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
            {title}
          </h1>

          {description && (
            <p className="text-xs md:text-sm text-[#B3B3B3] line-clamp-2 max-w-2xl">
              {description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs md:text-sm text-white/90 pt-2 font-medium">
            <span className="font-bold text-white">{ownerName}</span>
            <span>•</span>
            <span>{tracks.length} songs</span>
            {totalMinutes > 0 && (
              <>
                <span>•</span>
                <span className="text-[#B3B3B3]">about {totalMinutes} min</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. STICKY ACTION ROW */}
      <div className="sticky top-0 bg-[#121212]/95 backdrop-blur-md z-20 px-6 md:px-8 py-4 flex items-center justify-between border-b border-[#1E1E1E]">
        <div className="flex items-center gap-4">
          {/* Big 56px Play Button */}
          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            aria-label={isCurrentPlaylistPlaying ? 'Pause collection' : 'Play collection'}
            className="w-14 h-14 rounded-full bg-[#FFD60A] hover:bg-[#FFE033] active:scale-95 text-black flex items-center justify-center shadow-xl hover:scale-105 transition-all disabled:opacity-50"
          >
            {isCurrentPlaylistPlaying ? (
              <Pause className="w-6 h-6 fill-black" />
            ) : (
              <Play className="w-6 h-6 fill-black translate-x-0.5" />
            )}
          </button>

          {/* Shuffle Toggle */}
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-full hover:bg-[#1E1E1E] transition-all ${
              shuffle ? 'text-[#FFD60A]' : 'text-[#B3B3B3] hover:text-white'
            }`}
            title="Shuffle collection"
          >
            <Shuffle className="w-6 h-6" />
          </button>

          {/* Follow / Heart Button */}
          {type === 'artist' ? (
            <button
              onClick={() => {
                setIsFollowing(!isFollowing);
                showToast(isFollowing ? `Unfollowed ${title}` : `Following ${title}`, 'info');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                isFollowing
                  ? 'border-[#FFD60A] text-[#FFD60A] bg-transparent'
                  : 'border-white/40 text-white hover:border-white'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          ) : (
            <button
              onClick={() => {
                showToast('Playlist pinned to library', 'success');
              }}
              className="p-2.5 rounded-full hover:bg-[#1E1E1E] text-[#B3B3B3] hover:text-[#FFD60A] transition-all"
              title="Pin to Library"
            >
              <Heart className="w-6 h-6" />
            </button>
          )}

          {/* More Options Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2.5 rounded-full hover:bg-[#1E1E1E] text-[#B3B3B3] hover:text-white transition-all"
              title="More options"
            >
              <MoreHorizontal className="w-6 h-6" />
            </button>

            {showMenu && (
              <div className="absolute left-0 top-12 w-48 bg-[#232323] border border-[#333333] rounded-lg shadow-2xl py-1 z-30 text-xs">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('Playlist link copied', 'success');
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#2F2F2F] flex items-center gap-2 text-white"
                >
                  <Share2 className="w-4 h-4 text-[#B3B3B3]" /> Share Link
                </button>
                {isCustomPlaylist && playlistId && (
                  <button
                    onClick={() => {
                      deletePlaylist(playlistId);
                      setActiveTab('library');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-[#2F2F2F] flex items-center gap-2 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Playlist
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search within playlist */}
        <div className="relative max-w-xs w-full hidden sm:block">
          <Search className="w-4 h-4 text-[#6A6A6A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search in playlist"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[#181818] border border-[#2B2B2B] focus:border-[#FFD60A] text-xs text-white placeholder-[#6A6A6A] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* 3. 56PX TRACK TABLE (# | Title | Album | Source | Duration) */}
      <div className="px-6 md:px-8 py-4 flex-1">
        {/* Table Column Headers */}
        <div className="grid grid-cols-12 px-4 py-2 text-xs font-bold text-[#6A6A6A] uppercase tracking-wider border-b border-[#242424]">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 sm:col-span-5">Title</div>
          <div className="hidden sm:block sm:col-span-3">Album</div>
          <div className="col-span-3 sm:col-span-2 text-center">Source</div>
          <div className="col-span-2 sm:col-span-1 text-right flex items-center justify-end">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Track Rows */}
        {filteredTracks.length === 0 ? (
          <div className="text-center py-16 text-[#6A6A6A]">
            <Music className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-white">No tracks in this collection</p>
            <p className="text-xs mt-1">Add songs from the home shelves or search bar</p>
          </div>
        ) : (
          <div className="space-y-1 mt-2">
            {filteredTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isCurrentlyPlaying = isCurrent && isPlaying;
              const isFav = favorites.some((f) => f.id === track.id);

              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => playTrack(track, filteredTracks)}
                  className={`group grid grid-cols-12 items-center h-14 px-4 rounded-lg cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-[#232323] text-[#FFD60A]'
                      : 'hover:bg-[#1E1E1E] text-white'
                  }`}
                >
                  {/* Column 1: Track Number / Animated Equalizer / Hover Play */}
                  <div className="col-span-1 text-center text-xs text-[#6A6A6A] font-semibold flex items-center justify-center">
                    {isCurrentlyPlaying ? (
                      <span className="w-3.5 h-3.5 flex items-end justify-between gap-[1px]">
                        <span className="w-[2px] bg-[#FFD60A] h-full animate-pulse" />
                        <span className="w-[2px] bg-[#FFD60A] h-2/3 animate-pulse delay-75" />
                        <span className="w-[2px] bg-[#FFD60A] h-4/5 animate-pulse delay-150" />
                      </span>
                    ) : (
                      <>
                        <span className="group-hover:hidden">{idx + 1}</span>
                        <Play className="w-4 h-4 fill-white text-white hidden group-hover:block" />
                      </>
                    )}
                  </div>

                  {/* Column 2: 40px Artwork + Title & Artist */}
                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                    <img
                      src={
                        track.coverArtwork ||
                        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'
                      }
                      alt={track.title}
                      className="w-10 h-10 rounded-md object-cover shrink-0 bg-[#181818]"
                    />
                    <div className="min-w-0 flex-1 truncate">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-[#FFD60A]' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-xs text-[#B3B3B3] truncate">{track.artist}</p>
                    </div>
                  </div>

                  {/* Column 3: Album */}
                  <div className="hidden sm:block sm:col-span-3 text-xs text-[#B3B3B3] truncate pr-2">
                    {track.album || 'Single'}
                  </div>

                  {/* Column 4: Provider Source */}
                  <div className="col-span-3 sm:col-span-2 text-center">
                    {getSourceBadge(track.provider)}
                  </div>

                  {/* Column 5: Heart & Duration */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-2 text-xs font-mono text-[#B3B3B3]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track);
                        showToast(
                          isFav ? 'Removed from Liked Songs' : 'Added to Liked Songs',
                          isFav ? 'info' : 'success'
                        );
                      }}
                      className={`p-1 transition-all ${
                        isFav
                          ? 'text-[#FFD60A]'
                          : 'text-[#6A6A6A] hover:text-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-[#FFD60A]' : ''}`} />
                    </button>
                    <span>{track.durationFormatted || '3:30'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
