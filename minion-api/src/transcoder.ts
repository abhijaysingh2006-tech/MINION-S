import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Transcodes an incoming high-resolution audio file (FLAC, WAV, MP3) into
 * standard multi-bitrate HLS streams (96k, 160k, 320k) for adaptive streaming.
 */
export async function transcodeAudioToHls(
  inputFilePath: string,
  outputDir: string,
): Promise<{ masterPlaylistPath: string }> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const bitrates = [
    { name: 'low', bitrate: '96k', bandwidth: 96000 },
    { name: 'med', bitrate: '160k', bandwidth: 160000 },
    { name: 'high', bitrate: '320k', bandwidth: 320000 },
  ];

  const transcodePromises = bitrates.map((variant) => {
    const variantDir = path.join(outputDir, variant.name);
    if (!fs.existsSync(variantDir)) {
      fs.mkdirSync(variantDir, { recursive: true });
    }

    const playlistPath = path.join(variantDir, 'stream.m3u8');
    const segmentPattern = path.join(variantDir, 'segment_%03d.ts');

    return new Promise<void>((resolve, reject) => {
      ffmpeg(inputFilePath)
        .audioCodec('aac')
        .audioBitrate(variant.bitrate)
        .audioChannels(2)
        .audioFrequency(44100)
        .outputOptions([
          '-hls_time 6',
          '-hls_list_size 0',
          `-hls_segment_filename ${segmentPattern}`,
          '-hls_playlist_type vod',
        ])
        .output(playlistPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  });

  await Promise.all(transcodePromises);

  // Generate Master HLS Playlist
  const masterContent = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=96000,CODECS="mp4a.40.2"
low/stream.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=160000,CODECS="mp4a.40.2"
med/stream.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=320000,CODECS="mp4a.40.2"
high/stream.m3u8
`;

  const masterPlaylistPath = path.join(outputDir, 'master.m3u8');
  fs.writeFileSync(masterPlaylistPath, masterContent, 'utf-8');

  return { masterPlaylistPath };
}
