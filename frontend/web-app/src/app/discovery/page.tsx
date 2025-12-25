import { Metadata } from 'next';
import { generateMetaTags, generateSearchResultsSchema } from '@/lib/seo';
import { useSEO } from '@/components/seo/SEOProvider';
import { usePerformanceMonitor } from '@/lib/performance';
import { LazyFramerMotion, LazyLucideIcons } from '@/lib/lazyLoad';
import { OptimizedImage, Gallery } from '@/components/ui/OptimizedImage';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const { motion, AnimatePresence } = LazyFramerMotion;
const { Users, Filter, Search, Heart, Star, Shield, MapPin, Calendar } = LazyLucideIcons;

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  photos: string[];
  verified: boolean;
  premium: boolean;
  lastActive: string;
  interests: string[];
}

export async function generateMetadata(): Promise<Metadata> {
  return generateMetaTags(
    'Discover Sugar Daddies & Babies - Dandy Babe',
    'Find your perfect match with our advanced discovery system. Browse verified sugar daddies and sugar babies in your area.',
    ['sugar daddy discovery', 'sugar baby discovery', 'find matches', 'dating discovery'],
    undefined,
    '/discovery',
    'website'
  );
}

export default function DiscoveryPage() {
  const { updateStructuredData } = useSEO();
  const { metrics } = usePerformanceMonitor();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filters, setFilters] = useState({
    location: 'all',
    ageMin: 18,
    ageMax: 80,
    gender: 'all',
    verified: false,
    premium: false,
  });
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  // Mock profiles data
  const mockProfiles: Profile[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      age: 24,
      location: 'New York, NY',
      bio: 'Looking for a generous sugar daddy who can show me the finer things in life.',
      photos: ['/avatars/sarah1.jpg', '/avatars/sarah2.jpg'],
      verified: true,
      premium: true,
      lastActive: '2 hours ago',
      interests: ['Travel', 'Fine Dining', 'Art'],
    },
    {
      id: '2',
      name: 'Michael Chen',
      age: 42,
      location: 'Los Angeles, CA',
      bio: 'Successful entrepreneur looking for intelligent companionship.',
      photos: ['/avatars/michael1.jpg', '/avatars/michael2.jpg'],
      verified: true,
      premium: false,
      lastActive: '1 hour ago',
      interests: ['Business', 'Investing', 'Philanthropy'],
    },
    {
      id: '3',
      name: 'Jessica Parker',
      age: 28,
      location: 'Chicago, IL',
      bio: 'Graduate student seeking a mentor and generous partner.',
      photos: ['/avatars/jessica1.jpg', '/avatars/jessica2.jpg'],
      verified: false,
      premium: true,
      lastActive: '4 hours ago',
      interests: ['Education', 'Music', 'Cooking'],
    },
  ];

  useEffect(() => {
    // Simulate loading profiles
    setTimeout(() => {
      setProfiles(mockProfiles);
      setIsLoading(false);
      
      // Update structured data
      updateStructuredData('search-results', generateSearchResultsSchema(
        mockProfiles,
        'sugar daddy baby',
        mockProfiles.length
      ));
    }, 1000);
  }, [updateStructuredData]);

  const filteredProfiles = profiles.filter(profile => {
    // Apply filters
    if (filters.location !== 'all' && !profile.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (profile.age < filters.ageMin || profile.age > filters.ageMax) {
      return false;
    }
    if (filters.verified && !profile.verified) {
      return false;
    }
    if (filters.premium && !profile.premium) {
      return false;
    }
    return true;
  });

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      case 'age':
        return a.age - b.age;
      case 'location':
        return a.location.localeCompare(b.location);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Discover Matches</h1>
              <p className="text-gray-600">Find your perfect sugar daddy or sugar baby</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="premium" className="text-sm">
                {profiles.length} Active Members
              </Badge>
              {metrics && (
                <Badge variant="secondary" className="text-sm">
                  Load: {metrics.loadTime?.toFixed(2)}ms
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-6 w-6 text-purple-600" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Locations</option>
                    <option value="new york">New York</option>
                    <option value="los angeles">Los Angeles</option>
                    <option value="chicago">Chicago</option>
                    <option value="miami">Miami</option>
                    <option value="san francisco">San Francisco</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={filters.ageMin}
                      onChange={(e) => setFilters({...filters, ageMin: parseInt(e.target.value)})}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={filters.ageMax}
                      onChange={(e) => setFilters({...filters, ageMax: parseInt(e.target.value)})}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => setFilters({...filters, verified: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Verified Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.premium}
                      onChange={(e) => setFilters({...filters, premium: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Premium Members</span>
                  </label>
                </div>

                <Button onClick={() => setFilters({
                  location: 'all',
                  ageMin: 18,
                  ageMax: 80,
                  gender: 'all',
                  verified: false,
                  premium: false,
                })} className="w-full">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Sort and Search */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search profiles..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="newest">Newest</option>
                  <option value="age">Age</option>
                  <option value="location">Location</option>
                </select>
              </div>
            </div>

            {/* Profiles Grid */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                      <div className="animate-pulse">
                        <div className="h-48 bg-gray-300"></div>
                        <div className="p-6 space-y-4">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-300 rounded w-full"></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : sortedProfiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProfiles.map((profile, index) => (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="relative">
                        <OptimizedImage
                          src={profile.photos[0]}
                          alt={profile.name}
                          width={400}
                          height={300}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-4 left-4 flex space-x-2">
                          {profile.verified && (
                            <Badge variant="secondary" className="flex items-center space-x-1">
                              <Shield className="h-3 w-3" />
                              <span>Verified</span>
                            </Badge>
                          )}
                          {profile.premium && (
                            <Badge variant="premium" className="flex items-center space-x-1">
                              <Star className="h-3 w-3" />
                              <span>Premium</span>
                            </Badge>
                          )}
                        </div>
                        <button className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition-colors">
                          <Heart className="h-5 w-5 text-pink-500" />
                        </button>
                      </div>
                      
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">{profile.name}</h3>
                          <span className="text-gray-600 text-sm">{profile.age}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{profile.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{profile.lastActive}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{profile.bio}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {profile.interests.map((interest, i) => (
                            <Badge key={i} variant="outline">{interest}</Badge>
                          ))}
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" className="flex-1">
                            View Profile
                          </Button>
                          <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                            Send Message
                          </Button>
                        </div>
                      </CardContent>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl p-12 text-center shadow-lg"
                >
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Matches Found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters to see more profiles.</p>
                  <Button onClick={() => setFilters({
                    location: 'all',
                    ageMin: 18,
                    ageMax: 80,
                    gender: 'all',
                    verified: false,
                    premium: false,
                  })}>
                    Reset Filters
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}