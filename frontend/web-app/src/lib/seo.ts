import { Metadata, ResolvingMetadata } from 'next';

/**
 * SEO utilities and helpers for dynamic meta tags
 */

// Base SEO configuration
export const SEO_CONFIG = {
  siteName: 'BrandyBabe.com',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://brandybabe.com',
  defaultTitle: 'BrandyBabe.com - Premium Sugar Daddy Dating Platform',
  defaultDescription: 'Connect with successful sugar daddies and sugar babies in a safe, discreet environment. Find meaningful arrangements with verified profiles and transparent pricing.',
  defaultKeywords: [
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
  twitterHandle: '@dandybabe',
  facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
  defaultImage: '/og-image.jpg',
  defaultImageAlt: 'BrandyBabe.com - Premium Sugar Daddy Dating Platform',
};

// City-specific configurations for local SEO
export const CITY_CONFIGS = {
  'new-york': {
    name: 'New York',
    keywords: ['NYC sugar daddy', 'Manhattan sugar baby', 'Brooklyn sugar dating'],
    description: 'Find sugar daddies and sugar babies in New York City. Connect with successful professionals in Manhattan, Brooklyn, and beyond.',
  },
  'los-angeles': {
    name: 'Los Angeles',
    keywords: ['LA sugar daddy', 'Hollywood sugar baby', 'Beverly Hills sugar dating'],
    description: 'Connect with sugar daddies and sugar babies in Los Angeles. Find successful singles in Hollywood, Beverly Hills, and the greater LA area.',
  },
  'chicago': {
    name: 'Chicago',
    keywords: ['Chicago sugar daddy', 'Wicker Park sugar baby', 'Loop sugar dating'],
    description: 'Find sugar daddies and sugar babies in Chicago. Connect with successful professionals in the Windy City and surrounding areas.',
  },
  'miami': {
    name: 'Miami',
    keywords: ['Miami sugar daddy', 'South Beach sugar baby', 'Miami Beach sugar dating'],
    description: 'Connect with sugar daddies and sugar babies in Miami. Find successful singles in South Beach, Brickell, and the greater Miami area.',
  },
  'san-francisco': {
    name: 'San Francisco',
    keywords: ['SF sugar daddy', 'Silicon Valley sugar baby', 'Marina District sugar dating'],
    description: 'Find sugar daddies and sugar babies in San Francisco. Connect with tech professionals and successful singles in the Bay Area.',
  },
  'london': {
    name: 'London',
    keywords: ['London sugar daddy', 'Mayfair sugar baby', 'Kensington sugar dating'],
    description: 'Connect with sugar daddies and sugar babies in London. Find successful professionals in Mayfair, Kensington, and across the UK capital.',
  },
  'paris': {
    name: 'Paris',
    keywords: ['Paris sugar daddy', 'Champs-Élysées sugar baby', 'Le Marais sugar dating'],
    description: 'Find sugar daddies and sugar babies in Paris. Connect with successful singles in the City of Love and beyond.',
  },
  'dubai': {
    name: 'Dubai',
    keywords: ['Dubai sugar daddy', 'Palm Jumeirah sugar baby', 'Downtown Dubai sugar dating'],
    description: 'Connect with sugar daddies and sugar babies in Dubai. Find successful professionals in the UAE\'s most glamorous city.',
  },
};

/**
 * Generate dynamic meta tags for pages
 */
export const generateMetaTags = (
  title?: string,
  description?: string,
  keywords?: string[],
  image?: string,
  url?: string,
  type: 'website' | 'profile' | 'article' = 'website'
): Metadata => {
  const pageTitle = title ? `${title} | ${SEO_CONFIG.siteName}` : SEO_CONFIG.defaultTitle;
  const pageDescription = description || SEO_CONFIG.defaultDescription;
  const pageKeywords = keywords || SEO_CONFIG.defaultKeywords;
  const pageImage = image || `${SEO_CONFIG.baseUrl}${SEO_CONFIG.defaultImage}`;
  const pageUrl = url || `${SEO_CONFIG.baseUrl}/`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    openGraph: {
      type,
      locale: 'en_US',
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: SEO_CONFIG.defaultImageAlt,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: SEO_CONFIG.twitterHandle,
      site: SEO_CONFIG.twitterHandle,
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
    alternates: {
      canonical: pageUrl,
      languages: {
        'en-US': pageUrl,
        'es-ES': pageUrl.replace(/^https?:\/\/[^/]+/, '$&/es'),
        'fr-FR': pageUrl.replace(/^https?:\/\/[^/]+/, '$&/fr'),
        'de-DE': pageUrl.replace(/^https?:\/\/[^/]+/, '$&/de'),
      },
    },
  };
};

/**
 * Generate structured data for profiles
 */
export const generateProfileSchema = (profile: {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
  photos: string[];
  verified: boolean;
  lastActive: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SEO_CONFIG.baseUrl}/profile/${profile.id}`,
    name: profile.name,
    alternateName: profile.name,
    description: profile.bio,
    image: profile.photos[0] || `${SEO_CONFIG.baseUrl}/default-avatar.jpg`,
    gender: 'Female', // This would be dynamic based on profile
    age: profile.age,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location,
      addressCountry: 'US', // This would be dynamic
    },
    sameAs: [
      `${SEO_CONFIG.baseUrl}/profile/${profile.id}`,
    ],
    knowsAbout: profile.interests,
    worksFor: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
    },
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'Verified Member', // This would be dynamic
    },
    memberOf: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.baseUrl,
    },
    isAccessibleForFree: false,
    offers: {
      '@type': 'Offer',
      category: 'Premium Membership',
      availability: 'InStock',
      priceCurrency: 'USD',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SEO_CONFIG.baseUrl}/profile/${profile.id}`,
    },
  };
};

