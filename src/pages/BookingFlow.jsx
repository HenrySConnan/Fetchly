import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, Pet, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PetManagement from '../components/PetManagement';

const BookingFlow = () => {
  const { businessId, serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get service and business data from location state
  const { service, business } = location.state || {};
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1: Date and Time Selection
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [businessSettings, setBusinessSettings] = useState(null);
  
  // Step 2: Booking Details
  const [bookingDetails, setBookingDetails] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    selectedPet: '',
    specialRequests: '',
    notes: ''
  });
  
  // Step 3: Confirmation
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  
  // User's pets
  const [userPets, setUserPets] = useState([]);

  useEffect(() => {
    if (!service || !business) {
      navigate('/services');
      return;
    }
    loadUserPets();
    loadBusinessSettings();
  }, []);

  const loadUserPets = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_pets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      setUserPets(data || []);
    } catch (error) {
      console.error('Error loading user pets:', error);
    }
  };

  const loadBusinessSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('business_booking_settings')
        .select('settings')
        .eq('business_id', businessId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading business settings:', error);
      } else if (data) {
        setBusinessSettings(data.settings);
      } else {
        // Default settings
        setBusinessSettings({
          slot_duration: 30,
          advance_booking_days: 30,
          max_bookings_per_slot: 1,
          require_phone: true,
          require_email: true
        });
      }
    } catch (error) {
      console.error('Error loading business settings:', error);
    }
  };

  const generateTimeSlots = (date) => {
    if (!businessSettings) return [];
    
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    const slotDuration = businessSettings.slot_duration || 30;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += slotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          display: formatTime(timeString),
          available: true // We'll check availability later
        });
      }
    }
    
    return slots;
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot('');
    const slots = generateTimeSlots(date);
    setAvailableTimeSlots(slots);
  };

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleBookingDetailsChange = (field, value) => {
    setBookingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateBooking = async () => {
    if (!user) {
      setError('Please sign in to make a booking');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const bookingData = {
        business_id: businessId,
        service_id: serviceId,
        user_id: user.id,
        booking_date: selectedDate,
        booking_time: selectedTimeSlot,
        customer_name: bookingDetails.customerName,
        customer_email: bookingDetails.customerEmail,
        customer_phone: bookingDetails.customerPhone,
        pet_id: bookingDetails.selectedPet,
        special_requests: bookingDetails.specialRequests,
        notes: bookingDetails.notes,
        status: 'pending', // Will be auto-approved or manual based on business settings
        total_amount: service.price,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) throw error;

      setBookingConfirmation(data);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Select Date & Time</h2>
        </div>

        {/* Date Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose a Date</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateSelect(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            max={businessSettings ? new Date(Date.now() + (businessSettings.advance_booking_days || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Time Slot Selection */}
        {selectedDate && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableTimeSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeSlotSelect(slot.time)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedTimeSlot === slot.time
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  } ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!slot.available}
                >
                  <div className="text-sm font-medium">{slot.display}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        {selectedDate && selectedTimeSlot && (
          <div className="mt-8">
            <button
              onClick={() => setCurrentStep(2)}
              className="w-full btn-primary"
            >
              Continue to Booking Details
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-2 mb-6">
          <User className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
        </div>

        {/* Service Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{service.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-primary-600">R{service.price}</span>
            <span className="text-sm text-gray-500">{service.duration_minutes} minutes</span>
          </div>
        </div>

        {/* Booking Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={bookingDetails.customerName}
              onChange={(e) => handleBookingDetailsChange('customerName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={bookingDetails.customerEmail}
              onChange={(e) => handleBookingDetailsChange('customerEmail', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={bookingDetails.customerPhone}
              onChange={(e) => handleBookingDetailsChange('customerPhone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          {/* Pet Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Pet (Optional)
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              <PetManagement 
                onPetSelect={(petId) => handleBookingDetailsChange('selectedPet', petId)}
                selectedPetId={bookingDetails.selectedPet}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests
            </label>
            <textarea
              value={bookingDetails.specialRequests}
              onChange={(e) => handleBookingDetailsChange('specialRequests', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Any special requirements or notes..."
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex space-x-4 mt-8">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleCreateBooking}
            disabled={loading || !bookingDetails.customerName || !bookingDetails.customerEmail || !bookingDetails.customerPhone}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Booking...' : 'Create Booking'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          Your booking has been successfully created. You'll receive a confirmation email shortly.
        </p>

        {/* Booking Details */}
        {bookingConfirmation && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{formatTime(selectedTimeSlot)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">R{service.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-yellow-600">Pending Approval</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/services')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Browse More Services
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 btn-primary"
          >
            View My Bookings
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (!service || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Not Found</h3>
          <p className="text-gray-600 mb-4">The service you're trying to book is no longer available.</p>
          <button
            onClick={() => navigate('/services')}
            className="btn-primary"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Book {service.name}</h1>
              <p className="text-gray-600">{business.business_name}</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-1 mx-2 ${
                    currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-16 mt-2">
            <span className={`text-sm ${currentStep >= 1 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
              Date & Time
            </span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
              Details
            </span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
              Confirmation
            </span>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default BookingFlow;
