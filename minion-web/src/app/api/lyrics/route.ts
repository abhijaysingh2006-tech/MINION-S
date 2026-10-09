import { NextResponse } from 'next/server';
import axios from 'axios';

interface LyricLine {
  time: number;
  text: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawTitle = searchParams.get('title') || '';
  const rawArtist = searchParams.get('artist') || '';
  const duration = Number(searchParams.get('duration')) || 210;

  const { title, artist } = extractAccurateTrackAndArtist(rawTitle, rawArtist);

  // Search variations in order of accuracy
  const candidates = [
    { track: title, artist: artist },
    { track: `${artist} ${title}`, artist: '' },
    { track: title, artist: '' },
    { track: rawTitle.replace(/(\[.*?\]|\(.*?\))/g, '').trim(), artist: '' },
  ];

  for (const c of candidates) {
    if (!c.track) continue;

    // 1. Exact match attempt
    if (c.artist) {
      try {
        const exactRes = await axios.get('https://lrclib.net/api/get', {
          params: {
            track_name: c.track,
            artist_name: c.artist,
          },
          headers: { 'User-Agent': 'SoundWaveMusic/3.0' },
          timeout: 2500,
        });

        if (exactRes.data?.syncedLyrics) {
          const parsed = parseLrc(exactRes.data.syncedLyrics);
          if (parsed.length > 0) {
            return NextResponse.json({
              lyrics: parsed,
              match: `${exactRes.data.artistName} - ${exactRes.data.trackName}`,
              source: 'exact',
            });
          }
        }
      } catch (_) {}
    }

    // 2. Search match attempt
    try {
      const searchRes = await axios.get('https://lrclib.net/api/search', {
        params: {
          q: c.artist ? `${c.artist} ${c.track}` : c.track,
        },
        headers: { 'User-Agent': 'SoundWaveMusic/3.0' },
        timeout: 3000,
      });

      if (searchRes.data && Array.isArray(searchRes.data) && searchRes.data.length > 0) {
        // Find candidate that best matches title keywords
        const titleKeywords = c.track.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

        const bestMatch = searchRes.data.find((item: any) => {
          if (!item.syncedLyrics && !item.plainLyrics) return false;
          const candidateTitle = (item.trackName || '').toLowerCase();
          return titleKeywords.some((kw) => candidateTitle.includes(kw));
        }) || searchRes.data[0];

        if (bestMatch?.syncedLyrics) {
          const parsed = parseLrc(bestMatch.syncedLyrics);
          if (parsed.length > 0) {
            return NextResponse.json({
              lyrics: parsed,
              match: `${bestMatch.artistName} - ${bestMatch.trackName}`,
              source: 'search_synced',
            });
          }
        } else if (bestMatch?.plainLyrics) {
          const lines = bestMatch.plainLyrics
            .split('\n')
            .map((l: string) => l.trim())
            .filter((l: string) => l.length > 0 && !l.startsWith('[') && !l.startsWith('('));

          if (lines.length > 0) {
            return NextResponse.json({
              lyrics: generateEstimatedTimings(lines, duration),
              match: `${bestMatch.artistName} - ${bestMatch.trackName}`,
              source: 'search_plain',
            });
          }
        }
      }
    } catch (_) {}
  }

  // 3. If no authentic lyrics exist in the database, return clean notice without fabricated filler text
  return NextResponse.json({
    lyrics: [],
    message: 'No verified lyrics found for this song in database',
    source: 'not_found',
  });
}

/**
 * Extracts true song title and artist from YouTube/streaming metadata
 * e.g. "Guru Randhawa: Suit Suit Video Song | Hindi Medium | Irrfan Khan" -> "Suit Suit", "Guru Randhawa"
 * e.g. "Coldplay - Hymn For The Weekend (Official Video)" -> "Hymn For The Weekend", "Coldplay"
 */
function extractAccurateTrackAndArtist(rawTitle: string, rawArtist: string): { title: string; artist: string } {
  let cleaned = rawTitle
    .replace(/(\[.*?\]|\(.*?\))/gi, '') // remove [...] and (...)
    .replace(/(official video|official audio|music video|full song|video song|lyric video|lyrics|hd|4k|audio|visualizer|remix)/gi, '')
    .trim();

  let artist = rawArtist.replace(/(vevo|official|channel|records|music|entertainment|t-series|speed records)/gi, '').trim();
  let title = cleaned;

  // Pattern: "Artist - Title" or "Artist : Title | Movie"
  if (cleaned.includes(' - ')) {
    const parts = cleaned.split(' - ');
    if (parts.length >= 2) {
      artist = parts[0].trim();
      title = parts[1].split(/\|/)[0].trim();
    }
  } else if (cleaned.includes(':')) {
    const parts = cleaned.split(':');
    if (parts.length >= 2) {
      artist = parts[0].trim();
      title = parts[1].split(/\|/)[0].trim();
    }
  } else if (cleaned.includes('|')) {
    title = cleaned.split('|')[0].trim();
  }

  return {
    title: title || rawTitle,
    artist: artist || rawArtist,
  };
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
