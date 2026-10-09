'use client';

import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from './playerStore';

export const YouTubeBackgroundPlayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    currentTrack,
    setYtPlayer,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    nextTrack,
    volume,
  } = usePlayerStore();

  useEffect(() => {
    // Load YouTube IFrame API script tag
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (window.YT && window.YT.Player && containerRef.current) {
        const player = new window.YT.Player('yt-hidden-player', {
          height: '10',
          width: '10',
          videoId: currentTrack ? currentTrack.id : '',
          playerVars: {
            playsinline: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              setYtPlayer(event.target);
              event.target.setVolume(volume);
              if (currentTrack) {
                event.target.loadVideoById(currentTrack.id);
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
                const dur = event.target.getDuration();
                if (dur) setDuration(dur);
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                nextTrack();
              }
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    // Time ticker for progress bar
    const interval = setInterval(() => {
      const { ytPlayer, isPlaying } = usePlayerStore.getState();
      if (ytPlayer && isPlaying && typeof ytPlayer.getCurrentTime === 'function') {
        const curr = ytPlayer.getCurrentTime();
        if (curr !== undefined && !isNaN(curr)) {
          setCurrentTime(curr);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: -200,
        right: -200,
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <div id="yt-hidden-player" />
    </div>
  );
};
