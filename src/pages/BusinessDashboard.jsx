import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building,
  Calendar,
  DollarSign,
  Users,
  Plus,
  Settings,
  LogOut,
  Home,
  BarChart3,
  Package,
  Star
} from 'lucide-react';
import { useBusinessAccess } from '../hooks/useBusinessAccess';
import { useAuth } from '../contexts/AuthContext';
import BusinessServices from './BusinessServices';
import BusinessBookings from './BusinessBookings';

const BusinessDashboard = () => {
  const { isBusiness, businessProfile, isLoading } = useBusinessAccess();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isLoading && !isBusiness) {
      navigate('/');
    }
  }, [isBusiness, isLoading, navigate]);

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'services', 'bookings', 'deals', 'promotions', 'analytics', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/business?tab=${tab}`, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isBusiness) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Business Dashboard</h1>
                <p className="text-sm text-gray-600">{businessProfile?.business_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>View Site</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Your Business Dashboard</h2>
                <p className="text-lg text-gray-600">
                  Manage your pet care business with ease
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Today's Bookings</p>
                      <h3 className="text-2xl font-bold text-gray-900">12</h3>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Today's Revenue</p>
                      <h3 className="text-2xl font-bold text-gray-900">$1,250</h3>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Total Customers</p>
                      <h3 className="text-2xl font-bold text-gray-900">89</h3>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Star className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Average Rating</p>
                      <h3 className="text-2xl font-bold text-gray-900">4.8</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Plus className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Add New Service</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Create a new service offering for your customers.
                  </p>
                  <button className="w-full btn-primary text-sm">
                    Create Service
                  </button>
                </div>

                <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Star className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Create Deal</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Set up special offers and promotions for your services.
                  </p>
                  <button className="w-full btn-primary text-sm">
                    Create Deal
                  </button>
                </div>

                <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">View Bookings</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Manage your upcoming appointments and bookings.
                  </p>
                  <button 
                    onClick={() => handleTabChange('bookings')}
                    className="w-full btn-primary text-sm"
                  >
                    View Bookings
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'services' && (
            <BusinessServices />
          )}

          {activeTab === 'bookings' && (
            <BusinessBookings />
          )}

          {activeTab === 'deals' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Deals & Promotions</h2>
              <p className="text-lg text-gray-600">Deals management features coming soon...</p>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Business Analytics</h2>
              <p className="text-lg text-gray-600">Analytics and reporting features coming soon...</p>
            </motion.div>
          )}

          {activeTab === 'promotions' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Promotions Management</h2>
              <p className="text-lg text-gray-600">Promotional campaigns management coming soon...</p>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Business Settings</h2>
              <p className="text-lg text-gray-600">Settings features coming soon...</p>
            </motion.div>
          )}
      </div>
    </div>
  );
};

export default BusinessDashboard;