'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { Shield, Heart, Users, Star, ArrowRight, Sparkles, Lock, MessageCircle, Crown } from 'lucide-react';
import { ProfileCard, UserProfile } from '@/components/premium/ProfileCard';
import { VerificationBadge } from '@/components/premium/VerificationBadge';

// Mock Data for Featured Members
const FEATURED_MEMBERS: UserProfile[] = [
  {
    id: '1',
    name: 'Isabella',
    age: 24,
    location: 'New York, NY',
    distance: 5,
    bio: 'Art enthusiast and travel lover seeking a gentleman who appreciates the finer things in life.',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
    isPremium: true,
    isOnline: true,
    tags: ['Travel', 'Art', 'Fine Dining'],
    hasLiked: false
  },
  {
    id: '2',
    name: 'James',
    age: 45,
    location: 'Los Angeles, CA',
    distance: 12,
    bio: 'Successful entrepreneur looking for a companion to share exclusive experiences with.',
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
    isPremium: true,
    isOnline: false,
    tags: ['Business', 'Golf', 'Yachting'],
    hasLiked: false
  },
  {
    id: '3',
    name: 'Sophia',
    age: 22,
    location: 'Miami, FL',
    distance: 8,
    bio: 'Fashion model and student. I love spontaneity and deep conversations.',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
    isPremium: false,
    isOnline: true,
    tags: ['Fashion', 'Modeling', 'Beach'],
    hasLiked: true
  }
];


// Testimonial Card Component
const TestimonialCard: React.FC<{
  quote: string;
  author: string;
  role: string;
  rating: number;
}> = ({ quote, author, role, rating }) => (
  <div className="card p-8 h-full flex flex-col bg-white border border-gold-100 shadow-card hover:shadow-card-hover transition-all duration-300">
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 fill-gold-400 text-gold-400" />
      ))}
    </div>
    <p className="text-neutral-600 italic flex-grow text-lg leading-relaxed font-serif">"{quote}"</p>
    <div className="mt-6 pt-6 border-t border-neutral-100">
      <p className="font-semibold text-luxury-charcoal font-display">{author}</p>
      <p className="text-sm text-gold-600">{role}</p>
    </div>
  </div>
);

// Feature Card Component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}> = ({ icon, title, description, delay = '0' }) => (
  <div 
    className="group card p-8 text-center hover:border-gold-300 transition-all duration-500 bg-white"
    style={{ animationDelay: delay }}
  >
    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-gold 
                    flex items-center justify-center group-hover:scale-110 group-hover:shadow-glow
                    transition-all duration-500 text-luxury-black">
      {icon}
    </div>
    <h3 className="text-xl font-display font-semibold text-luxury-charcoal mb-3">{title}</h3>
    <p className="text-neutral-600 leading-relaxed">{description}</p>
  </div>
);

