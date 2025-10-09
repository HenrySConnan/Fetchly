import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  CheckCircle,
  Star,
  Users,
  BarChart3,
  Calendar,
  Settings,
  Shield,
  ArrowRight,
  Crown,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BusinessUpgrade = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track revenue, bookings, and customer insights'
    },
    {
      icon: Calendar,
      title: 'Booking Management',
      description: 'Manage all your appointments and schedules'
    },
    {
      icon: Settings,
      title: 'Service Management',
      description: 'Create and manage your service offerings'
    },
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Build relationships with your customers'
    }
  ];

  const benefits = [
    'Unlimited service listings',
    'Advanced booking management',
    'Customer communication tools',
    'Revenue analytics and reporting',
    'Priority customer support',
    'Custom business profile'
  ];

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would integrate with a payment system
      // For now, we'll just simulate the upgrade process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to business dashboard
      navigate('/business');
    } catch (error) {
      console.error('Error upgrading account:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-primary-600 to-accent-500 text-white px-4 py-2 rounded-full mb-6">
            <Crown className="w-5 h-5 mr-2" />
            <span className="font-semibold">Business Account</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Upgrade to
            <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent block">
              Business Account
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Unlock powerful business tools to manage your pet care services, track bookings, 
            and grow your business with professional features.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-primary-600 to-accent-500 text-white px-6 py-2 rounded-bl-2xl">
              <span className="font-bold">Most Popular</span>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Business Plan</h2>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-5xl font-bold text-gray-900">$29</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">Everything you need to run your pet care business</p>
            </div>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Upgrading...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Upgrade to Business</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-8 text-gray-600 mb-8">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Secure & Reliable</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>500+ Businesses</span>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm">
            Join hundreds of pet care professionals who trust PetConnect for their business needs.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessUpgrade;
