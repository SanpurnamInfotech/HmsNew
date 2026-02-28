import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DataService } from "../../../utils/domain"; 
import { useAuth } from "../../../auth/AuthContext";
import { FaChevronDown, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import '../../../styles/sidebar.css';

const Sidebar = ({ collapsed, theme, isMobile, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [modules, setModules] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [modRes, subRes] = await Promise.all([
          DataService.getAll("engine-module"),
          DataService.getAll("engine-submodule"),
        ]);

        const moduleArr = Array.isArray(modRes.data) ? modRes.data : modRes.data?.results || [];
        const submoduleArr = Array.isArray(subRes.data) ? subRes.data : subRes.data?.results || [];

        const menu = moduleArr
          .filter((m) => m.status === 1 || m.status === "ACTIVE")
          .sort((a, b) => (parseInt(a.sequence) || 999) - (parseInt(b.sequence) || 999))
          .map((m) => ({
            ...m,
            children: submoduleArr
              .filter((s) => String(s.module_code) === String(m.module_code) && (s.status === 1 || s.status === "ACTIVE"))
              .sort((a, b) => (parseInt(a.sequence) || 999) - (parseInt(b.sequence) || 999))
              .map((s) => ({
                ...s,
                url: s.url.replace(/^\/?admin\/?/, ""),
              })),
          }));

        setModules(menu);
      } catch (err) {
        console.error("Sidebar Data Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSidebarData();
  }, []);

  const sidebarClasses = `sidebar-container ${collapsed ? 'collapsed' : ''} ${isDark ? 'dark' : 'light'} ${isMobile ? 'mobile' : ''} ${isMobile && !collapsed ? 'show' : ''}`;

  return (
    <>
      {isMobile && !collapsed && (
        <div className="sidebar-backdrop" onClick={toggleSidebar} />
      )}

      <aside className={sidebarClasses}>
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-logo">
                <span className="logo-letter">H</span>
            </div>
            {!collapsed && (
              <span className="brand-name">
                HMS <span className="text-emerald">Admin</span>
              </span>
            )}
          </div>
        </div>

        <nav className="sidebar-nav scrollbar-thin">
          <Link 
            to="/admin/dashboard" 
            className={`nav-link-item ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
          >
            <div className="nav-link-content d-flex align-items-center">
              <FaTachometerAlt className="nav-icon-main" />
              {!collapsed && <span className="nav-label">Dashboard</span>}
            </div>
          </Link>

          {loading ? (
            <div className="sidebar-loader px-3">
               <div className="skeleton-item mb-2" style={{height: '20px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px'}}></div>
            </div>
          ) : (
            modules.map((mod) => {
              const isModuleActive = expanded === mod.module_code;
              const hasActiveChild = mod.children.some(sub => location.pathname.includes(sub.url));
              
              return (
                <div key={mod.module_code} className="menu-group">
                  <div 
                    className={`nav-link-item cursor-pointer ${(isModuleActive || hasActiveChild) ? 'expanded' : ''}`}
                    onClick={() => setExpanded(isModuleActive ? null : mod.module_code)}
                  >
                    <div className="nav-link-content d-flex align-items-center">
                      <div className={`status-dot ${isModuleActive || hasActiveChild ? 'active' : ''}`}></div>
                      {!collapsed && <span className="nav-label">{mod.module_name}</span>}
                    </div>
                    
                    {!collapsed && mod.children.length > 0 && (
                      <FaChevronDown size={10} className={`chevron-icon ${isModuleActive ? 'rotate' : ''}`} />
                    )}
                  </div>

                  {!collapsed && isModuleActive && (
                    <div className="submenu-container animate-slide-down">
                      {mod.children.map((sub) => (
                        <Link 
                          key={sub.submodule_code}
                          to={`/admin/${sub.url}`} 
                          onClick={isMobile ? toggleSidebar : undefined}
                          className={`submenu-item ${location.pathname.includes(sub.url) ? 'active' : ''}`}
                        >
                          {sub.submodule_name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt className="logout-icon" />
            {!collapsed && <span className="logout-text">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;