/**
 * Generate structured data for search results
 */
export const generateSearchResultsSchema = (profiles: any[], query: string, totalResults: number) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: `Sugar Daddy Search Results for "${query}"`,
    description: `Search results for sugar daddies and sugar babies matching "${query}"`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: profiles.length,
      itemListElement: profiles.map((profile, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: generateProfileSchema(profile),
      })),
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SEO_CONFIG.baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SEO_CONFIG.baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Search',
          item: `${SEO_CONFIG.baseUrl}/search`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: query,
        },
      ],
    },
  };
};

/**
 * Generate structured data for blog posts
 */
export const generateBlogPostSchema = (post: {
  title: string;
  description: string;
  content: string;
  author: string;
  publishDate: string;
  url: string;
  image?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    articleBody: post.content,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${SEO_CONFIG.baseUrl}/logo.png`,
      },
    },
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
    image: post.image ? {
      '@type': 'ImageObject',
      url: post.image,
      width: 1200,
      height: 630,
    } : undefined,
    keywords: SEO_CONFIG.defaultKeywords.join(', '),
  };
};

/**
 * Generate city-specific meta tags
 */
export const generateCityMetaTags = (citySlug: string): Metadata => {
  const cityConfig = CITY_CONFIGS[citySlug as keyof typeof CITY_CONFIGS];
  
  if (!cityConfig) {
    return generateMetaTags();
  }

  const title = `${cityConfig.name} Sugar Daddy & Sugar Baby Dating | ${SEO_CONFIG.siteName}`;
  const description = cityConfig.description;
  const keywords = [...SEO_CONFIG.defaultKeywords, ...cityConfig.keywords];

  return generateMetaTags(title, description, keywords);
};

/**
 * Generate profile-specific meta tags
 */
export const generateProfileMetaTags = (profile: {
  name: string;
  age: number;
  location: string;
  bio: string;
  photos: string[];
  verified: boolean;
}): Metadata => {
  const title = `${profile.name} (${profile.age}) - ${profile.location} | ${SEO_CONFIG.siteName}`;
  const description = profile.bio || `${profile.name} is looking for a sugar daddy in ${profile.location}. Join ${SEO_CONFIG.siteName} to connect with verified sugar daddies and babies.`;
  const image = profile.photos[0] || SEO_CONFIG.defaultImage;

  return generateMetaTags(title, description, undefined, image, undefined, 'profile');
};

/**
 * Generate search result meta tags
 */
export const generateSearchMetaTags = (query: string, location?: string): Metadata => {
  const locationText = location ? ` in ${location}` : '';
  const title = `Sugar Daddy & Sugar Baby Search${locationText} | ${SEO_CONFIG.siteName}`;
  const description = `Find sugar daddies and sugar babies${locationText} on ${SEO_CONFIG.siteName}. Search for ${query} and connect with verified profiles.`;
  const keywords = [...SEO_CONFIG.defaultKeywords, query, 'search'];

  return generateMetaTags(title, description, keywords);
};

/**
 * Generate blog post meta tags
 */
export const generateBlogMetaTags = (post: {
  title: string;
  description: string;
  tags: string[];
  publishDate: string;
  url: string;
}): Metadata => {
  const title = `${post.title} | Blog | ${SEO_CONFIG.siteName}`;
  const keywords = [...SEO_CONFIG.defaultKeywords, ...post.tags];

  return generateMetaTags(title, post.description, keywords);
};

/**
 * SEO utilities
 */
export const SEOUtils = {
  // Generate canonical URL
  generateCanonicalUrl: (path: string) => {
    const baseUrl = SEO_CONFIG.baseUrl;
    const cleanPath = path.replace(/\/+$/, '').replace(/^\/+/, '');
    return `${baseUrl}/${cleanPath}`;
  },

  // Generate robots meta tag
  generateRobotsMeta: (options: {
    index?: boolean;
    follow?: boolean;
    noindex?: boolean;
    nofollow?: boolean;
  } = {}) => {
    const { index = true, follow = true, noindex = false, nofollow = false } = options;
    
    if (noindex || nofollow) {
      return `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;
    }
    
    return `${index ? 'index' : 'noindex'}, ${follow ? 'follow' : 'nofollow'}`;
  },

  // Generate Open Graph meta tags
  generateOpenGraphMeta: (options: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
  } = {}) => {
    return {
      title: options.title || SEO_CONFIG.defaultTitle,
      description: options.description || SEO_CONFIG.defaultDescription,
      image: options.image || SEO_CONFIG.defaultImage,
      url: options.url || SEO_CONFIG.baseUrl,
      type: options.type || 'website',
    };
  },

  // Generate Twitter Card meta tags
  generateTwitterCardMeta: (options: {
    title?: string;
    description?: string;
    image?: string;
    card?: string;
  } = {}) => {
    return {
      card: options.card || 'summary_large_image',
      title: options.title || SEO_CONFIG.defaultTitle,
      description: options.description || SEO_CONFIG.defaultDescription,
      image: options.image || SEO_CONFIG.defaultImage,
      creator: SEO_CONFIG.twitterHandle,
      site: SEO_CONFIG.twitterHandle,
    };
  },

  // Check if URL is canonical
  isCanonicalUrl: (url: string) => {
    const canonicalUrl = SEOUtils.generateCanonicalUrl(url);
    return url === canonicalUrl;
  },

  // Generate sitemap entry
  generateSitemapEntry: (url: string, options: {
    lastmod?: string;
    changefreq?: string;
    priority?: string;
  } = {}) => {
    return {
      url: SEOUtils.generateCanonicalUrl(url),
      lastmod: options.lastmod || new Date().toISOString(),
      changefreq: options.changefreq || 'weekly',
      priority: options.priority || '0.8',
    };
  },
};