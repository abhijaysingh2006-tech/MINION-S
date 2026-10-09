'use client';

import React, { useEffect } from 'react';
import { SoundWaveTopBar } from '@/components/SoundWaveTopBar';
import { SoundWaveSidebar } from '@/components/SoundWaveSidebar';
import { SoundWaveMainView } from '@/components/SoundWaveMainView';
import { NowPlayingPanel } from '@/components/NowPlayingPanel';
import { SoundWavePlayerBar } from '@/components/SoundWavePlayerBar';
import { SoundWaveAudioEngine } from '@/lib/SoundWaveAudioEngine';
import { ToastContainer } from '@/components/ToastContainer';
import { LyricsView } from '@/components/LyricsView';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileNowPlayingSheet } from '@/components/MobileNowPlayingSheet';
import { useSoundWaveStore } from '@/lib/soundwaveStore';

export default function Home() {
  const {
    togglePlay,
    prevTrack,
    nextTrack,
    toggleLeftRail,
    toggleRightPanel,
    setActiveTab,
    showToast,
  } = useSoundWaveStore();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside input / textarea
      if (
        ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Space: Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }

      // Ctrl + Left / Right: Prev / Next
      if (e.ctrlKey && e.code === 'ArrowLeft') {
        e.preventDefault();
        prevTrack();
      }
      if (e.ctrlKey && e.code === 'ArrowRight') {
        e.preventDefault();
        nextTrack();
      }

      // Ctrl + F: Focus search
      if (e.ctrlKey && e.code === 'KeyF') {
        e.preventDefault();
        setActiveTab('search');
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        input?.focus();
      }

      // Ctrl + B: Toggle Left Library Rail
      if (e.ctrlKey && e.code === 'KeyB') {
        e.preventDefault();
        toggleLeftRail();
      }

      // Ctrl + Shift + N: Toggle Right Now Playing Panel
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyN') {
        e.preventDefault();
        toggleRightPanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, prevTrack, nextTrack, toggleLeftRail, toggleRightPanel, setActiveTab]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#000000] text-white select-none relative">
      {/* Background Audio Engine (HTML5 + YouTube IFrame) */}
      <SoundWaveAudioEngine />

      {/* Real-time feedback and notification toasts */}
      <ToastContainer />

      {/* Full-Screen Synced Lyrics Modal */}
      <LyricsView />

      {/* Full-Screen Mobile Now Playing Sheet (<900px) */}
      <MobileNowPlayingSheet />

      {/* 1. TOP BAR (64px) */}
      <SoundWaveTopBar />

      {/* 2. MAIN 3-PANEL FLOATING CARD AREA (Flex min-height 0, 8px outer margins/gaps) */}
      <div className="flex-1 flex overflow-hidden px-2 pb-2 md:pb-2 gap-2 min-h-0 mb-16 md:mb-0">
        {/* Left Library Rail */}
        <SoundWaveSidebar />

        {/* Center Main Content Panel */}
        <SoundWaveMainView />

        {/* Right Now Playing Panel (Collapsible / Responsive hidden under 1200px) */}
        <NowPlayingPanel />
      </div>

      {/* 3. DESKTOP BOTTOM PLAYER BAR (90px, hidden on mobile) */}
      <div className="hidden md:block">
        <SoundWavePlayerBar />
      </div>

      {/* 4. MOBILE BOTTOM TAB BAR & MINI-PLAYER (<900px) */}
      <MobileBottomNav />
    </div>
  );
}

