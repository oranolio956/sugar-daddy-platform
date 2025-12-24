import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import MetaTags from '@/components/seo/MetaTags';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import DatingSchema from '@/components/seo/DatingSchema';

export const metadata: Metadata = {
  title: 'Sugar Dating Blog - Tips, Reviews & Success Stories | Dandy Babe',
  description: 'Expert sugar dating advice, platform reviews, and success stories. Learn how to find sugar daddies, avoid scams, and build successful arrangements.',
  keywords: ['sugar dating blog', 'sugar daddy tips', 'sugar baby guide', 'dating advice', 'sugar dating reviews', 'arrangement dating'],
  openGraph: {
    title: 'Sugar Dating Blog - Tips, Reviews & Success Stories',
    description: 'Expert sugar dating advice, platform reviews, and success stories from the Dandy Babe community.',
    url: `${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/blog`,
    type: 'website',
    images: [
      {
        url: 'https://www.dandybabe.com/blog-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sugar Dating Blog - BrandyBabe.com',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sugar Dating Blog - Tips, Reviews & Success Stories',
    description: 'Expert sugar dating advice, platform reviews, and success stories.',
    images: ['https://www.dandybabe.com/blog-og-image.jpg'],
  },
  alternates: {
    canonical: `${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/blog`,
  },
};

const blogPosts = [
  {
    slug: 'seeking-com-login-not-working',
    title: 'Seeking.com Login Not Working? Here\'s Why Your Account Might Be Flagged (2024)',
    excerpt: 'Frustrated with Seeking.com login issues? Discover why accounts get flagged and what you can do about it.',
    date: '2024-12-20',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
    category: 'Platform Issues'
  },
  {
    slug: 'seeking-com-alternatives',
    title: 'Seeking.com Alternatives That Actually Work: My 90-Day Investigation',
    excerpt: 'After spending months testing alternatives to Seeking.com, here are the platforms that deliver real results.',
    date: '2024-12-18',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80',
    category: 'Reviews'
  },
  {
    slug: 'is-seeking-com-worth-it',
    title: 'Is Seeking.com Worth It in 2024? A Brutally Honest Cost Analysis',
    excerpt: 'Breaking down the real costs of Seeking.com membership and whether it\'s worth your investment.',
    date: '2024-12-15',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
    category: 'Analysis'
  },
  {
    slug: 'seeking-com-scams',
    title: 'Seeking.com Scams: The Red Flags They Don\'t Tell You About',
    excerpt: 'Protect yourself from common scams on Seeking.com with this comprehensive guide to red flags.',
    date: '2024-12-12',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    category: 'Safety'
  },
  {
    slug: 'reddit-users-left-seeking-com',
    title: 'Reddit Users Reveal: Why I Left Seeking.com for Good',
    excerpt: 'Real stories from Reddit users who made the switch from Seeking.com to better alternatives.',
    date: '2024-12-10',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    category: 'Community'
  },
  {
    slug: 'adultfriendfinder-review-2024',
    title: 'AdultFriendFinder Review 2024: Still Relevant or Just a Dating Dinosaur?',
    excerpt: 'A comprehensive review of AdultFriendFinder in 2024 - does this veteran platform still have what it takes?',
    date: '2024-12-08',
    readTime: '11 min read',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    category: 'Reviews'
  }
];

export default function BlogPage() {
  return (
    <Layout>
      {/* SEO Meta Tags */}
      <MetaTags
        title="Sugar Dating Blog - Tips, Reviews & Success Stories | Dandy Babe"
        description="Expert sugar dating advice, platform reviews, and success stories. Learn how to find sugar daddies, avoid scams, and build successful arrangements."
        keywords={['sugar dating blog', 'sugar daddy tips', 'sugar baby guide', 'dating advice', 'sugar dating reviews', 'arrangement dating']}
        canonical={`${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/blog`}
        ogTitle="Sugar Dating Blog - Tips, Reviews & Success Stories"
        ogDescription="Expert sugar dating advice, platform reviews, and success stories from the BrandyBabe.com community."
        ogImage="https://www.dandybabe.com/blog-og-image.jpg"
        ogUrl={`${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/blog`}
        twitterTitle="Sugar Dating Blog - Tips, Reviews & Success Stories"
        twitterDescription="Expert sugar dating advice, platform reviews, and success stories."
        twitterImage="https://www.dandybabe.com/blog-og-image.jpg"
        robots="index, follow"
        schemaType="WebPage"
        author="Dandy Babe Editorial Team"
        category="blog"
        tags={['sugar dating', 'sugar daddy', 'sugar baby', 'dating advice', 'platform reviews']}
        siteName="BrandyBabe.com"
        type="website"
      />

      {/* Dating Schema Markup */}
      <DatingSchema
        type="Organization"
        name="Dandy Babe"
        description="Premium sugar daddy dating platform providing expert advice and community insights."
        url={`${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/blog`}
        logo="https://www.dandybabe.com/logo.png"
        foundingDate="2024"
        contactType="Editorial"
        telephone="+1-555-BRANDY"
        email="editorial@dandybabe.com"
        priceRange="$$$"
        keywords={['sugar dating', 'sugar daddy', 'sugar baby', 'dating advice', 'platform reviews', 'success stories']}
      />

      {/* Breadcrumbs */}
      <div className="container-custom py-4">
        <Breadcrumbs
          items={[{ label: 'Blog', current: true }]}
          className="text-sm text-neutral-500"
        />
      </div>

      {/* Hero Section */}
      <section className="relative py-32 bg-charcoal-900">
        <div className="absolute inset-0 bg-gradient-to-br from-champagne-500/5 to-transparent" />
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              Sugar Dating <span className="text-champagne-500">Insights</span>
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Expert advice, honest reviews, and real stories from the sugar dating community.
              Navigate the world of arrangements with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-32 bg-charcoal-800">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article key={post.slug} className="group">
                <div className="bg-charcoal-900/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/5 hover:border-champagne-500/30 transition-all duration-500">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 bg-champagne-500/10 text-champagne-500 text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                      <span className="text-neutral-500 text-sm">{post.readTime}</span>
                    </div>
                    <h2 className="text-xl font-display font-bold text-white mb-3 group-hover:text-champagne-500 transition-colors line-clamp-2">
                      <a href={`/blog/${post.slug}`} className="block">
                        {post.title}
                      </a>
                    </h2>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <time className="text-neutral-500 text-xs" dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                      <a
                        href={`/blog/${post.slug}`}
                        className="text-champagne-500 hover:text-champagne-400 text-sm font-medium transition-colors group-hover:translate-x-1 transform duration-200"
                      >
                        Read More →
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-charcoal-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-gold opacity-[0.03]" />
        <div className="container-custom relative z-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-display font-bold text-white mb-6">
              Ready to Find Your <span className="text-champagne-500">Perfect Match?</span>
            </h2>
            <p className="text-xl text-neutral-400 mb-8">
              Join thousands of successful individuals who've found meaningful connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-gradient-gold text-charcoal-900 px-8 py-4 rounded-full font-bold tracking-widest uppercase text-sm hover:shadow-[0_0_30px_rgba(247,231,206,0.3)] transition-all duration-300"
              >
                Start Your Journey
              </a>
              <a
                href="/login"
                className="border border-champagne-500/30 text-champagne-500 px-8 py-4 rounded-full font-medium tracking-widest uppercase text-sm hover:bg-champagne-500/10 transition-all duration-300"
              >
                Member Login
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}