import axios from 'axios';

export interface YouTubeWebVideo {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  durationFormatted: string;
}

function parseDurationToSeconds(durationStr: string): number {
  if (!durationStr) return 210;
  const parts = durationStr.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 210;
}

/**
 * Ultra-reliable direct YouTube web scraper that does not require an API key
 * and does not break on youtube-sr 'browseId' internal changes.
 */
export async function searchYouTubeDirect(query: string, limit = 15): Promise<YouTubeWebVideo[]> {
  try {
    const res = await axios.get('https://www.youtube.com/results', {
      params: { search_query: query },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 8000,
    });

    const html = typeof res.data === 'string' ? res.data : '';
    const match =
      html.match(/var ytInitialData\s*=\s*({[\s\S]+?});<\/script>/) ||
      html.match(/ytInitialData\s*=\s*({[\s\S]+?});/);

    if (!match) return [];

    let data: any;
    try {
      data = JSON.parse(match[1]);
    } catch (_) {
      return [];
    }

    const contents =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
    if (!Array.isArray(contents)) return [];

    const itemSection = contents.find((c: any) => c.itemSectionRenderer)?.itemSectionRenderer;
    const items = itemSection?.contents;
    if (!Array.isArray(items)) return [];

    const results: YouTubeWebVideo[] = [];
    for (const item of items) {
      if (results.length >= limit) break;
      const v = item.videoRenderer;
      if (v && v.videoId) {
        const title =
          v.title?.runs?.map((r: any) => r.text).join('') ||
          v.title?.simpleText ||
          'YouTube Music Track';
        const artist =
          v.ownerText?.runs?.map((r: any) => r.text).join('') ||
          v.longBylineText?.runs?.map((r: any) => r.text).join('') ||
          'YouTube Artist';
        const durationFormatted = v.lengthText?.simpleText || '3:30';
        const duration = parseDurationToSeconds(durationFormatted);
        const thumbs = v.thumbnail?.thumbnails;
        const thumbnail =
          Array.isArray(thumbs) && thumbs.length > 0
            ? thumbs[thumbs.length - 1].url
            : `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

        results.push({
          id: v.videoId,
          title,
          artist,
          thumbnail,
          duration,
          durationFormatted,
        });
      }
    }

    return results;
  } catch (err: any) {
    console.warn('Direct YouTube web search failed:', err.message);
    return [];
  }
}
