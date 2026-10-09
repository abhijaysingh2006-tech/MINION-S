'use client';

import React, { useState } from 'react';
import { SpotifySidebar } from '@/components/SpotifySidebar';
import { SpotifyMainView } from '@/components/SpotifyMainView';
import { SpotifyPlayerBar } from '@/components/SpotifyPlayerBar';
import { YouTubeBackgroundPlayer } from '@/lib/YouTubeBackgroundPlayer';

export default function Home() {
  const [currentTab, setCurrentTab] = useState('home');

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-white selection:bg-[#1db954] selection:text-black">
      {/* Background YouTube audio handler */}
      <YouTubeBackgroundPlayer />

      {/* Main Spotify 2-column Layout */}
      <div className="flex flex-1 overflow-hidden">
        <SpotifySidebar currentTab={currentTab} onSelectTab={setCurrentTab} />
        <SpotifyMainView currentTab={currentTab} />
      </div>

      {/* Persistent Spotify Bottom Player Bar */}
      <SpotifyPlayerBar />
    </div>
  );
}
