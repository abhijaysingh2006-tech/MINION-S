import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SoundWave — Music Streaming Platform',
  description: 'Spotify-style ad-free legal music streaming aggregator powered by Jamendo, Deezer, YouTube & Archive.org',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="bg-[#000000] text-[#F8FAFC] h-full antialiased selection:bg-[#FFD60A] selection:text-black overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
