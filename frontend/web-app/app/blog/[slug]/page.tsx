import { Metadata } from 'next';
import { generateBlogMetaTags } from '../../../src/lib/seo';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  author: string;
  publishDate: string;
  tags: string[];
  readTime: string;
  image?: string;
}

// Mock blog posts data
const blogPosts: BlogPost[] = [
  {
    slug: 'sugar-daddy-guide',
    title: 'Complete Guide to Sugar Daddy Relationships',
    description: 'Everything you need to know about sugar daddy relationships, from finding the right match to maintaining a successful arrangement.',
    content: `
      <h2>What is a Sugar Daddy?</h2>
      <p>A sugar daddy is typically a successful, older individual who provides financial support and mentorship to a younger partner in exchange for companionship and intimacy. These relationships are based on mutual benefit and understanding.</p>
      
      <h2>Benefits of Sugar Daddy Relationships</h2>
      <ul>
        <li>Financial stability and support</li>
        <li>Mentorship and guidance</li>
        <li>Access to exclusive experiences</li>
        <li>Personal growth and development</li>
      </ul>
      
      <h2>How to Find the Right Sugar Daddy</h2>
      <p>Success in sugar dating comes from clear communication, mutual respect, and understanding each other's expectations. Platforms like Dandy Babe provide a safe environment to connect with verified profiles.</p>
    `,
    author: 'Relationship Expert',
    publishDate: '2024-01-15',
    tags: ['sugar daddy', 'relationships', 'dating advice'],
    readTime: '8 min read',
    image: '/blog/sugar-daddy-guide.jpg',
  },
  {
    slug: 'sugar-baby-tips',
    title: 'Top Tips for Sugar Babies',
    description: 'Essential advice for sugar babies to ensure safe, successful, and fulfilling arrangements.',
    content: `
      <h2>Safety First</h2>
      <p>Your safety should always be the top priority. Always meet in public places for initial meetings and let someone know where you're going.</p>
      
      <h2>Clear Communication</h2>
      <p>Be upfront about your expectations, boundaries, and what you're looking for in an arrangement. Clear communication prevents misunderstandings.</p>
      
      <h2>Professionalism</h2>
      <p>Treat your sugar dating experience with professionalism. Be punctual, respectful, and maintain good communication.</p>
    `,
    author: 'Lifestyle Coach',
    publishDate: '2024-01-20',
    tags: ['sugar baby', 'safety', 'tips'],
    readTime: '6 min read',
    image: '/blog/sugar-baby-tips.jpg',
  },
  {
    slug: 'arrangement-ideas',
    title: 'Creative Arrangement Ideas for Sugar Couples',
    description: 'Looking for unique ways to spend time with your sugar partner? Here are some creative arrangement ideas.',
    content: `
      <h2>Experience-Based Arrangements</h2>
      <p>Instead of traditional monthly allowances, consider experience-based arrangements where your sugar partner funds specific experiences like travel, education, or hobbies.</p>
      
      <h2>Long-Term Partnerships</h2>
      <p>Some sugar relationships evolve into long-term partnerships. This requires clear communication about future expectations and goals.</p>
      
      <h2>Mentorship Arrangements</h2>
      <p>Focus on personal and professional development with arrangements that include mentorship, career guidance, and skill development.</p>
    `,
    author: 'Relationship Expert',
    publishDate: '2024-01-25',
    tags: ['arrangements', 'creativity', 'relationships'],
    readTime: '5 min read',
    image: '/blog/arrangement-ideas.jpg',
  },
  {
    slug: 'safety-tips',
    title: 'Safety Tips for Sugar Dating',
    description: 'Essential safety guidelines for anyone involved in sugar dating to ensure a safe and positive experience.',
    content: `
      <h2>Online Safety</h2>
      <p>Protect your personal information online. Use a separate email address for dating and avoid sharing sensitive details until you're comfortable.</p>
      
      <h2>Meeting Safety</h2>
      <p>Always meet in public places for initial meetings. Let a trusted friend know where you're going and who you're meeting.</p>
      
      <h2>Trust Your Instincts</h2>
      <p>If something feels off, trust your gut. You have the right to end any interaction that makes you uncomfortable.</p>
    `,
    author: 'Safety Advocate',
    publishDate: '2024-01-30',
    tags: ['safety', 'tips', 'guidelines'],
    readTime: '7 min read',
    image: '/blog/safety-tips.jpg',
  },
  {
    slug: 'success-stories',
    title: 'Real Success Stories from Our Community',
    description: 'Inspirational stories from real members who found meaningful connections through sugar dating.',
    content: `
      <h2>Sarah & Michael's Story</h2>
      <p>Sarah was a college student struggling with tuition when she met Michael, a successful businessman. Their arrangement helped Sarah graduate debt-free while Michael gained a wonderful companion.</p>
      
      <h2>Jessica's Journey</h2>
      <p>Jessica used her sugar dating experience to fund her startup. Her sugar partner became both a financial supporter and business mentor.</p>
      
      <h2>Mark's Transformation</h2>
      <p>After a difficult divorce, Mark found companionship and renewed confidence through sugar dating. He now enjoys a fulfilling lifestyle with his sugar baby.</p>
    `,
    author: 'Community Manager',
    publishDate: '2024-02-01',
    tags: ['success stories', 'inspiration', 'community'],
    readTime: '10 min read',
    image: '/blog/success-stories.jpg',
  },
  {
    slug: 'relationship-advice',
    title: 'Relationship Advice for Sugar Couples',
    description: 'Expert advice on maintaining healthy, long-lasting sugar relationships based on mutual respect and understanding.',
    content: `
      <h2>Communication is Key</h2>
      <p>Regular, honest communication helps maintain strong sugar relationships. Discuss expectations, boundaries, and any concerns openly.</p>
      
      <h2>Maintain Independence</h2>
      <p>While your arrangement may involve financial support, maintaining your independence and personal goals is important for a healthy relationship.</p>
      
      <h2>Set Boundaries</h2>
      <p>Clear boundaries help both parties understand the relationship parameters and prevent misunderstandings.</p>
    `,
    author: 'Relationship Therapist',
    publishDate: '2024-02-05',
    tags: ['relationship advice', 'communication', 'boundaries'],
    readTime: '8 min read',
    image: '/blog/relationship-advice.jpg',
  },
];

interface BlogPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const post = blogPosts.find(p => p.slug === params.slug);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found | Dandy Babe',
      description: 'The blog post you are looking for does not exist.',
    };
  }

  return generateBlogMetaTags({
    title: post.title,
    description: post.description,
    tags: post.tags,
    publishDate: post.publishDate,
    url: `/blog/${post.slug}`,
  });
}

export default function BlogPostPage({ params }: BlogPageProps) {
  const post = blogPosts.find(p => p.slug === params.slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Blog Post Not Found</h1>
          <p className="text-gray-600">The blog post you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600">
      {/* Blog Header */}
      <div className="relative py-16">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {post.tags[0]}
              </span>
              <span className="text-gray-500 text-sm">{post.readTime}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
            <p className="text-xl text-gray-600 mb-6">{post.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold text-gray-800">{post.author}</p>
                  <p className="text-gray-500 text-sm">{new Date(post.publishDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:opacity-90">
                  Share
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-100">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-xl p-8">
          {post.image && (
            <div className="mb-8">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}
          
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* Tags */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* Author Bio */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mr-4"></div>
              <div>
                <h4 className="font-semibold text-gray-800">{post.author}</h4>
                <p className="text-gray-600">Relationship Expert & Sugar Dating Advocate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}