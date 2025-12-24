import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import { MobileTestSuite } from '@/components/MobileTestSuite';

export const metadata: Metadata = {
  title: 'Mobile Test Suite - Dandy Babe',
  description: 'Comprehensive mobile responsiveness testing for the BrandyBabe.com platform.',
  openGraph: {
    title: 'Mobile Test Suite - Dandy Babe',
    description: 'Test mobile responsiveness and compatibility for Dandy Babe.',
    url: `${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/mobile-test`,
    type: 'website',
  },
  alternates: {
    canonical: `${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/mobile-test`,
  },
};

export default function MobileTestPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-charcoal-900 py-8">
        <div className="container-custom">
          <MobileTestSuite />
        </div>
      </div>
    </Layout>
  );
}