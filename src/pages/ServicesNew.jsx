import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, DollarSign, Tag, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BusinessCard from '../components/BusinessCard';


const ServicesNew = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const navigate = useNavigate();

  // Mock categories for display if no services have categories
  const mockCategories = [
    'Grooming',
    'Veterinary',
    'Training',
    'Boarding',
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
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      );

      // Fetch approved businesses first
      const businessesPromise = supabase
        .from('business_profiles')
        .select('*')
        .eq('is_approved', true)
        .eq('is_active', true);

      const { data: businessesData, error: businessesError } = await Promise.race([
        businessesPromise,
        timeoutPromise
      ]);

      if (businessesError) throw businessesError;

      // Then fetch services for each business
      const businessesWithServicesData = [];
      for (const business of businessesData) {
        try {
          const servicesTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Services timeout')), 3000)
          );

          const servicesPromise = supabase
            .from('business_services')
            .select('*')
            .eq('business_id', business.id)
            .eq('is_active', true);

          const { data: servicesData, error: servicesError } = await Promise.race([
            servicesPromise,
            servicesTimeoutPromise
          ]);

          if (!servicesError && servicesData && servicesData.length > 0) {
            businessesWithServicesData.push({
              ...business,
              business_services: servicesData
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch services for business ${business.id}:`, error.message);
          // Continue with other businesses even if one fails
        }
      }

      // Add default categories to services
      const formattedBusinesses = businessesWithServicesData.map(business => ({
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
      if (formattedBusinesses.length === 0) {
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
                category: 'Grooming'
              },
              {
                id: 'service-2',
                name: 'Nail Trim & Ear Clean',
                description: 'Quick nail trim and gentle ear cleaning',
                price: 120,
                duration_minutes: 30,
                tags: ['Quick', 'Hygiene'],
                category: 'Grooming'
              }
            ]
          },
          {
            id: 'mock-2',
            business_name: 'Happy Tails Vet Clinic',
            bio: 'Compassionate veterinary care for your beloved pets. From routine check-ups to emergency services.',
            location: 'Cape Town',
            phone: '+27 21 987 6543',
            email: 'contact@happytails.co.za',
            business_services: [
              {
                id: 'service-3',
                name: 'Annual Check-up',
                description: 'Comprehensive health check and vaccination',
                price: 600,
                duration_minutes: 60,
                tags: ['Preventative', 'Vaccination'],
                category: 'Veterinary'
              },
              {
                id: 'service-4',
                name: 'Emergency Consultation',
                description: 'Urgent care for unexpected pet health issues',
                price: 800,
                duration_minutes: 90,
                tags: ['Urgent', 'Critical Care'],
                category: 'Veterinary'
              }
            ]
          }
        ];
        setBusinesses(mockBusinesses);
      } else {
        setBusinesses(formattedBusinesses);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (business) => {
    navigate(`/business/${business.id}`);
  };

  // Filter businesses based on search and category
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = searchTerm === '' || 
      business.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (business.business_services && business.business_services.some(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      ));

    const matchesCategory = selectedCategory === 'all' || 
      (business.business_services && business.business_services.some(service => 
        service.category === selectedCategory
      ));

    const matchesPrice = business.business_services && business.business_services.some(service => 
      service.price >= priceRange[0] && service.price <= priceRange[1]
    );

    return matchesSearch && matchesCategory && (priceRange[0] === 0 && priceRange[1] === 1000 ? true : matchesPrice);
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional
            <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent block">
              Pet Services
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover trusted pet professionals in your area. Book services, read reviews, and give your pets the care they deserve.
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search businesses, services, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {mockCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range: R{priceRange[0]} - R{priceRange[1]}</label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>
        </motion.div>

        {businesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Available</h3>
            <p className="text-gray-600 mb-6">We're working on adding more pet service providers to your area.</p>
            <button
              onClick={() => navigate('/waitlist')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Join Waitlist
            </button>
          </div>
        ) : (
          <>
            {/* Results Counter */}
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredBusinesses.length} business{filteredBusinesses.length !== 1 ? 'es' : ''} found
                {searchTerm && ` for "${searchTerm}"`}
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              </p>
            </div>

            {filteredBusinesses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No businesses found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setPriceRange([0, 1000]);
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBusinesses.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    services={business.business_services || []}
                    onBookService={handleBookService}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ServicesNew;