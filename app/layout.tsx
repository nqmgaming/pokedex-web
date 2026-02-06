import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pokédex - Bắt tất cả Pokémon!',
  description: 'Khám phá thế giới Pokémon với Pokédex tương tác. Xem thông tin, type và stats của các Pokémon yêu thích.',
  keywords: ['Pokemon', 'Pokédex', 'Pikachu', 'Game', 'Anime'],
  authors: [{ name: 'Pokemon Fan' }],
  openGraph: {
    title: 'Pokédex - Bắt tất cả Pokémon!',
    description: 'Khám phá thế giới Pokémon với Pokédex tương tác.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
