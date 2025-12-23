import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Seeking.com Scams: The Red Flags They Don\'t Tell You About',
  description: 'Learn to spot scams on Seeking.com. Protect yourself from fake profiles, catfish, and financial scams.',
  keywords: 'Seeking.com scams, Seeking.com fake profiles, sugar daddy scams, online dating scams',
};

export default function SeekingScamsArticle() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <article className="prose prose-lg max-w-none">
          <h1>Seeking.com Scams: The Red Flags They Don't Tell You About</h1>

          <p className="text-xl text-gray-600 mb-8">
            Seeking.com has a serious scam problem. Here's how to spot and avoid the most common scams.
          </p>

          <h2>Common Scam Types</h2>
          <ul>
            <li><strong>Gift Card Scams:</strong> Asking for iTunes or Amazon cards</li>
            <li><strong>Investment Scams:</strong> Promising to invest your money</li>
            <li><strong>Emergency Scams:</strong> Stories of being stuck abroad</li>
            <li><strong>Fake Verification:</strong> Bots pretending to be real users</li>
          </ul>

          <h2>Red Flags to Watch For</h2>
          <ul>
            <li>Immediate requests for money or gifts</li>
            <li>Refusal to video chat or meet in person</li>
            <li>Too-good-to-be-true stories</li>
            <li>Pressure to move conversations off-platform</li>
          </ul>

          <div className="bg-orange-50 p-6 rounded-lg my-8">
            <h3>Why Scams Thrive on Seeking.com</h3>
            <p>The platform profits from user desperation. More failed connections = more credit purchases.</p>
            <Link href="/shadow/seeking-scams" className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition">
              Find Scam-Free Alternatives →
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            *Always report suspicious activity to Seeking.com support.
          </p>
        </article>
      </main>
    </div>
  );
}