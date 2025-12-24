'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  type: string;
  data: any;
}

/**
 * Structured data component for SEO
 */
export default function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    // Remove existing structured data script
    const existingScript = document.querySelector(`script[type="application/ld+json"][data-type="${type}"]`);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-type', type);
    script.textContent = JSON.stringify(data);
    
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [type, data]);

  return null;
}

/**
 * Organization structured data
 */
export const OrganizationSchema = () => {
  const data = {
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
  };

  return <StructuredData type="organization" data={data} />;
};

/**
 * Website structured data
 */
export const WebsiteSchema = () => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dandy Babe',
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
      name: 'Dandy Babe Inc.',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dandybabe.com'}/logo.png`,
      },
    },
  };

  return <StructuredData type="website" data={data} />;
};

/**
 * FAQ structured data
 */
export const FAQSchema = () => {
  const data = {
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
        name: 'Is Dandy Babe safe?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Dandy Babe prioritizes safety with mandatory verification, background checks, and advanced fraud detection. All profiles are vetted and we provide 24/7 support.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does it cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dandy Babe offers flexible pricing: Free basic membership, Premium at $29.99/month, Elite at $99.99/month, and VIP at $299.99/month with exclusive features.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I remain anonymous?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we provide privacy controls to help you maintain anonymity. You can control what information is visible to other users and use our secure messaging system.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I verify my profile?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer multiple verification methods including photo verification, ID verification, and social media verification. Verified profiles receive a special badge and higher visibility.',
        },
      },
    ],
  };

  return <StructuredData type="faq" data={data} />;
};

/**
 * Breadcrumb structured data
 */
export const BreadcrumbSchema = ({ breadcrumbs }: { breadcrumbs: Array<{ name: string; url?: string }> }) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };

  return <StructuredData type="breadcrumb" data={data} />;
};

/**
 * Local Business structured data for city pages
 */
export const LocalBusinessSchema = ({ city }: { city: string }) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `BrandyBabe.com - ${city} Sugar Dating`,
    description: `Find sugar daddies and sugar babies in ${city}. Connect with successful professionals in your area.`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressCountry: 'US',
    },
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dandybabe.com'}/city/${city.toLowerCase().replace(/\s+/g, '-')}`,
    sameAs: [
      'https://www.facebook.com/brandybabe',
      'https://www.instagram.com/brandybabe',
      'https://www.twitter.com/brandybabe',
    ],
  };

  return <StructuredData type="local-business" data={data} />;
};

/**
 * Article structured data for blog posts
 */
export const ArticleSchema = ({ article }: { article: any }) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    articleBody: article.content,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'BrandyBabe.com',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dandybabe.com'}/logo.png`,
      },
    },
    datePublished: article.publishDate,
    dateModified: article.publishDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL || 'https://dandybabe.com'}/blog/${article.slug}`,
    },
    image: article.image ? {
      '@type': 'ImageObject',
      url: article.image,
      width: 1200,
      height: 630,
    } : undefined,
    keywords: article.tags.join(', '),
  };

  return <StructuredData type="article" data={data} />;
};