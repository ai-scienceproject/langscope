'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface HeaderProps {
  user?: User | null;
  isAuthenticated?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, isAuthenticated = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout fails
      router.push('/login');
    }
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Rankings', href: '/rankings' },
    { name: 'Arena', href: '/arena' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-40 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end h-16">
          {/* Right side - Search and Actions */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 px-4 py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 bg-gray-50/50 transition-all duration-200"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Action Icons */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 hidden md:flex">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 relative hidden md:flex">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Right side - User */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity p-1 rounded-xl hover:bg-gray-100"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </button>

                  {/* User Dropdown */}
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/80 py-2 z-20 backdrop-blur-lg">
                        <div className="px-4 py-3 border-b border-gray-200/80">
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        </div>
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        <div className="border-t border-gray-200/80 my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => router.push('/login')} className="rounded-xl">
                    Log in
                  </Button>
                  <Button variant="primary" onClick={() => router.push('/signup')} className="rounded-xl">
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/80 py-4 bg-white/95 backdrop-blur-lg">
            {/* Mobile Search */}
            <div className="px-4 mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 bg-gray-50/50"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <nav className="flex flex-col gap-1 px-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-200/80 my-2" />
              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl text-left transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start rounded-xl"
                    onClick={() => {
                      router.push('/login');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Log in
                  </Button>
                  <Button
                    variant="primary"
                    className="rounded-xl"
                    onClick={() => {
                      router.push('/signup');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

