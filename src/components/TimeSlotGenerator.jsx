import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const TimeSlotGenerator = ({ businessId, selectedDate, onSlotSelect, selectedSlot }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots();
    }
  }, [selectedDate, businessId]);

  const generateTimeSlots = () => {
    setLoading(true);
    
    // Generate time slots from 9 AM to 5 PM
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          display: formatTime(timeString),
          available: Math.random() > 0.3 // Random availability for demo
        });
      }
    }
    
    setAvailableSlots(slots);
    setLoading(false);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Clock className="w-4 h-4 animate-spin" />
        <span>Loading available times...</span>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Available Times
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {availableSlots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => onSlotSelect(slot.time)}
            disabled={!slot.available}
            className={`p-2 text-sm rounded-lg border transition-all ${
              selectedSlot === slot.time
                ? 'bg-primary-600 text-white border-primary-600'
                : slot.available
                ? 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            }`}
          >
            {slot.display}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotGenerator;