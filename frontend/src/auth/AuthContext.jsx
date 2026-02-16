import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/domain";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage to persist login across page refreshes
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(localStorage.getItem("username"));

  /**
   * Login function - stores both tokens and updates state
   */
  const login = (access, refresh, username) => {
    localStorage.setItem("token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("username", username);
    setToken(access);
    setUser({ username });
  };

  /**
   * Logout function - cleans up storage and redirects
   */
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    setToken(null);
    setUser(null);
    // Use window.location for a hard reset to clear all states
    window.location.href = "/admin/login";
  }, []);

  /**
   * Auto-refresh logic
   * Runs every 4 minutes to keep the session alive 
   * before the access token expires.
   */
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const refreshToken = localStorage.getItem("refresh_token");
      
      // Only attempt refresh if we are actually logged in
      if (refreshToken && token) {
        try {
          // We call the refresh endpoint directly
          const res = await api.post("token/refresh/", { refresh: refreshToken });
          const newAccess = res.data.access;
          
          localStorage.setItem("token", newAccess);
          setToken(newAccess);
          console.log("JWT Access Token rotated successfully");
        } catch (err) {
          console.error("Session expired during auto-refresh");
          // If refresh token is invalid/expired (401), log the user out
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout();
          }
        }
      }
    }, 4 * 60 * 1000); // 4 minutes

    return () => clearInterval(refreshInterval);
  }, [token, logout]);

  /**
   * Idle Timeout Logic
   * Logs out user after 5 minutes of inactivity
   */
  useEffect(() => {
    let idleTimer;
    // 5 minutes in milliseconds
    const TIMEOUT_DURATION = 5 * 60 * 1000; 

    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      
      if (token) {
        idleTimer = setTimeout(() => {
          console.log("User idle for 5 minutes - Logging out");
          logout();
        }, TIMEOUT_DURATION);
      }
    };

    // Events to track user activity
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    
    // Attach listeners if user is logged in
    if (token) {
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer(); // Start the timer immediately
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