import { JamendoAdapter } from './jamendoAdapter';
import { DeezerAdapter } from './deezerAdapter';
import { InternetArchiveAdapter } from './internetArchiveAdapter';
import { YouTubeAdapter } from './youtubeAdapter';
import { UnifiedTrack, UnifiedSearchResult, MusicProvider } from './types';

export class UnifiedMusicService {
  private jamendo = new JamendoAdapter();
  private deezer = new DeezerAdapter();
  private archive = new InternetArchiveAdapter();
  private youtube = new YouTubeAdapter();

  async search(query: string, providerFilter?: MusicProvider): Promise<UnifiedSearchResult> {
    const q = query.trim() || 'trending hits';

    let jamendoTracks: UnifiedTrack[] = [];
    let deezerTracks: UnifiedTrack[] = [];
    let archiveTracks: UnifiedTrack[] = [];
    let youtubeTracks: UnifiedTrack[] = [];

    const status = {
      jamendo: false,
      deezer: false,
      archive: false,
      youtube: false,
    };

    const tasks: Promise<void>[] = [];

    // 1. YouTube: 100% full-length tracks (Primary provider for commercial hits & full songs)
    if (!providerFilter || providerFilter === 'youtube') {
      tasks.push(
        this.youtube.search(q, 15).then((res) => {
          youtubeTracks = res;
          status.youtube = true;
        }).catch(() => { status.youtube = false; })
      );
    }

    // 2. Jamendo: 100% full-length HQ MP3 streams
    if (!providerFilter || providerFilter === 'jamendo') {
      tasks.push(
        this.jamendo.search(q, 10).then((res) => {
          jamendoTracks = res;
          status.jamendo = true;
        }).catch(() => { status.jamendo = false; })
      );
    }

    // 3. Internet Archive: 100% full-length audio recordings
    if (!providerFilter || providerFilter === 'archive') {
      tasks.push(
        this.archive.search(q, 6).then((res) => {
          archiveTracks = res;
          status.archive = true;
        }).catch(() => { status.archive = false; })
      );
    }

    // 4. Deezer: ONLY query when specifically requested via provider filter (prevents 30s preview flooding)
    if (providerFilter === 'deezer') {
      tasks.push(
        this.deezer.search(q, 15).then((res) => {
          deezerTracks = res;
          status.deezer = true;
        }).catch(() => { status.deezer = false; })
      );
    }

    await Promise.all(tasks);

    // Prioritize 100% full-length audio tracks (YouTube full audio & Jamendo full HQ MP3)
    const combinedTracks = [
      ...youtubeTracks,
      ...jamendoTracks,
      ...deezerTracks,
      ...archiveTracks,
    ];

    return {
      tracks: combinedTracks,
      providerStatus: status,
      totalCount: combinedTracks.length,
    };
  }
}
