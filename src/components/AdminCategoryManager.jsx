import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Save, X, Building } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminCategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_categories')
        .insert({
          name: newCategory.name.trim(),
          description: newCategory.description.trim() || null
        })
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      setNewCategory({ name: '', description: '' });
      setIsAdding(false);
      setSuccess('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (categoryId, updatedData) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_categories')
        .update(updatedData)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => cat.id === categoryId ? data : cat)
      );
      setEditingId(null);
      setSuccess('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('business_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setSuccess('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryRow = (category) => {
    if (editingId === category.id) {
      return (
        <motion.tr
          key={category.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50"
        >
          <td className="px-6 py-4">
            <input
              type="text"
              value={category.name}
              onChange={(e) => {
                setCategories(prev => 
                  prev.map(cat => 
                    cat.id === category.id 
                      ? { ...cat, name: e.target.value }
                      : cat
                  )
                );
              }}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </td>
          <td className="px-6 py-4">
            <input
              type="text"
              value={category.description || ''}
              onChange={(e) => {
                setCategories(prev => 
                  prev.map(cat => 
                    cat.id === category.id 
                      ? { ...cat, description: e.target.value }
                      : cat
                  )
                );
              }}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </td>
          <td className="px-6 py-4">
            <div className="flex space-x-2">
              <button
                onClick={() => handleUpdateCategory(category.id, {
                  name: category.name,
                  description: category.description
                })}
                className="text-green-600 hover:text-green-700"
                disabled={loading}
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="text-gray-600 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </td>
        </motion.tr>
      );
    }

    return (
      <tr key={category.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {category.name}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {category.description || 'No description'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex space-x-2">
            <button
              onClick={() => setEditingId(category.id)}
              className="text-primary-600 hover:text-primary-700"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Business Categories</h3>
          <p className="text-gray-600">Manage business categories for signup</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-xl"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h4>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                id="categoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Veterinary Services"
                required
              />
            </div>
            <div>
              <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                id="categoryDescription"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Brief description of this category"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewCategory({ name: '', description: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !newCategory.name.trim()}
              >
                {loading ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <Building className="w-12 h-12 text-gray-300" />
                      <span>No categories found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map(renderCategoryRow)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryManager;
