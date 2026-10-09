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

  // Clean title: remove "Official Video", "(Official Music Video)", "ft.", "feat."
  const cleanTitle = title
    .replace(/(\[.*?\]|\(.*?\))/g, '')
    .replace(/(official video|official audio|music video|lyrics|feat\..*|ft\..*)/gi, '')
    .trim();

  const cleanArtist = artist
    .replace(/(vevo|official|channel)/gi, '')
    .trim();

  // 1. Try LrcLib API (free open-source synchronized lyrics database)
  try {
    const res = await axios.get('https://lrclib.net/api/get', {
      params: {
        track_name: cleanTitle || title,
        artist_name: cleanArtist || artist,
      },
      headers: {
        'User-Agent': 'SoundWaveMusic/1.0 (https://github.com/soundwave)',
      },
      timeout: 3500,
    });

    if (res.data && res.data.syncedLyrics) {
      const parsed = parseLrc(res.data.syncedLyrics);
      if (parsed.length > 0) {
        return NextResponse.json({
          lyrics: parsed,
          source: 'lrclib_synced',
          plainLyrics: res.data.plainLyrics || null,
        });
      }
    }

    if (res.data && res.data.plainLyrics) {
      const splitLines = res.data.plainLyrics
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);

      const generatedSynced = generateEstimatedTimings(splitLines, duration);
      return NextResponse.json({
        lyrics: generatedSynced,
        source: 'lrclib_plain',
        plainLyrics: res.data.plainLyrics,
      });
    }
  } catch (err: any) {
    // Continue to fallback search
  }

  // 2. Try LrcLib Search Endpoint if exact match failed
  try {
    const searchRes = await axios.get('https://lrclib.net/api/search', {
      params: {
        q: `${cleanArtist} ${cleanTitle}`,
      },
      headers: {
        'User-Agent': 'SoundWaveMusic/1.0',
      },
      timeout: 3500,
    });

    if (searchRes.data && Array.isArray(searchRes.data) && searchRes.data.length > 0) {
      const match = searchRes.data.find((item: any) => item.syncedLyrics) || searchRes.data[0];
      if (match?.syncedLyrics) {
        const parsed = parseLrc(match.syncedLyrics);
        if (parsed.length > 0) {
          return NextResponse.json({
            lyrics: parsed,
            source: 'lrclib_search_synced',
          });
        }
      } else if (match?.plainLyrics) {
        const splitLines = match.plainLyrics
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0);
        return NextResponse.json({
          lyrics: generateEstimatedTimings(splitLines, duration),
          source: 'lrclib_search_plain',
        });
      }
    }
  } catch (err: any) {
    // Continue to fallback
  }

  // 3. Elegant Contextual Fallback for instrumental / unlisted tracks
  return NextResponse.json({
    lyrics: [
      { time: 0, text: `♪ ${cleanTitle || title} ♪` },
      { time: 6, text: `Performed by ${cleanArtist || artist}` },
      { time: 14, text: "♪ (Music playing...) ♪" },
      { time: 30, text: "Feel the rhythm and bassline flow" },
      { time: 55, text: "♪ (Harmonies & Melody) ♪" },
      { time: 80, text: "Sing along with the vibe" },
      { time: 120, text: "♪ (Instrumental Solo) ♪" },
      { time: 160, text: "♪ (Chorus Replay) ♪" },
      { time: 190, text: "Music, no interruptions • SoundWave" },
    ],
    source: 'fallback',
  });
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
  const startOffset = 5;
  const usableDuration = Math.max(totalDuration - 10, 30);
  const interval = usableDuration / lines.length;

  return lines.map((text, i) => ({
    time: Math.round((startOffset + i * interval) * 10) / 10,
    text,
  }));
}
