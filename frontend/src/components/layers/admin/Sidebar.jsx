import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DataService } from "../../../utils/domain"; 
import { useAuth } from "../../../auth/AuthContext";
import { FaChevronDown, FaChevronRight, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

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
              .filter(
                (s) =>
                  String(s.module_code) === String(m.module_code) &&
                  (s.status === 1 || s.status === "ACTIVE")
              )
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

  // Tailwind v4 Dynamic Classes
  const sidebarWidth = collapsed ? 'w-[80px]' : 'w-[260px]';
  const mobileTranslate = collapsed ? '-translate-x-full' : 'translate-x-0';
  
  const sidebarBase = `fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out shadow-2xl border-r
    ${isMobile ? `${mobileTranslate} w-[260px]` : sidebarWidth}
    ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-gray-200 text-slate-600'}`;

  const navLinkStyles = (isActive) => `flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 cursor-pointer group
    ${isActive 
      ? (isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-50 text-green-700 font-semibold') 
      : (isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-gray-50 hover:text-green-700')}`;

  const submenuItemStyles = (isActive) => `block pl-11 pr-4 py-2 text-sm transition-colors duration-200 rounded-md mx-2
    ${isActive 
      ? 'text-green-600 font-bold bg-green-50/50' 
      : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-green-700 hover:bg-gray-50')}`;

  return (
    <aside className={sidebarBase}>
      {/* Brand Header - Starts at absolute top 0 */}
      <div className={`flex items-center h-16 px-6 shrink-0 border-b ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center shadow-lg shadow-green-900/20">
             <span className="text-white font-black text-sm">H</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-xl tracking-tight animate-in fade-in duration-500">
              HMS <span className="text-green-600">Admin</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation Body */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700">
        <Link 
          to="/admin/dashboard" 
          className={navLinkStyles(location.pathname === '/admin/dashboard')}
        >
          <FaTachometerAlt className={`text-lg shrink-0 ${location.pathname === '/admin/dashboard' ? 'text-green-600' : ''}`} />
          {!collapsed && <span className="ml-4 truncate">Dashboard</span>}
        </Link>

        {loading ? (
          <div className="px-6 py-4 space-y-4">
             {[1,2,3,4].map(i => <div key={i} />)}
          </div>
        ) : (
          modules.map((mod) => (
            <div key={mod.module_code} className="mb-1">
              <div 
                className={navLinkStyles(expanded === mod.module_code)}
                onClick={() => setExpanded(expanded === mod.module_code ? null : mod.module_code)}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${expanded === mod.module_code ? 'bg-green-500 ring-4 ring-green-500/20' : 'bg-slate-500'}`}></div>
                  {!collapsed && <span className="ml-4 truncate font-medium">{mod.module_name}</span>}
                </div>
                
                {!collapsed && mod.children.length > 0 && (
                  <FaChevronDown size={10} className={`transition-transform duration-300 ${expanded === mod.module_code ? 'rotate-180' : 'rotate-0'}`} />
                )}
              </div>

              {/* Submodules */}
              {!collapsed && expanded === mod.module_code && (
                <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {mod.children.map((sub) => (
                    <Link 
                      key={sub.submodule_code}
                      to={`/admin/${sub.url}`} 
                      onClick={isMobile ? toggleSidebar : undefined}
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
      <div className={`p-4 mt-auto border-t ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
        <button 
          onClick={handleLogout} 
          className={`w-full flex items-center p-3 rounded-xl transition-all group
            ${isDark ? 'hover:bg-red-500/10 text-slate-400' : 'hover:bg-red-50 text-slate-600'}`}
        >
          <FaSignOutAlt className="text-lg group-hover:text-red-500 transition-colors" />
          {!collapsed && <span className="ml-4 font-semibold group-hover:text-red-500">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;