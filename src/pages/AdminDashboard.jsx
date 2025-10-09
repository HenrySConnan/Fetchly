import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  BarChart3,
  AlertTriangle,
  Star,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  Download,
  RefreshCw,
  Bell,
  Target,
  Zap,
  Crown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [stats, setStats] = useState({});
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [promotionPackages, setPromotionPackages] = useState([]);
  const [adminSettings, setAdminSettings] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
      } else if (adminData) {
        setIsAdmin(true);
        loadAdminData();
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    } finally {
      setCheckingAccess(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadPendingBusinesses(),
        loadAllBusinesses(),
        loadPromotions(),
        loadPromotionPackages(),
        loadAdminSettings(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [dailyStats, weeklyStats, monthlyStats] = await Promise.all([
        supabase.rpc('get_daily_stats'),
        supabase.rpc('get_weekly_stats'),
        supabase.rpc('get_monthly_stats')
      ]);

      setStats({
        daily: dailyStats.data,
        weekly: weeklyStats.data,
        monthly: monthlyStats.data
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadPendingBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select(`
          *,
          users:user_id(email, user_metadata)
        `)
        .eq('approval_status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setPendingBusinesses(data || []);
    } catch (error) {
      console.error('Error loading pending businesses:', error);
    }
  };

  const loadAllBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select(`
          *,
          users:user_id(email, user_metadata)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllBusinesses(data || []);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };

  const loadPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('business_promotions')
        .select(`
          *,
          business_profiles(business_name, users:user_id(email)),
          promotion_packages(name, price_per_day, price_per_week, price_per_month)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  };

  const loadPromotionPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('promotion_packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotionPackages(data || []);
    } catch (error) {
      console.error('Error loading promotion packages:', error);
    }
  };

  const loadAdminSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) throw error;
      
      const settings = {};
      data?.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value;
      });
      setAdminSettings(settings);
    } catch (error) {
      console.error('Error loading admin settings:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleBusinessApproval = async (businessId, approved, reason = '') => {
    try {
      const { error } = await supabase
        .from('business_profiles')
        .update({
          approval_status: approved ? 'approved' : 'rejected',
          approved_at: approved ? new Date().toISOString() : null,
          approved_by: user.id,
          rejection_reason: approved ? null : reason
        })
        .eq('id', businessId);

      if (error) throw error;

      // Create notification
      await supabase
        .from('admin_notifications')
        .insert({
          admin_id: user.id,
          notification_type: 'business_approval',
          title: `Business ${approved ? 'Approved' : 'Rejected'}`,
          message: `Business application has been ${approved ? 'approved' : 'rejected'}`,
          data: { business_id: businessId, approved }
        });

      await loadPendingBusinesses();
      await loadAllBusinesses();
    } catch (error) {
      console.error('Error updating business approval:', error);
    }
  };

  const handlePromotionApproval = async (promotionId, approved) => {
    try {
      const { error } = await supabase
        .from('business_promotions')
        .update({
          status: approved ? 'approved' : 'cancelled',
          approved_by: user.id,
          approved_at: approved ? new Date().toISOString() : null
        })
        .eq('id', promotionId);

      if (error) throw error;

      await loadPromotions();
    } catch (error) {
      console.error('Error updating promotion approval:', error);
    }
  };

  const updateAdminSetting = async (key, value) => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: key,
          setting_value: { value },
          updated_by: user.id
        });

      if (error) throw error;

      setAdminSettings(prev => ({
        ...prev,
        [key]: { value }
      }));
    } catch (error) {
      console.error('Error updating admin setting:', error);
    }
  };

  // Access denied component
  const renderAccessDenied = () => (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md mx-auto text-center"
      >
        <div className="glass-card rounded-2xl p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            This dashboard is only available for administrators. You don't have the required permissions.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full btn-primary"
            >
              Go to User Dashboard
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full btn-secondary"
            >
              Back to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Loading component
  const renderLoading = () => (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking access...</p>
      </div>
    </div>
  );

  // Show loading while checking access
  if (checkingAccess) {
    return renderLoading();
  }

  // Show access denied if not an admin
  if (!isAdmin) {
    return renderAccessDenied();
  }

  // Show loading while fetching admin data
  if (loading) {
    return renderLoading();
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'businesses', name: 'Businesses', icon: Building },
    { id: 'promotions', name: 'Promotions', icon: Target },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp }
  ];

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Admin Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.daily?.new_users || 0}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Businesses</p>
              <h3 className="text-2xl font-bold text-gray-900">{allBusinesses.length}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Building className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Approvals</p>
              <h3 className="text-2xl font-bold text-gray-900">{pendingBusinesses.length}</h3>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">${stats.daily?.total_revenue || 0}</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Notifications</h3>
        <div className="space-y-3">
          {notifications.slice(0, 5).map((notification) => (
            <div key={notification.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Bell className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{notification.title}</p>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(notification.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderBusinesses = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Business Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('businesses')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'businesses' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Businesses
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'pending' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Pending Approval
          </button>
        </div>
      </div>

      {/* Pending Businesses */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingBusinesses.map((business) => (
            <div key={business.id} className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{business.business_name}</h3>
                  <p className="text-gray-600">{business.users?.email}</p>
                  <p className="text-sm text-gray-500 mt-2">{business.business_description}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className="text-sm text-gray-500">
                      Submitted: {new Date(business.submitted_at).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      Category: {business.business_category}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleBusinessApproval(business.id, true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason:');
                      if (reason) handleBusinessApproval(business.id, false, reason);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Businesses */}
      {activeTab === 'businesses' && (
        <div className="glass-card p-6 rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allBusinesses.map((business) => (
                  <tr key={business.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{business.business_name}</div>
                        <div className="text-sm text-gray-500">{business.business_category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {business.users?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        business.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                        business.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {business.approval_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(business.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-700">
                          <Eye className="w-4 h-4" />
                        </button>
                        {business.approval_status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleBusinessApproval(business.id, true)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Rejection reason:');
                                if (reason) handleBusinessApproval(business.id, false, reason);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderPromotions = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Promotion Management</h2>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Package</span>
        </button>
      </div>

      {/* Promotion Packages */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Promotion Packages</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotionPackages.map((pkg) => (
            <div key={pkg.id} className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">{pkg.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {pkg.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Per Day:</span>
                  <span className="font-semibold">${pkg.price_per_day}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Per Week:</span>
                  <span className="font-semibold">${pkg.price_per_week}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Per Month:</span>
                  <span className="font-semibold">${pkg.price_per_month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Deals:</span>
                  <span className="font-semibold">{pkg.max_deals}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 btn-secondary text-sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Promotions */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Active Promotions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promotion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promotions.map((promotion) => (
                <tr key={promotion.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {promotion.business_profiles?.business_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {promotion.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {promotion.promotion_packages?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(promotion.start_date).toLocaleDateString()} - {new Date(promotion.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${promotion.total_cost}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      promotion.status === 'approved' ? 'bg-green-100 text-green-800' :
                      promotion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {promotion.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {promotion.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handlePromotionApproval(promotion.id, true)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePromotionApproval(promotion.id, false)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="text-primary-600 hover:text-primary-700">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Admin Settings</h2>

      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Maximum Business Deals</h4>
              <p className="text-sm text-gray-600">How many active deals a business can run simultaneously</p>
            </div>
            <input
              type="number"
              value={adminSettings.max_business_deals?.value || 3}
              onChange={(e) => updateAdminSetting('max_business_deals', parseInt(e.target.value))}
              className="w-20 p-2 border border-gray-200 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Promotion Approval Required</h4>
              <p className="text-sm text-gray-600">Whether promotions need admin approval before going live</p>
            </div>
            <input
              type="checkbox"
              checked={adminSettings.promotion_approval_required?.value || false}
              onChange={(e) => updateAdminSetting('promotion_approval_required', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Business Approval Required</h4>
              <p className="text-sm text-gray-600">Whether new businesses need admin approval</p>
            </div>
            <input
              type="checkbox"
              checked={adminSettings.business_approval_required?.value || false}
              onChange={(e) => updateAdminSetting('business_approval_required', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderAnalytics = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Stats */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Today's Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Users</span>
              <span className="font-semibold text-lg">{stats.daily?.new_users || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Businesses</span>
              <span className="font-semibold text-lg">{stats.daily?.new_businesses || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Bookings</span>
              <span className="font-semibold text-lg">{stats.daily?.new_bookings || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue</span>
              <span className="font-semibold text-lg text-green-600">${stats.daily?.total_revenue || 0}</span>
            </div>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-4">This Week's Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Users</span>
              <span className="font-semibold text-lg">{stats.weekly?.new_users || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Businesses</span>
              <span className="font-semibold text-lg">{stats.weekly?.new_businesses || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Bookings</span>
              <span className="font-semibold text-lg">{stats.weekly?.new_bookings || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue</span>
              <span className="font-semibold text-lg text-green-600">${stats.weekly?.total_revenue || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">This Month's Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{stats.monthly?.new_users || 0}</div>
            <div className="text-sm text-gray-600">New Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.monthly?.new_businesses || 0}</div>
            <div className="text-sm text-gray-600">New Businesses</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.monthly?.new_bookings || 0}</div>
            <div className="text-sm text-gray-600">New Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">${stats.monthly?.total_revenue || 0}</div>
            <div className="text-sm text-gray-600">Revenue</div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-red-600 to-pink-500 text-white px-4 py-2 rounded-full mb-6">
            <Crown className="w-5 h-5 mr-2" />
            <span className="font-semibold">Admin Dashboard</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Platform
            <span className="bg-gradient-to-r from-red-600 to-pink-500 bg-clip-text text-transparent block">
              Administration
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Manage businesses, promotions, and monitor platform analytics with comprehensive admin tools.
          </p>
        </motion.div>

        <div className="glass-card rounded-2xl p-6">
          {/* Tabs */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8 border-b border-gray-200 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-5 py-2 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'businesses' && renderBusinesses()}
            {activeTab === 'promotions' && renderPromotions()}
            {activeTab === 'settings' && renderSettings()}
            {activeTab === 'analytics' && renderAnalytics()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
