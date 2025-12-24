import { Metadata } from 'next';
import { generateMetaTags } from '../src/lib/seo';
import { useSEO } from '../src/components/seo/SEOProvider';
import { usePerformanceMonitor } from '../src/lib/performance';
import { LazyFramerMotion, LazyLucideIcons } from '../src/lib/lazyLoad';
import { OptimizedImage, Gallery, Avatar } from '../src/components/ui/OptimizedImage';
import { Button } from '../src/components/ui/Button';
import { Badge } from '../src/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/Card';

const { motion, AnimatePresence } = LazyFramerMotion;
const { Users, Heart, Star, Shield, Globe, Calendar, MessageCircle, TrendingUp } = LazyLucideIcons;

export async function generateMetadata(): Promise<Metadata> {
  return generateMetaTags(
    undefined,
    undefined,
    undefined,
    '/og-image.jpg',
    '/',
    'website'
  );
}

export default function HomePage() {
  const { updateMeta, updateStructuredData } = useSEO();
  const { metrics } = usePerformanceMonitor();

  useEffect(() => {
    // Update structured data for homepage
    updateStructuredData('homepage', {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://brandybabe.com',
      name: 'BrandyBabe.com - Premium Sugar Daddy Dating Platform',
      description: 'Connect with successful sugar daddies and sugar babies in a safe, discreet environment. Find meaningful arrangements with verified profiles and transparent pricing.',
      url: 'https://brandybabe.com',
      isPartOf: {
        '@type': 'WebSite',
        name: 'BrandyBabe.com',
        url: 'https://brandybabe.com',
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: 'https://brandybabe.com/og-image.jpg',
      },
      datePublished: '2024-01-01',
      dateModified: '2024-01-01',
      author: {
        '@type': 'Organization',
        name: 'BrandyBabe.com Inc.',
      },
      publisher: {
        '@type': 'Organization',
        name: 'BrandyBabe.com Inc.',
        logo: {
          '@type': 'ImageObject',
          url: 'https://brandybabe.com/logo.png',
        },
      },
      mainEntity: {
        '@type': 'Organization',
        name: 'BrandyBabe.com',
        url: 'https://brandybabe.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://brandybabe.com/logo.png',
        },
        description: 'Premium dating platform connecting successful sugar daddies and sugar babies',
        foundingDate: '2024',
        sameAs: [
          'https://www.facebook.com/brandybabe',
          'https://www.instagram.com/brandybabe',
          'https://www.twitter.com/brandybabe',
        ],
      },
    });
  }, [updateMeta, updateStructuredData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl"
            >
              <Users className="w-12 h-12 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              Premium Sugar Daddy Dating
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Connect with successful sugar daddies and sugar babies in a safe, discreet environment. 
              Find meaningful arrangements with verified profiles and transparent pricing.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-x-4"
            >
              <Button
                size="lg"
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Find Sugar Daddies
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors shadow-lg"
              >
                Find Sugar Babies
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex items-center justify-center space-x-8 text-white/80"
            >
              <div className="text-center">
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm">Active Members</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm">Success Rate</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm">Support</div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose BrandyBabe.com?</h2>
            <p className="text-xl text-gray-600">Premium features designed for successful singles</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-gray-800">Verified Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">All profiles are verified to ensure authenticity and safety. Our advanced verification process protects you from scammers and fake profiles.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-gray-800">Premium Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Enjoy exclusive features including advanced search filters, priority messaging, and access to premium members only events.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-gray-800">Global Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Connect with successful singles from around the world. Our global network ensures you'll find the perfect match no matter where you are.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0 }}
        className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
            >
              <div className="text-4xl font-bold mb-2">100K+</div>
              <div className="text-purple-200">Verified Members</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4 }}
            >
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-purple-200">Success Rate</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6 }}
            >
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-purple-200">Countries</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8 }}
            >
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-purple-200">Support</div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.0 }}
        className="py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">Real stories from our happy members</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.4 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar src="/avatars/sarah.jpg" size={48} />
                    <div className="ml-4">
                      <h4 className="font-semibold">Sarah M.</h4>
                      <p className="text-sm text-gray-600">New York, NY</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"I found my perfect sugar daddy in Manhattan. The platform made it so easy to connect with successful professionals. Now I can focus on my studies without financial stress."</p>
                  <div className="mt-4 flex items-center">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.6 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar src="/avatars/michael.jpg" size={48} />
                    <div className="ml-4">
                      <h4 className="font-semibold">James K.</h4>
                      <p className="text-sm text-gray-600">Los Angeles, CA</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"As a busy executive in LA, I needed someone who understood my lifestyle. BrandyBabe.com delivered. My sugar baby is intelligent, beautiful, and we share amazing chemistry."</p>
                  <div className="mt-4 flex items-center">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.8 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar src="/avatars/alex.jpg" size={48} />
                    <div className="ml-4">
                      <h4 className="font-semibold">Alex R.</h4>
                      <p className="text-sm text-gray-600">Chicago, IL</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"The verification process gave me peace of mind. I've been in a wonderful arrangement for 6 months now. BrandyBabe.com truly understands what successful singles are looking for."</p>
                  <div className="mt-4 flex items-center">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.0 }}
        className="py-20 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white"
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.2 }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Find Your Perfect Match?</h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Join thousands of successful singles who have found meaningful connections on BrandyBabe.com. 
              Your premium dating experience starts here.
            </p>
            
            <div className="space-x-4 mb-8">
              <Button
                size="lg"
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors shadow-lg"
              >
                View Premium Plans
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-white/80 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>100% Secure</span>
              </div>
              <div className="w-px h-6 bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>24/7 Support</span>
              </div>
              <div className="w-px h-6 bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Proven Results</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Performance Metrics */}
      {metrics && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.4 }}
          className="fixed bottom-4 right-4 bg-white rounded-lg p-4 shadow-lg text-sm text-gray-600"
        >
          <div className="font-semibold mb-2">Performance Metrics</div>
          <div className="space-y-1">
            <div>Load: {metrics.loadTime?.toFixed(2)}ms</div>
            <div>FCP: {metrics.firstContentfulPaint?.toFixed(2)}ms</div>
            <div>LCP: {metrics.largestContentfulPaint?.toFixed(2)}ms</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
