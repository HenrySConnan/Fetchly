import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, AlertCircle, Settings, Link, Unlink, X } from 'lucide-react';
import calendarService from '../services/calendarService';

const CalendarSettings = ({ isOpen, onClose, onSave }) => {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('google');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      checkCalendarConnections();
    }
  }, [isOpen]);

  const checkCalendarConnections = async () => {
    // Check if Google Calendar is connected
    try {
      const googleConnected = await calendarService.initializeGoogleCalendar();
      setGoogleConnected(googleConnected);
    } catch (error) {
      console.error('Google Calendar check failed:', error);
    }

    // Check if Outlook is connected
    try {
      const outlookConnected = await calendarService.initializeOutlookCalendar();
      setOutlookConnected(outlookConnected);
    } catch (error) {
      console.error('Outlook Calendar check failed:', error);
    }
  };

  const handleGoogleConnect = async () => {
    setLoading(true);
    setError('');
    
    try {
      const success = await calendarService.initializeGoogleCalendar();
      if (success) {
        setGoogleConnected(true);
        setSelectedProvider('google');
      } else {
        setError('Failed to connect to Google Calendar');
      }
    } catch (error) {
      setError('Failed to connect to Google Calendar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOutlookConnect = async () => {
    setLoading(true);
    setError('');
    
    try {
      const success = await calendarService.initializeOutlookCalendar();
      if (success) {
        setOutlookConnected(true);
        setSelectedProvider('outlook');
      } else {
        setError('Failed to connect to Outlook Calendar');
      }
    } catch (error) {
      setError('Failed to connect to Outlook Calendar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave({
      provider: selectedProvider,
      googleConnected,
      outlookConnected
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Calendar Settings</h2>
              <p className="text-gray-600">Connect your calendar to sync appointments</p>
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
        <div className="p-6 space-y-6">
          {/* Google Calendar */}
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Google Calendar</h3>
                  <p className="text-sm text-gray-600">Sync with your Google Calendar</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {googleConnected ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <button
                    onClick={handleGoogleConnect}
                    disabled={loading}
                    className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
            
            {googleConnected && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Google Calendar is connected</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your appointments will be automatically added to your Google Calendar
                </p>
              </div>
            )}
          </div>

          {/* Outlook Calendar */}
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Outlook Calendar</h3>
                  <p className="text-sm text-gray-600">Sync with your Outlook Calendar</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {outlookConnected ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                ) : (
                  <button
                    onClick={handleOutlookConnect}
                    disabled={loading}
                    className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
            
            {outlookConnected && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Outlook Calendar is connected</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your appointments will be automatically added to your Outlook Calendar
                </p>
              </div>
            )}
          </div>

          {/* Default Calendar Selection */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Calendar</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="calendarProvider"
                  value="google"
                  checked={selectedProvider === 'google'}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="font-medium text-gray-900">Google Calendar</span>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="calendarProvider"
                  value="outlook"
                  checked={selectedProvider === 'outlook'}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">Outlook Calendar</span>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Benefits */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Calendar Integration Benefits</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Automatic appointment reminders</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Sync across all your devices</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Easy rescheduling and cancellation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Conflict detection with other events</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            Save Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarSettings;
