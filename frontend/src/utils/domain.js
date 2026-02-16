import axios from "axios";

/**
 * 1. DYNAMIC DOMAIN DETERMINATION
 * Detects if the app is running locally or in production.
 */
export const get_domain = () => {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  
  // If local, point to Django dev server; otherwise, use the current site origin
  return isLocal ? "http://127.0.0.1:8000" : window.location.origin;
};

/**
 * 2. AXIOS INSTANCE SETUP
 */
const api = axios.create({
  baseURL: `${get_domain()}/api/`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/**
 * 3. REQUEST INTERCEPTOR: Auth Header
 * Standardized to look for "access_token".
 */
api.interceptors.request.use(
  (config) => {
    // Standardizing on 'token' for consistency with AuthContext
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 4. RESPONSE INTERCEPTOR: JWT Refresh Logic
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only redirect if we get a 401 and we're not already on the login page
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname.includes("/admin/login");
      
      if (!isLoginPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * 5. DATASERVICE: Generic CRUD wrapper
 * Clean, reusable methods for your project ecosystem.
 */
export const DataService = {
  formatUrl: (endpoint) => endpoint.replace(/^\/+|\/+$/g, ""),

  getAll: (endpoint, params = {}) => {
    const url = DataService.formatUrl(endpoint);
    return api.get(`${url}/`, { params });
  },

  getOne: (endpoint, id) => {
    const url = DataService.formatUrl(endpoint);
    return api.get(`${url}/${id}/`);
  },

  create: (endpoint, data) => {
    const url = DataService.formatUrl(endpoint);
    return api.post(`${url}/`, data);
  },

  update: (endpoint, id, data) => {
    const url = DataService.formatUrl(endpoint);
    // Uses PUT for full updates; switch to .patch if preferred
    return api.put(`${url}/${id}/`, data);
  },

  delete: (endpoint, id) => {
    const url = DataService.formatUrl(endpoint);
    return api.delete(`${url}/${id}/`);
  },
};

export const EmailService = {};

export default api;
