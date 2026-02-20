import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DataService } from "../../../utils/domain"; 
import { useAuth } from "../../../auth/AuthContext";
import { FaChevronDown, FaChevronRight, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

const Sidebar = ({ collapsed, theme, isMobile }) => {
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

        // Sort and Structure Menu
        const menu = moduleArr
          .filter((m) => m.status === 1 || m.status === "ACTIVE")
          /* SORT PARENT MODULES BY SEQUENCE */
          .sort((a, b) => (parseInt(a.sequence) || 999) - (parseInt(b.sequence) || 999))
          .map((m) => ({
            ...m,
            children: submoduleArr
              .filter(
                (s) =>
                  String(s.module_code) === String(m.module_code) &&
                  (s.status === 1 || s.status === "ACTIVE")
              )
              /* SORT SUBMODULES BY SEQUENCE */
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

  // Tailwind Class Helpers
  const sidebarStyles = `h-screen transition-all duration-300 z-50 flex flex-col shadow-xl 
    ${isMobile 
      ? (collapsed ? 'fixed -left-full w-64' : 'fixed left-0 w-64') 
      : (collapsed ? 'fixed left-0 w-20' : 'fixed left-0 w-64')}
    ${isDark ? 'bg-slate-900 text-gray-300' : 'bg-white text-gray-600'}`;

  const navLinkStyles = (isActive) => `flex items-center px-4 py-3 my-1 transition-colors duration-200 cursor-pointer 
    ${isActive 
      ? (isDark ? 'bg-green-900 text-white' : 'bg-green-50 text-green-900 border-r-4 border-green-900') 
      : (isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-gray-100 hover:text-green-900')}`;

  const submenuItemStyles = (isActive) => `block pl-12 pr-4 py-2 text-sm transition-colors duration-200 
    ${isActive 
      ? 'text-green-800 font-medium' 
      : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-green-900')}`;

  return (
    <div className={sidebarStyles}>
      {/* Brand Header */}
      <div className={`flex items-center h-16 px-6 border-b ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
        <div className="w-3 h-3 rounded-full bg-green-800 shrink-0"></div>
        {!collapsed && (
          <span className="ml-3 font-bold text-lg tracking-tight truncate">
            HMS <span className="text-green-800">Admin</span>
          </span>
        )}
      </div>

      {/* Navigation Body */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden mt-4 px-2">
        {/* Fixed Dashboard Link */}
        <Link 
          to="/admin/dashboard" 
          className={navLinkStyles(location.pathname === '/admin/dashboard')}
        >
          <FaTachometerAlt className="text-lg shrink-0" />
          {!collapsed && <span className="ml-4 font-medium transition-opacity">Dashboard</span>}
        </Link>

        {loading ? (
          <div className="flex justify-center mt-6 animate-pulse text-xs uppercase tracking-widest opacity-50">
            {collapsed ? '...' : 'Loading Content...'}
          </div>
        ) : (
          modules.map((mod) => (
            <div key={mod.module_code} className="mt-1">
              {/* Parent Module */}
              <div 
                className={navLinkStyles(expanded === mod.module_code)}
                onClick={() => setExpanded(expanded === mod.module_code ? null : mod.module_code)}
              >
                <div className="flex items-center flex-1">
                  <div className={`w-2 h-2 rounded-sm rotate-45 shrink-0 ${expanded === mod.module_code ? 'bg-green-800' : 'bg-gray-400'}`}></div>
                  {!collapsed && <span className="ml-4 font-medium truncate">{mod.module_name}</span>}
                </div>
                
                {!collapsed && mod.children.length > 0 && (
                  <span className="ml-auto transition-transform duration-200">
                    {expanded === mod.module_code ? <FaChevronDown size={12}/> : <FaChevronRight size={12}/>}
                  </span>
                )}
              </div>

              {/* Submodules List */}
              {!collapsed && expanded === mod.module_code && (
                <div className={`mt-1 mb-2 ${isDark ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg transition-all`}>
                  {mod.children.map((sub) => (
                    <Link 
                      key={sub.submodule_code}
                      to={`/admin/${sub.url}`} 
                      className={submenuItemStyles(location.pathname.includes(sub.url))}
                    >
                      {sub.submodule_name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </nav>

      {/* Footer / Logout */}
      <div className={`p-4 border-t ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
        <button 
          onClick={handleLogout} 
          className={`w-full flex items-center p-3 rounded-lg transition-colors group
            ${isDark ? 'hover:bg-red-900/20 text-gray-400' : 'hover:bg-red-50 text-gray-600'}`}
        >
          <FaSignOutAlt className="text-lg group-hover:text-red-500 shrink-0" />
          {!collapsed && <span className="ml-4 font-medium group-hover:text-red-500">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;