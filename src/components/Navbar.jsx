import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Deals', path: '/deals' },
    { name: 'Shop', path: '/shop' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">PetConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium transition-all duration-200 relative ${
                  location.pathname === link.path
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 rounded-full"></div>
                )}
              </Link>
            ))}
            
            {/* Auth Section */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-lg hover:bg-primary-50"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium">
                      {user.user_metadata?.first_name || 'User'}
                    </span>
                  </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl py-2 shadow-lg z-50">
                    <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200">
                      {user.email}
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={async () => {
                        await signOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="btn-primary text-sm px-4 py-2"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200/50"
          >
            <div className="py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block font-medium transition-colors duration-200 ${
                    location.pathname === link.path
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Mobile Auth */}
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.user_metadata?.first_name || 'User'}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  
                  {/* Mobile Dashboard Button */}
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full mb-3 btn-primary text-center flex items-center justify-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>My Dashboard</span>
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      setIsOpen(false);
                    }}
                    className="w-full text-left text-sm text-gray-700 hover:text-primary-600 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary text-sm px-4 py-2 inline-block"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;