import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Is Seeking.com Worth It in 2024? A Brutally Honest Cost Analysis',
  description: 'Calculate the real cost of Seeking.com membership. Is it worth the money or are there better options?',
  keywords: 'Is Seeking.com worth it, Seeking.com cost, Seeking.com pricing, sugar daddy site cost',
};

export default function SeekingWorthItArticle() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <article className="prose prose-lg max-w-none">
          <h1>Is Seeking.com Worth It in 2024? A Brutally Honest Cost Analysis</h1>

          <p className="text-xl text-gray-600 mb-8">
            Let's calculate exactly what Seeking.com costs you. The numbers might surprise you.
          </p>

          <h2>The Real Cost Breakdown</h2>
          <ul>
            <li><strong>Basic Membership:</strong> $30/month</li>
            <li><strong>Premium Features:</strong> $60/month</li>
            <li><strong>Credits for Messages:</strong> $10 for 100 credits</li>
            <li><strong>Hidden Costs:</strong> Time wasted on fake profiles</li>
          </ul>

          <h2>The Hidden Costs</h2>
          <p>The credit system means you pay to discover profiles are fake. It's gambling with your money.</p>

          <div className="bg-red-50 p-6 rounded-lg my-8">
            <h3>The Brutal Truth</h3>
            <p>Most users spend $200+ before realizing the system is designed against them.</p>
            <Link href="/shadow/seeking-worth-it" className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
              See Transparent Pricing →
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            *Cost analysis based on user reports and platform pricing.
          </p>
        </article>
      </main>
    </div>
  );
}