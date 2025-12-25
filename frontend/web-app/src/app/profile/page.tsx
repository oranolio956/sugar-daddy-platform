import { Metadata } from 'next';
import { generateProfileMetaTags } from '@/lib/seo';
import { useSEO } from '@/components/seo/SEOProvider';
import { usePerformanceMonitor } from '@/lib/performance';
import { LazyFramerMotion, LazyLucideIcons } from '@/lib/lazyLoad';
import { OptimizedImage, Avatar } from '@/components/ui/OptimizedImage';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const { motion, AnimatePresence } = LazyFramerMotion;
const { User, Edit, Camera, Shield, Star, Calendar, MapPin, Heart, MessageCircle, Share2, Download } = LazyLucideIcons;

interface ProfileData {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  photos: string[];
  verified: boolean;
  premium: boolean;
  membership: string;
  lastActive: string;
  interests: string[];
  education: string;
  occupation: string;
  lifestyle: {
    smoking: boolean;
    drinking: boolean;
    pets: boolean;
    children: boolean;
  };
  preferences: {
    lookingFor: string[];
    ageRange: { min: number; max: number };
    location: string;
    budget: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  // Mock profile data for SEO
  const profile = {
    name: 'Sarah Johnson',
    age: 24,
    location: 'New York, NY',
    bio: 'Looking for a generous sugar daddy who can show me the finer things in life.',
    photos: ['/avatars/sarah1.jpg'],
    verified: true,
  };

  return generateProfileMetaTags(profile);
}

export default function ProfilePage() {
  const { updateStructuredData } = useSEO();
  const { metrics } = usePerformanceMonitor();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock profile data
  const mockProfile: ProfileData = {
    id: 'user123',
    name: 'Sarah Johnson',
    age: 24,
    location: 'New York, NY',
    bio: 'Looking for a generous sugar daddy who can show me the finer things in life. I love traveling, fine dining, and exploring new experiences. Currently pursuing my MBA at NYU.',
    photos: [
      '/avatars/sarah1.jpg',
      '/avatars/sarah2.jpg',
      '/avatars/sarah3.jpg',
      '/avatars/sarah4.jpg',
    ],
    verified: true,
    premium: true,
    membership: 'Premium',
    lastActive: '2 hours ago',
    interests: ['Travel', 'Fine Dining', 'Art', 'Fashion', 'Fitness'],
    education: 'NYU Stern School of Business (MBA)',
    occupation: 'Marketing Manager',
    lifestyle: {
      smoking: false,
      drinking: true,
      pets: false,
      children: false,
    },
    preferences: {
      lookingFor: ['Long-term arrangement', 'Weekend dates', 'Mentorship'],
      ageRange: { min: 30, max: 50 },
      location: 'New York City area',
      budget: '$2000-5000/month',
    },
  };

  useEffect(() => {
    // Simulate loading profile
    setTimeout(() => {
      setProfile(mockProfile);
      setIsLoading(false);
      
      // Update structured data
      updateStructuredData('profile', {
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': `https://dandybabe.com/profile/${mockProfile.id}`,
        name: mockProfile.name,
        alternateName: mockProfile.name,
        description: mockProfile.bio,
        image: mockProfile.photos[0],
        gender: 'Female',
        age: mockProfile.age,
        address: {
          '@type': 'PostalAddress',
          addressLocality: mockProfile.location,
          addressCountry: 'US',
        },
        sameAs: [`https://dandybabe.com/profile/${mockProfile.id}`],
        knowsAbout: mockProfile.interests,
        worksFor: {
          '@type': 'Organization',
          name: 'Marketing Manager',
        },
        alumniOf: {
          '@type': 'EducationalOrganization',
          name: 'NYU Stern School of Business',
        },
        memberOf: {
          '@type': 'Organization',
          name: 'Dandy Babe',
          url: 'https://dandybabe.com',
        },
        isAccessibleForFree: false,
        offers: {
          '@type': 'Offer',
          category: 'Premium Membership',
          availability: 'InStock',
          priceCurrency: 'USD',
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://dandybabe.com/profile/${mockProfile.id}`,
        },
      });
    }, 1000);
  }, [updateStructuredData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">The profile you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar src={profile.photos[0]} alt={profile.name} size={80} />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span>{profile.age} years old</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Active {profile.lastActive}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {profile.verified && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Verified</span>
                    </Badge>
                  )}
                  {profile.premium && (
                    <Badge variant="premium" className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>{profile.membership}</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Send Message</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Like Profile</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Photos and Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photos Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-6 w-6 text-purple-600" />
                  <span>Photos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {profile.photos.map((photo, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
                    >
                      <OptimizedImage
                        src={photo}
                        alt={`${profile.name} photo ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download Photos</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-6 w-6 text-purple-600" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <p className="font-semibold">{profile.age}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-semibold">{profile.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Education:</span>
                    <p className="font-semibold">{profile.education}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Occupation:</span>
                    <p className="font-semibold">{profile.occupation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lifestyle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <span>Lifestyle</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Smoking:</span>
                  <Badge variant={profile.lifestyle.smoking ? "destructive" : "success"}>
                    {profile.lifestyle.smoking ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Drinking:</span>
                  <Badge variant={profile.lifestyle.drinking ? "default" : "secondary"}>
                    {profile.lifestyle.drinking ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pets:</span>
                  <Badge variant={profile.lifestyle.pets ? "default" : "secondary"}>
                    {profile.lifestyle.pets ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Children:</span>
                  <Badge variant={profile.lifestyle.children ? "default" : "secondary"}>
                    {profile.lifestyle.children ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit className="h-6 w-6 text-purple-600" />
                  <span>About Me</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-purple-600" />
                  <span>Interests</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="outline">{interest}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Share2 className="h-6 w-6 text-purple-600" />
                  <span>What I'm Looking For</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Looking For:</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferences.lookingFor.map((item, index) => (
                      <Badge key={index} variant="secondary">{item}</Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-600">Age Range:</span>
                    <p className="font-semibold">{profile.preferences.ageRange.min} - {profile.preferences.ageRange.max}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-semibold">{profile.preferences.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Budget:</span>
                    <p className="font-semibold">{profile.preferences.budget}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            {metrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-6 w-6 text-purple-600" />
                    <span>Page Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Load Time:</span>
                    <span className="font-semibold">{metrics.loadTime?.toFixed(2)}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">FCP:</span>
                    <span className="font-semibold">{metrics.firstContentfulPaint?.toFixed(2)}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">LCP:</span>
                    <span className="font-semibold">{metrics.largestContentfulPaint?.toFixed(2)}ms</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}