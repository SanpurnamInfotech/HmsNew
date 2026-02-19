// src/hooks/useCrud.js

import { useState, useEffect, useCallback } from "react";
import api from "../utils/domain";

/**
 * Generic CRUD Hook
 * Usage: useCrud("engine-activity/")
 */
export const useCrud = (endpoint) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(endpoint);

      let extractedData = [];
      if (Array.isArray(res.data)) {
        extractedData = res.data;
      } else if (res.data && typeof res.data === "object") {
        extractedData =
          Object.values(res.data).find((v) => Array.isArray(v)) || [];
      }
      setData(extractedData);
    } catch (err) {
      console.error("Fetch Error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper to extract error message from various API response formats
  const getErrorMessage = (data, defaultMsg) => {
    if (!data) return defaultMsg;
    // Check for explicit error field
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    // Check for field-specific validation errors
    let firstError = null;
    for (const [field, errors] of Object.entries(data)) {
      if (Array.isArray(errors) && errors.length > 0) {
        if (!firstError) firstError = `${field}: ${errors[0]}`;
      }
    }
    return firstError || defaultMsg;
  };

  // Generic Create
  const createItem = async (createEndpoint, payload) => {
    try {
      const res = await api.post(createEndpoint, payload);
      await fetchData(); // Auto-refresh
      return { success: true, data: res.data };
    } catch (err) {
      console.error("Create Error:", err.response?.data || err.message);
      const errorMsg = getErrorMessage(err.response?.data, "Creation failed");
      return { success: false, error: errorMsg || "Creation failed" };
    }
  };

  // Generic Update
  const updateItem = async (updateEndpoint, payload) => {
    try {
      const res = await api.put(updateEndpoint, payload);
      await fetchData(); // Auto-refresh
      return { success: true, data: res.data };
    } catch (err) {
      console.error("Update Error:", err.response?.data || err.message);
      const errorMsg = getErrorMessage(err.response?.data, "Update failed");
      return { success: false, error: errorMsg || "Update failed" };
    }
  };

  // Generic Delete
  const deleteItem = async (deleteEndpoint) => {
    try {
      await api.delete(deleteEndpoint);
      await fetchData(); // Auto-refresh
      return { success: true };
    } catch (err) {
      console.error("Delete Error:", err.response?.data || err.message);
      const errorMsg = getErrorMessage(err.response?.data, "Delete failed");
      return { success: false, error: errorMsg || "Delete failed" };
    }
  };

  return {
    data,
    loading,
    refresh: fetchData,
    createItem,
    updateItem,
    deleteItem
  };
};
