'use client';

import React from 'react';
import { usePlayerStore } from '@/lib/playerStore';
import { X, Mic } from 'lucide-react';

export const SyncedLyricsModal: React.FC = () => {
  const { currentTrack, currentTime, isLyricsOpen, toggleLyrics, seek } = usePlayerStore();

  if (!isLyricsOpen || !currentTrack) return null;

  const lyrics = currentTrack.lyrics || [
    { time: 0, text: "Lyrics unavailable for this royalty-free track." }
  ];

  return (
    <div className="fixed inset-0 bg-[#0F0F12]/95 backdrop-blur-xl z-50 flex flex-col p-8 select-none transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-minion-yellow/10 text-minion-yellow">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Lyrics
              <span className="text-xs px-2 py-0.5 rounded bg-minion-denim text-white font-medium">
                Real-time Synced
              </span>
            </h2>
            <p className="text-sm text-minion-textMuted">
              {currentTrack.title} — {currentTrack.artistName}
            </p>
          </div>
        </div>

        <button
          onClick={toggleLyrics}
          className="p-2 rounded-full hover:bg-white/10 text-minion-textMuted hover:text-white transition-colors"
          aria-label="Close Lyrics"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Synchronized lyrics stream */}
      <div className="flex-1 overflow-y-auto py-12 flex flex-col items-center justify-center space-y-8 text-center max-w-3xl mx-auto w-full">
        {lyrics.map((line, idx) => {
          const nextTime = lyrics[idx + 1]?.time ?? Infinity;
          const isActive = currentTime >= line.time && currentTime < nextTime;
          const isPassed = currentTime >= nextTime;

          return (
            <button
              key={idx}
              onClick={() => seek(line.time)}
              className={`text-2xl md:text-3xl font-bold transition-all duration-300 text-left w-full px-6 py-2 rounded-xl text-center ${
                isActive
                  ? 'text-minion-yellow scale-105 font-extrabold drop-shadow-[0_0_15px_rgba(255,214,10,0.5)]'
                  : isPassed
                  ? 'text-white/60 hover:text-white'
                  : 'text-white/30 hover:text-white/70'
              }`}
            >
              {line.text}
            </button>
          );
        })}
      </div>
    </div>
  );
};
