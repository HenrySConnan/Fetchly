import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Tag,
  Building,
  Phone,
  Mail,
  Heart,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import BusinessCard from '../components/BusinessCard';
import EnhancedBookingModal from '../components/EnhancedBookingModal';

const ServicesNew = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [categories, setCategories] = useState([]);

  // Service categories
  const serviceCategories = [
    'All',
    'Grooming',
    'Veterinary',
    'Dental',
    'Training',
    'Boarding',
    'Walking',
    'Pet Sitting',
    'Emergency Care',
    'Nutrition',
    'Behavioral'
  ];

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      
      // Fetch approved businesses with their services
      const { data: businessesData, error: businessesError } = await supabase
        .from('business_profiles')
        .select(`
          *,
          business_services (*)
        `)
        .eq('is_approved', true)
        .eq('is_active', true);

      if (businessesError) throw businessesError;

      // Filter businesses that have active services and add default categories
      const businessesWithServices = businessesData.filter(business => 
        business.business_services && business.business_services.length > 0
      ).map(business => ({
        ...business,
        business_services: business.business_services.map(service => ({
          ...service,
          // Add default category if none exists
          category: service.category || 'General',
          // Ensure tags exist
          tags: service.tags || []
        }))
      }));

      // If no businesses in database, show mock data for testing
      if (businessesWithServices.length === 0) {
        const mockBusinesses = [
          {
            id: 'mock-1',
            business_name: 'Paws & Claws Grooming',
            bio: 'Professional pet grooming services with 10+ years of experience. We specialize in all breeds and sizes.',
            location: 'Stellenbosch',
            phone: '+27 21 123 4567',
            email: 'info@pawsandclaws.co.za',
            business_services: [
              {
                id: 'service-1',
                name: 'Full Grooming Package',
                description: 'Complete grooming service including bath, brush, nail trim, and styling',
                price: 350,
                duration_minutes: 120,
                tags: ['All Breeds', 'Professional'],
                service_categories: { name: 'Grooming' }
              },
              {
                id: 'service-2',
                name: 'Nail Trimming',
                description: 'Safe and gentle nail trimming for all pets',
                price: 80,
                duration_minutes: 30,
                tags: ['Quick Service', 'All Pets'],
                service_categories: { name: 'Grooming' }
              }
            ]
          },
          {
            id: 'mock-2',
            business_name: 'Stellenbosch Vet Clinic',
            bio: 'Full-service veterinary care with emergency services available 24/7.',
            location: 'Stellenbosch',
            phone: '+27 21 987 6543',
            email: 'info@stellenboschvet.co.za',
            business_services: [
              {
                id: 'service-3',
                name: 'Health Checkup',
                description: 'Comprehensive health examination and vaccination',
                price: 450,
                duration_minutes: 60,
                tags: ['Vaccination', 'Health Check'],
                service_categories: { name: 'Veterinary' }
              },
              {
                id: 'service-4',
                name: 'Dental Cleaning',
                description: 'Professional dental cleaning and oral health assessment',
                price: 800,
                duration_minutes: 90,
                tags: ['Dental Care', 'Anesthesia'],
                service_categories: { name: 'Dental' }
              }
            ]
          }
        ];
        setBusinesses(mockBusinesses);
      } else {
        setBusinesses(businessesWithServices);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (business, services) => {
    setSelectedBusiness(business);
    setSelectedServices(services);
    setShowBookingModal(true);
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.business_services.some(service => 
                           service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                         );

    const matchesCategory = selectedCategory === 'all' || 
                           business.business_services.some(service => 
                             service.category === selectedCategory
                           );

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <section className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Find the Perfect <span className="text-primary-600">Pet Service</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover trusted local businesses offering professional pet care services in your area.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for services, businesses, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[200px]"
                >
                  {serviceCategories.map((category) => (
                    <option key={category} value={category === 'All' ? 'all' : category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Businesses Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {filteredBusinesses.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {filteredBusinesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  services={business.business_services}
                  onBookService={handleBookService}
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No businesses found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No businesses are currently available in your area.'
                }
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Booking Modal */}
      <EnhancedBookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedBusiness(null);
          setSelectedServices([]);
        }}
        business={selectedBusiness}
        services={selectedServices}
      />
    </div>
  );
};

export default ServicesNew;
