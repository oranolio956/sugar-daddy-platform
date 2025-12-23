import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'LuxeMatch - Premium Dating',
  description: 'Connect with successful individuals in a safe and discreet environment.',
  keywords: ['sugar daddy', 'sugar baby', 'dating', 'relationships', 'luxury dating'],
  authors: [{ name: 'LuxeMatch' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    title: 'LuxeMatch - Premium Dating',
    description: 'Connect with successful individuals in a safe and discreet environment.',
    url: process.env['NEXT_PUBLIC_APP_URL'] || 'https://sugar-daddy-platform.vercel.app',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#F7E7CE" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-champagne-50 text-charcoal-900 dark:bg-charcoal-900 dark:text-champagne-50 antialiased`}>
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#121212',
                  color: '#F7E7CE',
                  fontFamily: 'var(--font-inter)',
                  border: '1px solid rgba(247, 231, 206, 0.1)',
                  backdropFilter: 'blur(12px)',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#F7E7CE',
                    secondary: '#121212',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
