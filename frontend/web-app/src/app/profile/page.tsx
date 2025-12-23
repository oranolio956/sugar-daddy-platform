import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Layout from '@/components/Layout';
import { ProfileForm } from '@/components/profile/ProfileForm';

export const metadata: Metadata = {
  title: 'Profile Settings - Dandy Babe',
  description: 'Manage your profile, verification, and preferences on Dandy Babe.',
  openGraph: {
    title: 'Profile Settings - Dandy Babe',
    description: 'Manage your profile and preferences.',
    url: `${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/profile`,
    type: 'website',
  },
  alternates: {
    canonical: `${process.env['NEXT_PUBLIC_APP_URL'] || 'https://dandybabe.com'}/profile`,
  },
};

export default function ProfilePage() {
  // This would normally check authentication on the server side
  // For now, we'll let the client component handle it

  return (
    <Layout>
      <div className="min-h-screen bg-charcoal-900 py-8">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Profile Settings
            </h1>
            <p className="text-neutral-400">
              Manage your profile, verification, and account preferences.
            </p>
          </div>

          <ProfileForm />
        </div>
      </div>
    </Layout>
  );
}