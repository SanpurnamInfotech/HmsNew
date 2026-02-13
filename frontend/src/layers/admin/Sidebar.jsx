import React, { useEffect, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DataService } from "../../../utils/domain"; 
import { useAuth } from "../../../auth/AuthContext";
import { FaChevronDown, FaChevronRight, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';
import * as BsIcons from 'react-icons/bs';
import * as MdIcons from 'react-icons/md';
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import * as RiIcons from 'react-icons/ri';
import * as IoIcons from 'react-icons/io5';
import "../../../styles/Sidebar.css"; 
import logo from "../../../assets/images/medcard_logo.png";

const Sidebar = ({ collapsed, theme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [modules, setModules] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

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
          .map((m) => ({
            ...m,
            children: submoduleArr
              .filter(
                (s) =>
                  String(s.module_code) === String(m.module_code) &&
                  (s.status === 1 || s.status === "ACTIVE")
              )
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

  const renderIcon = (icon) => {
    if (!icon) return null;
    const map = { Fa: FaIcons, Bs: BsIcons, Md: MdIcons, Ai: AiIcons, Bi: BiIcons, Ri: RiIcons, Io: IoIcons };
    const prefix = icon.slice(0, 2);
    const lib = map[prefix];
    if (lib && lib[icon]) {
      const IconComp = lib[icon];
      return <IconComp />;
    }
    if (icon.includes('bi ')) return <i className={icon} />;
    if (icon.includes('fa ')) return <i className={icon} />;
    return <span>{icon}</span>;
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${theme}`}>
    {/* Medcard Branding Header */}
    <div className="sidebar-header">
      {/* Changed 'to' from "/admin/dashboard" to "/" */}
      <Link to="/" className="d-flex align-items-center justify-content-center text-decoration-none">
        <img 
          src={logo}
          alt="Medcard Logo" 
          className={`logo ${collapsed ? 'logo-collapsed' : 'logo-expanded'} mb-2`} 
        />
      </Link>
    </div>

      <Nav className="flex-column mt-3">
        {/* Fixed Dashboard Link */}
        <Nav.Link 
          as={Link} 
          to="/admin/dashboard" 
          className={`nav-item ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
        >
          <span className="nav-icon"><FaTachometerAlt /></span>
          {!collapsed && <span className="nav-label">Dashboard</span>}
        </Nav.Link>

        {loading ? (
          <div className="text-center mt-3 small text-muted">Loading...</div>
        ) : (
          modules.map((mod) => (
            <div key={mod.module_code} className="menu-group">
              {/* Parent Module */}
              <div 
                className={`nav-item d-flex align-items-center justify-content-between ${expanded === mod.module_code ? 'expanded-header' : ''}`}
                onClick={() => setExpanded(expanded === mod.module_code ? null : mod.module_code)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center">
                  <span className="nav-icon">{renderIcon(mod.icon)}</span>
                  {!collapsed && <span className="nav-label ms-2">{mod.module_name}</span>}
                </div>
                
                {!collapsed && mod.children.length > 0 && (
                  <span className="chevron-icon">
                    {expanded === mod.module_code ? <FaChevronDown size={12}/> : <FaChevronRight size={12}/>}
                  </span>
                )}
              </div>

              {/* Submodules (Children) */}
              {!collapsed && expanded === mod.module_code && (
                <div className="submenu-list">
                  {mod.children.map((sub) => (
                    <Nav.Link 
                      key={sub.submodule_code}
                      as={Link} 
                      to={`/admin/${sub.url}`} 
                      className={`submenu-item ${location.pathname.includes(sub.url) ? 'active' : ''}`}
                    >
                      <span className="nav-icon me-2">{renderIcon(sub.icon)}</span>
                      {sub.submodule_name}
                    </Nav.Link>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </Nav>

      {/* Logout at bottom */}
      <div className="sidebar-footer mt-auto p-3">
        <button onClick={handleLogout} className="btn-logout border-0 bg-transparent d-flex align-items-center w-100">
          <FaSignOutAlt className="nav-icon" />
          {!collapsed && <span className="ms-3 nav-label">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;