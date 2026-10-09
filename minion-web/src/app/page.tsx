'use client';

import React from 'react';
import { SoundWaveSidebar } from '@/components/SoundWaveSidebar';
import { SoundWaveMainView } from '@/components/SoundWaveMainView';
import { SoundWavePlayerBar } from '@/components/SoundWavePlayerBar';
import { SoundWaveAudioEngine } from '@/lib/SoundWaveAudioEngine';
import { ToastContainer } from '@/components/ToastContainer';

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0F0F12] text-white selection:bg-[#FFD60A] selection:text-black">
      {/* Background Audio Routing Engine (HTML5 Audio + YouTube IFrame) */}
      <SoundWaveAudioEngine />

      {/* Global Interactive Notification Toasts */}
      <ToastContainer />

      {/* Main Spotify-style 2-Column Application Layout */}
      <div className="flex flex-1 overflow-hidden">
        <SoundWaveSidebar />
        <SoundWaveMainView />
      </div>

      {/* Persistent Bottom Player Bar (80px) */}
      <SoundWavePlayerBar />
    </div>
  );
}
