import { Metadata } from 'next';
import { generateCityMetaTags } from '../../../src/lib/seo';
import { CITY_CONFIGS } from '../../../src/lib/seo';

interface CityPageProps {
  params: {
    city: string;
  };
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  return generateCityMetaTags(params.city);
}

export default function CityPage({ params }: CityPageProps) {
  const cityConfig = CITY_CONFIGS[params.city as keyof typeof CITY_CONFIGS];
  
  if (!cityConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">City Not Found</h1>
          <p className="text-gray-600">The city page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Sugar Daddy & Baby Dating in {cityConfig.name}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              {cityConfig.description}
            </p>
            <div className="space-x-4">
              <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors">
                Find Sugar Daddies
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors">
                Find Sugar Babies
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Local Connections</h3>
            <p className="text-gray-600">Connect with sugar daddies and babies in {cityConfig.name} and surrounding areas.</p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Verified Profiles</h3>
            <p className="text-gray-600">All profiles are verified to ensure authenticity and safety.</p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure Platform</h3>
            <p className="text-gray-600">Your privacy and security are our top priorities.</p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Success Stories from {cityConfig.name}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">"I found my perfect sugar daddy in Manhattan. The platform made it so easy to connect with successful professionals."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold">Sarah M.</p>
                  <p className="text-sm text-gray-500">Manhattan, NY</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">"As a busy executive in LA, I needed someone who understood my lifestyle. BrandyBabe.com delivered."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold">James K.</p>
                  <p className="text-sm text-gray-500">Beverly Hills, CA</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">"The verification process gave me peace of mind. I've been in a wonderful arrangement for 6 months now."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold">Alex R.</p>
                  <p className="text-sm text-gray-500">Chicago, IL</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Match in {cityConfig.name}?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful singles in {cityConfig.name} who have found meaningful connections on BrandyBabe.com.
          </p>
          <div className="space-x-4">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors">
              Get Started Free
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors">
              View Premium Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}