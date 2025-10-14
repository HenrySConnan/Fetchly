import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Phone, Mail, Clock, DollarSign, Tag, Building, Calendar, ChevronDown, ChevronUp, Globe, Award, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import EnhancedBookingModal from '../components/EnhancedBookingModal';
import BusinessHours from '../components/BusinessHours';

// Service Card Component
const ServiceCard = ({ service, onBook }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  
  // Check if description is long enough to need truncation
  const shouldTruncate = service.description && service.description.length > 100;
  const truncatedDescription = shouldTruncate && !isExpanded 
    ? service.description.substring(0, 100) + '...' 
    : service.description;

  useEffect(() => {
    if (service.description && service.description.length > 100) {
      setShowReadMore(true);
    }
  }, [service.description]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/70 backdrop-blur-xl rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Service Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{service.name}</h3>
          {/* Service Category */}
          {service.service_categories && (
            <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium ml-2 flex-shrink-0">
              {service.service_categories.name}
            </span>
          )}
        </div>
        
        {/* Service Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          {truncatedDescription}
        </p>
        
        {/* Read More/Less Button */}
        {showReadMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-600 text-xs font-medium hover:text-primary-700 flex items-center space-x-1 mb-3"
          >
            <span>{isExpanded ? 'Show Less' : 'Read More'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Service Tags */}
      {service.tags && service.tags.length > 0 && (
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-1">
            {service.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {service.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{service.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Service Details & Actions */}
      <div className="px-6 pb-6">
        {/* Price and Duration */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 text-green-600">
            <DollarSign className="w-4 h-4" />
            <span className="text-lg font-bold">${service.price}</span>
          </div>
          <div className="flex items-center space-x-1 text-blue-600 text-sm">
            <Clock className="w-4 h-4" />
            <span>{service.duration || service.duration_minutes} min</span>
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={onBook}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium py-3 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Book This Service
        </button>
      </div>
    </motion.div>
  );
};

const BusinessServicesPage = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    if (businessId) {
      fetchBusinessAndServices();
    }
  }, [businessId]);

  const fetchBusinessAndServices = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if this is a mock business ID
      if (businessId.startsWith('mock-')) {
        const mockBusinesses = {
          'mock-1': {
            id: 'mock-1',
            business_name: 'Paws & Claws Grooming',
            bio: 'Professional pet grooming services with 10+ years of experience. We specialize in all breeds and sizes.',
            location: 'Stellenbosch',
            phone: '+27 21 123 4567',
            email: 'info@pawsandclaws.co.za',
            business_categories: { name: 'Grooming' }
          },
          'mock-2': {
            id: 'mock-2',
            business_name: 'Stellenbosch Vet Clinic',
            bio: 'Full-service veterinary care with emergency services available 24/7.',
            location: 'Stellenbosch',
            phone: '+27 21 987 6543',
            email: 'info@stellenboschvet.co.za',
            business_categories: { name: 'Veterinary' }
          }
        };

        const mockServices = {
          'mock-1': [
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
          ],
          'mock-2': [
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
        };

        // Use the first mock business if the ID doesn't match any mock data
        const businessData = mockBusinesses[businessId] || mockBusinesses['mock-1'];
        const servicesData = mockServices[businessId] || mockServices['mock-1'];
        
        setBusiness(businessData);
        setServices(servicesData);
        setLoading(false);
        return;
      }

      // Fetch business details from database (simplified query to avoid relationship issues)
      const { data: businessData, error: businessError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', businessId)
        .eq('is_approved', true)
        .eq('is_active', true)
        .single();

      if (businessError) throw businessError;

      // Fetch business services (simplified query)
      const { data: servicesData, error: servicesError } = await supabase
        .from('business_services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;

      setBusiness(businessData);
      setServices(servicesData);
    } catch (err) {
      console.error('Error fetching business and services:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Not Found</h3>
          <p className="text-gray-600 mb-4">This business may not exist or is no longer available.</p>
          <button
            onClick={() => navigate('/services')}
            className="btn-primary"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          onClick={() => navigate('/services')}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to All Services</span>
        </motion.button>

        {/* Business Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Business Photo */}
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Building className="w-10 h-10 text-white" />
            </div>

            {/* Business Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.business_name}</h1>
                  <p className="text-gray-600 mb-3">{business.bio}</p>
                </div>
                
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4 md:mb-0">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-lg font-medium text-gray-700">4.8</span>
                </div>
              </div>

              {/* Business Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span>{business.location}</span>
                </div>
                
                {business.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-primary-600" />
                    <span>{business.phone}</span>
                  </div>
                )}
                
                {business.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-primary-600" />
                    <span>{business.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Services Section - Moved up for better visibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Services</h2>
          
          {services.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Available</h3>
              <p className="text-gray-600">This business hasn't added any services yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  onBook={() => handleBookService(service)} 
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Business Information Section - Moved after services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Business Hours */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
              </div>
              <BusinessHours businessId={business.id} />
            </div>

            {/* Contact & Additional Info */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Contact & Information</h3>
              </div>
              
              <div className="space-y-4">
                {/* Location */}
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">{business.location}</p>
                  </div>
                </div>

                {/* Phone */}
                {business.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <a href={`tel:${business.phone}`} className="text-primary-600 hover:text-primary-700">
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {business.email && (
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a href={`mailto:${business.email}`} className="text-primary-600 hover:text-primary-700">
                        {business.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Website */}
                {business.website && (
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Website</p>
                      <a 
                        href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {business.website}
                      </a>
                    </div>
                  </div>
                )}

                {/* Business Type */}
                {business.business_type && (
                  <div className="flex items-start space-x-3">
                    <Award className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Business Type</p>
                      <p className="text-gray-600 capitalize">{business.business_type}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Booking Modal */}
      <EnhancedBookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedService(null);
        }}
        business={business}
        services={selectedService ? [selectedService] : []}
        selectedService={selectedService}
      />
    </div>
  );
};

export default BusinessServicesPage;
