import React, { useRef, useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { Shield, Heart, Users, Star, ArrowRight, Sparkles, Lock, Crown, Zap, Globe, ShieldCheck } from 'lucide-react';
import { ProfileCard, UserProfile } from '@/components/premium/ProfileCard';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

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

const MagneticButton: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({ children, onClick, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const BentoItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: delay
      }}
      className={`glass-dark rounded-[2rem] p-8 overflow-hidden relative group ${className}`}
    >
      {children}
    </motion.div>
  );
};

const HomePageClient: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);

  return (
    <Layout>
      {/* Hero Section - Asymmetrical & High Impact */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-charcoal-900 pt-20">
        {/* Parallax Background Elements */}
        <motion.div
          style={{ y: y1 }}
          className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-champagne-500/10 rounded-full blur-[120px] pointer-events-none"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-champagne-600/5 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Content - Fluid Typography */}
            <div className="flex-1 text-left space-y-10">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <span className="inline-block px-4 py-1.5 rounded-full glass border-champagne-500/20 text-champagne-500 text-sm font-medium tracking-widest uppercase mb-6">
                  Est. 2026 • The New Standard
                </span>
                <h1 className="text-white font-display font-bold leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(2.5rem, 5vw + 1rem, 5rem)' }}>
                  Where <span className="italic text-champagne-500">Ambition</span> <br />
                  Meets <span className="text-transparent bg-clip-text bg-gradient-gold">Elegance</span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-neutral-400 max-w-xl leading-relaxed font-light"
                style={{ fontSize: 'clamp(1rem, 0.5vw + 0.8rem, 1.125rem)' }}
              >
                A curated sanctuary for the world's most successful individuals.
                Experience a level of discretion and sophistication that redefines modern connection.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-6 items-center"
              >
                <MagneticButton>
                  <Button
                    size="lg"
                    className="bg-gradient-gold text-charcoal-900 text-sm tracking-[0.2em] uppercase font-bold px-10 py-6 rounded-full hover:shadow-[0_0_30px_rgba(247,231,206,0.3)] transition-all duration-500"
                    onClick={() => window.location.href = '/register'}
                  >
                    Apply Now
                  </Button>
                </MagneticButton>

                <button
                  className="text-white/60 hover:text-champagne-500 transition-colors flex items-center gap-2 group tracking-widest uppercase text-xs font-medium"
                  onClick={() => window.location.href = '/login'}
                >
                  Member Login
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>

            {/* Right Content - Overlapping Elements & Visual Depth */}
            <div className="flex-1 relative w-full max-w-xl lg:max-w-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-20"
              >
                <ProfileCard
                  user={FEATURED_MEMBERS[0]!}
                  variant="premium"
                  className="glass-dark border-champagne-500/20 shadow-2xl transform lg:translate-x-12"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute -top-12 -right-4 lg:-right-12 z-10 hidden sm:block"
              >
                <div className="glass p-6 rounded-3xl border-white/5 backdrop-blur-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center">
                      <ShieldCheck className="text-charcoal-900 w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Verified Elite</p>
                      <p className="text-white/50 text-xs">Identity & Wealth Confirmed</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="absolute -bottom-8 -left-4 lg:-left-8 z-30 hidden sm:block"
              >
                <div className="glass-dark p-6 rounded-3xl border-champagne-500/10 backdrop-blur-xl">
                  <div className="flex -space-x-3 mb-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-charcoal-900 bg-charcoal-800 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Member avatar" />
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-charcoal-900 bg-champagne-500 flex items-center justify-center text-[10px] font-bold text-charcoal-900">
                      +2k
                    </div>
                  </div>
                  <p className="text-white text-xs font-medium">Active in your area</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="py-32 bg-charcoal-900 relative">
        <div className="container-custom">
          <div className="mb-20 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white font-display font-bold mb-6"
              style={{ fontSize: 'clamp(2rem, 4vw + 1rem, 3.5rem)' }}
            >
              The <span className="text-champagne-500">LuxeMatch</span> Ecosystem
            </motion.h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              A multi-layered approach to high-end matchmaking, combining advanced technology with human intuition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[700px]">
            {/* Large Feature */}
            <BentoItem className="md:col-span-2 md:row-span-2 flex flex-col justify-end">
              <div className="absolute top-0 left-0 w-full h-full opacity-20 group-hover:opacity-30 transition-opacity duration-700">
                <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover" alt="Luxury lifestyle" />
              </div>
              <div className="relative z-10">
                <Crown className="w-12 h-12 text-champagne-500 mb-6" />
                <h3 className="text-3xl font-display font-bold text-white mb-4">Curated Excellence</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Every member is hand-vetted by our global committee to ensure the highest standards of success, style, and integrity.
                </p>
              </div>
            </BentoItem>

            {/* Medium Feature */}
            <BentoItem className="md:col-span-2 flex flex-col justify-center" delay={0.1}>
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-champagne-500/10 flex items-center justify-center shrink-0">
                  <Lock className="w-8 h-8 text-champagne-500" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">Fortress Privacy</h3>
                  <p className="text-neutral-400 text-sm">
                    Military-grade encryption and absolute anonymity. Your private life remains private.
                  </p>
                </div>
              </div>
            </BentoItem>

            {/* Small Feature 1 */}
            <BentoItem className="flex flex-col justify-center" delay={0.2}>
              <Zap className="w-8 h-8 text-champagne-500 mb-4" />
              <h3 className="text-lg font-display font-bold text-white mb-2">Instant Match</h3>
              <p className="text-neutral-400 text-xs">
                AI-driven compatibility engine for immediate high-value connections.
              </p>
            </BentoItem>

            {/* Small Feature 2 */}
            <BentoItem className="flex flex-col justify-center" delay={0.3}>
              <Globe className="w-8 h-8 text-champagne-500 mb-4" />
              <h3 className="text-lg font-display font-bold text-white mb-2">Global Access</h3>
              <p className="text-neutral-400 text-xs">
                Connect with elites in London, Paris, Dubai, and beyond.
              </p>
            </BentoItem>
          </div>
        </div>
      </section>

      {/* Featured Members - Glassmorphism & Motion */}
      <section className="py-32 bg-charcoal-800 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-white font-display font-bold mb-4" style={{ fontSize: 'clamp(2rem, 3vw + 1rem, 3rem)' }}>
                Featured <span className="text-champagne-500">Members</span>
              </h2>
              <p className="text-neutral-400">Discover the most exceptional profiles in our community.</p>
            </div>
            <Button variant="outline" className="border-champagne-500/30 text-champagne-500 hover:bg-champagne-500/10 rounded-full px-8">
              View All
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURED_MEMBERS.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <ProfileCard
                  user={member}
                  className="glass-dark border-white/5 hover:border-champagne-500/30 transition-all duration-500"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - High Impact */}
      <section className="py-32 bg-charcoal-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-gold opacity-[0.03]" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-white font-display font-bold mb-8" style={{ fontSize: 'clamp(2.5rem, 5vw + 1rem, 4.5rem)' }}>
              Ready to Enter the <br />
              <span className="text-transparent bg-clip-text bg-gradient-gold">Inner Circle?</span>
            </h2>
            <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto font-light">
              Membership is limited to maintain the highest quality of connections.
              Begin your application today for a private consultation.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <MagneticButton>
                <Button
                  size="lg"
                  className="bg-gradient-gold text-charcoal-900 text-lg px-12 py-8 rounded-full font-bold tracking-widest uppercase shadow-[0_20px_50px_rgba(247,231,206,0.2)]"
                  onClick={() => window.location.href = '/register'}
                >
                  Start Application
                </Button>
              </MagneticButton>
            </div>

            <p className="mt-12 text-neutral-500 text-sm tracking-widest uppercase">
              Strictly Confidential • Invitation Only • Elite Community
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer - Refined */}
      <footer className="bg-charcoal-900 border-t border-white/5 py-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <h3 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-gold mb-6">LuxeMatch</h3>
              <p className="text-neutral-500 max-w-sm leading-relaxed">
                The world's most exclusive dating platform for successful individuals and sophisticated companions.
                Redefining luxury connection since 2024.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Platform</h4>
              <ul className="space-y-4 text-neutral-500 text-sm">
                <li><a href="#" className="hover:text-champagne-500 transition-colors">The Experience</a></li>
                <li><a href="#" className="hover:text-champagne-500 transition-colors">Safety & Privacy</a></li>
                <li><a href="#" className="hover:text-champagne-500 transition-colors">Elite Membership</a></li>
                <li><a href="#" className="hover:text-champagne-500 transition-colors">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 text-neutral-500 text-sm">
                <li><a href="#" className="hover:text-champagne-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-champagne-500 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-champagne-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-champagne-500 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
            <p className="text-neutral-600 text-xs tracking-widest uppercase">© 2026 LuxeMatch International. All rights reserved.</p>
            <div className="flex gap-8">
              {['Instagram', 'Twitter', 'LinkedIn'].map(social => (
                <a key={social} href="#" className="text-neutral-600 hover:text-champagne-500 text-xs tracking-widest uppercase transition-colors">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default HomePageClient;