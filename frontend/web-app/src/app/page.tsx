import type { Metadata } from 'next';
import HomePageClient from '@/components/HomePageClient';

export const metadata: Metadata = {
  title: 'Dandy Babe - Premium Sugar Daddy Dating Platform',
  description: 'Connect with successful sugar daddies and sugar babies in a safe, discreet environment. Find meaningful arrangements with verified profiles and transparent pricing.',
  keywords: ['sugar daddy', 'sugar baby', 'sugar dating', 'arrangement dating', 'luxury dating', 'mutual benefit dating', 'elite dating'],
  openGraph: {
    title: 'Dandy Babe - Premium Sugar Daddy Dating Platform',
    description: 'Connect with successful sugar daddies and sugar babies in a safe, discreet environment. Find meaningful arrangements with verified profiles.',
    url: process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com',
    type: 'website',
    images: [
      {
        url: 'https://www.dandybabe.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dandy Babe - Premium Sugar Daddy Dating Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dandy Babe - Premium Sugar Daddy Dating Platform',
    description: 'Connect with successful sugar daddies and sugar babies in a safe, discreet environment.',
    images: ['https://www.dandybabe.com/og-image.jpg'],
  },
  alternates: {
    canonical: process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com',
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
