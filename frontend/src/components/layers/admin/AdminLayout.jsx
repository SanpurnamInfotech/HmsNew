import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Navbar } from 'react-bootstrap';
import { FaBars, FaBell, FaUserCircle, FaSun, FaMoon } from 'react-icons/fa';
import Sidebar from './Sidebar';
import { useTheme } from '../../../theme/ThemeContext.jsx';

const AdminLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const isDark = theme === 'dark';

  // Constants for widths to match your Sidebar.jsx/css
  const SIDEBAR_WIDTH = 260;
  const COLLAPSED_WIDTH = 80;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);

  // Dynamic margin calculation
  const getMarginLeft = () => {
    if (isMobile) return '0px';
    return collapsed ? `${COLLAPSED_WIDTH}px` : `${SIDEBAR_WIDTH}px`;
  };

  return (
    <div className={`admin-layout ${theme}`} style={{ minHeight: '100vh' }}>
      <Sidebar 
        collapsed={collapsed} 
        theme={theme} 
        isMobile={isMobile} 
        toggleSidebar={toggleSidebar} 
      />

<div 
  className="main-wrapper transition-all duration-300"
  style={{ 
    marginLeft: getMarginLeft(),
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'transparent' // Ensure wrapper doesn't block sidebar bg
  }}
>
  {/* REMOVED 'sticky-top' and fixed background classes */}
  <Navbar 
    expand="lg" 
    className={`top-navbar border-bottom ${isDark ? 'border-slate-800' : 'border-gray-100'}`}
    style={{ 
      backgroundColor: 'transparent', // Header background is now transparent
      paddingTop: '1rem',
      paddingBottom: '1rem'
    }}
  >
    <Container fluid>
      <div className="d-flex align-items-center">
        <button 
          onClick={toggleSidebar} 
          className={`btn-toggle-sidebar border-0 bg-transparent me-3 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}
        >
          <FaBars size={20} />
        </button>
        <h5 className={`mb-0 fw-bold header-title ${isDark ? 'text-white' : 'text-dark'}`}>
          Medical Center
        </h5>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* ... rest of your icons and profile section stays the same ... */}
        <div 
          className={`theme-toggle-btn cursor-pointer p-2 rounded-circle ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`} 
          onClick={toggleTheme}
          style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isDark ? <FaSun className="text-warning" /> : <FaMoon className="text-primary" />}
        </div>
        
        {/* Notification and Profile */}
        <div className="notification-icon-wrapper position-relative cursor-pointer">
          <FaBell size={20} className={isDark ? 'text-slate-400' : 'text-muted'} />
          <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
        </div>

        <div className={`profile-section d-flex align-items-center gap-2 border-start ps-3 ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
          <div className="text-end d-none d-sm-block">
            <p className={`mb-0 fw-bold small ${isDark ? 'text-white' : 'text-dark'}`} style={{ fontSize: '0.85rem' }}>Dr. Admin</p>
            <p className="mb-0 text-muted uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>Super User</p>
          </div>
          <FaUserCircle size={32} className="text-emerald-500" />
        </div>
      </div>
    </Container>
  </Navbar>

  <main className="content-area p-4 flex-grow-1">
    <Outlet context={{ isDark }} />
  </main>
</div>
    </div>
  );
};

export default AdminLayout;