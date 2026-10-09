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

    if (!providerFilter || providerFilter === 'jamendo') {
      tasks.push(
        this.jamendo.search(q, 15).then((res) => {
          jamendoTracks = res;
          status.jamendo = true;
        }).catch(() => { status.jamendo = false; })
      );
    }

    if (!providerFilter || providerFilter === 'deezer') {
      tasks.push(
        this.deezer.search(q, 15).then((res) => {
          deezerTracks = res;
          status.deezer = true;
        }).catch(() => { status.deezer = false; })
      );
    }

    if (!providerFilter || providerFilter === 'archive') {
      tasks.push(
        this.archive.search(q, 8).then((res) => {
          archiveTracks = res;
          status.archive = true;
        }).catch(() => { status.archive = false; })
      );
    }

    if (!providerFilter || providerFilter === 'youtube') {
      tasks.push(
        this.youtube.search(q, 10).then((res) => {
          youtubeTracks = res;
          status.youtube = true;
        }).catch(() => { status.youtube = false; })
      );
    }

    await Promise.all(tasks);

    // Interleave or combine results with Deezer & Jamendo full audio prioritization
    const combinedTracks = [
      ...deezerTracks,
      ...jamendoTracks,
      ...youtubeTracks,
      ...archiveTracks,
    ];

    return {
      tracks: combinedTracks,
      providerStatus: status,
      totalCount: combinedTracks.length,
    };
  }
}
