import { NextResponse } from 'next/server';
import axios from 'axios';

interface LyricLine {
  time: number;
  text: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';
  const artist = searchParams.get('artist') || '';
  const duration = Number(searchParams.get('duration')) || 210;

  // Clean title & artist for maximum cross-language match (Hindi, Punjabi, Korean, Spanish, Tamil, English, etc.)
  const cleanTitle = cleanSongTitle(title);
  const cleanArtist = cleanArtistName(artist);

  // Strategy 1: Search exact metadata on LrcLib
  try {
    const res = await axios.get('https://lrclib.net/api/get', {
      params: {
        track_name: cleanTitle,
        artist_name: cleanArtist,
      },
      headers: { 'User-Agent': 'SoundWaveMusic/2.0' },
      timeout: 3000,
    });

    if (res.data?.syncedLyrics) {
      const parsed = parseLrc(res.data.syncedLyrics);
      if (parsed.length > 0) {
        return NextResponse.json({ lyrics: parsed, source: 'synced_exact' });
      }
    }
  } catch (_) {}

  // Strategy 2: Multi-query Search (supports transliterated, regional, and multilingual names)
  const searchVariations = [
    `${cleanArtist} ${cleanTitle}`,
    cleanTitle,
    `${cleanTitle} lyrics`,
    `${cleanArtist} lyrics`,
  ];

  for (const query of searchVariations) {
    if (!query.trim()) continue;
    try {
      const searchRes = await axios.get('https://lrclib.net/api/search', {
        params: { q: query },
        headers: { 'User-Agent': 'SoundWaveMusic/2.0' },
        timeout: 3000,
      });

      if (searchRes.data && Array.isArray(searchRes.data) && searchRes.data.length > 0) {
        // Priority to synced lyrics in original language / script
        const syncedItem = searchRes.data.find((item: any) => item.syncedLyrics);
        if (syncedItem?.syncedLyrics) {
          const parsed = parseLrc(syncedItem.syncedLyrics);
          if (parsed.length > 0) {
            return NextResponse.json({ lyrics: parsed, source: 'synced_search' });
          }
        }

        // Second priority: plain lyrics in original language (Hindi/Punjabi/Korean/etc.)
        const plainItem = searchRes.data.find((item: any) => item.plainLyrics);
        if (plainItem?.plainLyrics) {
          const lines = plainItem.plainLyrics
            .split('\n')
            .map((l: string) => l.trim())
            .filter((l: string) => l.length > 0 && !l.startsWith('[') && !l.startsWith('('));

          if (lines.length > 0) {
            return NextResponse.json({
              lyrics: generateEstimatedTimings(lines, duration),
              source: 'plain_search_synced',
            });
          }
        }
      }
    } catch (_) {}
  }

  // Strategy 3: Multilingual Fallback
  return NextResponse.json({
    lyrics: [
      { time: 0, text: `♪ ${cleanTitle || title} ♪` },
      { time: 5, text: `Track by ${cleanArtist || artist}` },
      { time: 12, text: '♪ (Music Playing / संगीत बज रहा है) ♪' },
      { time: 30, text: 'Feel the rhythm and bassline flow' },
      { time: 55, text: '♪ (Instrumental & Vocal Harmonies) ♪' },
      { time: 80, text: 'Sing along with the groove' },
      { time: 120, text: '♪ (Main Hook Replay) ♪' },
      { time: 160, text: '♪ (Outro Flow) ♪' },
      { time: 190, text: 'SoundWave • Music, No Limits' },
    ],
    source: 'contextual_fallback',
  });
}

function cleanSongTitle(title: string): string {
  return title
    .replace(/(\[.*?\]|\(.*?\))/g, '') // remove brackets/parentheses like [Official 4K]
    .replace(/(official video|official audio|music video|full song|video song|hd|4k|audio|lyric video|lyrics|feat\..*|ft\..*)/gi, '')
    .replace(/[-|/].*$/g, '') // remove trailing movie names or dashes
    .trim();
}

function cleanArtistName(artist: string): string {
  return artist
    .replace(/(vevo|official|channel|records|music|entertainment)/gi, '')
    .replace(/[-|/].*$/g, '')
    .trim();
}

function parseLrc(lrcContent: string): LyricLine[] {
  const lines = lrcContent.split('\n');
  const result: LyricLine[] = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const ms = parseInt(match[3], 10);
      const totalSec = min * 60 + sec + (match[3].length === 2 ? ms / 100 : ms / 1000);
      const text = match[4].trim();
      if (text.length > 0) {
        result.push({ time: totalSec, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

function generateEstimatedTimings(lines: string[], totalDuration: number): LyricLine[] {
  if (lines.length === 0) return [];
  const startOffset = 4;
  const usableDuration = Math.max(totalDuration - 8, 30);
  const interval = usableDuration / lines.length;

  return lines.map((text, i) => ({
    time: Math.round((startOffset + i * interval) * 10) / 10,
    text,
  }));
}
