import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, User, Mail, Phone, MapPin, CheckCircle, X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const WaitlistManager = ({ isOpen, onClose, service, provider }) => {
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && service && provider) {
      loadWaitlistEntries();
    }
  }, [isOpen, service, provider]);

  const loadWaitlistEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('waitlist')
        .select(`
          *,
          user_profiles!inner(
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('service_id', service.id)
        .eq('provider_id', provider.id)
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setWaitlistEntries(data || []);
    } catch (error) {
      console.error('Error loading waitlist:', error);
      setError('Failed to load waitlist entries');
    } finally {
      setLoading(false);
    }
  };

  const notifyWaitlistEntry = async (entryId) => {
    try {
      setLoading(true);
      
      // Update status to notified
      const { error: updateError } = await supabase
        .from('waitlist')
        .update({ status: 'notified' })
        .eq('id', entryId);

      if (updateError) throw updateError;

      // Here you would typically send an email/SMS notification
      // For now, we'll just show a success message
      setSuccess('Waitlist entry notified successfully');
      
      // Reload waitlist
      await loadWaitlistEntries();
    } catch (error) {
      console.error('Error notifying waitlist entry:', error);
      setError('Failed to notify waitlist entry');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWaitlist = async (entryId) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('waitlist')
        .update({ status: 'cancelled' })
        .eq('id', entryId);

      if (error) throw error;

      setSuccess('Waitlist entry removed successfully');
      
      // Reload waitlist
      await loadWaitlistEntries();
    } catch (error) {
      console.error('Error removing waitlist entry:', error);
      setError('Failed to remove waitlist entry');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Waitlist Manager</h2>
              <p className="text-gray-600">{service?.name} - {provider?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Waitlist</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">{waitlistEntries.length}</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Notified</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {waitlistEntries.filter(entry => entry.status === 'notified').length}
              </p>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Waiting</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {waitlistEntries.filter(entry => entry.status === 'waiting').length}
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Success</span>
              </div>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          )}

          {/* Waitlist Entries */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading waitlist...</p>
            </div>
          ) : waitlistEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No waitlist entries</h3>
              <p className="text-gray-600">No one is currently on the waitlist for this service.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {waitlistEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {entry.user_profiles?.first_name} {entry.user_profiles?.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">{entry.user_profiles?.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            Preferred: {entry.preferred_date ? formatDate(entry.preferred_date) : 'Any date'} at {entry.preferred_time ? formatTime(entry.preferred_time) : 'Any time'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{entry.user_profiles?.phone || 'No phone provided'}</span>
                        </div>
                      </div>

                      {entry.notes && (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {entry.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.status === 'waiting' 
                            ? 'bg-orange-100 text-orange-800' 
                            : entry.status === 'notified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Added {formatDate(entry.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {entry.status === 'waiting' && (
                        <button
                          onClick={() => notifyWaitlistEntry(entry.id)}
                          disabled={loading}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                        >
                          Notify
                        </button>
                      )}
                      
                      <button
                        onClick={() => removeFromWaitlist(entry.id)}
                        disabled={loading}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WaitlistManager;
