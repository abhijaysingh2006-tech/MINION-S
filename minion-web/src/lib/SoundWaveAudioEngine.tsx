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
    showToast,
  } = useSoundWaveStore();

  useEffect(() => {
    // 1. Register HTML5 audio element
    if (audioRef.current) {
      setAudioElement(audioRef.current);
    }

    // 2. Load YouTube IFrame API script
    if (typeof window !== 'undefined') {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const initYt = () => {
        if (window.YT && window.YT.Player) {
          try {
            ytContainerRef.current = new window.YT.Player('soundwave-yt-hidden', {
              height: '240',
              width: '320',
              videoId: '',
              playerVars: {
                autoplay: 1,
                controls: 0,
                enablejsapi: 1,
                origin: window.location.origin,
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
                onError: (err: any) => {
                  console.warn('YouTube embedded player error:', err);
                  setIsLoading(false);
                  showToast('YouTube video playback restriction or error', 'error');
                },
              },
            });
          } catch (e) {
            console.error('YouTube player init error:', e);
          }
        }
      };

      if (window.YT && window.YT.Player) {
        initYt();
      } else {
        window.onYouTubeIframeAPIReady = initYt;
      }
    }

    // 3. Playback time ticker
    const ticker = setInterval(() => {
      const state = useSoundWaveStore.getState();
      if (!state.currentTrack || !state.isPlaying) return;

      if (state.currentTrack.playbackType === 'youtube_embed') {
        if (ytContainerRef.current && typeof ytContainerRef.current.getCurrentTime === 'function') {
          try {
            const t = ytContainerRef.current.getCurrentTime();
            if (t !== undefined && !isNaN(t)) {
              setCurrentTime(t);
            }
          } catch (_) {}
        }
      } else if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 400);

    return () => clearInterval(ticker);
  }, []);

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

  const handleError = () => {
    setIsLoading(false);
    showToast('Failed to load audio stream from provider', 'error');
  };

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        onEnded={nextTrack}
        crossOrigin="anonymous"
      />
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
        <div id="soundwave-yt-hidden" />
      </div>
    </>
  );
};
