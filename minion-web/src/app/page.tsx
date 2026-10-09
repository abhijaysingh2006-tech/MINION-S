'use client';

import React, { useState } from 'react';
import { SoundWaveSidebar } from '@/components/SoundWaveSidebar';
import { SoundWaveMainView } from '@/components/SoundWaveMainView';
import { SoundWavePlayerBar } from '@/components/SoundWavePlayerBar';
import { SoundWaveAudioEngine } from '@/lib/SoundWaveAudioEngine';

export default function Home() {
  const [currentTab, setCurrentTab] = useState('home');
  const [providerFilter, setProviderFilter] = useState('all');

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-white selection:bg-[#1ed760] selection:text-black">
      {/* Background Multi-Provider Audio Engine */}
      <SoundWaveAudioEngine />

      {/* Main 2-column Spotify/SoundWave Layout */}
      <div className="flex flex-1 overflow-hidden">
        <SoundWaveSidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activeProviderFilter={providerFilter}
          onSelectProviderFilter={setProviderFilter}
        />
        <SoundWaveMainView
          currentTab={currentTab}
          providerFilter={providerFilter}
        />
      </div>

      {/* Persistent Bottom Player Bar */}
      <SoundWavePlayerBar />
    </div>
  );
}
