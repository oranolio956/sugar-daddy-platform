/**
 * Article Schema Markup Component
 * Adds structured data for blog posts to improve SEO
 */

interface ArticleSchemaProps {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  publisherName: string;
  publisherLogo: string;
  url: string;
  wordCount?: number;
  keywords?: string[];
}

export const generateArticleSchema = ({
  headline,
  description,
  image = "https://www.dandybabe.com/og-image.jpg",
  datePublished,
  dateModified,
  authorName,
  authorUrl = "https://www.dandybabe.com",
  publisherName = "Dandy Babe",
  publisherLogo = "https://www.dandybabe.com/logo.png",
  url,
  wordCount = 800,
  keywords = []
}: ArticleSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: headline,
    description: description,
    image: image,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: authorUrl
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogo
      }
    },
    url: url,
    wordCount: wordCount,
    keywords: keywords.join(', '),
    inLanguage: 'en-US',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    articleSection: 'Dating Advice',
    isAccessibleForFree: true
  };

  return JSON.stringify(schema);
};

export const ArticleSchema = (props: ArticleSchemaProps) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: generateArticleSchema(props)
      }}
    />
  );
};