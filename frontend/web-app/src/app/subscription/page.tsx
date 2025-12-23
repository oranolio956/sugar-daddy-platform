import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';

export const metadata: Metadata = {
  title: 'Premium Membership - Dandy Babe',
  description: 'Upgrade to premium membership for unlimited messaging, priority matching, and exclusive features.',
  openGraph: {
    title: 'Premium Membership - Dandy Babe',
    description: 'Unlock premium features with our elite membership tiers.',
    url: `${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/subscription`,
    type: 'website',
  },
  alternates: {
    canonical: `${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/subscription`,
  },
};

export default function SubscriptionPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-charcoal-900 py-8">
        <div className="container-custom">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Choose Your <span className="text-champagne-500">Membership</span>
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
              Unlock premium features and find your perfect match faster with our elite membership options.
            </p>
          </div>

          <SubscriptionManager />
        </div>
      </div>
    </Layout>
  );
}