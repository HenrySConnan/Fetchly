import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const TimeSlotGenerator = ({ businessId, selectedDate, onSlotSelect, selectedSlot }) => {
  const [businessHours, setBusinessHours] = useState(null);
  const [bookingSettings, setBookingSettings] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [existingBookings, setExistingBookings] = useState([]);

  useEffect(() => {
    if (businessId && selectedDate) {
      loadBusinessData();
      loadExistingBookings();
    }
  }, [businessId, selectedDate]);

  const loadBusinessData = async () => {
    try {
      // Load business hours
      const { data: hoursData } = await supabase
        .from('business_hours')
        .select('hours')
        .eq('business_id', businessId)
        .single();

      // Load booking settings
      const { data: settingsData } = await supabase
        .from('business_booking_settings')
        .select('settings')
        .eq('business_id', businessId)
        .single();

      if (hoursData) setBusinessHours(hoursData.hours);
      if (settingsData) setBookingSettings(settingsData.settings);

    } catch (error) {
      console.error('Error loading business data:', error);
    }
  };

  const loadExistingBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_time, status')
        .eq('business_id', businessId)
        .eq('booking_date', selectedDate)
        .in('status', ['confirmed', 'pending']);

      if (error) throw error;
      setExistingBookings(data || []);
    } catch (error) {
      console.error('Error loading existing bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeSlots = () => {
    if (!businessHours || !bookingSettings) return [];

    const selectedDay = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const dayHours = businessHours[selectedDay];

    if (!dayHours || !dayHours.isOpen) return [];

    const slots = [];
    const slotDuration = bookingSettings.slot_duration || 30; // minutes
    const maxBookingsPerSlot = bookingSettings.max_bookings_per_slot || 1;

    // Parse opening and closing times
    const [openHour, openMin] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = dayHours.close.split(':').map(Number);

    const openTime = openHour * 60 + openMin; // Convert to minutes
    const closeTime = closeHour * 60 + closeMin;

    // Generate slots
    for (let time = openTime; time < closeTime; time += slotDuration) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Check if this slot is available
      const slotBookings = existingBookings.filter(booking => 
        booking.booking_time === timeString
      );

      const isAvailable = slotBookings.length < maxBookingsPerSlot;

      slots.push({
        time: timeString,
        displayTime: formatTime(timeString),
        isAvailable,
        bookingsCount: slotBookings.length,
        maxBookings: maxBookingsPerSlot
      });
    }

    return slots;
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (businessHours && bookingSettings) {
      const slots = generateTimeSlots();
      setTimeSlots(slots);
    }
  }, [businessHours, bookingSettings, existingBookings]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Loading available times...</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const slots = generateTimeSlots();

  if (slots.length === 0) {
    return (
      <div className="text-center py-6">
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">No available times for this date</p>
        <p className="text-xs text-gray-500 mt-1">
          This business may be closed on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-primary-600" />
        <span className="text-sm font-medium text-gray-900">Available Times</span>
        <span className="text-xs text-gray-500">
          ({slots.filter(slot => slot.isAvailable).length} slots available)
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
        {slots.map((slot, index) => (
          <button
            key={index}
            onClick={() => slot.isAvailable && onSlotSelect(slot.time)}
            disabled={!slot.isAvailable}
            className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedSlot === slot.time
                ? 'bg-primary-600 text-white shadow-md'
                : slot.isAvailable
                ? 'bg-white border border-gray-300 text-gray-700 hover:border-primary-500 hover:bg-primary-50'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="text-center">
              <div className="font-medium">{slot.displayTime}</div>
              {!slot.isAvailable && (
                <div className="text-xs mt-1">Full</div>
              )}
              {slot.isAvailable && slot.bookingsCount > 0 && (
                <div className="text-xs mt-1 text-gray-500">
                  {slot.bookingsCount}/{slot.maxBookings}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {selectedSlot && (
        <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-700">
              Selected: {formatTime(selectedSlot)}
            </span>
            <button
              onClick={() => onSlotSelect(null)}
              className="text-xs text-primary-600 hover:text-primary-800"
            >
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotGenerator;
