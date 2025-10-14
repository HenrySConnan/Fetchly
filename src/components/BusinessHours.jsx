import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

const BusinessHours = ({ businessId }) => {
  const [businessHours, setBusinessHours] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      fetchBusinessHours();
    }
  }, [businessId]);

  const fetchBusinessHours = async () => {
    try {
      const { data, error } = await supabase
        .from('business_hours')
        .select('hours')
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching business hours:', error);
      } else if (data) {
        setBusinessHours(data.hours);
      }
    } catch (error) {
      console.error('Error fetching business hours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const isCurrentlyOpen = () => {
    if (!businessHours) return false;
    
    const currentDay = getCurrentDay();
    const todayHours = businessHours[currentDay];
    
    if (!todayHours || !todayHours.isOpen) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!businessHours) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Hours not available</span>
      </div>
    );
  }

  const currentDay = getCurrentDay();
  const todayHours = businessHours[currentDay];
  const isOpen = isCurrentlyOpen();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Current Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={`text-sm font-medium ${isOpen ? 'text-green-700' : 'text-red-700'}`}>
          {isOpen ? 'Open now' : 'Closed'}
        </span>
        {todayHours && todayHours.isOpen && (
          <span className="text-sm text-gray-600">
            • {formatTime(todayHours.open)} - {formatTime(todayHours.close)}
          </span>
        )}
      </div>

      {/* Hours List */}
      <div className="space-y-1">
        {Object.entries(businessHours).map(([day, hours]) => (
          <div key={day} className="flex justify-between items-center text-sm">
            <span className="capitalize font-medium text-gray-700">
              {day === currentDay ? (
                <span className="text-primary-600 font-semibold">{day}</span>
              ) : (
                day
              )}
            </span>
            <span className="text-gray-600">
              {hours.isOpen ? (
                `${formatTime(hours.open)} - ${formatTime(hours.close)}`
              ) : (
                <span className="text-gray-400">Closed</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BusinessHours;
