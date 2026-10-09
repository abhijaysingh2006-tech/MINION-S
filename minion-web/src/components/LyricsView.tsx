'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSoundWaveStore } from '@/lib/soundwaveStore';
import { X, Mic2, Sparkles, Music } from 'lucide-react';

interface LyricLine {
  time: number;
  text: string;
}

export const LyricsView: React.FC = () => {
  const { currentTrack, currentTime, isLyricsOpen, toggleLyrics, seek } = useSoundWaveStore();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loading, setLoading] = useState(false);
  const activeLineRef = useRef<HTMLButtonElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Fetch lyrics whenever the playing song changes
  useEffect(() => {
    if (!currentTrack) {
      setLyrics([]);
      return;
    }

    setLoading(true);
    fetch(
      `/api/lyrics?title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(
        currentTrack.artist
      )}&duration=${currentTrack.duration || 210}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.lyrics && Array.isArray(data.lyrics)) {
          setLyrics(data.lyrics);
        }
      })
      .catch((err) => {
        console.warn('Lyrics fetch error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentTrack?.id]);

  // Auto-scroll active lyric line into center view
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTime]);

  if (!isLyricsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#121b14]/95 backdrop-blur-2xl flex flex-col text-white select-none animate-in fade-in duration-300">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1ed760]/20 flex items-center justify-center text-[#1ed760] shadow-lg">
            <Mic2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              Lyrics
              <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-[#1ed760] text-black">
                Live Synced
              </span>
            </h2>
            {currentTrack && (
              <p className="text-xs md:text-sm text-[#94A3B8] truncate mt-0.5">
                {currentTrack.title} — <span className="text-white font-medium">{currentTrack.artist}</span>
              </p>
            )}
          </div>
        </div>

        <button
          onClick={toggleLyrics}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105"
          title="Close lyrics"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Lyrics Stream Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 md:px-16 py-20 flex flex-col items-center space-y-8 max-w-4xl mx-auto w-full text-center"
      >
        {loading && (
          <div className="my-auto flex flex-col items-center gap-3 text-[#94A3B8]">
            <div className="w-8 h-8 border-2 border-[#1ed760] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold">Synchronizing lyrics...</p>
          </div>
        )}

        {!loading && lyrics.length > 0 && (
          lyrics.map((line, idx) => {
            const nextTime = lyrics[idx + 1]?.time ?? Infinity;
            const isActive = currentTime >= line.time && currentTime < nextTime;
            const isPassed = currentTime >= nextTime;

            return (
              <button
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => seek(line.time)}
                className={`text-2xl md:text-4xl font-extrabold leading-relaxed transition-all duration-300 text-center w-full px-4 py-2 rounded-2xl ${
                  isActive
                    ? 'text-white scale-105 drop-shadow-[0_0_25px_rgba(30,215,96,0.6)] font-black'
                    : isPassed
                    ? 'text-white/40 hover:text-white/80'
                    : 'text-white/20 hover:text-white/60'
                }`}
              >
                {line.text}
              </button>
            );
          })
        )}

        {!loading && lyrics.length === 0 && (
          <div className="my-auto flex flex-col items-center gap-3 text-[#94A3B8]">
            <Music className="w-10 h-10 text-[#FFD60A]" />
            <p className="text-lg font-bold text-white">Lyrics unavailable for this recording</p>
            <p className="text-xs">Enjoy the uninterrupted instrumental playback.</p>
          </div>
        )}
      </div>
    </div>
  );
};
