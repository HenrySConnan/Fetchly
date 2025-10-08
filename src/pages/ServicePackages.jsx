import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Star, Clock, Users, CheckCircle, ArrowRight, Percent } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const ServicePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatServices = (servicesJson) => {
    try {
      const services = JSON.parse(servicesJson);
      return Array.isArray(services) ? services : [];
    } catch {
      return [];
    }
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
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mr-4">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                Service
                <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent block">
                  Packages
                </span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Save money with our carefully curated service packages designed for your pet's ongoing care needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading packages...</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {packages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="glass-card rounded-2xl overflow-hidden group cursor-pointer"
                >
                  {/* Package Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-primary-600" />
                        <span className="text-sm font-medium text-primary-600">Package</span>
                      </div>
                      {pkg.discount_percentage > 0 && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                          <Percent className="w-3 h-3" />
                          <span>{pkg.discount_percentage}% OFF</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{pkg.description}</p>
                  </div>

                  {/* Package Details */}
                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{pkg.total_sessions} sessions included</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Perfect for regular care</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Star className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Best value option</span>
                      </div>
                    </div>

                    {/* Services Included */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Services Included:</h4>
                      <div className="space-y-2">
                        {formatServices(pkg.services).map((service, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">
                              {service.name} {service.quantity > 1 && `(${service.quantity}x)`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-6">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-primary-600">${pkg.price}</span>
                        <span className="text-sm text-gray-500">total</span>
                      </div>
                      {pkg.discount_percentage > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          Save ${Math.round((pkg.price / (1 - pkg.discount_percentage / 100)) - pkg.price)} with this package
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Link
                      to="/services"
                      className="w-full btn-primary group-hover:scale-105 transition-transform duration-300 flex items-center justify-center space-x-2"
                    >
                      <span>Book Package</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && packages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No packages available</h3>
              <p className="text-gray-600">Check back later for new service packages.</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent block">
                Service Packages?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our packages are designed to provide comprehensive care for your pets while saving you money and ensuring consistent service quality.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Percent,
                title: 'Save Money',
                description: 'Get significant discounts when you book multiple sessions together. The more you book, the more you save.',
                color: 'from-green-500 to-green-600',
                bgColor: 'bg-green-50'
              },
              {
                icon: Clock,
                title: 'Consistent Care',
                description: 'Regular appointments ensure your pet receives consistent, high-quality care from trusted professionals.',
                color: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-50'
              },
              {
                icon: Star,
                title: 'Priority Booking',
                description: 'Package holders get priority scheduling and preferred time slots for their appointments.',
                color: 'from-purple-500 to-purple-600',
                bgColor: 'bg-purple-50'
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-8 text-center"
              >
                <div className={`w-16 h-16 ${benefit.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <benefit.icon className={`w-8 h-8 bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServicePackages;
