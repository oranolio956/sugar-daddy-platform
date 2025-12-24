'use client';

import { useEffect, useState } from 'react';

interface SEOValidationResult {
  title: { valid: boolean; length: number; message: string };
  description: { valid: boolean; length: number; message: string };
  keywords: { valid: boolean; count: number; message: string };
  ogTags: { valid: boolean; missing: string[] };
  twitterTags: { valid: boolean; missing: string[] };
  structuredData: { valid: boolean; count: number };
  performance: { score: number; issues: string[] };
}

/**
 * SEO validation component for development and debugging
 */
export default function SEOValidator() {
  const [validation, setValidation] = useState<SEOValidationResult | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const validateSEO = () => {
      const result: SEOValidationResult = {
        title: validateTitle(),
        description: validateDescription(),
        keywords: validateKeywords(),
        ogTags: validateOpenGraph(),
        twitterTags: validateTwitter(),
        structuredData: validateStructuredData(),
        performance: validatePerformance(),
      };

      setValidation(result);
    };

    validateSEO();
    window.addEventListener('load', validateSEO);
    window.addEventListener('popstate', validateSEO);

    return () => {
      window.removeEventListener('load', validateSEO);
      window.removeEventListener('popstate', validateSEO);
    };
  }, []);

  const validateTitle = () => {
    const title = document.title;
    const length = title.length;
    const valid = length >= 30 && length <= 60;
    const message = valid 
      ? 'Title length is optimal' 
      : length < 30 
        ? 'Title is too short (recommended: 30-60 characters)' 
        : 'Title is too long (recommended: 30-60 characters)';

    return { valid, length, message };
  };

  const validateDescription = () => {
    const metaDesc = document.querySelector('meta[name="description"]');
    const description = metaDesc?.getAttribute('content') || '';
    const length = description.length;
    const valid = length >= 50 && length <= 160;
    const message = valid 
      ? 'Description length is optimal' 
      : length < 50 
        ? 'Description is too short (recommended: 50-160 characters)' 
        : 'Description is too long (recommended: 50-160 characters)';

    return { valid, length, message };
  };

  const validateKeywords = () => {
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const keywords = metaKeywords?.getAttribute('content') || '';
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    const count = keywordList.length;
    const valid = count >= 3 && count <= 10;
    const message = valid 
      ? `Using ${count} keywords is optimal` 
      : count < 3 
        ? 'Too few keywords (recommended: 3-10)' 
        : 'Too many keywords (recommended: 3-10)';

    return { valid, count, message };
  };

  const validateOpenGraph = () => {
    const requiredTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
    const missing: string[] = [];

    requiredTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      if (!element) missing.push(tag);
    });

    return { valid: missing.length === 0, missing };
  };

  const validateTwitter = () => {
    const requiredTags = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
    const missing: string[] = [];

    requiredTags.forEach(tag => {
      const element = document.querySelector(`meta[name="${tag}"]`);
      if (!element) missing.push(tag);
    });

    return { valid: missing.length === 0, missing };
  };

  const validateStructuredData = () => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const count = scripts.length;
    const valid = count > 0;

    return { valid, count };
  };

  const validatePerformance = () => {
    const issues: string[] = [];
    let score = 100;

    // Check for large images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.naturalWidth > 1200 || img.naturalHeight > 800) {
        issues.push(`Large image detected: ${img.src}`);
        score -= 5;
      }
    });

    // Check for missing alt text
    images.forEach(img => {
      if (!img.alt || img.alt.trim() === '') {
        issues.push(`Image missing alt text: ${img.src}`);
        score -= 3;
      }
    });

    // Check for inline styles
    const elementsWithInlineStyles = document.querySelectorAll('[style]');
    if (elementsWithInlineStyles.length > 0) {
      issues.push(`Found ${elementsWithInlineStyles.length} elements with inline styles`);
      score -= 2;
    }

    // Check for missing meta tags
    const requiredMetaTags = ['viewport', 'description'];
    requiredMetaTags.forEach(tag => {
      const meta = document.querySelector(`meta[name="${tag}"]`);
      if (!meta) {
        issues.push(`Missing meta tag: ${tag}`);
        score -= 5;
      }
    });

    return { score: Math.max(0, score), issues };
  };

  if (!validation || !isVisible) return null;

  const overallScore = Math.round(
    (validation.title.valid + validation.description.valid + validation.keywords.valid + 
     validation.ogTags.valid + validation.twitterTags.valid + validation.structuredData.valid) / 6 * 100
  );

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-800">SEO Validator</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Overall Score</span>
          <span className={`text-sm font-bold ${
            overallScore >= 80 ? 'text-green-600' : overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {overallScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              overallScore >= 80 ? 'bg-green-500' : overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${overallScore}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className={`flex justify-between ${validation.title.valid ? 'text-green-600' : 'text-red-600'}`}>
          <span>Title</span>
          <span>{validation.title.length} chars</span>
        </div>
        
        <div className={`flex justify-between ${validation.description.valid ? 'text-green-600' : 'text-red-600'}`}>
          <span>Description</span>
          <span>{validation.description.length} chars</span>
        </div>
        
        <div className={`flex justify-between ${validation.keywords.valid ? 'text-green-600' : 'text-red-600'}`}>
          <span>Keywords</span>
          <span>{validation.keywords.count} used</span>
        </div>
        
        <div className={`flex justify-between ${validation.ogTags.valid ? 'text-green-600' : 'text-red-600'}`}>
          <span>Open Graph</span>
          <span>{validation.ogTags.missing.length === 0 ? 'Complete' : 'Missing'}</span>
        </div>
        
        <div className={`flex justify-between ${validation.twitterTags.valid ? 'text-green-600' : 'text-red-600'}`}>
          <span>Twitter Cards</span>
          <span>{validation.twitterTags.missing.length === 0 ? 'Complete' : 'Missing'}</span>
        </div>
        
        <div className={`flex justify-between ${validation.structuredData.valid ? 'text-green-600' : 'text-red-600'}`}>
          <span>Structured Data</span>
          <span>{validation.structuredData.count} found</span>
        </div>
      </div>

      {validation.performance.issues.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-red-600 mb-2">Performance Issues</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {validation.performance.issues.map((issue, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-1">•</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}