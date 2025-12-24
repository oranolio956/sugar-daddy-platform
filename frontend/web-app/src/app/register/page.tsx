'use client';

import React from 'react';
import { MetaTags } from '@/components/seo/MetaTags';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { RegistrationWizard } from '@/components/auth/RegistrationWizard';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* SEO Meta Tags */}
      <MetaTags
        title="Join Dandy Babe - Premium Sugar Daddy & Sugar Baby Dating"
        description="Create your free account on BrandyBabe.com, the premier sugar dating platform for successful individuals seeking meaningful arrangements. Verified profiles, secure, and discreet."
        keywords={['sugar daddy registration', 'sugar baby registration', 'sugar dating signup', 'arrangement dating registration', 'premium dating signup', 'verified dating registration']}
        canonical="https://dandybabe.com/register"
        ogTitle="Join Dandy Babe - Premium Sugar Daddy & Sugar Baby Dating"
        ogDescription="Create your free account on Dandy Babe, the premier sugar dating platform for successful individuals seeking meaningful arrangements."
        ogImage="https://www.dandybabe.com/register-og-image.jpg"
        ogUrl="https://dandybabe.com/register"
        twitterTitle="Join Dandy Babe - Premium Sugar Dating"
        twitterDescription="Create your free account on Dandy Babe, the premier sugar dating platform."
        twitterImage="https://www.dandybabe.com/register-og-image.jpg"
        robots="index, follow"
        schemaType="WebPage"
        author="Dandy Babe Team"
        category="dating"
        tags={['sugar daddy', 'sugar baby', 'sugar dating', 'registration', 'signup']}
        siteName="BrandyBabe.com"
        type="website"
      />

      {/* Breadcrumbs */}
      <div className="container-custom py-4">
        <Breadcrumbs
          items={[{ label: 'Register', current: true }]}
          className="text-sm text-neutral-500"
        />
      </div>

      {/* Registration Wizard */}
      <RegistrationWizard />
    </div>
  );
}
