import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Scissors, 
  Footprints, 
  Home, 
  GraduationCap, 
  AlertCircle, 
  Building, 
  Car,
  Clock, 
  Star, 
  MapPin, 
  ArrowRight, 
  CheckCircle,
  Filter,
  Search,
  DollarSign,
  User
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import EnhancedBookingModal from '../components/EnhancedBookingModal';

const Services = () => {
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
      
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          service_categories(name)
        `);
      
      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('service_categories')
        .select('*');
      
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch providers
      const { data: providersData, error: providersError } = await supabase
        .from('providers')
        .select('*');
      
      if (providersError) throw providersError;
      setProviders(providersData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.service_categories?.name === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];
    
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl rounded-full px-4 py-2 mb-8 shadow-lg">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Trusted Pet Care Professionals</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Book Professional
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent block">
                Pet Services
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Choose from our comprehensive range of pet care services and book with trusted professionals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="lg:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="flex-1 slider"
                />
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1 slider"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading services...</p>
            </div>
          ) : (
            <>
              {/* Results Counter */}
              {!loading && filteredServices.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-600">
                    {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
                    {searchTerm && ` for "${searchTerm}"`}
                    {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                  </p>
                </div>
              )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredServices.map((service, index) => {
                const IconComponent = categoryIcons[service.service_categories?.name?.toLowerCase()] || Stethoscope;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="glass-card rounded-2xl overflow-hidden group cursor-pointer relative"
                  >
                    {/* Service Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10"></div>
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      {/* Floating elements for visual interest */}
                      <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/20 rounded-full"></div>
                    </div>

                    {/* Service Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium text-gray-700">4.8</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {formatDuration(service.duration_minutes)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                          {service.service_categories?.name}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">
                        {service.description}
                      </p>

                      {/* Service Details */}
                      <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-5 h-5 text-primary-600" />
                          <span className="font-bold text-primary-600 text-lg">${service.price}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Starting from</div>
                          <div className="text-sm font-medium text-gray-700">Professional Service</div>
                        </div>
                      </div>

                      {/* Book Button */}
                      <button 
                        onClick={() => {
                          setSelectedService(service);
                          setShowBookingModal(true);
                        }}
                        className="w-full btn-primary group-hover:scale-105 transition-all duration-300 hover:shadow-lg"
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <span>Book Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {!loading && filteredServices.length === 0 && (
            <div className="text-center py-16">
              <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No services found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria to find what you're looking for.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setPriceRange([0, 200]);
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

          {/* Enhanced Booking Modal */}
          <EnhancedBookingModal
            isOpen={showBookingModal}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedService(null);
            }}
            service={selectedService}
            providers={providers}
          />
    </div>
  );
};

export default Services;