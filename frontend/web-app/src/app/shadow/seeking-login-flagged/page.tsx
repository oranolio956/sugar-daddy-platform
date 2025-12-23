/**
 * Shadow Landing Page - Seeking.com Login Issues
 * URL: /shadow/seeking-login-flagged
 * Noindex: Prevents indexing, pure conversion page
 */

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Seeking.com Login Issues - Account Flagged Solutions',
  description: 'Fix your Seeking.com login problems and account flags with proven solutions.',
  robots: 'noindex, nofollow',
};

export default function ShadowLoginFlaggedPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
          Tired of Losing Access to Seeking.com?
        </h1>

        <div className="prose prose-lg prose-invert mb-12">
          <p className="text-xl text-gray-300 leading-relaxed">
            One day your account works, the next it's "flagged" or "under review."
          </p>
          <p className="text-lg text-gray-300 leading-relaxed mt-4">
            You spend hours trying to get back in, only to find your matches are gone.
            The credit system keeps you trapped, but the bans keep you out.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed mt-4">
            What if there was a platform that verified accounts upfront, no arbitrary flags,
            and you never lose access to your connections?
          </p>
          <p className="text-xl text-yellow-400 font-semibold mt-6">
            Stop fighting the system. Join one that works for you.
          </p>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-black mb-4">
            Never Lose Access Again
          </h2>
          <p className="text-black text-lg mb-6">
            Verified profiles from day one. No flags, no reviews, no disappearing accounts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register?ref=shadow-login-flagged"
              className="bg-black text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-900 transition text-center"
            >
              Get Verified Access →
            </Link>
            <Link
              href="/login?ref=shadow-login-flagged"
              className="border-2 border-black text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-black hover:text-white transition text-center"
            >
              Already a Member? Login
            </Link>
          </div>
          <p className="text-black text-sm mt-4 opacity-80">
            ✓ Verified profiles ✓ No account flags ✓ Permanent access
          </p>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-gray-500 text-sm mb-4">Join the frustration-free alternative</p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>⭐⭐⭐⭐⭐ 4.7/5 from 2,800+ reviews</span>
            <span>•</span>
            <span>Zero account suspensions</span>
            <span>•</span>
            <span>Transparent verification</span>
          </div>
        </div>
      </main>
    </div>
  );
}