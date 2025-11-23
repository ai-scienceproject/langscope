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
  sidebarType?: 'filter' | 'leaderboard' | 'domains';
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
  standings?: ModelStanding[];
  domains?: Array<{ id: string; name: string; slug: string; icon?: string; battleCount?: number; modelCount?: number }>;
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
  domains,
  user,
  isAuthenticated = false,
  className,
}) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-light-gray">
      {/* Left Sidebar */}
      <LeftSidebar user={user} isAuthenticated={isAuthenticated} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto lg:ml-0">
        <main className={cn('flex-1 flex flex-col lg:flex-row', className)}>
          <div className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
            {children}
          </div>
          
          {showSidebar && (
            <Sidebar
              type={sidebarType}
              filters={filters}
              onFilterChange={onFilterChange}
              standings={standings}
              domains={domains}
            />
          )}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Layout;

