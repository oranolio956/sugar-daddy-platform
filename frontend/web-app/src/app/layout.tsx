import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, Montserrat } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { SEOProvider } from '../src/components/seo/SEOProvider';
import { AccessibilityProvider } from '../src/contexts/AccessibilityContext';
import { ToastProvider } from '../src/components/ui/Toast';
import { TooltipProvider } from '../src/components/ui/Tooltip';
import { ErrorBoundary } from '../src/components/ui/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

// Custom luxury font for accents
const greatVibes = localFont({
  src: 'https://fonts.gstatic.com/s/greatvibes/v19/RWmMoKWR9v4ksMfaWd_JN9XFiaE.ttf',
  variable: '--font-great-vibes',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7E7CE' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dandybabe.com'),
  title: {
    default: 'Dandy Babe - Premium Sugar Daddy Dating Platform',
    template: '%s | Dandy Babe'
  },
  description: 'Connect with successful sugar daddies and sugar babies in a safe, discreet environment. Find meaningful arrangements with verified profiles and transparent pricing. Join the elite dating platform for sophisticated singles.',
  keywords: [
    'sugar daddy',
    'sugar baby',
    'sugar dating',
    'arrangement dating',
    'luxury dating',
    'mutual benefit dating',
    'elite dating',
    'premium dating',
    'successful singles',
    'discreet dating',
    'verified dating',
    'high-end dating'
  ],
  authors: [{ name: 'Dandy Babe Team' }],
  creator: 'Dandy Babe',
  publisher: 'Dandy Babe Inc.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'dating',
  classification: 'adult entertainment',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Dandy Babe - Premium Sugar Daddy Dating Platform',
    description: 'Connect with successful sugar daddies and sugar babies in a safe, discreet environment. Find meaningful arrangements with verified profiles.',
    siteName: 'Dandy Babe',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dandy Babe - Premium Sugar Daddy Dating Platform',
        type: 'image/jpeg',
      },
      {
        url: '/og-image-square.jpg',
        width: 600,
        height: 600,
        alt: 'Dandy Babe Logo',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dandy Babe - Premium Sugar Daddy Dating Platform',
    description: 'Connect with successful sugar daddies and sugar babies in a safe, discreet environment.',
    images: ['/og-image.jpg'],
    creator: '@dandybabe',
    site: '@dandybabe',
  },
  facebook: {
    appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
      'es-ES': '/es',
      'fr-FR': '/fr',
      'de-DE': '/de',
    },
  },
  other: {
    'application-name': 'BrandyBabe.com',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'BrandyBabe.com',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#F7E7CE',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#F7E7CE',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for third-party services */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'BrandyBabe.com',
              description: 'Premium sugar daddy dating platform for successful singles',
              url: process.env.NEXT_PUBLIC_APP_URL || 'https://dandybabe.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dandybabe.com'}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
              publisher: {
                '@type': 'Organization',
                name: 'BrandyBabe.com Inc.',
                logo: {
                  '@type': 'ImageObject',
                  url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dandybabe.com'}/logo.png`,
                },
              },
            }),
          }}
        />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Dandy Babe',
              url: process.env.NEXT_PUBLIC_APP_URL || 'https://dandybabe.com',
              logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dandybabe.com'}/logo.png`,
              description: 'Premium dating platform connecting successful sugar daddies and sugar babies',
              foundingDate: '2024',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-555-BRANDY',
                contactType: 'customer service',
                availableLanguage: ['English', 'Spanish', 'French'],
              },
              sameAs: [
                'https://www.facebook.com/brandybabe',
                'https://www.instagram.com/brandybabe',
                'https://www.twitter.com/brandybabe',
                'https://www.linkedin.com/company/brandybabe',
              ],
            }),
          }}
        />

        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is sugar daddy dating?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Sugar daddy dating involves mutually beneficial relationships where successful individuals (sugar daddies) provide financial support to attractive companions (sugar babies) in exchange for companionship and intimacy.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Is BrandyBabe.com safe?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, BrandyBabe.com prioritizes safety with mandatory verification, background checks, and advanced fraud detection. All profiles are vetted and we provide 24/7 support.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How much does it cost?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'BrandyBabe.com offers flexible pricing: Free basic membership, Premium at $29.99/month, Elite at $99.99/month, and VIP at $299.99/month with exclusive features.',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${montserrat.variable} ${greatVibes.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <AccessibilityProvider>
            <ToastProvider>
              <TooltipProvider>
                <SEOProvider>
                  {/* Skip link for screen readers */}
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-champagne-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-champagne-500"
                  >
                    Skip to main content
                  </a>
                  
                  {children}
                </SEOProvider>
              </TooltipProvider>
            </ToastProvider>
          </AccessibilityProvider>
        </ErrorBoundary>

        {/* Performance and Analytics Scripts */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                    send_page_view: true
                  });
                `,
              }}
            />

            {/* Hotjar */}
            {process.env.NEXT_PUBLIC_HOTJAR_ID && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(h,o,t,j,a,r){
                      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                      h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                      a=o.getElementsByTagName('head')[0];
                      r=o.createElement('script');r.async=1;
                      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                      a.appendChild(r);
                    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                  `,
                }}
              />
            )}
          </>
        )}
      </body>
    </html>
  );
}
