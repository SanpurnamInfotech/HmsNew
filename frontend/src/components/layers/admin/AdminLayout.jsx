import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { FaBars, FaBell, FaUserCircle, FaMoon, FaSun } from 'react-icons/fa';
import Sidebar from './Sidebar';
import { useTheme } from '../../../theme/ThemeContext.jsx';

const AdminLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setCollapsed(false); // Auto-expand sidebar on desktop
      } else {
        setCollapsed(true); // Auto-collapse sidebar on mobile
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setCollapsed(!collapsed);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
      
      {/* Sidebar Component */}
      <Sidebar collapsed={collapsed} theme={theme} isMobile={isMobile} />

      {/* Overlay for mobile view */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Right Side Content - Positioned to the right of sidebar */}
      <div 
        className={`fixed top-0 h-screen transition-all duration-300 ${isMobile ? 'left-0 right-0' : (collapsed ? 'left-20 right-0' : 'left-64 right-0')} overflow-y-auto`}
        style={{ zIndex: 40 }} // Slightly lower than sidebar z-index
      >
        {/* Top Header Navbar */}
        <header className={`sticky top-0 z-30 h-16 flex items-center px-6 shadow-sm border-b transition-colors duration-300 
          ${isDark ? 'bg-slate-900/80 backdrop-blur-md border-slate-800' : 'bg-white border-gray-200'}`}>
          
          <div className="flex items-center justify-between w-full">
            {/* Left side: Toggle & Title */}
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleSidebar}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
              >
                <FaBars className="text-xl text-green-800" />
              </button>
              {/* <h1 className="text-lg font-bold tracking-tight hidden sm:block">Medical Center</h1> */}
            </div>

            {/* Right side: Actions & Profile */}
            <div className="flex items-center gap-5">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-full border transition-all ${isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-gray-200 hover:bg-gray-100'}`}
              >
                {isDark ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-slate-600" />}
              </button>

              {/* Notification */}
              <div className="relative cursor-pointer p-2 group">
                <FaBell className={`text-xl transition-colors ${isDark ? 'text-slate-400 group-hover:text-white' : 'text-gray-500 group-hover:text-green-900'}`} />
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-slate-900"></span>
                </span>
              </div>

              {/* Profile Section */}
              <div className={`flex items-center gap-3 pl-4 border-l ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold leading-none">Dr. Admin</p>
                  <p className={`text-[10px] uppercase tracking-wider font-semibold mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Super User</p>
                </div>
                <div className="relative">
                  <FaUserCircle className="text-3xl text-green-800" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-800 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 pb-16">
          <div className={`rounded-xl h-full ${isDark ? 'bg-slate-900/40' : ''} p-6 ml-4`}>
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;