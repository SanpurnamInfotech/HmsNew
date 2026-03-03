import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Navbar } from 'react-bootstrap';
import { FaBars, FaBell, FaUserCircle} from 'react-icons/fa';
import { FiSun, FiMoon } from 'react-icons/fi';
import Sidebar from './Sidebar';
import { useTheme } from '../../../theme/ThemeContext.jsx';
import { useAuth } from '../../../auth/AuthContext.jsx';

const AdminLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth(); 
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const isDark = theme === 'dark';

  // Constants for widths
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

  const getMarginLeft = () => {
    if (isMobile) return '0px';
    return collapsed ? `${COLLAPSED_WIDTH}px` : `${SIDEBAR_WIDTH}px`;
  };


  const bgColor = isDark ? '#0f172a' : '#ffffff'; 

  return (
      <div 
            className={`admin-layout ${theme} transition-colors duration-300`} 
            style={{ 
              minHeight: '100vh', 
              backgroundColor: bgColor,
              color: isDark ? '#f8fafc' : '#0f172a',
              width: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
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
          backgroundColor: 'transparent' 
        }}
      >
        <Navbar 
          expand="lg" 
          className={`top-navbar border-bottom ${isDark ? 'border-slate-800' : 'border-gray-100'}`}
          style={{ 
            backgroundColor: 'transparent',
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
              <div 
                className="theme-toggle-btn cursor-pointer p-2 rounded-circle" 
                onClick={toggleTheme}
                style={{ 
                  width: '35px', 
                  height: '35px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                }}
              >
                {isDark ? (
                  <FiSun size={20} className="text-warning" />
                ) : (
                  <FiMoon size={20} className="text-dark" />
                )}
              </div>
              
              <div className="notification-icon-wrapper position-relative cursor-pointer">
                <FaBell size={20} className={isDark ? 'text-slate-400' : 'text-muted'} />
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
              </div>

              <div className={`profile-section d-flex align-items-center gap-2 border-start ps-3 ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
                <div className="text-end d-none d-sm-block">
                 
                  <p className={`mb-0 fw-bold small ${isDark ? 'text-white' : 'text-dark'}`} style={{ fontSize: '0.85rem' }}>
                    Dr. {user?.username || "Admin"}
                  </p>
                  <p className="mb-0 text-muted uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>
                    {user?.usertype_name || "Super User"}
                  </p>
                </div>
                <FaUserCircle size={32} className="text-emerald-500" />
              </div>
            </div>
          </Container>
        </Navbar>

        <main className="content-area p-4 grow">
          <Outlet context={{ isDark }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;