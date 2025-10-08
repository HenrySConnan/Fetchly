import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Percent, 
  Clock, 
  Star, 
  MapPin, 
  Calendar,
  Tag,
  ArrowRight,
  CheckCircle,
  Users,
  Timer,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const dealCategories = [
    { id: 'all', name: 'All Deals', icon: Tag },
    { id: 'veterinary', name: 'Veterinary', icon: Percent },
    { id: 'grooming', name: 'Grooming', icon: Percent },
    { id: 'walking', name: 'Dog Walking', icon: Percent },
    { id: 'boarding', name: 'Boarding', icon: Percent },
  ];

  // Mock deals data - in real app, this would come from Supabase
  const mockDeals = [
    {
      id: 1,
      title: 'New Pet Owner Package',
      description: 'Complete care package for your new furry friend. Includes health checkup, grooming, and training session.',
      originalPrice: 299,
      discountedPrice: 199,
      discount: 33,
      category: 'veterinary',
      validUntil: '2024-02-15',
      image: '/api/placeholder/400/300',
      rating: 4.9,
      reviews: 127,
      features: ['Health Checkup', 'Grooming Session', 'Training Consultation', 'Vaccination Package'],
      isLimited: true,
      remainingSpots: 12
    },
    {
      id: 2,
      title: 'Monthly Grooming Subscription',
      description: 'Get your pet professionally groomed every month with our premium subscription service.',
      originalPrice: 120,
      discountedPrice: 89,
      discount: 26,
      category: 'grooming',
      validUntil: '2024-03-01',
      image: '/api/placeholder/400/300',
      rating: 4.8,
      reviews: 89,
      features: ['Monthly Grooming', 'Nail Trimming', 'Teeth Cleaning', 'Flea Treatment'],
      isLimited: false,
      remainingSpots: null
    },
    {
      id: 3,
      title: 'Weekend Dog Walking Special',
      description: 'Perfect for busy weekends. Professional dog walking service with GPS tracking.',
      originalPrice: 80,
      discountedPrice: 59,
      discount: 26,
      category: 'walking',
      validUntil: '2024-02-20',
      image: '/api/placeholder/400/300',
      rating: 4.7,
      reviews: 156,
      features: ['Weekend Walks', 'GPS Tracking', 'Photo Updates', 'Exercise Report'],
      isLimited: true,
      remainingSpots: 8
    },
    {
      id: 4,
      title: 'Holiday Boarding Package',
      description: 'Safe and comfortable boarding for your pet during holidays with premium care.',
      originalPrice: 200,
      discountedPrice: 149,
      discount: 26,
      category: 'boarding',
      validUntil: '2024-02-28',
      image: '/api/placeholder/400/300',
      rating: 4.9,
      reviews: 203,
      features: ['Premium Boarding', 'Daily Exercise', '24/7 Care', 'Photo Updates'],
      isLimited: true,
      remainingSpots: 5
    },
    {
      id: 5,
      title: 'Senior Pet Care Bundle',
      description: 'Specialized care package designed for senior pets with health monitoring.',
      originalPrice: 180,
      discountedPrice: 129,
      discount: 28,
      category: 'veterinary',
      validUntil: '2024-02-25',
      image: '/api/placeholder/400/300',
      rating: 4.8,
      reviews: 94,
      features: ['Health Monitoring', 'Pain Management', 'Special Diet', 'Regular Checkups'],
      isLimited: false,
      remainingSpots: null
    },
    {
      id: 6,
      title: 'First-Time Customer Special',
      description: 'Welcome to PetConnect! Get 30% off your first service booking.',
      originalPrice: 100,
      discountedPrice: 70,
      discount: 30,
      category: 'all',
      validUntil: '2024-03-15',
      image: '/api/placeholder/400/300',
      rating: 4.9,
      reviews: 312,
      features: ['Any Service', 'Flexible Booking', 'Professional Care', 'Satisfaction Guarantee'],
      isLimited: false,
      remainingSpots: null
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setDeals(mockDeals);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDeals = deals.filter(deal => 
    selectedCategory === 'all' || deal.category === selectedCategory
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysUntilExpiry = (dateString) => {
    const today = new Date();
    const expiry = new Date(dateString);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mr-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                Exclusive
                <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent block">
                  Pet Deals
                </span>
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Save big on premium pet care services. Limited-time offers you won't want to miss!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-3 mb-8">
            {dealCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white/80 text-gray-700 hover:bg-white/90'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Deals Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading amazing deals...</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredDeals.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="glass-card rounded-2xl overflow-hidden group cursor-pointer relative"
                >
                  {/* Deal Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                      <Percent className="w-3 h-3" />
                      <span>{deal.discount}% OFF</span>
                    </div>
                  </div>

                  {/* Limited Badge */}
                  {deal.isLimited && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                        <Timer className="w-3 h-3" />
                        <span>LIMITED</span>
                      </div>
                    </div>
                  )}

                  {/* Deal Image */}
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Tag className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{deal.title}</h3>
                    </div>
                  </div>

                  {/* Deal Content */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {deal.description}
                    </p>

                    {/* Pricing */}
                    <div className="mb-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-3xl font-bold text-primary-600">${deal.discountedPrice}</span>
                        <span className="text-lg text-gray-400 line-through">${deal.originalPrice}</span>
                        <span className="text-sm text-gray-500">You save ${deal.originalPrice - deal.discountedPrice}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
                      <div className="space-y-2">
                        {deal.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deal Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{deal.rating}</span>
                          <span className="text-sm text-gray-400">({deal.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Expires {formatDate(deal.validUntil)}
                          </span>
                        </div>
                      </div>

                      {deal.isLimited && deal.remainingSpots && (
                        <div className="flex items-center space-x-2 text-orange-600">
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Only {deal.remainingSpots} spots left!
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-red-600">
                        <Timer className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {getDaysUntilExpiry(deal.validUntil)} days left
                        </span>
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <button className="w-full btn-primary group-hover:scale-105 transition-transform duration-300 flex items-center justify-center space-x-2">
                      <span>Claim Deal</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && filteredDeals.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No deals found</h3>
              <p className="text-gray-600">Try selecting a different category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-3xl p-12 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">
                Don't Miss Out on These Deals!
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of pet owners who save big with our exclusive offers. 
                Limited time only!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-2">
                  <span>Browse All Services</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 hover:scale-105 border border-white/30">
                  Get Notified of New Deals
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Deals;
