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
      const win = window as any;
      if (!win.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const initYt = () => {
        if (win.YT && win.YT.Player) {
          try {
            ytContainerRef.current = new win.YT.Player('soundwave-yt-hidden', {
              height: '180',
              width: '240',
              videoId: 'dQw4w9WgXcQ', // Default initialization ID
              playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                enablejsapi: 1,
                fs: 0,
                playsinline: 1,
                rel: 0,
              },
              events: {
                onReady: (event: any) => {
                  setYtPlayer(event.target);
                  event.target.setVolume(Math.round(volume * 100));

                  // If a YouTube track was selected before onReady fired, start it now
                  const active = useSoundWaveStore.getState().currentTrack;
                  if (active && active.playbackType === 'youtube_embed') {
                    try {
                      event.target.loadVideoById(active.originalId);
                      event.target.playVideo();
                      setIsPlaying(true);
                      setIsLoading(false);
                    } catch (e) {
                      console.warn('Deferred YT start error:', e);
                    }
                  }
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
                  console.warn('YouTube embedded player error code:', err?.data);
                  setIsLoading(false);
                },
              },
            });
          } catch (e) {
            console.error('YouTube player init error:', e);
          }
        }
      };

      if (win.YT && win.YT.Player) {
        initYt();
      } else {
        win.onYouTubeIframeAPIReady = initYt;
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
    }, 350);

    return () => clearInterval(ticker);
  }, []);

  // React directly to track changes for YouTube streams
  useEffect(() => {
    if (!currentTrack) return;

    if (currentTrack.playbackType === 'youtube_embed') {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (ytContainerRef.current && typeof ytContainerRef.current.loadVideoById === 'function') {
        try {
          ytContainerRef.current.loadVideoById(currentTrack.originalId);
          ytContainerRef.current.playVideo();
          setIsPlaying(true);
          setIsLoading(false);
        } catch (err) {
          console.warn('Reactive YT load error:', err);
        }
      }
    }
  }, [currentTrack?.id, currentTrack?.playbackType]);

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
  };

  return (
    <>
      {/* HTML5 audio engine for Jamendo and Archive direct MP3s */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        onEnded={nextTrack}
        crossOrigin="anonymous"
      />

      {/* YouTube IFrame Player: kept on-screen at bottom-right with near-zero opacity so browser does NOT throttle or pause */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: 200,
          height: 120,
          opacity: 0.001,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <div id="soundwave-yt-hidden" />
      </div>
    </>
  );
};
