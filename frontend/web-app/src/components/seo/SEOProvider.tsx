'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { generateMetaTags, generateProfileSchema, generateSearchResultsSchema } from '../../lib/seo';
import DynamicMetaTags from './DynamicMetaTags';
import StructuredData from './StructuredData';
import SEOValidator from './SEOValidator';

interface SEOContextType {
  updateMeta: (meta: any) => void;
  updateStructuredData: (type: string, data: any) => void;
  generateProfileSchema: (profile: any) => void;
  generateSearchResultsSchema: (profiles: any[], query: string, totalResults: number) => void;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

export const SEOProvider = ({ children }: { children: React.ReactNode }) => {
  const [meta, setMeta] = useState<any>(null);
  const [structuredData, setStructuredData] = useState<Array<{ type: string; data: any }>>([]);

  const updateMeta = (newMeta: any) => {
    setMeta(newMeta);
  };

  const updateStructuredData = (type: string, data: any) => {
    setStructuredData(prev => {
      const filtered = prev.filter(item => item.type !== type);
      return [...filtered, { type, data }];
    });
  };

  const generateProfileSchema = (profile: any) => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL || 'https://brandybabe.com'}/profile/${profile.id}`,
      name: profile.name,
      alternateName: profile.name,
      description: profile.bio,
      image: profile.photos[0] || `${process.env.NEXT_PUBLIC_APP_URL || 'https://brandybabe.com'}/default-avatar.jpg`,
      gender: profile.gender || 'Female',
      age: profile.age,
      address: {
        '@type': 'PostalAddress',
        addressLocality: profile.location,
        addressCountry: 'US',
      },
      sameAs: [
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://brandybabe.com'}/profile/${profile.id}`,
      ],
      knowsAbout: profile.interests,
      worksFor: {
        '@type': 'Organization',
        name: 'BrandyBabe.com',
      },
      memberOf: {
        '@type': 'Organization',
        name: 'BrandyBabe.com',
        url: process.env.NEXT_PUBLIC_APP_URL || 'https://brandybabe.com',
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
        '@id': `${process.env.NEXT_PUBLIC_APP_URL || 'https://brandybabe.com'}/profile/${profile.id}`,
      },
    };

    updateStructuredData('profile', schema);
  };

  const generateSearchResultsSchema = (profiles: any[], query: string, totalResults: number) => {
    const schema = {
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
          urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://brandybabe.com'}/search?q={search_term_string}`,
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
            item: process.env.NEXT_PUBLIC_APP_URL || 'https://brandybabe.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Search',
            item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://brandybabe.com'}/search`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: query,
          },
        ],
      },
    };

    updateStructuredData('search-results', schema);
  };

  return (
    <SEOContext.Provider value={{
      updateMeta,
      updateStructuredData,
      generateProfileSchema,
      generateSearchResultsSchema,
    }}>
      {children}
      
      {/* Dynamic Meta Tags */}
      {meta && <DynamicMetaTags {...meta} />}
      
      {/* Structured Data */}
      {structuredData.map(({ type, data }) => (
        <StructuredData key={type} type={type} data={data} />
      ))}
      
      {/* SEO Validator for development */}
      {process.env.NODE_ENV === 'development' && <SEOValidator />}
    </SEOContext.Provider>
  );
};

export const useSEO = () => {
  const context = useContext(SEOContext);
  if (context === undefined) {
    throw new Error('useSEO must be used within a SEOProvider');
  }
  return context;
};

// HOC for easy SEO integration
export const withSEO = (Component: React.ComponentType<any>, seoProps: any) => {
  return (props: any) => {
    const { updateMeta } = useSEO();
    
    useEffect(() => {
      updateMeta(seoProps);
    }, [updateMeta, seoProps]);

    return <Component {...props} />;
  };
};