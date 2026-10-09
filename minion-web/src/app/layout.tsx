import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SoundWave — Music Streaming Platform',
  description: 'Spotify-style ad-free legal music streaming aggregator powered by Jamendo, Deezer, YouTube & Archive.org',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="bg-[#0F0F12] text-[#F8FAFC] h-full antialiased selection:bg-[#FFD60A] selection:text-black">
        {children}
      </body>
    </html>
  );
}
