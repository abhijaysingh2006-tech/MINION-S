'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSoundWaveStore } from '@/lib/soundwaveStore';
import { X, Mic2, Music, Loader2 } from 'lucide-react';

interface LyricLine {
  time: number;
  text: string;
}

export const LyricsView: React.FC = () => {
  const { currentTrack, currentTime, isLyricsOpen, toggleLyrics, seek } = useSoundWaveStore();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastActiveIndex = useRef<number>(-1);

  // Fetch lyrics on track change
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
          lineRefs.current = new Array(data.lyrics.length).fill(null);
          lastActiveIndex.current = -1;
        }
      })
      .catch((err) => {
        console.warn('Lyrics fetch error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentTrack?.id]);

  // Compute active lyric index efficiently with binary search / range check
  const activeIndex = useMemo(() => {
    if (lyrics.length === 0) return -1;
    let index = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [currentTime, lyrics]);

  // Smooth GPU-accelerated scroll when active line changes
  useEffect(() => {
    if (activeIndex >= 0 && activeIndex !== lastActiveIndex.current) {
      lastActiveIndex.current = activeIndex;
      const el = lineRefs.current[activeIndex];
      const container = containerRef.current;
      if (el && container) {
        const containerHeight = container.clientHeight;
        const elTop = el.offsetTop;
        const elHeight = el.clientHeight;
        const targetScroll = elTop - containerHeight / 2 + elHeight / 2;

        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }
    }
  }, [activeIndex]);

  if (!isLyricsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1410]/95 backdrop-blur-2xl flex flex-col text-white select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#1ed760]/20 flex items-center justify-center text-[#1ed760] shadow-md">
            <Mic2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
              Lyrics
              <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-[#1ed760] text-black">
                Multilingual Synced
              </span>
            </h2>
            {currentTrack && (
              <p className="text-xs text-[#94A3B8] truncate mt-0.5 max-w-sm md:max-w-md">
                {currentTrack.title} — <span className="text-white font-semibold">{currentTrack.artist}</span>
              </p>
            )}
          </div>
        </div>

        <button
          onClick={toggleLyrics}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-transform hover:scale-105"
          title="Close lyrics"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Lyrics Scrollable Body */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 md:px-16 py-32 flex flex-col items-center space-y-6 max-w-4xl mx-auto w-full text-center scroll-smooth"
        style={{ willChange: 'transform, scroll-position' }}
      >
        {loading && (
          <div className="my-auto flex flex-col items-center gap-3 text-[#94A3B8]">
            <Loader2 className="w-8 h-8 animate-spin text-[#1ed760]" />
            <p className="text-sm font-semibold">Loading song lyrics...</p>
          </div>
        )}

        {!loading && lyrics.length > 0 && (
          lyrics.map((line, idx) => {
            const isActive = activeIndex === idx;
            const isPassed = activeIndex > idx;

            return (
              <button
                key={idx}
                ref={(el) => { lineRefs.current[idx] = el; }}
                onClick={() => seek(line.time)}
                className={`w-full py-2.5 px-6 rounded-2xl text-left text-center transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white text-3xl md:text-4xl font-black scale-105 drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]'
                    : isPassed
                    ? 'text-white/45 text-2xl md:text-3xl font-bold hover:text-white/80'
                    : 'text-white/20 text-2xl md:text-3xl font-bold hover:text-white/60'
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
            <p className="text-lg font-bold text-white">Lyrics unavailable for this track</p>
            <p className="text-xs">Enjoy the music on SoundWave.</p>
          </div>
        )}
      </div>
    </div>
  );
};
