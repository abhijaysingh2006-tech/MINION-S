'use client';

import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from './playerStore';

export const YouTubeBackgroundPlayer: React.FC = () => {
  const playerRef = useRef<any>(null);
  const {
    currentTrack,
    setYtPlayer,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    nextTrack,
    volume,
    isPlaying,
  } = usePlayerStore();

  useEffect(() => {
    // 1. Load YouTube Iframe API if not already present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const onYouTubeReady = () => {
      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player('yt-audio-player', {
          height: '200',
          width: '200',
          videoId: '',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            rel: 0,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            onReady: (event: any) => {
              setYtPlayer(event.target);
              event.target.setVolume(volume);
              const storeTrack = usePlayerStore.getState().currentTrack;
              if (storeTrack) {
                event.target.loadVideoById(storeTrack.id);
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
                const d = event.target.getDuration();
                if (d) setDuration(d);
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                nextTrack();
              }
            },
            onError: (err: any) => {
              console.warn('YouTube playback event error:', err);
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      onYouTubeReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeReady;
    }

    // Interval to poll currentTime
    const interval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const state = usePlayerStore.getState();
        if (state.isPlaying) {
          const t = playerRef.current.getCurrentTime();
          if (t !== undefined && !isNaN(t)) {
            setCurrentTime(t);
          }
        }
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Watch for track changes
  useEffect(() => {
    if (currentTrack && playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById(currentTrack.id);
        playerRef.current.playVideo();
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentTrack]);

  return (
    <div
      style={{
        position: 'fixed',
        left: -9999,
        top: -9999,
        width: 200,
        height: 200,
        opacity: 0.01,
        pointerEvents: 'none',
        zIndex: -99,
      }}
    >
      <div id="yt-audio-player" />
    </div>
  );
};
