import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Camera, 
  Save, 
  Edit, 
  X,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Bell,
  Shield,
  Users,
  CreditCard,
  Globe,
  Building
} from 'lucide-react';
import { useBusinessAccess } from '../hooks/useBusinessAccess';
import { supabase } from '../lib/supabase';

const BusinessSettings = () => {
  const { businessProfile, isLoading: isBusinessLoading } = useBusinessAccess();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Settings
  const [profileData, setProfileData] = useState({
    business_name: '',
    bio: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    location: 'Stellenbosch'
  });

  // Business Hours
  const [businessHours, setBusinessHours] = useState({
    monday: { isOpen: true, open: '09:00', close: '17:00' },
    tuesday: { isOpen: true, open: '09:00', close: '17:00' },
    wednesday: { isOpen: true, open: '09:00', close: '17:00' },
    thursday: { isOpen: true, open: '09:00', close: '17:00' },
    friday: { isOpen: true, open: '09:00', close: '17:00' },
    saturday: { isOpen: false, open: '09:00', close: '17:00' },
    sunday: { isOpen: false, open: '09:00', close: '17:00' }
  });

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState({
    slot_duration: 30, // minutes
    advance_booking_days: 30,
    cancellation_hours: 24,
    max_bookings_per_slot: 1,
    require_phone: true,
    require_email: true,
    allow_online_payment: true,
    require_deposit: false,
    deposit_percentage: 0
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    booking_confirmations: true,
    booking_reminders: true,
    cancellation_notifications: true,
    new_booking_alerts: true,
    daily_summary: true
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    payment_methods: ['cash', 'card'],
    currency: 'ZAR',
    tax_rate: 15,
    service_fee: 0,
    refund_policy: '24 hours notice required for cancellations'
  });

  useEffect(() => {
    if (businessProfile?.id) {
      loadSettings();
    }
  }, [businessProfile]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Load profile data
      setProfileData({
        business_name: businessProfile.business_name || '',
        bio: businessProfile.bio || '',
        phone: businessProfile.phone || '',
        email: businessProfile.email || '',
        website: businessProfile.website || '',
        address: businessProfile.address || '',
        location: businessProfile.location || 'Stellenbosch'
      });

      // Load business hours (you'll need to create this table)
      const { data: hoursData } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessProfile.id)
        .single();

      if (hoursData) {
        setBusinessHours(hoursData.hours || businessHours);
      }

      // Load booking settings
      const { data: bookingData } = await supabase
        .from('business_booking_settings')
        .select('*')
        .eq('business_id', businessProfile.id)
        .single();

      if (bookingData) {
        setBookingSettings(bookingData.settings || bookingSettings);
      }

      // Load notification settings
      const { data: notificationData } = await supabase
        .from('business_notification_settings')
        .select('*')
        .eq('business_id', businessProfile.id)
        .single();

      if (notificationData) {
        setNotificationSettings(notificationData.settings || notificationSettings);
      }

      // Load payment settings
      const { data: paymentData } = await supabase
        .from('business_payment_settings')
        .select('*')
        .eq('business_id', businessProfile.id)
        .single();

      if (paymentData) {
        setPaymentSettings(paymentData.settings || paymentSettings);
      }

    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('business_profiles')
        .update(profileData)
        .eq('id', businessProfile.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile: ' + error.message });
    }
  };

  const handleSaveBusinessHours = async () => {
    try {
      const { error } = await supabase
        .from('business_hours')
        .upsert({
          business_id: businessProfile.id,
          hours: businessHours
        });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Business hours updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update business hours: ' + error.message });
    }
  };

  const handleSaveBookingSettings = async () => {
    try {
      const { error } = await supabase
        .from('business_booking_settings')
        .upsert({
          business_id: businessProfile.id,
          settings: bookingSettings
        });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Booking settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update booking settings: ' + error.message });
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      const { error } = await supabase
        .from('business_notification_settings')
        .upsert({
          business_id: businessProfile.id,
          settings: notificationSettings
        });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Notification settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update notification settings: ' + error.message });
    }
  };

  const handleSavePaymentSettings = async () => {
    try {
      const { error } = await supabase
        .from('business_payment_settings')
        .upsert({
          business_id: businessProfile.id,
          settings: paymentSettings
        });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Payment settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update payment settings: ' + error.message });
    }
  };

  const updateBusinessHours = (day, field, value) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const updateBookingSettings = (field, value) => {
    setBookingSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNotificationSettings = (field, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updatePaymentSettings = (field, value) => {
    setPaymentSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isBusinessLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Building },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'booking', label: 'Booking Settings', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Business Settings</h1>
          <p className="text-lg text-gray-600">Manage your business profile, hours, and preferences</p>
        </motion.div>

        {/* Message */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700 border border-primary-200'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Business Profile</h2>
                  <button
                    onClick={handleSaveProfile}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.business_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, business_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <select
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="Stellenbosch">Stellenbosch</option>
                      <option value="Cape Town">Cape Town</option>
                      <option value="Johannesburg">Johannesburg</option>
                      <option value="Durban">Durban</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Tell customers about your business..."
                  />
                </div>
              </motion.div>
            )}

            {/* Business Hours */}
            {activeTab === 'hours' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Business Hours</h2>
                  <button
                    onClick={handleSaveBusinessHours}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Hours</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {Object.entries(businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-24">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={hours.isOpen}
                            onChange={(e) => updateBusinessHours(day, 'isOpen', e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="font-medium capitalize">{day}</span>
                        </label>
                      </div>

                      {hours.isOpen && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      )}

                      {!hours.isOpen && (
                        <span className="text-gray-500 italic">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Booking Settings */}
            {activeTab === 'booking' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Booking Settings</h2>
                  <button
                    onClick={handleSaveBookingSettings}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Slot Duration (minutes)
                    </label>
                    <select
                      value={bookingSettings.slot_duration}
                      onChange={(e) => updateBookingSettings('slot_duration', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                      <option value={90}>90 minutes</option>
                      <option value={120}>120 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advance Booking (days)
                    </label>
                    <input
                      type="number"
                      value={bookingSettings.advance_booking_days}
                      onChange={(e) => updateBookingSettings('advance_booking_days', parseInt(e.target.value))}
                      min="1"
                      max="365"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cancellation Notice (hours)
                    </label>
                    <input
                      type="number"
                      value={bookingSettings.cancellation_hours}
                      onChange={(e) => updateBookingSettings('cancellation_hours', parseInt(e.target.value))}
                      min="1"
                      max="168"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Bookings Per Slot
                    </label>
                    <input
                      type="number"
                      value={bookingSettings.max_bookings_per_slot}
                      onChange={(e) => updateBookingSettings('max_bookings_per_slot', parseInt(e.target.value))}
                      min="1"
                      max="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Require Phone Number</h4>
                      <p className="text-sm text-gray-600">Customers must provide phone number when booking</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bookingSettings.require_phone}
                        onChange={(e) => updateBookingSettings('require_phone', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Require Email Address</h4>
                      <p className="text-sm text-gray-600">Customers must provide email address when booking</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bookingSettings.require_email}
                        onChange={(e) => updateBookingSettings('require_email', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Allow Online Payment</h4>
                      <p className="text-sm text-gray-600">Enable online payment processing for bookings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bookingSettings.allow_online_payment}
                        onChange={(e) => updateBookingSettings('allow_online_payment', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
                  <button
                    onClick={handleSaveNotificationSettings}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {key.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {getNotificationDescription(key)}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateNotificationSettings(key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Payment Settings</h2>
                  <button
                    onClick={handleSavePaymentSettings}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={paymentSettings.currency}
                      onChange={(e) => updatePaymentSettings('currency', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="ZAR">South African Rand (ZAR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={paymentSettings.tax_rate}
                      onChange={(e) => updatePaymentSettings('tax_rate', parseFloat(e.target.value))}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Fee (R)
                    </label>
                    <input
                      type="number"
                      value={paymentSettings.service_fee}
                      onChange={(e) => updatePaymentSettings('service_fee', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Policy
                  </label>
                  <textarea
                    value={paymentSettings.refund_policy}
                    onChange={(e) => updatePaymentSettings('refund_policy', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe your refund and cancellation policy..."
                  />
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Security Features</h3>
                  <p className="text-gray-600">Password management and security settings will be available here.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for notification descriptions
const getNotificationDescription = (key) => {
  const descriptions = {
    email_notifications: 'Receive notifications via email',
    sms_notifications: 'Receive notifications via SMS',
    booking_confirmations: 'Send confirmation emails to customers',
    booking_reminders: 'Send reminder notifications before appointments',
    cancellation_notifications: 'Get notified when bookings are cancelled',
    new_booking_alerts: 'Get notified immediately when new bookings are made',
    daily_summary: 'Receive daily summary of bookings and activities'
  };
  return descriptions[key] || 'Notification setting';
};

export default BusinessSettings;
