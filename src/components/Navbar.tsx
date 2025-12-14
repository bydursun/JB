import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Menu, X, User, LogOut, LayoutDashboard as Dashboard } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-2xl sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <Briefcase className="h-10 w-10 text-white relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl transform group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">JobPortal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              aria-current={isActive('/') ? 'page' : undefined}
              className={`transition-colors ${
                isActive('/') 
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-700 hover:text-blue-600'
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded`}
            >
              Home
            </Link>
            <Link
              to="/jobs"
              aria-current={isActive('/jobs') ? 'page' : undefined}
              className={`transition-colors ${
                isActive('/jobs') 
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-700 hover:text-blue-600'
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded`}
            >
              Jobs
            </Link>

            {user ? (
              <>
                {user.role === 'employer' && (
                  <Link
                    to="/applications/manage"
                    aria-current={isActive('/applications/manage') ? 'page' : undefined}
                    className={`transition-colors ${
                      isActive('/applications/manage') 
                        ? 'text-blue-600 font-semibold' 
                        : 'text-gray-700 hover:text-blue-600'
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded`}
                  >
                    Applications
                  </Link>
                )}
                {user.role === 'jobseeker' && (
                  <Link
                    to="/applications"
                    aria-current={isActive('/applications') ? 'page' : undefined}
                    className={`transition-colors ${
                      isActive('/applications') 
                        ? 'text-blue-600 font-semibold' 
                        : 'text-gray-700 hover:text-blue-600'
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded`}
                  >
                    Applications
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  aria-current={isActive('/dashboard') ? 'page' : undefined}
                  className={`transition-colors ${
                    isActive('/dashboard') 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:text-blue-600'
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded`}
                >
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded">
                    <User className="h-5 w-5" />
                    <span>{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  aria-current={isActive('/login') ? 'page' : undefined}
                  className={`transition-colors ${
                    isActive('/login') 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:text-blue-600'
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            className="md:hidden flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive('/') ? 'page' : undefined}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white`}
              >
                Home
              </Link>
              <Link
                to="/jobs"
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive('/jobs') ? 'page' : undefined}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/jobs') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white`}
              >
                Jobs
              </Link>

              {user ? (
                <>
                  <Link
                    to={user.role === 'employer' ? '/applications/manage' : '/applications'}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isActive(user.role === 'employer' ? '/applications/manage' : '/applications') ? 'page' : undefined}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(user.role === 'employer' ? '/applications/manage' : '/applications') 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white`}
                  >
                    <Dashboard className="h-5 w-5" />
                    <span>{user.role === 'employer' ? 'Applications' : 'Applications'}</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isActive('/dashboard') ? 'page' : undefined}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/dashboard') 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white`}
                  >
                    <Dashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                  <div className="px-3 py-2 text-sm text-gray-500 border-t border-gray-200 mt-2">
                    Welcome, {user.name}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isActive('/login') ? 'page' : undefined}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/login') 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
