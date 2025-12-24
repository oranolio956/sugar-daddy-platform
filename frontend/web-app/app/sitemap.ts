import { MetadataRoute } from 'next';
import { SEOUtils } from '../src/lib/seo';

// Static pages
const staticPages = [
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/discovery',
  '/messaging',
  '/profile',
  '/subscription',
  '/verification',
  '/resend-verification',
  '/verify-email',
  '/blog',
  '/blog/seeking-com-alternatives',
  '/blog/seeking-com-scams',
  '/blog/seeking-com-login-not-working',
  '/blog/seeking-com-worth-it',
  '/blog/reddit-users-left-seeking-com',
  '/blog/adultfriendfinder-review-2024',
  '/blog/is-seeking-com-worth-it',
];

// City-specific pages
const cityPages = [
  'new-york',
  'los-angeles',
  'chicago',
  'miami',
  'san-francisco',
  'london',
  'paris',
  'dubai',
].map(city => `/city/${city}`);

// Blog post pages
const blogPages = [
  'sugar-daddy-guide',
  'sugar-baby-tips',
  'arrangement-ideas',
  'safety-tips',
  'success-stories',
  'relationship-advice',
].map(post => `/blog/${post}`);

// Generate sitemap
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dandybabe.com';
  
  const staticUrls: MetadataRoute.Sitemap = staticPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFreq: 'weekly',
    priority: page === '/' ? 1.0 : 0.8,
  }));

  const cityUrls: MetadataRoute.Sitemap = cityPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFreq: 'daily',
    priority: 0.9,
  }));

  const blogUrls: MetadataRoute.Sitemap = blogPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFreq: 'weekly',
    priority: 0.7,
  }));

  return [
    ...staticUrls,
    ...cityUrls,
    ...blogUrls,
  ];
}