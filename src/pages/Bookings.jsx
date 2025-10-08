import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Scissors, 
  Home, 
  Footprints, 
  GraduationCap, 
  AlertCircle, 
  Building, 
  Car,
  Star,
  Clock,
  DollarSign,
  Filter,
  Search,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import BookingModal from '../components/BookingModal';

const Bookings = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const categoryIcons = {
    veterinary: Stethoscope,
    grooming: Scissors,
    'pet-sitting': Home,
    'dog-walking': Footprints,
    training: GraduationCap,
    emergency: AlertCircle,
    boarding: Building,
    transportation: Car
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');

      // Fetch services with category info
      const { data: servicesData } = await supabase
        .from('services')
        .select(`
          *,
          service_categories (
            name,
            slug,
            color
          )
        `)
        .eq('is_active', true)
        .order('name');

      // Fetch providers
      const { data: providersData } = await supabase
        .from('providers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      setCategories(categoriesData || []);
      setServices(servicesData || []);
      setProviders(providersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || 
      service.service_categories?.slug === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];
    
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const getCategoryIcon = (slug) => {
    const IconComponent = categoryIcons[slug] || Home;
    return IconComponent;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Book Pet Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find and book professional pet care services for your furry friends
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="lg:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              All Services
            </button>
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.slug);
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                    selectedCategory === category.slug
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white/80 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group"
            >
              {/* Service Image */}
              <div className="relative mb-4">
                <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl text-primary-300">
                      {React.createElement(getCategoryIcon(service.service_categories?.slug))}
                    </div>
                  )}
                </div>
                <div className="absolute top-3 left-3">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: service.service_categories?.color || '#3b82f6' }}
                  >
                    {service.service_categories?.name}
                  </span>
                </div>
              </div>

              {/* Service Info */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {service.description}
                </p>

                {/* Service Details */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(service.duration_minutes)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold text-primary-600">${service.price}</span>
                  </div>
                </div>

                {/* Book Button */}
                <button 
                  onClick={() => {
                    setSelectedService(service);
                    setShowBookingModal(true);
                  }}
                  className="w-full btn-primary mt-4 group-hover:scale-105 transition-transform duration-300"
                >
                  Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredServices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="text-6xl text-gray-300 mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No services found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}

        {/* Popular Providers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Trusted Service Providers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.slice(0, 6).map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{provider.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{provider.rating}</span>
                      <span className="text-sm text-gray-400">({provider.total_reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{provider.bio}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{provider.city}, {provider.state}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Booking Modal */}
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
          service={selectedService}
          providers={providers}
        />
      </div>
    </div>
  );
};

export default Bookings;
