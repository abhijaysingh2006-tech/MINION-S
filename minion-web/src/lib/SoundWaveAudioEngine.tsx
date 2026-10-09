'use client';

import React, { useEffect, useRef } from 'react';
import { useSoundWaveStore } from './soundwaveStore';

export const SoundWaveAudioEngine: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytContainerRef = useRef<any>(null);
  const {
    setAudioElement,
    setYtPlayer,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setIsLoading,
    nextTrack,
    currentTrack,
    volume,
  } = useSoundWaveStore();

  useEffect(() => {
    // 1. Mount HTML5 Audio Element
    if (audioRef.current) {
      setAudioElement(audioRef.current);
    }

    // 2. Load YouTube Iframe API for compliant video playback
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initYt = () => {
      if (window.YT && window.YT.Player) {
        ytContainerRef.current = new window.YT.Player('soundwave-yt-player', {
          height: '240',
          width: '320',
          videoId: '',
          playerVars: {
            autoplay: 1,
            controls: 0,
            enablejsapi: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            onReady: (event: any) => {
              setYtPlayer(event.target);
              event.target.setVolume(Math.round(volume * 100));
            },
            onStateChange: (event: any) => {
              if (event.data === 1) { // Playing
                setIsPlaying(true);
                setIsLoading(false);
                const dur = event.target.getDuration();
                if (dur) setDuration(dur);
              } else if (event.data === 2) { // Paused
                setIsPlaying(false);
              } else if (event.data === 0) { // Ended
                nextTrack();
              }
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initYt();
    } else {
      window.onYouTubeIframeAPIReady = initYt;
    }

    // Polling currentTime ticker for whichever player is active
    const ticker = setInterval(() => {
      const state = useSoundWaveStore.getState();
      if (!state.currentTrack || !state.isPlaying) return;

      if (state.currentTrack.playbackType === 'youtube_embed') {
        if (ytContainerRef.current && typeof ytContainerRef.current.getCurrentTime === 'function') {
          const t = ytContainerRef.current.getCurrentTime();
          if (t !== undefined && !isNaN(t)) {
            setCurrentTime(t);
          }
        }
      } else if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 400);

    return () => clearInterval(ticker);
  }, []);

  // HTML5 audio event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* HTML5 Audio for Jamendo, Deezer preview, Archive.org */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={nextTrack}
        crossOrigin="anonymous"
      />

      {/* Embedded YouTube Container */}
      <div
        style={{
          position: 'fixed',
          left: -9999,
          top: -9999,
          width: 320,
          height: 240,
          opacity: 0.01,
          pointerEvents: 'none',
          zIndex: -999,
        }}
      >
        <div id="soundwave-yt-player" />
      </div>
    </>
  );
};
