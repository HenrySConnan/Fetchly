import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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

const BusinessDashboard = () => {
  const { isBusinessOwner, isBusinessApproved, businessProfile, isLoading } = useBusinessAccess();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isLoading && !isBusinessOwner) {
      navigate('/');
    }
  }, [isBusinessOwner, isLoading, navigate]);

  useEffect(() => {
    if (!isLoading && isBusinessOwner && !isBusinessApproved) {
      navigate('/business-upgrade');
    }
  }, [isBusinessOwner, isBusinessApproved, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isBusinessOwner) {
    return null;
  }

  if (!isBusinessApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="glass-card p-8 rounded-2xl text-center max-w-md">
          <Building className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Application Pending</h2>
          <p className="text-gray-600 mb-6">
            Your business application is currently under review. You'll receive an email notification once it's approved.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
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

      {/* Business Navigation Sidebar */}
      <div className="flex">
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Panel</h3>
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'overview' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Overview</span>
              </button>
              <button 
                onClick={() => setActiveTab('services')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'services' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Services</span>
              </button>
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'bookings' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Bookings</span>
              </button>
              <button 
                onClick={() => setActiveTab('deals')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'deals' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Star className="w-5 h-5" />
                <span>Deals & Promotions</span>
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'settings' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto px-6 py-12">
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
                    onClick={() => setActiveTab('bookings')}
                    className="w-full btn-primary text-sm"
                  >
                    View Bookings
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Service Management</h2>
              <p className="text-lg text-gray-600">Service management features coming soon...</p>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Management</h2>
              <p className="text-lg text-gray-600">Booking management features coming soon...</p>
            </motion.div>
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
    </div>
  );
};

export default BusinessDashboard;