import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Minion — Music, no interruptions.',
  description: 'Ad-free music streaming experience with HLS adaptive audio, verified artists, and fan tipping.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0F0F12] text-white antialiased selection:bg-minion-yellow selection:text-black">
        {children}
      </body>
    </html>
  );
}
