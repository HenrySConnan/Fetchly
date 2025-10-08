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
import BookingModal from '../components/BookingModal';

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
          <div className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="lg:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-700 hover:bg-white/90'
              }`}
            >
              All Services
            </button>
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.name.toLowerCase().replace(' ', '-')] || Stethoscope;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                    selectedCategory === category.name
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

      {/* Services Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading services...</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="glass-card rounded-2xl overflow-hidden group cursor-pointer"
                >
                  {/* Service Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                      <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Service Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {service.service_categories?.name}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {service.description}
                    </p>

                    {/* Service Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDuration(service.duration_minutes)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-primary-600" />
                          <span className="font-semibold text-primary-600">${service.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Book Button */}
                    <button 
                      onClick={() => {
                        setSelectedService(service);
                        setShowBookingModal(true);
                      }}
                      className="w-full btn-primary group-hover:scale-105 transition-transform duration-300"
                    >
                      Book Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && filteredServices.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </section>

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
  );
};

export default Services;