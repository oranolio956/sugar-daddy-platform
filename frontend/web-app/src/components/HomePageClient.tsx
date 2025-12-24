import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import MetaTags from '@/components/seo/MetaTags';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import DatingSchema from '@/components/seo/DatingSchema';
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
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <Layout>
      {/* SEO Meta Tags */}
      <MetaTags
        title="BrandyBabe.com - Premium Sugar Daddy Dating Platform"
        description="Connect with successful sugar daddies and sugar babies in a safe, discreet environment. Find meaningful arrangements with verified profiles and transparent pricing."
        keywords={['sugar daddy', 'sugar baby', 'sugar dating', 'arrangement dating', 'luxury dating', 'mutual benefit dating', 'elite dating', 'premium dating', 'successful singles', 'discreet dating', 'verified dating', 'high-end dating']}
        canonical="https://brandybabe.com"
        ogTitle="BrandyBabe.com - Premium Sugar Daddy Dating Platform"
        ogDescription="Connect with successful sugar daddies and sugar babies in a safe, discreet environment. Find meaningful arrangements with verified profiles."
        ogImage="https://www.brandybabe.com/og-image.jpg"
        ogUrl="https://brandybabe.com"
        twitterTitle="BrandyBabe.com - Premium Sugar Daddy Dating Platform"
        twitterDescription="Connect with successful sugar daddies and sugar babies in a safe, discreet environment."
        twitterImage="https://www.brandybabe.com/og-image.jpg"
        robots="index, follow"
        schemaType="WebSite"
        author="BrandyBabe.com Team"
        category="dating"
        tags={['sugar daddy', 'sugar baby', 'sugar dating', 'arrangement dating', 'luxury dating']}
        siteName="BrandyBabe.com"
        type="website"
      />

      {/* Dating Schema Markup */}
      <DatingSchema
        type="DatingService"
        name="BrandyBabe.com"
        description="Premium sugar daddy dating platform connecting successful individuals with attractive companions in a safe, discreet environment."
        url="https://brandybabe.com"
        logo="https://www.brandybabe.com/logo.png"
        foundingDate="2024"
        contactType="Customer Service"
        telephone="+1-555-BRANDY"
        email="support@brandybabe.com"
        priceRange="$$$"
        serviceType="Online Dating Service"
        audience={{
          ageMin: 18,
          ageMax: 65,
          gender: "Unspecified"
        }}
        reviewCount={1250}
        ratingValue={4.8}
        bestRating={5}
        worstRating={1}
        keywords={['sugar daddy', 'sugar baby', 'sugar dating', 'arrangement dating', 'luxury dating', 'mutual benefit dating', 'elite dating', 'premium dating']}
      />

      {/* Breadcrumbs */}
      <div className="container-custom py-4">
        <Breadcrumbs
          items={[]}
          className="text-sm text-neutral-500"
        />
      </div>
      {/* Hero Section - Asymmetrical & High Impact */}
      <motion.section
        className="relative min-h-screen flex items-center overflow-hidden bg-charcoal-900 pt-24 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
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
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left Content - Fluid Typography */}
            <div className="flex-1 text-left space-y-8 lg:space-y-10">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              >
                <span className="inline-block px-4 py-2 rounded-full glass border-champagne-500/20 text-champagne-500 text-xs lg:text-sm font-medium tracking-widest uppercase mb-6">
                  Est. 2024 • The New Standard
                </span>
                <h1 className="text-white font-display font-bold leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(2rem, 6vw + 0.5rem, 4.5rem)' }}>
                  Where <span className="italic text-champagne-500">Ambition</span> <br />
                  Meets <span className="text-transparent bg-clip-text bg-gradient-gold">Sophistication</span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-neutral-400 leading-relaxed font-light text-base lg:text-lg hover-glow"
                style={{ fontSize: 'clamp(1rem, 0.5vw + 0.8rem, 1.125rem)' }}
              >
                An exclusive sanctuary for the world's most accomplished individuals.
                Experience unparalleled discretion and refined sophistication that redefines meaningful connection.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 lg:gap-6 items-start"
              >
                <MagneticButton>
                  <Button
                    size="lg"
                    className="bg-gradient-gold text-charcoal-900 text-sm tracking-[0.2em] uppercase font-bold px-8 py-4 lg:px-10 lg:py-6 rounded-full hover:shadow-[0_0_30px_rgba(247,231,206,0.3)] transition-all duration-500 w-full sm:w-auto touch-target-lg"
                    onClick={() => router.push('/register')}
                  >
                    Begin Your Journey
                  </Button>
                </MagneticButton>

                <button
                  className="text-white/60 hover:text-champagne-500 transition-colors flex items-center gap-2 group tracking-widest uppercase text-xs font-medium w-full sm:w-auto justify-center sm:justify-start touch-target"
                  onClick={() => router.push('/login')}
                >
                  Member Login
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>

            {/* Right Content - Overlapping Elements & Visual Depth */}
            <div className="flex-1 relative w-full max-w-sm lg:max-w-md xl:max-w-lg">
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
                className="absolute -top-8 -right-4 lg:-right-8 z-10 hidden lg:block"
              >
                <div className="glass p-4 lg:p-6 rounded-2xl lg:rounded-3xl border-white/5 backdrop-blur-2xl">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 h-10 lg:w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center">
                      <ShieldCheck className="text-charcoal-900 w-5 lg:w-6 h-5 lg:h-6" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm lg:text-base">Verified Elite</p>
                      <p className="text-white/50 text-xs lg:text-sm">Identity & Wealth Confirmed</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="absolute -bottom-6 -left-4 lg:-left-8 z-30 hidden lg:block"
              >
                <div className="glass-dark p-4 lg:p-6 rounded-2xl lg:rounded-3xl border-champagne-500/10 backdrop-blur-xl">
                  <div className="flex -space-x-2 lg:-space-x-3 mb-2 lg:mb-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-7 h-7 lg:w-8 h-8 rounded-full border-2 border-charcoal-900 bg-charcoal-800 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Member avatar" />
                      </div>
                    ))}
                    <div className="w-7 h-7 lg:w-8 h-8 rounded-full border-2 border-charcoal-900 bg-champagne-500 flex items-center justify-center text-[8px] lg:text-[10px] font-bold text-charcoal-900">
                      +2k
                    </div>
                  </div>
                  <p className="text-white text-xs lg:text-sm font-medium">Active in your area</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="py-20 lg:py-32 bg-charcoal-900 relative">
        <div className="container-custom">
          <div className="mb-16 lg:mb-20 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white font-display font-bold mb-4 lg:mb-6"
              style={{ fontSize: 'clamp(1.75rem, 4vw + 0.5rem, 3rem)' }}
            >
              The <span className="text-champagne-500">BrandyBabe.com</span> Ecosystem
            </motion.h2>
            <p className="text-neutral-400 max-w-xl lg:max-w-2xl mx-auto text-base lg:text-lg">
              A multi-layered approach to high-end matchmaking, combining advanced technology with human intuition.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-4 lg:gap-6 h-auto lg:h-[600px]">
            {/* Large Feature */}
            <BentoItem className="lg:col-span-2 lg:row-span-2 flex flex-col justify-end">
              <div className="absolute top-0 left-0 w-full h-full opacity-20 group-hover:opacity-30 transition-opacity duration-700">
                <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover" alt="Luxury lifestyle" />
              </div>
              <div className="relative z-10 p-6 lg:p-8">
                <Crown className="w-10 lg:w-12 h-10 lg:h-12 text-champagne-500 mb-4 lg:mb-6" />
                <h3 className="text-2xl lg:text-3xl font-display font-bold text-white mb-3 lg:mb-4">Curated Excellence</h3>
                <p className="text-neutral-400 leading-relaxed text-sm lg:text-base">
                  Every member is hand-vetted by our global committee to ensure the highest standards of success, style, and integrity.
                </p>
              </div>
            </BentoItem>

            {/* Medium Feature */}
            <BentoItem className="lg:col-span-2 flex flex-col justify-center p-6 lg:p-8" delay={0.1}>
              <div className="flex items-start gap-4 lg:gap-6">
                <div className="w-12 lg:w-16 h-12 lg:h-16 rounded-xl lg:rounded-2xl bg-champagne-500/10 flex items-center justify-center shrink-0">
                  <Lock className="w-6 lg:w-8 h-6 lg:h-8 text-champagne-500" />
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-display font-bold text-white mb-2 lg:mb-2">Fortress Privacy</h3>
                  <p className="text-neutral-400 text-sm lg:text-sm">
                    Military-grade encryption and absolute anonymity. Your private life remains private.
                  </p>
                </div>
              </div>
            </BentoItem>

            {/* Small Feature 1 */}
            <BentoItem className="flex flex-col justify-center p-4 lg:p-6" delay={0.2}>
              <Zap className="w-6 lg:w-8 h-6 lg:h-8 text-champagne-500 mb-3 lg:mb-4" />
              <h3 className="text-base lg:text-lg font-display font-bold text-white mb-2 lg:mb-2">Instant Match</h3>
              <p className="text-neutral-400 text-xs lg:text-xs leading-relaxed">
                AI-driven compatibility engine for immediate high-value connections.
              </p>
            </BentoItem>

            {/* Small Feature 2 */}
            <BentoItem className="flex flex-col justify-center p-4 lg:p-6" delay={0.3}>
              <Globe className="w-6 lg:w-8 h-6 lg:h-8 text-champagne-500 mb-3 lg:mb-4" />
              <h3 className="text-base lg:text-lg font-display font-bold text-white mb-2 lg:mb-2">Global Access</h3>
              <p className="text-neutral-400 text-xs lg:text-xs leading-relaxed">
                Connect with elites in London, Paris, Dubai, and beyond.
              </p>
            </BentoItem>
          </div>
        </div>
      </section>

      {/* Featured Members - Glassmorphism & Motion */}
      <section className="py-16 lg:py-32 bg-charcoal-800 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 lg:gap-0 mb-12 lg:mb-16">
            <div>
              <h2 className="text-white font-display font-bold mb-3 lg:mb-4" style={{ fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)' }}>
                Featured <span className="text-champagne-500">Members</span>
              </h2>
              <p className="text-neutral-400 text-base lg:text-lg">Discover the most exceptional profiles in our community.</p>
            </div>
            <Button variant="outline" className="border-champagne-500/30 text-champagne-500 hover:bg-champagne-500/10 rounded-full px-6 lg:px-8 py-3 lg:py-4 touch-target">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                  className="glass-dark border-white/5 hover:border-champagne-500/30 transition-all duration-500 touch-target"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - High Impact */}
      <section className="py-16 lg:py-32 bg-charcoal-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-gold opacity-[0.03]" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl lg:max-w-4xl mx-auto"
          >
            <h2 className="text-white font-display font-bold mb-6 lg:mb-8" style={{ fontSize: 'clamp(2rem, 5vw + 0.5rem, 4rem)' }}>
              Ready to Enter the <br />
              <span className="text-transparent bg-clip-text bg-gradient-gold">Exclusive Circle?</span>
            </h2>
            <p className="text-base lg:text-xl text-neutral-400 mb-8 lg:mb-12 max-w-xl lg:max-w-2xl mx-auto font-light leading-relaxed">
              Membership is by invitation only to maintain the highest caliber of connections.
              Begin your application today for a private consultation.
            </p>

            <div className="flex flex-col gap-4 lg:gap-6 items-center">
              <MagneticButton>
                <Button
                  size="lg"
                  className="bg-gradient-gold text-charcoal-900 text-base lg:text-lg px-8 lg:px-12 py-4 lg:py-6 rounded-full font-bold tracking-widest uppercase shadow-[0_20px_50px_rgba(247,231,206,0.2)] touch-target-lg w-full sm:w-auto"
                  onClick={() => router.push('/register')}
                >
                  Begin Your Application
                </Button>
              </MagneticButton>
              
              <p className="text-neutral-500 text-xs lg:text-sm tracking-widest uppercase">
                Strictly Confidential • Invitation Only • Elite Community
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Refined */}
      <footer className="bg-charcoal-900 border-t border-white/5 py-12 lg:py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 mb-12 lg:mb-20">
            <div className="lg:col-span-2">
              <h3 className="text-2xl lg:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-gold mb-4 lg:mb-6">BrandyBabe.com</h3>
              <p className="text-neutral-500 text-sm lg:text-base leading-relaxed max-w-md lg:max-w-sm">
                The world's most exclusive dating platform for successful individuals and sophisticated companions.
                Redefining luxury connection since 2024.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 lg:mb-6 uppercase tracking-widest text-xs lg:text-xs">Platform</h4>
              <ul className="space-y-3 lg:space-y-4 text-neutral-500 text-sm lg:text-sm">
                <li><a href="#" className="hover:text-champagne-500 transition-colors touch-target">The Experience</a></li>
                <li><a href="#" className="hover:text-champagne-500 transition-colors touch-target">Safety & Privacy</a></li>
                <li><a href="#" className="hover:text-champagne-500 transition-colors touch-target">Elite Membership</a></li>
                <li><a href="#" className="hover:text-champagne-500 transition-colors touch-target">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 lg:mb-6 uppercase tracking-widest text-xs lg:text-xs">Company</h4>
              <ul className="space-y-3 lg:space-y-4 text-neutral-500 text-sm lg:text-sm">
                <li><a href="#" className="hover:text-champagne-500 transition-colors touch-target">About Us</a></li>
                <li><a href="#" className="hover:text-champagne-500 transition-colors touch-target">Contact</a></li>
                <li><a href="#" className="hover:text-champagne-500 transition-colors touch-target">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-champagne-500 transition-colors touch-target">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-center pt-8 lg:pt-12 border-t border-white/5 gap-6">
            <p className="text-neutral-600 text-xs lg:text-xs tracking-widest uppercase">© 2026 BrandyBabe.com International. All rights reserved.</p>
            <div className="flex gap-6 lg:gap-8">
              {['Instagram', 'Twitter', 'LinkedIn'].map(social => (
                <a key={social} href="#" className="text-neutral-600 hover:text-champagne-500 text-xs lg:text-xs tracking-widest uppercase transition-colors touch-target">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default HomePageClient;