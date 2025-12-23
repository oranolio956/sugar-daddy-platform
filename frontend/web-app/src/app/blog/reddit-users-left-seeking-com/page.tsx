import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Reddit Users Reveal: Why I Left Seeking.com for Good',
  description: 'Real stories from Reddit users who quit Seeking.com. See why thousands are making the switch.',
  keywords: 'Seeking.com reddit, why I left Seeking.com, Seeking.com reviews, sugar daddy reddit',
};

export default function RedditLeftSeekingArticle() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <article className="prose prose-lg max-w-none">
          <h1>Reddit Users Reveal: Why I Left Seeking.com for Good</h1>

          <p className="text-xl text-gray-600 mb-8">
            The Reddit community has spoken. Here's why thousands of users are abandoning Seeking.com.
          </p>

          <h2>Real Reddit Stories</h2>
          <blockquote>"Spent 6 months, $400, zero real dates. The credit system is predatory."</blockquote>
          <blockquote>"Account banned after investing time and money. No explanation, no recourse."</blockquote>
          <blockquote>"80% of matches are either bots or scammers. Complete waste of time."</blockquote>

          <h2>The Common Themes</h2>
          <ul>
            <li>Arbitrary account bans</li>
            <li>Predatory credit system</li>
            <li>Overwhelming fake profiles</li>
            <li>Poor customer support</li>
          </ul>

          <div className="bg-purple-50 p-6 rounded-lg my-8">
            <h3>The Exodus Has Begun</h3>
            <p>Thousands of Reddit users have found alternatives that actually work. Join them.</p>
            <Link href="/shadow/seeking-reddit-left" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
              Join the Reddit Migration →
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            *Stories compiled from public Reddit discussions. User experiences vary.
          </p>
        </article>
      </main>
    </div>
  );
}