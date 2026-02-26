import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { FaBars, FaBell, FaUserCircle } from 'react-icons/fa';
import Sidebar from './Sidebar';
import { useTheme } from '../../../theme/ThemeContext.jsx';

const AdminLayout = () => {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
      
      {/* Sidebar Component - Still fixed to the side */}
      <Sidebar collapsed={collapsed} theme={theme} isMobile={isMobile} />

      {/* Overlay for mobile view */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Container - Changed from fixed to flex-1 for natural document scrolling */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 
          ${isMobile ? 'ml-0' : (collapsed ? 'ml-20' : 'ml-64')}
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}
      >
        {/* Top Header Navbar - Fixed removed, Background removed */}
        <header className="h-16 flex items-center px-6 transition-colors duration-300 bg-transparent">
          
          <div className="flex items-center justify-between w-full">
            {/* Left side: Toggle */}
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleSidebar}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-200'}`}
              >
                <FaBars className="text-xl text-green-800" />
              </button>
            </div>

            {/* Right side: Actions & Profile */}
            <div className="flex items-center gap-5">
              <div className="relative cursor-pointer p-2 group">
                <FaBell className={`text-xl transition-colors ${isDark ? 'text-slate-400 group-hover:text-white' : 'text-gray-500 group-hover:text-green-900'}`} />
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-slate-950"></span>
                </span>
              </div>

              <div className={`flex items-center gap-3 pl-4 border-l ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold leading-none">Dr. Admin</p>
                  <p className={`text-[10px] uppercase tracking-wider font-semibold mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Super User</p>
                </div>
                <div className="relative">
                  <FaUserCircle className="text-3xl text-green-800" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-800 border-2 border-white dark:border-slate-950 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content - Scrolls with the header */}
        <main className="flex-1 p-6">
          <div className="h-full">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;