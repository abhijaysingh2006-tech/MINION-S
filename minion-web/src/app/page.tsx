'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MainFeed } from '@/components/MainFeed';
import { PlayerBar } from '@/components/PlayerBar';
import { RightNowPlayingPanel } from '@/components/RightNowPlayingPanel';
import { SyncedLyricsModal } from '@/components/SyncedLyricsModal';
import { ArtistDashboard } from '@/components/ArtistDashboard';
import { MinionWrapped } from '@/components/MinionWrapped';
import { usePlayerStore } from '@/lib/playerStore';

export default function Home() {
  const [currentTab, setCurrentTab] = useState('home');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { setAudioElement, setCurrentTime, setDuration, nextTrack } = usePlayerStore();

  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current);
    }
  }, [setAudioElement]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-minion-bg text-white">
      {/* Hidden audio element for continuous web playback */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={nextTrack}
        crossOrigin="anonymous"
      />

      {/* Main 3-column Layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        <main className="flex-1 flex flex-col overflow-hidden bg-[#0F0F12]">
          {currentTab === 'artist-dashboard' ? (
            <ArtistDashboard />
          ) : currentTab === 'wrapped' ? (
            <MinionWrapped />
          ) : (
            <MainFeed currentTab={currentTab} />
          )}
        </main>

        <RightNowPlayingPanel />
      </div>

      {/* Persistent Bottom Audio Player Bar */}
      <PlayerBar />

      {/* Synced Lyrics Full-Screen Overlay */}
      <SyncedLyricsModal />
    </div>
  );
}
