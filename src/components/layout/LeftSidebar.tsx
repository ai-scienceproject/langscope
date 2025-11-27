'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface LeftSidebarProps {
  user?: User | null;
  isAuthenticated?: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ user, isAuthenticated = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { name: 'Home', href: '/', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { name: 'Rankings', href: '/rankings', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { name: 'Arena', href: '/arena', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { name: 'About', href: '/about', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-black text-white shadow-lg hover:bg-dark-gray transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={cn(
        'bg-white border-r border-gray-200 flex flex-col h-screen fixed lg:sticky top-0 transition-all duration-300 shadow-sm z-40',
        collapsed ? 'w-16 sm:w-20' : 'w-64 sm:w-72',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
      {/* Logo Section */}
      <div className="p-4 sm:p-6 border-b border-gray-200/80">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg hover:bg-dark-gray transition-all duration-300">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-black">
              Langscope
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-light-gray text-black shadow-sm border border-gray-200'
                  : 'text-dark-gray hover:bg-light-gray hover:text-black'
              )}
              title={collapsed ? item.name : undefined}
            >
              <span className={cn(
                'flex-shrink-0 transition-all duration-200',
                isActive 
                  ? 'text-black' 
                  : 'text-dark-gray group-hover:text-black'
              )}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      {isAuthenticated && user ? (
        <>
          {/* Upgrade Section */}
          {!collapsed && (
            <div className="px-3 pb-4">
              <div className="bg-light-gray rounded-xl p-4 border border-gray-200">
                <div className="text-xs font-semibold text-black mb-1">Current plan</div>
                <div className="text-xs text-dark-gray mb-3">Free trial</div>
                <button className="w-full bg-black text-white text-xs font-semibold py-2 px-3 rounded-lg hover:bg-dark-gray transition-all duration-200 shadow-sm">
                  Upgrade to Pro
                </button>
                <p className="text-xs text-dark-gray mt-2 leading-tight">get the latest and exclusive features</p>
              </div>
            </div>
          )}

          {/* User Profile */}
          <div className="px-3 pb-4 border-t border-gray-200/80 pt-4">
            <div className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-light-gray transition-colors cursor-pointer group",
              collapsed && 'justify-center'
            )}>
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white text-sm font-semibold shadow-sm flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-black truncate">{user.name}</div>
                    <div className="text-xs text-dark-gray truncate">{user.email}</div>
                  </div>
                  <svg
                    className="w-4 h-4 text-dark-gray group-hover:text-black transition-colors flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </div>
          </div>

          {/* Logout */}
          <div className="px-3 pb-4">
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-dark-gray hover:bg-red-50 hover:text-red-600 transition-all duration-200 group",
                collapsed && 'justify-center'
              )}
              title={collapsed ? 'Logout' : undefined}
            >
              <svg
                className="w-5 h-5 text-dark-gray group-hover:text-red-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </>
      ) : (
        /* Login/Signup Section */
        <div className="px-3 pb-4 border-t border-gray-200/80 pt-4 space-y-2">
          {!collapsed ? (
            <>
              <button
                onClick={() => {
                  router.push('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-dark-gray hover:bg-light-gray transition-all duration-200 border border-gray-200 hover:border-gray-300"
              >
                Log in
              </button>
              <button
                onClick={() => {
                  router.push('/signup');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-black hover:bg-dark-gray transition-all duration-200 shadow-sm flex items-center justify-center"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  router.push('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-dark-gray hover:bg-light-gray transition-all duration-200 border border-gray-200 hover:border-gray-300 flex items-center justify-center"
                title="Log in"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </button>
              <button
                onClick={() => {
                  router.push('/signup');
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-white bg-black hover:bg-dark-gray transition-all duration-200 shadow-sm flex items-center justify-center"
                title="Sign up"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* Collapse Toggle - Hidden on mobile */}
      <div className="hidden lg:block px-3 pb-4 border-t border-gray-200/80 pt-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2.5 rounded-xl text-dark-gray hover:bg-light-gray hover:text-black transition-all duration-200 group"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={cn(
              "w-5 h-5 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

    </aside>
    </>
  );
};

export default LeftSidebar;

