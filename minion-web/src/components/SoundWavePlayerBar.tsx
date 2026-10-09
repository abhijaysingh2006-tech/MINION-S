'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Loader2,
  Mic2,
  ListMusic,
  Laptop2,
  Maximize2,
  Minimize2,
  Pipette,
  PictureInPicture2,
  Plus,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { useSoundWaveStore } from '@/lib/soundwaveStore';

export const SoundWavePlayerBar: React.FC = () => {
  const {
    currentTrack,
    queue,
    queueIndex,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    currentTime,
    duration,
    shuffle,
    repeat,
    favorites,
    isLyricsOpen,
    toggleLyrics,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    playlists,
    addTrackToPlaylist,
    playTrack,
    setIsRightPanelOpen,
    showToast,
  } = useSoundWaveStore();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [isHoveringVolume, setIsHoveringVolume] = useState(false);

  const isFavorited = currentTrack
    ? favorites.some((f) => f.id === currentTrack.id)
    : false;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Toggle Picture-in-Picture for video / mini floating
  const togglePiP = async () => {
    try {
      const video = document.querySelector('video');
      if (video && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await video.requestPictureInPicture();
        }
      } else {
        showToast('Picture-in-Picture active in SoundWave mode', 'info');
      }
    } catch {
      showToast('Mini-player not supported in this browser', 'info');
    }
  };

  return (
    <footer className="h-[90px] bg-[#000000] px-4 md:px-6 flex items-center justify-between select-none z-40 shrink-0 relative">
      {/* 1. LEFT: 56px COVER, TITLE & ACTIONS */}
      <div className="flex items-center gap-3.5 w-[30%] min-w-[220px]">
        {currentTrack ? (
          <>
            {/* 56px Cover Thumbnail */}
            <div
              onClick={() => setIsRightPanelOpen(true)}
              className="w-14 h-14 rounded-lg overflow-hidden bg-[#181818] cursor-pointer shadow-md shrink-0 relative group"
              title="Open Now Playing Panel"
            >
              <img
                src={
                  currentTrack.coverArtwork ||
                  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120'
                }
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Track Title & Artist */}
            <div className="overflow-hidden min-w-0 max-w-[190px] flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span
                  onClick={() => setIsRightPanelOpen(true)}
                  className="text-sm font-bold text-white truncate hover:underline hover:text-[#FFD60A] cursor-pointer"
                  title={currentTrack.title}
                >
                  {currentTrack.title}
                </span>
                {/* Badge tags */}
                {currentTrack.provider === 'deezer' && (
                  <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-pink-500/20 text-pink-300 shrink-0">
                    Preview
                  </span>
                )}
                {currentTrack.provider === 'youtube' && (
                  <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-red-500/20 text-red-300 shrink-0">
                    YouTube
                  </span>
                )}
              </div>
              <span className="text-xs text-[#B3B3B3] truncate hover:text-white cursor-pointer mt-0.5">
                {currentTrack.artist}
              </span>
            </div>

            {/* Like & Add Actions */}
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <button
                onClick={() => {
                  toggleFavorite(currentTrack);
                  showToast(
                    isFavorited ? 'Removed from Liked Songs' : 'Added to Liked Songs',
                    isFavorited ? 'info' : 'success'
                  );
                }}
                className="p-1.5 rounded-full hover:bg-white/10 transition-transform hover:scale-110"
                aria-label={isFavorited ? 'Unlike' : 'Like'}
                title={isFavorited ? 'Unlike' : 'Like'}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isFavorited ? 'fill-[#FFD60A] text-[#FFD60A]' : 'text-[#B3B3B3] hover:text-white'
                  }`}
                />
              </button>

              {/* Playlist popover toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-[#B3B3B3] hover:text-white transition-all"
                  title="Add to playlist"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {showPlaylistMenu && (
                  <div className="absolute left-0 bottom-12 w-48 bg-[#232323] border border-[#333333] rounded-lg shadow-2xl py-2 z-50 text-xs">
                    <div className="px-3 pb-1 text-[11px] font-bold text-[#888888] uppercase tracking-wider">
                      Add to Playlist
                    </div>
                    {playlists.map((pl) => (
                      <button
                        key={pl.id}
                        onClick={() => {
                          addTrackToPlaylist(pl.id, currentTrack.id);
                          setShowPlaylistMenu(false);
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-[#2F2F2F] text-white truncate flex items-center justify-between"
                      >
                        <span>{pl.name}</span>
                        {pl.trackIds.includes(currentTrack.id) && (
                          <Check className="w-3.5 h-3.5 text-[#FFD60A]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-xs text-[#6A6A6A]">Play a song to begin streaming</div>
        )}
      </div>

      {/* 2. CENTER: PLAYBACK CONTROLS & 4PX PROGRESS BAR (Max-w 720px) */}
      <div className="flex flex-col items-center justify-center max-w-[720px] w-[42%] min-w-[300px] gap-1.5">
        {/* Top Controls Row */}
        <div className="flex items-center gap-6">
          {/* Shuffle Button (Active = Yellow with dot beneath) */}
          <button
            onClick={toggleShuffle}
            className={`relative p-1 transition-colors ${
              shuffle ? 'text-[#FFD60A]' : 'text-[#B3B3B3] hover:text-white'
            }`}
            title="Toggle Shuffle"
          >
            <Shuffle className="w-4 h-4" />
            {shuffle && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FFD60A] rounded-full" />
            )}
          </button>

          {/* Previous Track */}
          <button
            onClick={prevTrack}
            className="p-1 text-[#B3B3B3] hover:text-white hover:scale-110 active:scale-95 transition-all"
            title="Previous (Ctrl+Left)"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Main 40px Circle Play/Pause Button (White circle, black icon) */}
          <button
            onClick={togglePlay}
            disabled={isLoading || !currentTrack}
            className="w-10 h-10 rounded-full bg-white hover:bg-[#FFD60A] active:scale-95 text-black flex items-center justify-center shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-black" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-black text-black" />
            ) : (
              <Play className="w-5 h-5 fill-black text-black translate-x-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            className="p-1 text-[#B3B3B3] hover:text-white hover:scale-110 active:scale-95 transition-all"
            title="Next (Ctrl+Right)"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat Button (Active = Yellow with dot beneath) */}
          <button
            onClick={toggleRepeat}
            className={`relative p-1 transition-colors ${
              repeat !== 'off' ? 'text-[#FFD60A]' : 'text-[#B3B3B3] hover:text-white'
            }`}
            title={`Repeat: ${repeat}`}
          >
            {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            {repeat !== 'off' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FFD60A] rounded-full" />
            )}
          </button>
        </div>

        {/* Bottom 4px Progress Bar Row */}
        <div className="w-full flex items-center gap-2 text-xs font-mono text-[#B3B3B3]">
          <span className="w-10 text-right text-[11px] tabular-nums">
            {formatTime(currentTime)}
          </span>

          {/* Interactive Progress Bar */}
          <div
            onMouseEnter={() => setIsHoveringProgress(true)}
            onMouseLeave={() => setIsHoveringProgress(false)}
            className="relative flex-1 h-1 hover:h-1.5 bg-[#4D4D4D] rounded-full cursor-pointer flex items-center transition-all group"
          >
            {/* Filled Progress */}
            <div
              className={`h-full rounded-full transition-colors relative ${
                isHoveringProgress ? 'bg-[#FFD60A]' : 'bg-white'
              }`}
              style={{ width: `${progressPercent}%` }}
            >
              {/* Draggable Knob (Visible on hover only) */}
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-opacity ${
                  isHoveringProgress ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}
              />
            </div>

            {/* Transparent HTML5 range overlay for seamless drag seeking */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Progress scrubber"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <span className="w-10 text-left text-[11px] tabular-nums text-[#6A6A6A]">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 3. RIGHT: LYRICS, QUEUE, DEVICES, VOLUME (100PX), MINI-PLAYER, FULLSCREEN */}
      <div className="flex items-center justify-end gap-3 w-[30%] min-w-[240px] text-[#B3B3B3]">
        {/* Live Lyrics Button */}
        <button
          onClick={toggleLyrics}
          className={`p-1.5 rounded-full transition-all relative ${
            isLyricsOpen ? 'text-[#FFD60A]' : 'hover:text-white'
          }`}
          title="Lyrics"
        >
          <Mic2 className="w-4 h-4" />
          {isLyricsOpen && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FFD60A] rounded-full" />
          )}
        </button>

        {/* Queue Drawer Button */}
        <div className="relative">
          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-1.5 rounded-full transition-all relative ${
              isQueueOpen ? 'text-[#FFD60A]' : 'hover:text-white'
            }`}
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
            {isQueueOpen && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FFD60A] rounded-full" />
            )}
          </button>

          {/* Mini Queue Popover */}
          {isQueueOpen && (
            <div className="absolute right-0 bottom-12 w-80 max-h-96 bg-[#232323] border border-[#333333] rounded-xl shadow-2xl p-3 z-50 overflow-y-auto space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Play Queue ({queue.length})
                </span>
                <button
                  onClick={() => setIsQueueOpen(false)}
                  className="p-1 text-[#B3B3B3] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1">
                {queue.map((t, idx) => (
                  <div
                    key={`${t.id}-${idx}`}
                    onClick={() => playTrack(t, queue)}
                    className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer text-xs ${
                      currentTrack?.id === t.id
                        ? 'bg-[#181818] text-[#FFD60A] font-bold'
                        : 'hover:bg-[#2A2A2A] text-white'
                    }`}
                  >
                    <span className="w-4 text-[10px] text-[#6A6A6A] text-center">{idx + 1}</span>
                    <img
                      src={t.coverArtwork}
                      alt={t.title}
                      className="w-7 h-7 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1 truncate">
                      <p className="truncate">{t.title}</p>
                      <p className="text-[10px] text-[#B3B3B3] truncate">{t.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Connect to a Device */}
        <div className="relative">
          <button
            onClick={() => setIsDevicesOpen(!isDevicesOpen)}
            className={`p-1.5 rounded-full transition-all ${
              isDevicesOpen ? 'text-[#FFD60A]' : 'hover:text-white'
            }`}
            title="Connect to a device"
          >
            <Laptop2 className="w-4 h-4" />
          </button>

          {isDevicesOpen && (
            <div className="absolute right-0 bottom-12 w-64 bg-[#232323] border border-[#333333] rounded-xl shadow-2xl p-3 z-50 text-xs space-y-2">
              <span className="font-bold text-white block">Current Device</span>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#181818] text-[#FFD60A] font-bold">
                <Laptop2 className="w-4 h-4" />
                <div>
                  <p>Web Browser</p>
                  <p className="text-[10px] font-normal text-[#B3B3B3]">SoundWave Audio Engine</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Volume Controls & 100px Slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="hover:text-white transition-colors p-1"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {/* 100px Custom Volume Slider */}
          <div
            onMouseEnter={() => setIsHoveringVolume(true)}
            onMouseLeave={() => setIsHoveringVolume(false)}
            className="relative w-[100px] h-1 hover:h-1.5 bg-[#4D4D4D] rounded-full cursor-pointer flex items-center transition-all group"
          >
            <div
              className={`h-full rounded-full transition-colors relative ${
                isHoveringVolume ? 'bg-[#FFD60A]' : 'bg-white'
              }`}
              style={{ width: `${volumePercent}%` }}
            >
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-opacity ${
                  isHoveringVolume ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}
              />
            </div>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume slider"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Mini-player (Picture-in-Picture) */}
        <button
          onClick={togglePiP}
          className="p-1.5 rounded-full hover:text-white transition-colors hidden sm:inline-flex"
          title="Mini-player"
        >
          <PictureInPicture2 className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-full hover:text-white transition-colors hidden sm:inline-flex"
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </footer>
  );
};
