'use client';

import React from 'react';
import LeftSidebar from './LeftSidebar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import type { FilterState, ModelStanding } from '@/types';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  sidebarType?: 'filter' | 'leaderboard';
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
  standings?: ModelStanding[];
  user?: any;
  isAuthenticated?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showSidebar = false,
  sidebarType = 'filter',
  filters,
  onFilterChange,
  standings,
  user,
  isAuthenticated = false,
  className,
}) => {
  return (
    <div className="min-h-screen flex bg-gray-50/50">
      {/* Left Sidebar */}
      <LeftSidebar user={user} isAuthenticated={isAuthenticated} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className={cn('flex-1 flex', className)}>
          <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
            {children}
          </div>
          
          {showSidebar && (
            <Sidebar
              type={sidebarType}
              filters={filters}
              onFilterChange={onFilterChange}
              standings={standings}
            />
          )}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Layout;

