/**
 * DatingService JSON-LD Schema Markup Component
 * Place this in your layout.tsx or pages where you want schema to appear
 */

interface SchemaMarkupProps {
  brandName: string;
  description: string;
  url: string;
  logo: string;
  ratingValue: string;
  reviewCount: string;
  price: string;
  priceCurrency?: string;
}

export const generateSchemaMarkup = ({
  brandName,
  description,
  url,
  logo,
  ratingValue,
  reviewCount,
  price,
  priceCurrency = 'USD'
}: SchemaMarkupProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'DatingService',
    name: brandName,
    description: description,
    url: url,
    logo: logo,
    priceRange: '$$',
    paymentAccepted: 'Credit Card, PayPal, Crypto',
    currenciesAccepted: priceCurrency,
    
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      reviewCount: reviewCount,
      bestRating: '5',
      worstRating: '1',
      itemReviewed: brandName
    },
    
    review: [
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'Verified Member'
        },
        datePublished: '2024-12-15',
        reviewBody: 'Finally found a site where profiles are actually real. Been here 3 months, met 2 real matches.',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5'
        }
      }
    ],
    
    audience: {
      '@type': 'Audience',
      audienceType: 'Adult Dating,Relationship,Matchmaking',
      targetMinAge: '18',
      targetMaxAge: '99'
    },
    
    category: [
      'Sugar Dating',
      'Elite Dating',
      'Arrangement Dating',
      'Mutual Benefit Dating',
      'Premium Dating'
    ],
    
    areaServed: {
      '@type': 'Place',
      name: 'Worldwide'
    },
    
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Membership Plans',
      itemListElement: [
        {
          '@type': 'Offer',
          name: 'Standard Membership',
          price: price,
          priceCurrency: priceCurrency,
          billingDuration: 'month',
          availability: 'https://schema.org/InStock'
        }
      ]
    },
    
    founder: {
      '@type': 'Person',
      name: 'Alex Thompson',
      jobTitle: 'CEO & Founder',
      sameAs: [
        'https://linkedin.com/in/alex-thompson-dandybabe',
        'https://twitter.com/alexdandybabe'
      ]
    },

    sameAs: [
      'https://facebook.com/dandybabe',
      'https://twitter.com/dandybabe',
      'https://instagram.com/dandybabe',
      'https://tiktok.com/@dandybabe'
    ],

    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-555-3269',
      contactType: 'customer service',
      availableLanguage: 'English',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
        ],
        opens: '00:00',
        closes: '23:59'
      }
    }
  };

  return JSON.stringify(schema);
};

export const SchemaMarkup = (props: SchemaMarkupProps) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: generateSchemaMarkup(props)
      }}
    />
  );
};

// Usage in layout.tsx:
/*
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';

export const metadata: Metadata = {
  // ... other metadata
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <SchemaMarkup
          brandName="Dandy Babe"
          description="Premium dating platform for meaningful arrangements"
          url="https://www.dandybabe.com"
          logo="https://www.dandybabe.com/logo.png"
          ratingValue="4.7"
          reviewCount="2847"
          price="29.99"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
*/
