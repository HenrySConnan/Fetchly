import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  Heart, 
  ShoppingBag, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  MapPin, 
  Star, 
  Bell, 
  Shield, 
  CreditCard,
  ChevronRight,
  Camera,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Pet Street, Dog City, DC 12345',
    avatar: null
  });

  // Mock data - in real app, this would come from Supabase
  const [pets, setPets] = useState([
    {
      id: 1,
      name: 'Buddy',
      type: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      weight: '65 lbs',
      avatar: null,
      medicalNotes: 'Allergic to chicken, up to date on vaccinations'
    },
    {
      id: 2,
      name: 'Whiskers',
      type: 'Cat',
      breed: 'Persian',
      age: 2,
      weight: '8 lbs',
      avatar: null,
      medicalNotes: 'Indoor cat, needs regular grooming'
    }
  ]);

  const [upcomingBookings, setUpcomingBookings] = useState([
    {
      id: 1,
      service: 'Veterinary Checkup',
      provider: 'Dr. Sarah Johnson',
      date: '2024-02-15',
      time: '10:00 AM',
      location: 'PetCare Clinic',
      status: 'confirmed',
      pet: 'Buddy'
    },
    {
      id: 2,
      service: 'Dog Walking',
      provider: 'Mike Wilson',
      date: '2024-02-16',
      time: '2:00 PM',
      location: 'Your Home',
      status: 'confirmed',
      pet: 'Buddy'
    }
  ]);

  const [bookingHistory, setBookingHistory] = useState([
    {
      id: 1,
      service: 'Pet Grooming',
      provider: 'Bella\'s Grooming',
      date: '2024-01-20',
      status: 'completed',
      pet: 'Whiskers',
      rating: 5,
      review: 'Excellent service!'
    },
    {
      id: 2,
      service: 'Veterinary Checkup',
      provider: 'Dr. Sarah Johnson',
      date: '2024-01-10',
      status: 'completed',
      pet: 'Buddy',
      rating: 5,
      review: 'Very professional and caring.'
    }
  ]);

  const [orderHistory, setOrderHistory] = useState([
    {
      id: 1,
      orderNumber: 'PC-2024-001',
      date: '2024-01-25',
      total: 89.99,
      status: 'delivered',
      items: ['Premium Dog Food', 'Chew Toys Pack']
    },
    {
      id: 2,
      orderNumber: 'PC-2024-002',
      date: '2024-01-15',
      total: 45.50,
      status: 'delivered',
      items: ['Cat Litter', 'Catnip Toys']
    }
  ]);

  const [newPet, setNewPet] = useState({
    name: '',
    type: 'Dog',
    breed: '',
    age: '',
    weight: '',
    medicalNotes: ''
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'pets', label: 'My Pets', icon: Heart },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleAddPet = () => {
    if (newPet.name && newPet.breed && newPet.age && newPet.weight) {
      const pet = {
        id: Date.now(),
        ...newPet,
        avatar: null
      };
      setPets([...pets, pet]);
      setNewPet({
        name: '',
        type: 'Dog',
        breed: '',
        age: '',
        weight: '',
        medicalNotes: ''
      });
      setIsAddingPet(false);
    }
  };

  const handleDeletePet = (petId) => {
    setPets(pets.filter(pet => pet.id !== petId));
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    // In real app, save to Supabase
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {profileData.firstName}!
          </h1>
          <p className="text-gray-600">Manage your pets, bookings, and account settings</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 sticky top-24">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-white/50'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-2xl p-8"
            >
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 font-semibold">Upcoming Bookings</p>
                          <p className="text-3xl font-bold text-blue-700">{upcomingBookings.length}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 font-semibold">My Pets</p>
                          <p className="text-3xl font-bold text-green-700">{pets.length}</p>
                        </div>
                        <Heart className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 font-semibold">Total Orders</p>
                          <p className="text-3xl font-bold text-purple-700">{orderHistory.length}</p>
                        </div>
                        <ShoppingBag className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                    
                    <div className="space-y-4">
                      {upcomingBookings.slice(0, 2).map((booking) => (
                        <div key={booking.id} className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{booking.service}</p>
                            <p className="text-sm text-gray-600">{booking.date} at {booking.time}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pets Tab */}
              {activeTab === 'pets' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">My Pets</h2>
                    <button
                      onClick={() => setIsAddingPet(true)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Pet</span>
                    </button>
                  </div>

                  {/* Add Pet Modal */}
                  {isAddingPet && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900">Add New Pet</h3>
                          <button onClick={() => setIsAddingPet(false)}>
                            <X className="w-6 h-6 text-gray-400" />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pet Name</label>
                            <input
                              type="text"
                              value={newPet.name}
                              onChange={(e) => setNewPet({...newPet, name: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="Enter pet name"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                              <select
                                value={newPet.type}
                                onChange={(e) => setNewPet({...newPet, type: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                <option value="Dog">Dog</option>
                                <option value="Cat">Cat</option>
                                <option value="Bird">Bird</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                              <input
                                type="text"
                                value={newPet.breed}
                                onChange={(e) => setNewPet({...newPet, breed: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Enter breed"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                              <input
                                type="text"
                                value={newPet.age}
                                onChange={(e) => setNewPet({...newPet, age: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="e.g., 3 years"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                              <input
                                type="text"
                                value={newPet.weight}
                                onChange={(e) => setNewPet({...newPet, weight: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="e.g., 65 lbs"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Medical Notes</label>
                            <textarea
                              value={newPet.medicalNotes}
                              onChange={(e) => setNewPet({...newPet, medicalNotes: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              rows="3"
                              placeholder="Any medical conditions or notes..."
                            />
                          </div>
                        </div>
                        
                        <div className="flex space-x-4 mt-6">
                          <button
                            onClick={handleAddPet}
                            className="flex-1 btn-primary"
                          >
                            Add Pet
                          </button>
                          <button
                            onClick={() => setIsAddingPet(false)}
                            className="flex-1 btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pets Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pets.map((pet) => (
                      <div key={pet.id} className="bg-white/50 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center">
                              <Heart className="w-8 h-8 text-primary-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
                              <p className="text-gray-600">{pet.breed} • {pet.age} old</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeletePet(pet.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Weight:</span>
                            <span className="text-sm font-medium text-gray-900">{pet.weight}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Type:</span>
                            <span className="text-sm font-medium text-gray-900">{pet.type}</span>
                          </div>
                          {pet.medicalNotes && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>Medical Notes:</strong> {pet.medicalNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
                  
                  {/* Upcoming Bookings */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <div key={booking.id} className="bg-white/50 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{booking.service}</h4>
                              <p className="text-gray-600">{booking.provider}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{formatDate(booking.date)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{booking.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{booking.location}</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="text-sm text-gray-500">Pet: </span>
                            <span className="text-sm font-medium text-gray-900">{booking.pet}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking History */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking History</h3>
                    <div className="space-y-4">
                      {bookingHistory.map((booking) => (
                        <div key={booking.id} className="bg-white/50 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{booking.service}</h4>
                              <p className="text-gray-600">{booking.provider}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < booking.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{formatDate(booking.date)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Heart className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{booking.pet}</span>
                            </div>
                          </div>
                          
                          {booking.review && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm text-gray-600 italic">"{booking.review}"</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                  
                  <div className="space-y-4">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="bg-white/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                            <p className="text-gray-600">{formatDate(order.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">${order.total}</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Items:</p>
                          <ul className="text-sm text-gray-700">
                            {order.items.map((item, index) => (
                              <li key={index} className="flex items-center space-x-2">
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                  
                  {/* Profile Settings */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                      <div className="bg-white/50 rounded-xl p-6">
                        {!isEditingProfile ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium text-gray-900">{profileData.firstName} {profileData.lastName}</p>
                              </div>
                              <button
                                onClick={() => setIsEditingProfile(true)}
                                className="btn-secondary flex items-center space-x-2"
                              >
                                <Edit3 className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium text-gray-900">{profileData.email}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="font-medium text-gray-900">{profileData.phone}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Address</p>
                              <p className="font-medium text-gray-900">{profileData.address}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <input
                                  type="text"
                                  value={profileData.firstName}
                                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <input
                                  type="text"
                                  value={profileData.lastName}
                                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                              <input
                                type="text"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                              <input
                                type="text"
                                value={profileData.address}
                                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div className="flex space-x-4">
                              <button
                                onClick={handleSaveProfile}
                                className="btn-primary flex items-center space-x-2"
                              >
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                              </button>
                              <button
                                onClick={() => setIsEditingProfile(false)}
                                className="btn-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notification Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                      <div className="bg-white/50 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">Booking Reminders</p>
                              <p className="text-sm text-gray-600">Get notified about upcoming appointments</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">Order Updates</p>
                              <p className="text-sm text-gray-600">Get notified about order status changes</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Security Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                      <div className="bg-white/50 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Shield className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">Change Password</p>
                              <p className="text-sm text-gray-600">Update your account password</p>
                            </div>
                          </div>
                          <button className="btn-secondary">Change</button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">Payment Methods</p>
                              <p className="text-sm text-gray-600">Manage your saved payment methods</p>
                            </div>
                          </div>
                          <button className="btn-secondary">Manage</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
