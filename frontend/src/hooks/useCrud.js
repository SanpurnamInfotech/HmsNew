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

  // Generic Create
  const createItem = async (createEndpoint, payload) => {
    try {
      const res = await api.post(createEndpoint, payload);
      await fetchData(); // Auto-refresh
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Creation failed" };
    }
  };

  // Generic Update
  const updateItem = async (updateEndpoint, payload) => {
    try {
      const res = await api.put(updateEndpoint, payload);
      await fetchData(); // Auto-refresh
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Update failed" };
    }
  };

  // Generic Delete
  const deleteItem = async (deleteEndpoint) => {
    try {
      await api.delete(deleteEndpoint);
      await fetchData(); // Auto-refresh
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Delete failed" };
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
