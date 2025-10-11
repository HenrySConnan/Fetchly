import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Tag, Clock, DollarSign, MapPin, Star, Phone, Mail, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useBusinessAccess } from '../hooks/useBusinessAccess';
import { supabase } from '../lib/supabase';

// Service Card Component for Management
const ServiceManagementCard = ({ service, onEdit, onDelete }) => {
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
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-2">{service.name}</h3>
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
          
          {/* Action Buttons */}
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => onEdit(service)}
              className="p-2 text-gray-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
              title="Edit service"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(service.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
              title="Delete service"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
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

      {/* Service Details */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 text-green-600">
            <DollarSign className="w-4 h-4" />
            <span className="text-lg font-bold">R{service.price}</span>
          </div>
          <div className="flex items-center space-x-1 text-blue-600 text-sm">
            <Clock className="w-4 h-4" />
            <span>{service.duration} min</span>
          </div>
        </div>
        
        {/* Category */}
        <div className="flex items-center space-x-2 mb-3">
          <Tag className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-gray-600">{service.category}</span>
        </div>
      </div>
    </motion.div>
  );
};

const BusinessServices = () => {
  const { businessProfile } = useBusinessAccess();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    tags: []
  });

  // Service categories
  const serviceCategories = [
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

  // Load services
  useEffect(() => {
    loadServices();
  }, [businessProfile]);

  const loadServices = async () => {
    if (!businessProfile) return;
    
    try {
      const { data, error } = await supabase
        .from('business_services')
        .select('*')
        .eq('business_id', businessProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        business_id: businessProfile.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        category: formData.category,
        tags: formData.tags,
        is_active: true
      };

      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('business_services')
          .update(serviceData)
          .eq('id', editingService.id);
        
        if (error) throw error;
      } else {
        // Create new service
        const { error } = await supabase
          .from('business_services')
          .insert([serviceData]);
        
        if (error) throw error;
      }

      // Reset form and reload
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: '',
        tags: []
      });
      setShowAddModal(false);
      setEditingService(null);
      loadServices();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      tags: service.tags || []
    });
    setShowAddModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const { error } = await supabase
        .from('business_services')
        .delete()
        .eq('id', serviceId);
      
      if (error) throw error;
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Manage Services</h1>
          <p className="text-lg text-gray-600">Add and manage your business services</p>
        </div>

        {/* Add Service Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Service</span>
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceManagementCard 
              key={service.id} 
              service={service} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-600 mb-6">Add your first service to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add Your First Service
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingService(null);
                    setFormData({
                      name: '',
                      description: '',
                      price: '',
                      duration: '',
                      category: '',
                      tags: []
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Dog Grooming, Veterinary Checkup"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe your service..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (R) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {serviceCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (optional)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full flex items-center space-x-2"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-primary-500 hover:text-primary-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add a tag..."]');
                        if (input.value.trim()) {
                          addTag(input.value.trim());
                          input.value = '';
                        }
                      }}
                      className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingService(null);
                      setFormData({
                        name: '',
                        description: '',
                        price: '',
                        duration: '',
                        category: '',
                        tags: []
                      });
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingService ? 'Update Service' : 'Add Service'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BusinessServices;
