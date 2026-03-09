import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api, { get_domain } from "../../utils/domain"; 
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";

export const domain = get_domain();
export const API_BASE = `${domain}/api/`;

export const useCrud = (endpoint) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoint);
      let result = [];
      if (Array.isArray(res.data)) result = res.data;
      else if (res.data?.results) result = res.data.results;
      else {
        const dynamicKey = Object.keys(res.data).find(key => Array.isArray(res.data[key]));
        result = dynamicKey ? res.data[dynamicKey] : [];
      }
      setData(result);
    } catch (error) {
      if (error.response?.status === 401) navigate("/admin/login");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, navigate]);

  useEffect(() => { refresh(); }, [refresh]);

  const createItem = async (ep, payload) => {
    try {
      const res = await api.post(ep, payload);
      await refresh();
      return { success: true, data: res.data };
    } catch (err) { 
      return { 
        success: false, 
        error: err.response?.data || err.response?.message || "Error" 
      }; 
    }
  };

  const updateItem = async (ep, payload) => {
    try {
      const res = await api.put(ep, payload);
      await refresh();
      return { success: true, data: res.data };
    } catch (err) { 
      return { 
        success: false, 
        error: err.response?.data || err.response?.message || "Error" 
      }; 
    }
  };

  const deleteItem = async (ep) => {
    try {
      await api.delete(ep);
      await refresh();
      return { success: true };
    } catch (err) { 
      return { 
        success: false, 
        error: err.response?.data || err.response?.message || "Error" 
      }; 
    }
  };

  return { data, loading, refresh, createItem, updateItem, deleteItem };
};

export const useTable = (data, initialItemsPerPage = 10) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const filteredData = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter(item => 
      Object.values(item).some(v => String(v).toLowerCase().includes(s))
    );
  }, [data, search]);

  const effectiveItemsPerPage = itemsPerPage >= 9999 ? (filteredData.length || 1) : itemsPerPage;
  const totalPages = Math.ceil(filteredData.length / effectiveItemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * effectiveItemsPerPage, currentPage * effectiveItemsPerPage);

  return { 
    search, setSearch, 
    currentPage, setCurrentPage, 
    itemsPerPage, setItemsPerPage, 
    filteredData, paginatedData, 
    totalPages, effectiveItemsPerPage 
  };
};

export const TableToolbar = ({ itemsPerPage, setItemsPerPage, search, setSearch, setCurrentPage }) => (
  <div className="table-toolbar">
    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
      <span>Show</span>
      <select 
        className="px-2 py-1 border rounded bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer" 
        value={itemsPerPage >= 9999 ? "all" : itemsPerPage} 
        onChange={(e) => { 
          setItemsPerPage(e.target.value === "all" ? 9999 : Number(e.target.value)); 
          setCurrentPage(1); 
        }}
      >
        {[5, 10, 25, 50].map(v => <option key={v} value={v}>{v}</option>)}
        <option value="all">All</option>
      </select>
      <span>entries</span>
    </div>

    <div className="relative group">
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
      <input 
        type="text"
        className="w-full sm:w-72 pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
        value={search} 
        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
        placeholder="Search..."
      />
    </div>
  </div>
);

export const Pagination = ({ totalEntries, itemsPerPage, currentPage, setCurrentPage, totalPages }) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const safeTotalPages = Math.max(Number(totalPages) || 1, 1);

  return (
    <div className="pagination-container">
      <div className="text-sm font-medium text-gray-500">
        Showing <span className="text-black font-bold">{totalEntries === 0 ? 0 : startIndex + 1}</span> to{" "}
        <span className="text-black font-bold">{Math.min(startIndex + itemsPerPage, totalEntries)}</span> of{" "}
        <span className="text-black font-bold">{totalEntries}</span> entries
      </div>

      <nav className="pagination-nav">
        <button 
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
          disabled={currentPage === 1} 
          className="pagination-btn rounded-l-md disabled:opacity-30"
        >
          <FaChevronLeft size={10} />
        </button>
        
        {Array.from({ length: safeTotalPages }, (_, i) => i + 1).map((page) => (
          <button 
            key={page} 
            onClick={() => setCurrentPage(page)} 
            className={`pagination-btn ${
              currentPage === page 
              ? "pagination-btn-active" 
              : "text-gray-900"
            }`}
          >
            {page}
          </button>
        ))}

        <button 
          onClick={() => setCurrentPage(p => Math.min(p + 1, safeTotalPages))} 
          disabled={currentPage === safeTotalPages} 
          className="pagination-btn rounded-r-md disabled:opacity-30"
        >
          <FaChevronRight size={10} />
        </button>
      </nav>
    </div>
  );
};