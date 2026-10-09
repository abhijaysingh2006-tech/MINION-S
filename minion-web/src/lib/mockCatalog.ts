export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumTitle?: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;
  lyrics?: { time: number; text: string }[];
  isLiked?: boolean;
}

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Banana Groove (Summer Beat)',
    artistId: 'art-1',
    artistName: 'DJ Stuart',
    albumTitle: 'Yellow Sunshine Vol. 1',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.freesound.org/previews/612/612613_5674468-lq.mp3',
    duration: 184,
    lyrics: [
      { time: 0, text: "♪ (Upbeat synth bass starts) ♪" },
      { time: 5, text: "Bello! Are you ready for the vibe?" },
      { time: 10, text: "Yellow lights flashing across the ceiling" },
      { time: 18, text: "Ba-ba-ba, ba-banana!" },
      { time: 24, text: "We don't need no commercials in our sound" },
      { time: 30, text: "Just nonstop bass making our goggles bounce!" },
      { time: 42, text: "Feel the frequency rising high" },
    ],
    isLiked: true,
  },
  {
    id: 'track-2',
    title: 'Midnight Goggle Drive',
    artistId: 'art-2',
    artistName: 'The Gru-vers',
    albumTitle: 'Overalls & Synthesizers',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.freesound.org/previews/536/536108_5674468-lq.mp3',
    duration: 215,
    lyrics: [
      { time: 0, text: "♪ (Lush retro synth chords) ♪" },
      { time: 12, text: "Cruising down the highway after dark" },
      { time: 22, text: "Minion headlights glowing neon warm" },
      { time: 35, text: "No ads, no noise, just you and me" },
    ],
    isLiked: false,
  },
  {
    id: 'track-3',
    title: 'Bello Beats (Acoustic Coffee)',
    artistId: 'art-3',
    artistName: 'Kevin & The Bananas',
    albumTitle: 'Underground Lab Sessions',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.freesound.org/previews/415/415804_5121236-lq.mp3',
    duration: 162,
    lyrics: [
      { time: 0, text: "♪ (Gentle acoustic fingerpicking) ♪" },
      { time: 8, text: "Morning steam and sweet espresso aroma" },
      { time: 18, text: "A quiet moment before the rocket launch" },
    ],
    isLiked: true,
  },
  {
    id: 'track-4',
    title: 'Minion Rocket Escape',
    artistId: 'art-4',
    artistName: 'Vector Space Cadets',
    albumTitle: 'Zero Gravity',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://cdn.freesound.org/previews/682/682023_11861866-lq.mp3',
    duration: 198,
    lyrics: [
      { time: 0, text: "♪ (Fast breakbeat drum intro) ♪" },
      { time: 7, text: "Countdown starting: 3, 2, 1... BLAST OFF!" },
      { time: 16, text: "Flying past the moon in denim blue" },
    ],
    isLiked: false,
  },
];
