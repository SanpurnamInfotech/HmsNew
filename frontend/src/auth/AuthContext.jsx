import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/domain";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("userData");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  /**
   * Login Function
   */
  const login = (access, refresh, userData) => {
    localStorage.setItem("token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("userData", JSON.stringify(userData));
    
    setToken(access);
    setUser(userData);
  };

  /**
   * Logout Function
   */
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userData");
    setToken(null);
    setUser(null);
    // Redirect to login page
    window.location.href = "/admin/login";
  }, []);

  /**
   * 1. Auto-refresh logic (Every 4 minutes)
   * Prevents session expiration while user is active
   */
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const refreshToken = localStorage.getItem("refresh_token");
      
      if (refreshToken && token) {
        try {
          const res = await api.post("token/refresh/", { refresh: refreshToken });
          const newAccess = res.data.access;
          
          localStorage.setItem("token", newAccess);
          setToken(newAccess);
          console.log("JWT Access Token rotated successfully");
        } catch (err) {
            console.error("Session expired during auto-refresh");

            if (
              err.response?.status === 401 ||
              err.response?.status === 403 ||
              err.response?.status === 500
            ) {
              logout();
            }
          }
      }
    }, 4 * 60 * 1000); 

    return () => clearInterval(refreshInterval);
  }, [token, logout]);

  /**
   * 2. Idle Timeout Logic (15 Minutes)
   * Logs out user if there is no activity
   */
  useEffect(() => {
    let idleTimer;
    // 15 Minutes * 60 Seconds * 1000 Milliseconds
    const TIMEOUT_DURATION = 15 * 60 * 1000; 

    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      
      if (token) {
        idleTimer = setTimeout(() => {
          console.log("User idle for 15 minutes - Logging out");
          logout();
        }, TIMEOUT_DURATION);
      }
    };

    // Events to track user activity
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    
    if (token) {
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer(); // Initialize timer
    }

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [token, logout]);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);