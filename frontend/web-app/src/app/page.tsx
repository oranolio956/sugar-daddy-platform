'use client';

import React, { useEffect, useState, useRef } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { Shield, Heart, Users, Clock, Star, CheckCircle, ArrowRight, Sparkles, Lock, MessageCircle } from 'lucide-react';

// Animated Counter Component
const AnimatedCounter: React.FC<{ end: number; suffix?: string; duration?: number }> = ({ 
  end, 
  suffix = '', 
  duration = 2000 
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// Testimonial Card Component
const TestimonialCard: React.FC<{
  quote: string;
  author: string;
  role: string;
  rating: number;
}> = ({ quote, author, role, rating }) => (
  <div className="card-premium p-8 h-full flex flex-col">
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 fill-primary-500 text-primary-500" />
      ))}
    </div>
    <p className="text-neutral-600 italic flex-grow text-lg leading-relaxed">"{quote}"</p>
    <div className="mt-6 pt-6 border-t border-neutral-100">
      <p className="font-semibold text-neutral-900">{author}</p>
      <p className="text-sm text-primary-600">{role}</p>
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
    className="group card-premium p-8 text-center hover:border-primary-200 transition-all duration-500"
    style={{ animationDelay: delay }}
  >
    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 
                    flex items-center justify-center group-hover:scale-110 group-hover:shadow-premium
                    transition-all duration-500">
      {icon}
    </div>
    <h3 className="text-xl font-display font-semibold text-neutral-900 mb-3">{title}</h3>
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
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-slate">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-pattern-dots opacity-30"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-500/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-accent-500/10 to-transparent"></div>
        </div>

        <div className="relative container-custom py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-primary-400 font-medium">Premium Dating Experience</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight">
                Where Luxury
                <span className="block text-gradient-gold">Meets Connection</span>
              </h1>
              
              <p className="text-xl text-neutral-300 max-w-xl leading-relaxed">
                Experience the most exclusive sugar dating platform. Connect with successful, 
                generous individuals seeking meaningful, upscale relationships.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="btn-premium text-lg px-8 py-4 group"
                  onClick={() => window.location.href = '/register'}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="btn-premium-outline border-primary-400/50 text-primary-400 hover:bg-primary-500/10 text-lg px-8 py-4"
                  onClick={() => window.location.href = '/login'}
                >
                  Sign In
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-400" />
                  <span className="text-sm text-neutral-400">Verified Profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary-400" />
                  <span className="text-sm text-neutral-400">100% Discreet</span>
                </div>
              </div>
            </div>

            {/* Right Content - Premium Visual */}
            <div className={`hidden lg:block ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                {/* Decorative card stack */}
                <div className="absolute -top-4 -left-4 w-full h-full rounded-3xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 blur-xl"></div>
                <div className="relative bg-gradient-to-br from-luxury-charcoal to-luxury-slate rounded-3xl p-8 border border-primary-500/20 shadow-premium-xl">
                  <div className="space-y-6">
                    {/* Profile Preview Cards */}
                    <div className="flex gap-4">
                      <div className="flex-1 bg-luxury-black/50 rounded-2xl p-4 border border-primary-500/10">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 mb-3"></div>
                        <div className="h-3 w-24 bg-neutral-700 rounded mb-2"></div>
                        <div className="h-2 w-16 bg-neutral-800 rounded"></div>
                      </div>
                      <div className="flex-1 bg-luxury-black/50 rounded-2xl p-4 border border-accent-500/10">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 mb-3"></div>
                        <div className="h-3 w-20 bg-neutral-700 rounded mb-2"></div>
                        <div className="h-2 w-14 bg-neutral-800 rounded"></div>
                      </div>
                    </div>
                    
                    {/* Match notification */}
                    <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl p-4 border border-primary-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">New Match!</p>
                          <p className="text-sm text-neutral-400">You have a new connection</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats preview */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-display font-bold text-primary-400">98%</p>
                        <p className="text-xs text-neutral-500">Match Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-display font-bold text-accent-400">24/7</p>
                        <p className="text-xs text-neutral-500">Support</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-display font-bold text-primary-400">5★</p>
                        <p className="text-xs text-neutral-500">Rated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary-400/50 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-primary-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-white"></div>
        <div className="relative container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <p className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-2">
                <AnimatedCounter end={500} suffix="K+" />
              </p>
              <p className="text-neutral-600 font-medium">Active Members</p>
            </div>
            <div className="text-center p-6">
              <p className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-2">
                <AnimatedCounter end={150} suffix="K+" />
              </p>
              <p className="text-neutral-600 font-medium">Successful Matches</p>
            </div>
            <div className="text-center p-6">
              <p className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-2">
                <AnimatedCounter end={98} suffix="%" />
              </p>
              <p className="text-neutral-600 font-medium">Satisfaction Rate</p>
            </div>
            <div className="text-center p-6">
              <p className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-2">
                <AnimatedCounter end={50} suffix="+" />
              </p>
              <p className="text-neutral-600 font-medium">Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-neutral-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6">
              The Premium Experience You Deserve
            </h2>
            <p className="text-xl text-neutral-600">
              We've crafted every detail to ensure your journey to finding the perfect connection is seamless, secure, and sophisticated.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-primary-600" />}
              title="Verified & Secure"
              description="Every profile undergoes rigorous verification. Your privacy and security are our top priorities with bank-level encryption."
              delay="0.1s"
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8 text-primary-600" />}
              title="Smart Matching"
              description="Our AI-powered algorithm learns your preferences to connect you with highly compatible matches tailored to your desires."
              delay="0.2s"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-primary-600" />}
              title="Elite Community"
              description="Join a curated community of successful, attractive individuals who value quality connections and meaningful relationships."
              delay="0.3s"
            />
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8 text-primary-600" />}
              title="Private Messaging"
              description="Communicate securely with end-to-end encrypted messaging. Share moments privately with those who matter."
              delay="0.4s"
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-primary-600" />}
              title="24/7 Concierge"
              description="Our dedicated support team is available around the clock to assist you with any questions or concerns."
              delay="0.5s"
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8 text-primary-600" />}
              title="Premium Features"
              description="Unlock exclusive features like priority visibility, advanced filters, and VIP events for premium members."
              delay="0.6s"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-luxury-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-grid opacity-20"></div>
        <div className="relative container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium mb-4">
              Getting Started
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Your Journey to <span className="text-gradient-gold">Connection</span>
            </h2>
            <p className="text-xl text-neutral-400">
              Finding your perfect match is just a few steps away
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="relative text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 
                            flex items-center justify-center text-3xl font-display font-bold
                            group-hover:scale-110 group-hover:shadow-glow-gold transition-all duration-500">
                1
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4">Create Your Profile</h3>
              <p className="text-neutral-400 leading-relaxed">
                Sign up and create a stunning profile that showcases your personality and what you're looking for.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-500 to-transparent"></div>
            </div>

            <div className="relative text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 
                            flex items-center justify-center text-3xl font-display font-bold
                            group-hover:scale-110 group-hover:shadow-glow-gold transition-all duration-500">
                2
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4">Discover Matches</h3>
              <p className="text-neutral-400 leading-relaxed">
                Browse through verified profiles and let our smart algorithm suggest your most compatible matches.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-accent-500 to-transparent"></div>
            </div>

            <div className="relative text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 
                            flex items-center justify-center text-3xl font-display font-bold
                            group-hover:scale-110 group-hover:shadow-glow-rose transition-all duration-500">
                3
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4">Connect & Meet</h3>
              <p className="text-neutral-400 leading-relaxed">
                Start meaningful conversations and take your connection to the next level with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-neutral-50 to-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4">
              Success Stories
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6">
              Real Connections, Real Stories
            </h2>
            <p className="text-xl text-neutral-600">
              Hear from our members who found exactly what they were looking for
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="I never thought I'd find someone who truly understands what I'm looking for. This platform exceeded all my expectations."
              author="Alexandra M."
              role="Premium Member"
              rating={5}
            />
            <TestimonialCard
              quote="The verification process gave me confidence that I was connecting with genuine people. Found my perfect match within weeks!"
              author="Michael R."
              role="Verified Member"
              rating={5}
            />
            <TestimonialCard
              quote="Elegant, discreet, and effective. The quality of connections here is unmatched. Worth every penny of the premium membership."
              author="Sophia L."
              role="VIP Member"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4">
                Your Safety Matters
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-6">
                Trust & Security First
              </h2>
              <p className="text-xl text-neutral-600 mb-8">
                We've implemented industry-leading security measures to ensure your experience is safe, private, and worry-free.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Profile Verification</h4>
                    <p className="text-neutral-600">Multi-step verification process ensures authentic profiles</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">End-to-End Encryption</h4>
                    <p className="text-neutral-600">All messages and data are encrypted with military-grade security</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">24/7 Fraud Protection</h4>
                    <p className="text-neutral-600">Advanced AI monitors for suspicious activity around the clock</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Discreet Billing</h4>
                    <p className="text-neutral-600">Your privacy is protected with anonymous billing statements</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-6">
              <div className="card-premium p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">SSL Secured</h4>
                <p className="text-sm text-neutral-600">256-bit encryption</p>
              </div>
              <div className="card-premium p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">GDPR Compliant</h4>
                <p className="text-sm text-neutral-600">Data protection</p>
              </div>
              <div className="card-premium p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">Verified Profiles</h4>
                <p className="text-sm text-neutral-600">100% authentic</p>
              </div>
              <div className="card-premium p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                  <Star className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">Top Rated</h4>
                <p className="text-sm text-neutral-600">4.9/5 stars</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-luxury-black via-luxury-charcoal to-luxury-slate relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-20"></div>
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-primary-500/10 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-accent-500/10 to-transparent"></div>
        
        <div className="relative container-custom text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              Ready to Find Your
              <span className="block text-gradient-gold">Perfect Match?</span>
            </h2>
            <p className="text-xl text-neutral-300 mb-10 max-w-2xl mx-auto">
              Join thousands of successful members who have found meaningful connections. 
              Your journey to luxury dating starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="btn-premium text-lg px-10 py-5 group"
                onClick={() => window.location.href = '/register'}
              >
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary-400/50 text-primary-400 hover:bg-primary-500/10 text-lg px-10 py-5"
                onClick={() => window.location.href = '/login'}
              >
                Already a Member? Sign In
              </Button>
            </div>
            
            <p className="mt-8 text-sm text-neutral-500">
              Free to join • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-luxury-black text-neutral-400 py-16 border-t border-neutral-800">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-display font-bold text-gradient-gold mb-4">LuxeMatch</h3>
              <p className="text-sm leading-relaxed">
                The premier platform for meaningful, upscale connections. Where luxury meets love.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Safety Tips</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Community Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">DMCA</a></li>
              </ul>
            </div>
          </div>
          
          <div className="divider-gold my-12"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2024 LuxeMatch. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-primary-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default HomePage;
