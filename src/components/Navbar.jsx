import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, User, LogOut, Calendar, ShoppingBag, Percent, Package, Clock, Building, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessAccess } from '../hooks/useBusinessAccess';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { useUserType } from '../hooks/useUserType';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isBusinessAccount } = useBusinessAccess();
  const { isAdmin, isLoading: adminLoading } = useAdminAccess();
  const { userType } = useUserType();

  const navLinks = [
    { name: 'Home', path: '/', icon: Heart },
    { name: 'Services', path: '/services', icon: Calendar },
    { name: 'Deals', path: '/deals', icon: Percent },
    { name: 'Packages', path: '/packages', icon: Package },
    { name: 'Waitlist', path: '/waitlist', icon: Clock },
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
  ];

  // Mobile bottom nav items (most important)
  const mobileNavItems = [
    { name: 'Home', path: '/', icon: Heart },
    { name: 'Services', path: '/services', icon: Calendar },
    { name: 'Deals', path: '/deals', icon: Percent },
    { name: 'Profile', path: user ? '/dashboard' : '/auth', icon: User },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900">PetConnect</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="flex items-center space-x-8">
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
                  {isBusinessAccount && (
                    <Link
                      to="/business"
                      className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-lg hover:bg-primary-50"
                    >
                      <Building className="w-4 h-4" />
                      <span className="text-sm font-medium">Business</span>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-lg hover:bg-primary-50"
                    >
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Admin</span>
                    </Link>
                  )}
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
                        {userType === 'user' && (
                          <Link
                            to="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <User className="w-4 h-4" />
                            <span>Dashboard</span>
                          </Link>
                        )}
                        {userType === 'business' && (
                          <Link
                            to="/business"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Building className="w-4 h-4" />
                            <span>Business</span>
                          </Link>
                        )}
                        {userType === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Shield className="w-4 h-4" />
                            <span>Admin</span>
                          </Link>
                        )}
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
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">PetConnect</span>
          </Link>

          {/* More Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl"
          >
            <div className="py-4 space-y-2">
              {/* Additional Pages */}
              <Link
                to="/packages"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 font-medium transition-colors ${
                  location.pathname === '/packages' ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Service Packages
              </Link>
              <Link
                to="/waitlist"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 font-medium transition-colors ${
                  location.pathname === '/waitlist' ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Waitlist
              </Link>
              <Link
                to="/shop"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 font-medium transition-colors ${
                  location.pathname === '/shop' ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Shop
              </Link>
              
              {/* User Section */}
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4 px-4">
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
                  
                  {!adminLoading && !isAdmin && (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  
                  {isBusinessAccount && (
                    <Link
                      to="/business"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Building className="w-4 h-4" />
                      <span>Business</span>
                    </Link>
                  )}
                  {!adminLoading && isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={async () => {
                      await signOut();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:text-primary-600 flex items-center space-x-2"
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
                    className="block px-4 py-3 text-sm text-gray-700 hover:text-primary-600"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around py-2">
          {mobileNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === item.path ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              {item.name === 'Deals' ? (
                <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">%</span>
                </div>
              ) : (
                <item.icon className="w-5 h-5" />
              )}
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;