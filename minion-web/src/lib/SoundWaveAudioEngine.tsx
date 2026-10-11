'use client';

import React, { useEffect, useRef } from 'react';
import { useSoundWaveStore } from './soundwaveStore';

// Safe inline silent WAV fallback (1-second PCM) in case /silent.wav network request is delayed
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRmQfAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

export const SoundWaveAudioEngine: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const ytContainerRef = useRef<any>(null);

  const {
    setAudioElement,
    setYtPlayer,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setIsLoading,
    nextTrack,
    prevTrack,
    seek,
    togglePlay,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
  } = useSoundWaveStore();

  // 1. Initial engine setup & YouTube IFrame API initialization
  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current);
    }

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
              videoId: 'dQw4w9WgXcQ',
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
                  if (event.data === 1) {
                    // Playing
                    setIsPlaying(true);
                    setIsLoading(false);
                    const dur = event.target.getDuration();
                    if (dur) setDuration(dur);
                  } else if (event.data === 2) {
                    // Paused
                    const state = useSoundWaveStore.getState();
                    // On mobile, if tab is hidden / phone locked but user wanted track playing:
                    if (typeof document !== 'undefined' && document.hidden && state.isPlaying) {
                      try {
                        event.target.playVideo();
                      } catch (_) {
                        setIsPlaying(false);
                      }
                    } else {
                      setIsPlaying(false);
                    }
                  } else if (event.data === 0) {
                    // Ended
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

    // Playback time ticker & lockscreen position synchronizer
    const ticker = setInterval(() => {
      const state = useSoundWaveStore.getState();
      if (!state.currentTrack || !state.isPlaying) return;

      let pos = 0;
      if (state.currentTrack.playbackType === 'youtube_embed') {
        if (ytContainerRef.current && typeof ytContainerRef.current.getCurrentTime === 'function') {
          try {
            const t = ytContainerRef.current.getCurrentTime();
            if (t !== undefined && !isNaN(t)) {
              pos = t;
              setCurrentTime(t);
            }
          } catch (_) {}
        }
      } else if (audioRef.current) {
        pos = audioRef.current.currentTime;
        setCurrentTime(pos);
      }

      // Synchronize lockscreen / notification scrubber
      if (
        typeof navigator !== 'undefined' &&
        'mediaSession' in navigator &&
        'setPositionState' in navigator.mediaSession &&
        state.duration > 0 &&
        pos <= state.duration
      ) {
        try {
          navigator.mediaSession.setPositionState({
            duration: state.duration,
            playbackRate: 1.0,
            position: Math.max(0, pos),
          });
        } catch (_) {}
      }
    }, 400);

    return () => clearInterval(ticker);
  }, []);

  // 2. Register full MediaSession action handlers (lock screen, smartwatch, notification drawer)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const actionMap: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => togglePlay()],
      ['pause', () => togglePlay()],
      ['previoustrack', () => prevTrack()],
      ['nexttrack', () => nextTrack()],
      [
        'seekto',
        (details) => {
          if (details.seekTime !== undefined) {
            seek(details.seekTime);
          }
        },
      ],
      [
        'seekbackward',
        (details) => {
          const skip = details.seekOffset || 10;
          const { currentTime: curr, seek: doSeek } = useSoundWaveStore.getState();
          doSeek(Math.max(0, curr - skip));
        },
      ],
      [
        'seekforward',
        (details) => {
          const skip = details.seekOffset || 10;
          const { currentTime: curr, duration: dur, seek: doSeek } = useSoundWaveStore.getState();
          doSeek(Math.min(dur || curr + skip, curr + skip));
        },
      ],
      [
        'stop',
        () => {
          const { isPlaying: playing, togglePlay: doToggle } = useSoundWaveStore.getState();
          if (playing) doToggle();
        },
      ],
    ];

    for (const [action, handler] of actionMap) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (_) {}
    }
  }, [togglePlay, prevTrack, nextTrack, seek]);

  // 3. Keep MediaSession metadata updated when track changes
  useEffect(() => {
    if (!currentTrack || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      const art =
        currentTrack.coverArtwork ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=512';
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'SoundWave',
        artwork: [
          { src: art, sizes: '96x96', type: 'image/jpeg' },
          { src: art, sizes: '128x128', type: 'image/jpeg' },
          { src: art, sizes: '192x192', type: 'image/jpeg' },
          { src: art, sizes: '256x256', type: 'image/jpeg' },
          { src: art, sizes: '384x384', type: 'image/jpeg' },
          { src: art, sizes: '512x512', type: 'image/jpeg' },
        ],
      });
    } catch (_) {}
  }, [currentTrack]);

  // 4. Synchronize MediaSession playback state with store
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (_) {}
  }, [isPlaying]);

  // 5. Silent Audio Carrier for Background Phone Playback (iOS Safari & Android Chrome)
  // When YouTube streams are active, keeping a silent HTML5 audio loop running prevents mobile OS
  // from suspending audio focus or freezing the tab when screen locks.
  useEffect(() => {
    const silent = silentAudioRef.current;
    if (!silent) return;

    if (isPlaying && currentTrack?.playbackType === 'youtube_embed') {
      silent.volume = 0.01;
      silent.loop = true;
      silent.play().catch((e) => {
        console.warn('Silent audio keep-alive carrier note:', e);
      });
    } else {
      silent.pause();
    }
  }, [isPlaying, currentTrack?.playbackType]);

  // 6. Direct track reactive changes for YouTube
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
      {/* HTML5 audio engine for Jamendo and Archive direct MP3 streams */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        onEnded={nextTrack}
        crossOrigin="anonymous"
      />

      {/* Background Audio Carrier: maintains mobile OS audio pipeline during YouTube playback & screen lock */}
      <audio
        ref={silentAudioRef}
        src="/silent.wav"
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== SILENT_WAV_DATA_URI) {
            target.src = SILENT_WAV_DATA_URI;
          }
        }}
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: 1,
          height: 1,
          opacity: 0.001,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />

      {/* YouTube IFrame Player: kept on-screen at bottom-right with opacity 0.001 to prevent browser render throttling */}
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
