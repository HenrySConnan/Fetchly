import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Pet, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const PetManagement = ({ onPetSelect, selectedPetId }) => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    color: '',
    gender: '',
    medical_notes: ''
  });

  useEffect(() => {
    if (user) {
      loadPets();
    }
  }, [user]);

  const loadPets = async () => {
    try {
      const { data, error } = await supabase
        .from('user_pets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const petData = {
        user_id: user.id,
        name: formData.name.trim(),
        breed: formData.breed.trim() || null,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        color: formData.color.trim() || null,
        gender: formData.gender || null,
        medical_notes: formData.medical_notes.trim() || null
      };

      if (editingPet) {
        const { error } = await supabase
          .from('user_pets')
          .update(petData)
          .eq('id', editingPet.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_pets')
          .insert([petData]);

        if (error) throw error;
      }

      await loadPets();
      resetForm();
    } catch (error) {
      console.error('Error saving pet:', error);
    }
  };

  const handleDelete = async (petId) => {
    if (!confirm('Are you sure you want to delete this pet?')) return;

    try {
      const { error } = await supabase
        .from('user_pets')
        .update({ is_active: false })
        .eq('id', petId);

      if (error) throw error;
      await loadPets();
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name || '',
      breed: pet.breed || '',
      age: pet.age || '',
      weight: pet.weight || '',
      color: pet.color || '',
      gender: pet.gender || '',
      medical_notes: pet.medical_notes || ''
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      breed: '',
      age: '',
      weight: '',
      color: '',
      gender: '',
      medical_notes: ''
    });
    setEditingPet(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Pet className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">My Pets</h3>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Pet</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              {editingPet ? 'Edit Pet' : 'Add New Pet'}
            </h4>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pet Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age (years)
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  min="0"
                  max="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Notes
              </label>
              <textarea
                value={formData.medical_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, medical_notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Any medical conditions, allergies, or special care instructions..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{editingPet ? 'Update Pet' : 'Add Pet'}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Pets List */}
      {pets.length === 0 ? (
        <div className="text-center py-8">
          <Pet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Pets Added</h4>
          <p className="text-gray-600 mb-4">Add your pets to make booking easier</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Add Your First Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pets.map((pet) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
                selectedPetId === pet.id 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => onPetSelect && onPetSelect(pet.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Pet className="w-5 h-5 text-primary-600" />
                  <h4 className="font-semibold text-gray-900">{pet.name}</h4>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(pet);
                    }}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(pet.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                {pet.breed && (
                  <div className="flex justify-between">
                    <span>Breed:</span>
                    <span className="font-medium">{pet.breed}</span>
                  </div>
                )}
                {pet.age && (
                  <div className="flex justify-between">
                    <span>Age:</span>
                    <span className="font-medium">{pet.age} years</span>
                  </div>
                )}
                {pet.weight && (
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span className="font-medium">{pet.weight} kg</span>
                  </div>
                )}
                {pet.gender && (
                  <div className="flex justify-between">
                    <span>Gender:</span>
                    <span className="font-medium capitalize">{pet.gender}</span>
                  </div>
                )}
              </div>

              {pet.medical_notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Medical Notes:</span> {pet.medical_notes}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetManagement;
