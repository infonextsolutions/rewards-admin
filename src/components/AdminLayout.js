'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './layout/Sidebar';
import AuthGuard from './AuthGuard';
import { SearchProvider } from '../contexts/SearchContext';
import { useAuth } from '../contexts/AuthContext';

const AdminLayoutContent = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen transition-all duration-300">
        {/* Header */}
        <header className="w-full bg-white border-b border-gray-200 px-4 lg:px-6 py-4" role="banner">
          <div className="flex items-center justify-between w-full h-full">

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                aria-label="Open sidebar"
                type="button"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <div className="flex-1"></div>

            {/* Right Section - Actions & Profile */}
            <div className="flex items-center gap-4 ml-6">

              {/* Divider */}

              {/* Notification */}

              <div className="hidden lg:block w-px h-10 bg-[#d0d5de] rounded-[6.4px]" aria-hidden="true" />

              {/* User Profile */}
              <div className="hidden sm:flex items-center gap-3 user-menu-container relative">
                <div className="text-right">
                  <p className="text-[#464154] text-base [font-family:'Barlow-Regular',Helvetica] font-normal">
                    <span className="font-normal">Hello, </span>
                    <span className="[font-family:'Barlow-SemiBold',Helvetica] font-semibold">
                      {user?.firstName || 'Admin'}!
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-12 h-12 bg-gray-300 rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center text-white font-semibold text-base"
                  aria-label="User profile menu"
                  type="button"
                >
                  {user?.firstName?.charAt(0) || 'A'}
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function AdminLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Public routes that should not use admin layout
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <SearchProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SearchProvider>
    </AuthGuard>
  );
}
