import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CareCanvas — Van Verbeelding naar Zorgkracht',
  description:
    'Een inclusief co-creatieplatform waar iedere zorgrol samen het zorgsysteem van morgen ontwerpt.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
