import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, User, Mail, Phone, MapPin, CheckCircle, X, AlertCircle, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Waitlist = () => {
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserWaitlist();
    }
  }, [user]);

  const loadUserWaitlist = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('waitlist')
        .select(`
          *,
          services!inner(
            name,
            description,
            price,
            duration_minutes
          ),
          providers!inner(
            name,
            email,
            phone,
            address,
            city
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWaitlistEntries(data || []);
    } catch (error) {
      console.error('Error loading waitlist:', error);
      setError('Failed to load waitlist entries');
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

      // Reload waitlist
      await loadUserWaitlist();
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'notified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'booked':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-4 h-4" />;
      case 'notified':
        return <Bell className="w-4 h-4" />;
      case 'booked':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to view your waitlist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                My
                <span className="bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent block">
                  Waitlist
                </span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Track your waitlist status for popular services and get notified when slots become available.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Waitlist Entries */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading waitlist...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading waitlist</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : waitlistEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No waitlist entries</h3>
              <p className="text-gray-600">You're not currently on any waitlists.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {waitlistEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <Bell className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{entry.services.name}</h3>
                          <p className="text-gray-600">{entry.providers.name}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(entry.status)}`}>
                          {getStatusIcon(entry.status)}
                          <span>{entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Preferred: {entry.preferred_date ? formatDate(entry.preferred_date) : 'Any date'} at {entry.preferred_time ? formatTime(entry.preferred_time) : 'Any time'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{entry.providers.city}</span>
                        </div>
                      </div>

                      {entry.notes && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700">
                            <strong>Your notes:</strong> {entry.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Added {formatDate(entry.created_at)}
                        </div>
                        
                        {entry.status === 'waiting' && (
                          <button
                            onClick={() => removeFromWaitlist(entry.id)}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                          >
                            Remove from Waitlist
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Info Section */}
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
              How the
              <span className="bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent block">
                Waitlist Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get notified when your preferred time slots become available for popular services.
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
                icon: Bell,
                title: 'Join Waitlist',
                description: 'When a service is fully booked, you can join the waitlist for your preferred time slots.',
                color: 'from-orange-500 to-red-500',
                bgColor: 'bg-orange-50'
              },
              {
                icon: Clock,
                title: 'Get Notified',
                description: 'We\'ll notify you immediately when a slot becomes available for your preferred time.',
                color: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-50'
              },
              {
                icon: CheckCircle,
                title: 'Book Quickly',
                description: 'You\'ll have priority access to book the newly available slot before it\'s offered to others.',
                color: 'from-green-500 to-green-600',
                bgColor: 'bg-green-50'
              }
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-8 text-center"
              >
                <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <step.icon className={`w-8 h-8 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Waitlist;