const HomePage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-luxury-black">
        {/* Background with subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-black to-luxury-charcoal"></div>

        <div className="relative container-custom py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20">
                <Crown className="w-4 h-4 text-gold-400" />
                <span className="text-sm text-gold-400 font-medium">The Premier Luxury Dating Experience</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight">
                Exclusive Connections
                <span className="block text-transparent bg-clip-text bg-gradient-gold">For Discerning Tastes</span>
              </h1>

              <p className="text-xl text-neutral-300 max-w-xl leading-relaxed font-light">
                A curated sanctuary where successful professionals meet sophisticated companions.
                Where genuine connections transcend the ordinary, in an atmosphere of absolute discretion.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="btn-primary text-lg px-8 py-4 group"
                  onClick={() => window.location.href = '/register'}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-gold-400/50 text-gold-400 hover:bg-gold-500/10 text-lg px-8 py-4"
                  onClick={() => window.location.href = '/login'}
                >
                  Member Sign In
                </Button>
              </div>

            </div>

            {/* Right Content - Premium Visual */}
            <div className={`hidden lg:block relative ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <div className="relative z-10">
                <ProfileCard
                  user={FEATURED_MEMBERS[0]!}
                  variant="premium"
                  className="max-w-sm mx-auto shadow-2xl border-gold-500/30"
                />
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Trust & Quality Section */}
      <section className="py-20 bg-ivory-pearl">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-gold flex items-center justify-center">
                <Shield className="w-8 h-8 text-luxury-black" />
              </div>
              <h3 className="text-xl font-display font-semibold text-luxury-charcoal">Rigorous Verification</h3>
              <p className="text-neutral-600">Every profile undergoes comprehensive background checks and identity verification</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-gold flex items-center justify-center">
                <Lock className="w-8 h-8 text-luxury-black" />
              </div>
              <h3 className="text-xl font-display font-semibold text-luxury-charcoal">Absolute Discretion</h3>
              <p className="text-neutral-600">Bank-level encryption and privacy protocols protect all interactions</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-gold flex items-center justify-center">
                <Crown className="w-8 h-8 text-luxury-black" />
              </div>
              <h3 className="text-xl font-display font-semibold text-luxury-charcoal">Curated Excellence</h3>
              <p className="text-neutral-600">Only the most sophisticated and successful individuals join our exclusive community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Exclusive Community Preview */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-gold-100 text-gold-800 text-sm font-medium mb-4">
              By Invitation Only
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-luxury-charcoal mb-6">
              A Sanctuary of Sophistication
            </h2>
            <p className="text-xl text-neutral-600">
              Where ambition, elegance, and genuine connection converge in perfect harmony.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURED_MEMBERS.map((member) => (
              <ProfileCard key={member.id} user={member} />
            ))}
          </div>
        </div>
      </section>

      {/* The LuxeMatch Difference */}
      <section className="py-24 bg-ivory-linen">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-gold-100 text-gold-800 text-sm font-medium mb-4">
              Beyond Ordinary Dating
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-luxury-charcoal mb-6">
              Where Luxury Meets Authenticity
            </h2>
            <p className="text-xl text-neutral-600">
              Unlike conventional platforms, we curate an environment where sophistication and genuine connection take precedence over quantity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Crown className="w-8 h-8" />}
              title="Curated Admissions"
              description="Membership by invitation only, ensuring every individual meets our exacting standards of success and sophistication."
              delay="0.1s"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Fortress Privacy"
              description="Military-grade security protocols and absolute discretion. What happens in LuxeMatch stays in LuxeMatch."
              delay="0.2s"
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Personal Concierge"
              description="Dedicated relationship specialists who understand the nuances of sophisticated matchmaking."
              delay="0.3s"
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="Authentic Connections"
              description="No games, no pretense. We facilitate genuine relationships between equals who share similar ambitions and values."
              delay="0.4s"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Elite Networking"
              description="Access to exclusive events, private gatherings, and connections that extend beyond romantic interests."
              delay="0.5s"
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8" />}
              title="Zero Compromise"
              description="Quality over quantity. We'd rather have 100 perfect matches than 100,000 mediocre ones."
              delay="0.6s"
            />
          </div>
        </div>
      </section>

      {/* The Experience */}
      <section className="py-24 bg-luxury-charcoal text-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-gold-500/20 text-gold-400 text-sm font-medium mb-4">
              A Different Approach
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Redefining <span className="text-transparent bg-clip-text bg-gradient-gold">Sophisticated Connection</span>
            </h2>
            <p className="text-xl text-neutral-400">
              While others focus on algorithms and swipes, we believe in the art of genuine human connection
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-display font-semibold">Personal Curation</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Our relationship specialists personally review and curate potential connections based on your unique profile,
                  lifestyle, and aspirations. No generic algorithms here.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-display font-semibold">Meaningful Introductions</h3>
                <p className="text-neutral-400 leading-relaxed">
                  When we sense a genuine connection, we facilitate elegant introductions with context and warmth,
                  setting the stage for authentic relationships.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-display font-semibold">Ongoing Guidance</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Your journey doesn't end with a match. We provide discreet counsel and support throughout
                  your relationship development.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-gold-500/20 to-primary-500/20 backdrop-blur-sm border border-white/10 p-8 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <Crown className="w-16 h-16 mx-auto text-gold-400" />
                  <div>
                    <h4 className="text-xl font-display font-semibold mb-2">Exclusivity by Design</h4>
                    <p className="text-neutral-400">
                      Quality connections require quality curation. We maintain an intimate community where every member matters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Member Reflections */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-gold-100 text-gold-800 text-sm font-medium mb-4">
              Authentic Voices
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-luxury-charcoal mb-6">
              Stories of Genuine Connection
            </h2>
            <p className="text-xl text-neutral-600">
              The quiet satisfaction of finding someone who shares your refined sensibilities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="After years of superficial encounters, I finally found someone who appreciates the finer details of life. The discretion and quality here are unparalleled."
              author="Victoria E."
              role="Art Collector"
              rating={5}
            />
            <TestimonialCard
              quote="The difference is in the curation. Every introduction feels considered, not algorithmic. I've formed connections that extend beyond romance."
              author="Jonathan K."
              role="Executive Director"
              rating={5}
            />
            <TestimonialCard
              quote="In a world of noise, LuxeMatch provides sanctuary. The relationships I've built here have the depth and authenticity I value most."
              author="Isabella R."
              role="Gallery Owner"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Begin Your Journey */}
      <section className="py-24 bg-luxury-black text-center">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              Your Invitation Awaits
            </h2>
            <p className="text-xl text-neutral-300 mb-10 max-w-2xl mx-auto">
              Take the first step toward connections that match your sophistication and ambition.
            </p>
            <Button
              size="lg"
              className="btn-primary text-lg px-12 py-5 group"
              onClick={() => window.location.href = '/register'}
            >
              Begin Your Application
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="mt-8 text-sm text-neutral-500">
              Complimentary initial consultation • Discreet process • No obligations
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-luxury-black text-neutral-400 py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-gold mb-4">LuxeMatch</h3>
              <p className="text-sm leading-relaxed max-w-xs">
                Curating sophisticated connections in an atmosphere of absolute discretion and elegance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-gold-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Follow</h4>
              <div className="flex justify-center md:justify-start gap-6">
                <a href="#" className="hover:text-gold-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="hover:text-gold-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gold-900 to-transparent my-8"></div>

          <div className="text-center">
            <p className="text-sm">© 2024 LuxeMatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default HomePage;
