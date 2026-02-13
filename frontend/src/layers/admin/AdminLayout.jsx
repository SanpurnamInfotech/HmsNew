import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { FaBars, FaBell, FaUserCircle, FaMoon, FaSun } from 'react-icons/fa';
import Sidebar from './Sidebar';
import { useTheme } from '../../../theme/ThemeContext.jsx';

const AdminLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-layout ${collapsed ? 'collapsed' : ''} ${theme}`}>
      {/* Sidebar Component */}
      <Sidebar collapsed={collapsed} theme={theme} />

      {/* Main Right Side Content */}
      <div className="main-wrapper">
        
        {/* Top Header Navbar */}
        <Navbar expand="lg" className="top-navbar shadow-sm">
          <Container fluid>
            <div className="d-flex align-items-center">
              <FaBars 
                className="toggle-icon me-3" 
                onClick={() => setCollapsed(!collapsed)} 
              />
              <h5 className="mb-0 fw-bold header-title">Medical Center</h5>
            </div>

            <div className="d-flex align-items-center gap-4">
              {/* Theme Toggle */}
              <div className="theme-toggle" onClick={toggleTheme}>
                {theme === 'dark' ? <i className="bi bi-sun-fill"></i> : <i className="bi bi-moon-fill"></i>}
              </div>

              {/* Notification */}
              <div className="position-relative">
                <FaBell size={20} className="text-muted" />
                <span className="badge-dot"></span>
              </div>

              {/* Profile Section */}
              <div className="d-flex align-items-center gap-2 border-start ps-3">
                <div className="text-end d-none d-sm-block">
                  {/* <p className="mb-0 fw-bold small">Admin</p>
                  <p className="mb-0 text-muted tiny">Super User</p> */}
                </div>
                <FaUserCircle size={32} className="text-mint" />
              </div>
            </div>
          </Container>
        </Navbar>

        {/* Dynamic Page Content */}
        <div className="content-area p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
