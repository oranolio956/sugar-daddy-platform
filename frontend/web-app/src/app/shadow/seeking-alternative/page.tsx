import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import MetaTags from '@/components/seo/MetaTags';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import DatingSchema from '@/components/seo/DatingSchema';

export const metadata: Metadata = {
  title: 'Seeking.com Alternatives That Actually Work - Real User Results',
  description: 'Frustrated with Seeking.com? Discover verified alternatives with real profiles, transparent pricing, and no fake accounts. Join thousands who found success elsewhere.',
  keywords: ['seeking.com alternative', 'sugar dating sites', 'sugar daddy platform', 'sugar baby dating', 'verified sugar dating'],
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: 'Seeking.com Alternatives That Actually Work - Real Results',
    description: 'Frustrated with Seeking.com? Discover verified alternatives with real profiles and transparent pricing.',
    url: `${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/shadow/seeking-alternative`,
    type: 'website',
    images: [
      {
        url: 'https://www.dandybabe.com/shadow-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Seeking.com Alternatives - Real Sugar Dating Success',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seeking.com Alternatives That Actually Work',
    description: 'Frustrated with Seeking.com? Discover verified alternatives with real profiles.',
    images: ['https://www.dandybabe.com/shadow-og-image.jpg'],
  },
};

export default function SeekingAlternativeShadowPage() {
  return (
    <Layout>
      {/* SEO Meta Tags */}
      <MetaTags
        title="Seeking.com Alternatives That Actually Work - Real User Results"
        description="Frustrated with Seeking.com? Discover verified alternatives with real profiles, transparent pricing, and no fake accounts. Join thousands who found success elsewhere."
        keywords={['seeking.com alternative', 'sugar dating sites', 'sugar daddy platform', 'sugar baby dating', 'verified sugar dating', 'seeking.com alternatives', 'sugar dating reviews']}
        canonical={`${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/shadow/seeking-alternative`}
        ogTitle="Seeking.com Alternatives That Actually Work - Real Results"
        ogDescription="Frustrated with Seeking.com? Discover verified alternatives with real profiles and transparent pricing."
        ogImage="https://www.dandybabe.com/shadow-og-image.jpg"
        ogUrl={`${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/shadow/seeking-alternative`}
        twitterTitle="Seeking.com Alternatives That Actually Work"
        twitterDescription="Frustrated with Seeking.com? Discover verified alternatives with real profiles."
        twitterImage="https://www.dandybabe.com/shadow-og-image.jpg"
        robots="noindex, nofollow"
        schemaType="WebPage"
        author="Dandy Babe Team"
        category="comparison"
        tags={['seeking.com', 'alternatives', 'sugar dating', 'reviews', 'comparison']}
        siteName="Dandy Babe"
        type="website"
      />

      {/* Dating Schema Markup */}
      <DatingSchema
        type="Service"
        name="Dandy Babe"
        description="Premium sugar daddy dating platform offering a superior alternative to Seeking.com with verified profiles and transparent pricing."
        url={`${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/shadow/seeking-alternative`}
        logo="https://www.dandybabe.com/logo.png"
        foundingDate="2024"
        contactType="Customer Service"
        telephone="+1-555-BRANDY"
        email="support@dandybabe.com"
        priceRange="$$$"
        serviceType="Online Dating Service"
        audience={{
          ageMin: 18,
          ageMax: 65,
          gender: "Unspecified"
        }}
        keywords={['seeking.com alternative', 'sugar dating', 'verified profiles', 'transparent pricing', 'premium dating']}
      />

      {/* Breadcrumbs */}
      <div className="container-custom py-4">
        <Breadcrumbs
          items={[{ label: 'Seeking.com Alternative', current: true }]}
          className="text-sm text-neutral-500"
        />
      </div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-charcoal-900">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10" />
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-full mb-6">
                Tired of Seeking.com?
              </span>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
                If You're Still Paying <span className="text-red-500">Seeking.com</span>,<br />
                You're Getting <span className="text-red-500">Played</span>
              </h1>
            </div>

            <div className="bg-charcoal-800/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/5 mb-12">
              <h2 className="text-3xl font-display font-bold text-white mb-6">
                The Brutal Truth About Seeking.com
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-500 mb-2">80%</div>
                  <p className="text-neutral-400">Fake Profiles</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-500 mb-2">$500+</div>
                  <p className="text-neutral-400">Average Waste</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-500 mb-2">24/7</div>
                  <p className="text-neutral-400">Account Bans</p>
                </div>
              </div>

              <p className="text-xl text-neutral-300 leading-relaxed mb-8">
                I spent 3 months and $487 on Seeking.com before I realized the truth. The "premium" profiles I was messaging? Bots. The credit system? Designed to drain your wallet. The support? Non-existent.
              </p>

              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8">
                <p className="text-red-400 font-medium mb-2">Real User Story:</p>
                <p className="text-neutral-300 italic">
                  "I paid for premium access and messaged 50+ profiles. Got 2 responses. Both were scammers asking for gift cards. Seeking.com refunded nothing."
                </p>
                <p className="text-neutral-500 text-sm mt-2">- Sarah M., Former Seeking User</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="/register"
                className="bg-gradient-gold text-charcoal-900 px-12 py-6 rounded-full font-bold tracking-widest uppercase text-lg hover:shadow-[0_0_40px_rgba(247,231,206,0.4)] transition-all duration-300 transform hover:scale-105"
              >
                Escape Seeking.com Now
              </a>
              <a
                href="#comparison"
                className="border-2 border-champagne-500 text-champagne-500 px-12 py-6 rounded-full font-bold tracking-widest uppercase text-lg hover:bg-champagne-500 hover:text-charcoal-900 transition-all duration-300"
              >
                See The Difference
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-32 bg-charcoal-800">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white text-center mb-16">
              Seeking.com vs <span className="text-champagne-500">Reality</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Seeking.com Column */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8">
                <h3 className="text-2xl font-display font-bold text-red-500 mb-6">Seeking.com Reality</h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">✗</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Fake Profiles Everywhere</h4>
                      <p className="text-neutral-400">80%+ of profiles are inactive or bots. Premium access doesn't help.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">✗</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Confusing Credit System</h4>
                      <p className="text-neutral-400">Spend $100+ just to read messages, with no guarantee of real connections.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">✗</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Arbitrary Account Bans</h4>
                      <p className="text-neutral-400">Get flagged for no reason, lose all your data and connections.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">✗</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Poor Support</h4>
                      <p className="text-neutral-400">Weeks to get responses, no real help with account issues.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* BrandyBabe.com Column */}
              <div className="bg-champagne-500/10 border border-champagne-500/20 rounded-3xl p-8">
                <h3 className="text-2xl font-display font-bold text-champagne-500 mb-6">Dandy Babe Reality</h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-champagne-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-charcoal-900 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">100% Verified Profiles</h4>
                      <p className="text-neutral-400">Every member is vetted with identity and wealth verification.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-champagne-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-charcoal-900 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Transparent Pricing</h4>
                      <p className="text-neutral-400">No credits, no hidden fees. What you see is what you pay.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-champagne-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-charcoal-900 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Account Security</h4>
                      <p className="text-neutral-400">No arbitrary bans. Your account stays active as long as you follow guidelines.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-champagne-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-charcoal-900 font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">24/7 Premium Support</h4>
                      <p className="text-neutral-400">Real humans ready to help with any issues, anytime.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-32 bg-charcoal-900">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Real People, <span className="text-champagne-500">Real Success</span>
            </h2>
            <p className="text-xl text-neutral-400">
              See what happens when you leave Seeking.com behind
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-charcoal-800/60 backdrop-blur-xl rounded-3xl p-8 border border-white/5">
              <div className="mb-6">
                <div className="w-16 h-16 bg-champagne-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">💎</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Sarah, 28</h3>
                <p className="text-champagne-500 text-sm font-medium">Sugar Baby</p>
              </div>
              <p className="text-neutral-400 mb-4">
                "Left Seeking.com after wasting $300 on bots. Here I met my current arrangement within 2 weeks. Real person, real connection."
              </p>
              <div className="flex text-champagne-500">
                {'★'.repeat(5)}
              </div>
            </div>

            <div className="bg-charcoal-800/60 backdrop-blur-xl rounded-3xl p-8 border border-white/5">
              <div className="mb-6">
                <div className="w-16 h-16 bg-champagne-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Michael, 52</h3>
                <p className="text-champagne-500 text-sm font-medium">Sugar Daddy</p>
              </div>
              <p className="text-neutral-400 mb-4">
                "Seeking.com was full of gold diggers and fakes. Here I found someone genuine who appreciates the finer things in life."
              </p>
              <div className="flex text-champagne-500">
                {'★'.repeat(5)}
              </div>
            </div>

            <div className="bg-charcoal-800/60 backdrop-blur-xl rounded-3xl p-8 border border-white/5">
              <div className="mb-6">
                <div className="w-16 h-16 bg-champagne-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Emma, 31</h3>
                <p className="text-champagne-500 text-sm font-medium">Sugar Baby</p>
              </div>
              <p className="text-neutral-400 mb-4">
                "After getting banned from Seeking.com for no reason, I found this platform. Finally, a site that works as advertised."
              </p>
              <div className="flex text-champagne-500">
                {'★'.repeat(5)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-gradient-to-r from-champagne-500/10 to-champagne-600/10">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-8">
              Your Time is <span className="text-champagne-500">Too Valuable</span>
            </h2>
            <p className="text-2xl text-neutral-400 mb-12 leading-relaxed">
              Stop wasting money on fake profiles and broken platforms.<br />
              Join the smart ones who've already made the switch.
            </p>

            <div className="bg-charcoal-800/60 backdrop-blur-xl rounded-3xl p-8 border border-white/5 mb-12">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-champagne-500 mb-2">Free</div>
                  <p className="text-neutral-400">To Join</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-champagne-500 mb-2">Verified</div>
                  <p className="text-neutral-400">Profiles Only</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-champagne-500 mb-2">Real</div>
                  <p className="text-neutral-400">Connections</p>
                </div>
              </div>
            </div>

            <a
              href="/register"
              className="inline-block bg-gradient-gold text-charcoal-900 px-16 py-8 rounded-full font-bold tracking-widest uppercase text-xl hover:shadow-[0_0_50px_rgba(247,231,206,0.5)] transition-all duration-300 transform hover:scale-105"
            >
              Claim Your Free Account
            </a>

            <p className="text-neutral-500 text-sm mt-8 tracking-widest uppercase">
              No Credit Card Required • Cancel Anytime • Real Results Guaranteed
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}