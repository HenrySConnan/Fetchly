import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, MapPin, Phone, Star, DollarSign, RotateCcw, Package, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const EnhancedBookingModal = ({ isOpen, onClose, service, providers = [] }) => {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { user } = useAuth();

  // Recurring appointment states
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState('weekly');
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [totalSessions, setTotalSessions] = useState(1);

  // Service package states
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [availablePackages, setAvailablePackages] = useState([]);

  // Waitlist states
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistReason, setWaitlistReason] = useState('');

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const recurringOptions = [
    { value: 'weekly', label: 'Weekly', description: 'Every week' },
    { value: 'biweekly', label: 'Bi-weekly', description: 'Every 2 weeks' },
    { value: 'monthly', label: 'Monthly', description: 'Every month' },
    { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' }
  ];

  useEffect(() => {
    if (isOpen && service) {
      // Set default provider if only one available
      if (providers.length === 1) {
        setSelectedProvider(providers[0]);
      }
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split('T')[0]);
      
      // Set default recurring end date to 3 months from now
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      setRecurringEndDate(threeMonthsFromNow.toISOString().split('T')[0]);
      
      // Load available packages
      loadServicePackages();
    }
  }, [isOpen, service, providers]);

  const loadServicePackages = async () => {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setAvailablePackages(data || []);
    } catch (error) {
      console.error('Error loading service packages:', error);
    }
  };

  const calculateRecurringSessions = () => {
    if (!isRecurring || !selectedDate || !recurringEndDate) return 1;
    
    const startDate = new Date(selectedDate);
    const endDate = new Date(recurringEndDate);
    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (recurringType) {
      case 'weekly':
        return Math.floor(diffDays / 7) + 1;
      case 'biweekly':
        return Math.floor(diffDays / 14) + 1;
      case 'monthly':
        return Math.floor(diffDays / 30) + 1;
      case 'quarterly':
        return Math.floor(diffDays / 90) + 1;
      default:
        return 1;
    }
  };

  const calculateTotalPrice = () => {
    if (selectedPackage) {
      return selectedPackage.price;
    }
    
    const basePrice = service?.price || 0;
    const sessions = isRecurring ? calculateRecurringSessions() : 1;
    return basePrice * sessions;
  };

  const handleRecurringChange = (checked) => {
    setIsRecurring(checked);
    if (checked) {
      setTotalSessions(calculateRecurringSessions());
    } else {
      setTotalSessions(1);
    }
  };

  const handleRecurringTypeChange = (type) => {
    setRecurringType(type);
    setTotalSessions(calculateRecurringSessions());
  };

  const handleBooking = async () => {
    if (!user) {
      alert('Please sign in to book a service');
      return;
    }

    if (!selectedProvider || !selectedDate || !selectedTime || !petName || !petType) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (isRecurring) {
        await createRecurringBookings();
      } else {
        await createSingleBooking();
      }
      
      alert('Booking confirmed! You will receive a confirmation email shortly.');
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createSingleBooking = async () => {
    const { error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        provider_id: selectedProvider.id,
        service_id: service.id,
        booking_date: selectedDate,
        booking_time: selectedTime,
        duration_minutes: service.duration_minutes,
        total_price: calculateTotalPrice(),
        pet_name: petName,
        pet_type: petType,
        special_instructions: specialInstructions,
        is_recurring: false,
        status: 'pending'
      });

    if (error) throw error;
  };

  const createRecurringBookings = async () => {
    const sessions = calculateRecurringSessions();
    const bookings = [];
    
    for (let i = 0; i < sessions; i++) {
      const bookingDate = new Date(selectedDate);
      
      // Calculate the date for this session
      switch (recurringType) {
        case 'weekly':
          bookingDate.setDate(bookingDate.getDate() + (i * 7));
          break;
        case 'biweekly':
          bookingDate.setDate(bookingDate.getDate() + (i * 14));
          break;
        case 'monthly':
          bookingDate.setMonth(bookingDate.getMonth() + i);
          break;
        case 'quarterly':
          bookingDate.setMonth(bookingDate.getMonth() + (i * 3));
          break;
      }
      
      bookings.push({
        user_id: user.id,
        provider_id: selectedProvider.id,
        service_id: service.id,
        booking_date: bookingDate.toISOString().split('T')[0],
        booking_time: selectedTime,
        duration_minutes: service.duration_minutes,
        total_price: service.price,
        pet_name: petName,
        pet_type: petType,
        special_instructions: specialInstructions,
        is_recurring: true,
        recurring_type: recurringType,
        recurring_end_date: recurringEndDate,
        status: 'pending'
      });
    }
    
    const { error } = await supabase
      .from('bookings')
      .insert(bookings);

    if (error) throw error;
  };

  const handleWaitlist = async () => {
    if (!user) {
      alert('Please sign in to join the waitlist');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert({
          user_id: user.id,
          service_id: service.id,
          provider_id: selectedProvider.id,
          preferred_date: selectedDate,
          preferred_time: selectedTime,
          notes: waitlistReason,
          status: 'waiting'
        });

      if (error) throw error;
      
      alert('You have been added to the waitlist. We will notify you when a slot becomes available.');
      onClose();
    } catch (error) {
      console.error('Error joining waitlist:', error);
      alert('Failed to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !service) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Book {service.name}</h2>
              <p className="text-gray-600">Complete your booking details</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-8 h-0.5 ${
                      step > stepNumber ? 'bg-primary-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Provider & Time</span>
              <span>Pet Details</span>
              <span>Confirmation</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                {/* Provider Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Provider
                  </label>
                  <div className="grid gap-3">
                    {providers.map((provider) => (
                      <div
                        key={provider.id}
                        onClick={() => setSelectedProvider(provider)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedProvider?.id === provider.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span>{provider.rating}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{provider.city}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date and Time Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Time
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Choose time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Service Packages */}
                {availablePackages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Service Packages (Optional)
                    </label>
                    <div className="space-y-3">
                      {availablePackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(selectedPackage?.id === pkg.id ? null : pkg)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedPackage?.id === pkg.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                              <p className="text-sm text-gray-600">{pkg.description}</p>
                              <p className="text-sm text-gray-500">{pkg.total_sessions} sessions</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary-600">${pkg.price}</div>
                              {pkg.discount_percentage > 0 && (
                                <div className="text-sm text-green-600">
                                  {pkg.discount_percentage}% off
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recurring Appointment Option */}
                <div className="border-t pt-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={isRecurring}
                      onChange={(e) => handleRecurringChange(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="recurring" className="flex items-center space-x-2">
                      <RotateCcw className="w-4 h-4 text-primary-600" />
                      <span className="font-medium text-gray-900">Set up recurring appointments</span>
                    </label>
                  </div>

                  {isRecurring && (
                    <div className="space-y-4 pl-7">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frequency
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {recurringOptions.map((option) => (
                            <div
                              key={option.value}
                              onClick={() => handleRecurringTypeChange(option.value)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                recurringType === option.value
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-medium text-gray-900">{option.label}</div>
                              <div className="text-sm text-gray-600">{option.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={recurringEndDate}
                          onChange={(e) => setRecurringEndDate(e.target.value)}
                          min={selectedDate}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Recurring Summary</span>
                        </div>
                        <p className="text-sm text-blue-800">
                          {totalSessions} appointments will be created from {selectedDate} to {recurringEndDate}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Waitlist Option */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-gray-900">No available slots?</span>
                    </div>
                    <button
                      onClick={() => setShowWaitlist(!showWaitlist)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Join Waitlist
                    </button>
                  </div>
                  
                  {showWaitlist && (
                    <div className="mt-4 p-4 bg-orange-50 rounded-xl">
                      <textarea
                        placeholder="Tell us your preferred dates and any special requirements..."
                        value={waitlistReason}
                        onChange={(e) => setWaitlistReason(e.target.value)}
                        className="w-full p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Pet Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet Name *
                    </label>
                    <input
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="Enter pet name"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet Type *
                    </label>
                    <select
                      value={petType}
                      onChange={(e) => setPetType(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select pet type</option>
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="bird">Bird</option>
                      <option value="rabbit">Rabbit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special requirements or notes for the service provider..."
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Booking Summary</h3>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provider:</span>
                      <span className="font-medium">{selectedProvider?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium">
                        {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pet:</span>
                      <span className="font-medium">{petName} ({petType})</span>
                    </div>
                    {isRecurring && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recurring:</span>
                        <span className="font-medium">
                          {recurringType} ({totalSessions} sessions)
                        </span>
                      </div>
                    )}
                    {selectedPackage && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Package:</span>
                        <span className="font-medium">{selectedPackage.name}</span>
                      </div>
                    )}
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Price:</span>
                        <span className="text-primary-600">${calculateTotalPrice()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              {showWaitlist && (
                <button
                  onClick={handleWaitlist}
                  disabled={loading}
                  className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Join Waitlist'}
                </button>
              )}
              
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleBooking}
                  disabled={loading}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnhancedBookingModal;
