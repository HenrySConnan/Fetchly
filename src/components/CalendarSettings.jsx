import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import calendarService from '../services/calendarService';

const CalendarSettings = ({ isOpen, onClose, onSave }) => {
  const [provider, setProvider] = useState('google');
  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      checkCalendarStatus();
    }
  }, [isOpen]);

  const checkCalendarStatus = async () => {
    try {
      const status = calendarService.isCalendarConnected();
      setGoogleConnected(status.google);
      setOutlookConnected(status.outlook);
    } catch (error) {
      console.error('Error checking calendar status:', error);
    }
  };

  const handleConnect = async (calendarProvider) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await calendarService.connectCalendar(calendarProvider);
      
      if (result.success) {
        if (calendarProvider === 'google') {
          setGoogleConnected(true);
        } else {
          setOutlookConnected(true);
        }
      } else {
        setError(result.error || 'Failed to connect calendar');
      }
    } catch (error) {
      setError('Failed to connect calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave({
      provider,
      googleConnected,
      outlookConnected
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Calendar Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            {/* Google Calendar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Google Calendar</h3>
                    <p className="text-sm text-gray-600">Sync with your Google Calendar</p>
                  </div>
                </div>
                {googleConnected ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect('google')}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>

            {/* Outlook Calendar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Outlook Calendar</h3>
                    <p className="text-sm text-gray-600">Sync with your Outlook Calendar</p>
                  </div>
                </div>
                {outlookConnected ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect('outlook')}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>

            {/* Default Provider Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Default Calendar Provider
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="provider"
                    value="google"
                    checked={provider === 'google'}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Google Calendar</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="provider"
                    value="outlook"
                    checked={provider === 'outlook'}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Outlook Calendar</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CalendarSettings;