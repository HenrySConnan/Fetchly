import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Building,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  LogOut,
  Home
} from 'lucide-react';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { useAuth } from '../contexts/AuthContext';

const SimpleAdminDashboard = () => {
  const { isAdmin, isLoading, error } = useAdminAccess();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  const loadStats = async () => {
    try {
      // Simple stats - we'll add real data later
      setStats({
        totalUsers: 150,
        totalBusinesses: 25,
        totalBookings: 89,
        totalRevenue: 12500
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have admin privileges.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">PetConnect Administration</p>
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

      {/* Admin Navigation Sidebar */}
      <div className="flex">
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Admin Panel</h3>
            <nav className="space-y-2">
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Users className="w-5 h-5" />
                <span>Users</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Building className="w-5 h-5" />
                <span>Businesses</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Calendar className="w-5 h-5" />
                <span>Bookings</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <DollarSign className="w-5 h-5" />
                <span>Revenue</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <AlertTriangle className="w-5 h-5" />
                <span>Alerts</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome, Admin!
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            You have successfully logged in as an administrator. This is your dedicated admin panel.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Businesses</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalBusinesses}</h3>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Bookings</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalBookings}</h3>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</h3>
              </div>
            </div>
          </div>
        </motion.div>

            {/* Admin Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Manage user accounts, view user activity, and handle user support requests.
                </p>
                <div className="space-y-2">
                  <button className="w-full btn-primary text-sm">
                    View All Users
                  </button>
                  <button className="w-full btn-secondary text-sm">
                    User Reports
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Building className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Business Approval</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Review and approve business applications, manage business profiles.
                </p>
                <div className="space-y-2">
                  <button className="w-full btn-primary text-sm">
                    Pending Approvals (3)
                  </button>
                  <button className="w-full btn-secondary text-sm">
                    Business Reports
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  View detailed analytics, revenue reports, and platform insights.
                </p>
                <div className="space-y-2">
                  <button className="w-full btn-primary text-sm">
                    View Analytics
                  </button>
                  <button className="w-full btn-secondary text-sm">
                    Generate Reports
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Management</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Monitor platform revenue, manage payments, and view financial reports.
                </p>
                <div className="space-y-2">
                  <button className="w-full btn-primary text-sm">
                    Revenue Dashboard
                  </button>
                  <button className="w-full btn-secondary text-sm">
                    Payment Reports
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Monitor system health, handle issues, and manage platform notifications.
                </p>
                <div className="space-y-2">
                  <button className="w-full btn-primary text-sm">
                    View Alerts (2)
                  </button>
                  <button className="w-full btn-secondary text-sm">
                    System Status
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <Settings className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Admin Settings</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Configure platform settings, manage admin users, and system preferences.
                </p>
                <div className="space-y-2">
                  <button className="w-full btn-primary text-sm">
                    Platform Settings
                  </button>
                  <button className="w-full btn-secondary text-sm">
                    Admin Users
                  </button>
                </div>
              </div>
            </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="glass-card p-8 rounded-xl text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            You have successfully logged in as an admin. The admin dashboard is working perfectly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              View Public Site
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Refresh Dashboard
            </button>
          </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  export default SimpleAdminDashboard;
