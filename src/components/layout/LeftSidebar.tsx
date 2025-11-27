'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface LeftSidebarProps {
  user?: User | null;
  isAuthenticated?: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ user: userProp, isAuthenticated: isAuthenticatedProp = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser, isAuthenticated: authIsAuthenticated, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Use auth context values, fallback to props if provided
  const user = authUser || userProp;
  const isAuthenticated = authIsAuthenticated || isAuthenticatedProp;

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
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="url(#homeGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="#1E40AF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.3" transform="translate(1, 1)" />
      </svg>
    )},
    { name: 'Rankings', href: '/rankings', icon: (
      <Image src="/logos/ranking.png" alt="Rankings" width={28} height={28} className="w-7 h-7" />
    )},
    { name: 'Arena', href: '/arena', icon: (
      <Image src="/logos/battle.png" alt="Arena" width={28} height={28} className="w-7 h-7" />
    )},
    { name: 'About', href: '/about', icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="aboutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="url(#aboutGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#6D28D9" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.3" transform="translate(1, 1)" />
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
        collapsed ? 'w-12' : 'w-64 sm:w-72',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
      {/* Logo Section */}
      <div className="p-4 sm:p-6 border-b border-gray-200/80">
        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
          <Image src="/logos/langscope.png" alt="Langscope" width={40} height={40} className="w-10 h-10" />
          {!collapsed && (
            <span className="text-xl font-bold text-black">Langscope</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold transition-all duration-200 group',
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
            <div className="px-3 pt-4 pb-2 border-t border-gray-200/80">
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
          <div className="px-3 pt-2 pb-1 border-t border-gray-200/80">
            <div className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-light-gray transition-colors cursor-pointer group",
              collapsed && 'justify-center'
            )}>
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white text-xs font-semibold shadow-sm flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-lg object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-black truncate">{user.name}</div>
                    <div className="text-[10px] text-dark-gray truncate">{user.email}</div>
                  </div>
                  <svg
                    className="w-3 h-3 text-dark-gray group-hover:text-black transition-colors flex-shrink-0"
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
          <div className="px-3 pb-3 pt-1">
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs font-medium text-dark-gray hover:bg-red-50 hover:text-red-600 transition-all duration-200 group",
                collapsed && 'justify-center'
              )}
              title={collapsed ? 'Logout' : undefined}
            >
              <svg
                className="w-4 h-4 text-dark-gray group-hover:text-red-500 transition-colors"
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
        <div className="px-3 pb-3 border-t border-gray-200/80 pt-3 space-y-1.5">
          {!collapsed ? (
            <>
              <button
                onClick={() => {
                  router.push('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-2 py-1.5 rounded-lg text-xs font-medium text-dark-gray hover:bg-light-gray transition-all duration-200 border border-gray-200 hover:border-gray-300"
              >
                Log in
              </button>
              <button
                onClick={() => {
                  router.push('/signup');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-2 py-1.5 rounded-lg text-xs font-semibold text-white bg-black hover:bg-dark-gray transition-all duration-200 shadow-sm flex items-center justify-center"
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
                className="w-full p-2 rounded-lg text-dark-gray hover:bg-light-gray transition-all duration-200 border border-gray-200 hover:border-gray-300 flex items-center justify-center"
                title="Log in"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </button>
              <button
                onClick={() => {
                  router.push('/signup');
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2 rounded-lg text-white bg-black hover:bg-dark-gray transition-all duration-200 shadow-sm flex items-center justify-center"
                title="Sign up"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* Collapse Toggle - Hidden on mobile */}
      <div className="hidden lg:block px-3 pb-2 border-t border-gray-200/80 pt-1.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-1 rounded text-dark-gray hover:bg-light-gray hover:text-black transition-all duration-200 group"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={cn(
              "w-3 h-3 transition-transform duration-300",
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

