import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Clock, DollarSign, Tag, Heart, Building } from 'lucide-react';

const BusinessCard = ({ business, services, onBookService }) => {
  const navigate = useNavigate();
  
  // Get all unique tags from services
  const allTags = [...new Set(services.flatMap(service => service.tags || []))];
  
  // Get service categories - handle both mock data and real database data
  const categories = [...new Set(services.map(service => {
    // For mock data with service_categories object
    if (service.service_categories?.name) {
      return service.service_categories.name;
    }
    // For real database data, use the category field directly
    if (service.category) {
      return service.category;
    }
    // Fallback to service name if no category
    return service.name;
  }).filter(Boolean))];

  const handleCardClick = () => {
    navigate(`/business/${business.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Business Photo */}
      <div className="h-32 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
          <Building className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Business Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{business.business_name}</h3>
            <p className="text-gray-600 text-xs mb-2 line-clamp-2">{business.bio}</p>
            
            {/* Business Info */}
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <MapPin className="w-3 h-3 text-primary-600" />
                <span>{business.location}</span>
              </div>
              
              {business.phone && (
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <Phone className="w-3 h-3 text-primary-600" />
                  <span>{business.phone}</span>
                </div>
              )}
            </div>
            
            {/* Business Hours removed from card - only show in business info section */}
          </div>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span className="text-xs font-medium text-gray-700">4.8</span>
          </div>
        </div>

        {/* Service Categories */}
        <div className="flex flex-wrap gap-1 mb-2">
          {categories.slice(0, 3).map((category, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium"
            >
              {category}
            </span>
          ))}
          {categories.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
              +{categories.length - 3}
            </span>
          )}
        </div>

        {/* Service Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {allTags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {allTags.length > 4 && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{allTags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4">
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/business/${business.id}`);
            }}
            className="flex-1 btn-primary text-xs py-2"
          >
            View Services & Book
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Heart className="w-3 h-3" />
          </button>
        </div>
        
        {/* Service Count */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">
            {services.length} service{services.length !== 1 ? 's' : ''} available
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default BusinessCard;
