import React, { useState, useEffect } from "react";
import api from "../../utils/domain"; 
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';

const ModuleMst = () => {
  /* ================= DATA FETCHING ================= */
  const MODULE_PATH = "engine-module";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${MODULE_PATH}/`);
  
  const [userTypes, setUserTypes] = useState([]);
  const [permissionsData, setPermissionsData] = useState({});
  const [urlOptions, setUrlOptions] = useState([]); 

  /* ================= UI STATES ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showUrlDropdown, setShowUrlDropdown] = useState(false);
  const [urlSearchTerm, setUrlSearchTerm] = useState(""); 

  const [formData, setFormData] = useState({ 
    module_code: "", 
    module_name: "", 
    url: "", 
    icon: "", 
    sequence: "",
    status: 1 
  });
  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

  /* ================= TABLE LOGIC ================= */
  const { 
    search, setSearch, 
    currentPage, setCurrentPage, 
    itemsPerPage, setItemsPerPage, 
    paginatedData, 
    effectiveItemsPerPage, 
    filteredData,
    totalPages 
  } = useTable(data);

  /* ================= EFFECTS ================= */
  useEffect(() => {
    fetchUserTypes();
    fetchAvailableUrls(); 
  }, []);

  useEffect(() => {
    if (isEdit && formData.module_code) {
      fetchModulePermissions(formData.module_code);
    }
  }, [isEdit, formData.module_code]);

  /* Add this inside your component */
const fetchAvailableUrls = async () => {
  try {
    const response = await api.get("available_urls/"); 
    // This will now show all URLs currently registered in your Engine tables
    setUrlOptions(response.data || []);
  } catch (error) {
    console.error("Error fetching engine URLs:", error);
  }
};

/* Use this in your form JSX */
<div className="space-y-1 relative">
  <label className="text-xs font-bold text-gray-500 uppercase">Navigation URL</label>
  <div 
    className="w-full border rounded-lg p-2.5 flex justify-between items-center cursor-pointer bg-gray-50 hover:bg-white border-gray-200 transition-all"
    onClick={() => setShowUrlDropdown(!showUrlDropdown)}
  >
    <span className={formData.url ? "text-gray-900" : "text-gray-400"}>
      {formData.url || "Select Existing Path"}
    </span>
    <FaChevronDown size={10} className={`transition-transform ${showUrlDropdown ? 'rotate-180' : ''}`} />
  </div>

  {showUrlDropdown && (
    <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="p-2 border-b bg-gray-50 flex items-center gap-2">
        <FaSearch className="text-gray-400" size={12} />
        <input 
          className="w-full bg-transparent outline-none text-sm" 
          placeholder="Search registered engine paths..." 
          value={urlSearchTerm}
          onChange={(e) => setUrlSearchTerm(e.target.value)}
        />
      </div>
      <div className="max-h-48 overflow-y-auto">
        {urlOptions
          .filter(u => u.label.toLowerCase().includes(urlSearchTerm.toLowerCase()) || u.value.toLowerCase().includes(urlSearchTerm.toLowerCase()))
          .map(u => (
            <div 
              key={u.value} 
              className="px-4 py-3 hover:bg-green-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0"
              onClick={() => { 
                setFormData({...formData, url: u.value}); 
                setShowUrlDropdown(false); 
              }}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700 text-sm">{u.label}</span>
                <span className="text-[10px] font-mono text-gray-400">{u.value}</span>
              </div>
            </div>
          ))}
          {urlOptions.length === 0 && (
            <div className="p-4 text-center text-xs text-gray-400">No paths found in Engine Tables</div>
          )}
      </div>
    </div>
  )}
</div>

  const fetchUserTypes = async () => {
    try {
      const response = await api.get("usertypes/"); 
      const incomingData = response.data.results || response.data;
      if (Array.isArray(incomingData)) setUserTypes(incomingData);
    } catch (error) {
      console.error("Error fetching user types:", error);
    }
  };

  const fetchModulePermissions = async (code) => {
    try {
      const response = await api.get(`${MODULE_PATH}/permissions/${code}/`);
      setPermissionsData(response.data || {});
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setPermissionsData({});
    }
  };

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedModule(null);
    setUrlSearchTerm("");
    setShowUrlDropdown(false);
    setPermissionsData({});
    setFormData({ module_code: "", module_name: "", url: "", icon: "", sequence: "", status: 1 });
  };

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  /* ================= CRUD OPERATIONS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.url) {
        showModal("Navigation URL is required", "error");
        return;
    }

    const finalPayload = { ...formData, ...permissionsData };
    const actionPath = isEdit 
      ? `${MODULE_PATH}/update/${formData.module_code}/` 
      : `${MODULE_PATH}/create/`;

    const result = isEdit 
      ? await updateItem(actionPath, finalPayload)
      : await createItem(actionPath, finalPayload);

    if (result.success) {
      showModal(`Module ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedModule) return;
    const result = await deleteItem(`${MODULE_PATH}/delete/${selectedModule.module_code}/`);
    if (result.success) {
      showModal("Module deleted successfully!");
      setSelectedModule(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Engine Modules...</p>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-body">
              <div className="modal-icon-container">
                {modal.type === "success" 
                  ? <div className="modal-icon-success"><FaCheckCircle /></div> 
                  : <div className="modal-icon-error"><FaTimesCircle /></div>
                }
              </div>
              <h3 className={`modal-title ${modal.type === "success" ? "modal-title-success" : "modal-title-error"}`}>
                {modal.type === "success" ? "Success" : "Error"}
              </h3>
              <p className="modal-message mb-6">{modal.message}</p>
              <button className="btn-primary w-full" onClick={() => setModal({ ...modal, visible: false })}>OK</button>
            </div>
          </div>
        </div>
      )}

      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">Module Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus size={14} /> Add New</button>
            {selectedModule && (
              <div className="flex items-center gap-2">
                <button className="btn-warning" onClick={() => { setFormData({...selectedModule}); setIsEdit(true); setShowForm(true); }}><FaEdit size={14} /> Edit</button>
                <button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="form-container">
          <h6 className="text-lg font-bold text-gray-800 mb-6">{isEdit ? "Update Module Profile" : "Add New Module"}</h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">Module Code</label>
              <input className={`form-input ${isEdit ? "form-input-disabled" : ""}`} value={formData.module_code} disabled={isEdit} required onChange={e => setFormData({ ...formData, module_code: e.target.value.toUpperCase() })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Module Name</label>
              <input className="form-input" value={formData.module_name} required onChange={e => setFormData({ ...formData, module_name: e.target.value })} />
            </div>

            {/* DYNAMIC URL DROPDOWN */}
            <div className="space-y-1.5 relative">
              <label className="form-label">URL Path</label>
              <div className="form-input flex justify-between items-center cursor-pointer bg-white" onClick={() => setShowUrlDropdown(!showUrlDropdown)}>
                <span className={formData.url ? "text-gray-800" : "text-gray-400"}>{formData.url || "Select Navigation Path"}</span>
                {showUrlDropdown ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              </div>
              {showUrlDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                    <div className="p-2 border-b bg-gray-50 flex items-center gap-2">
                        <FaSearch className="text-gray-400" size={12} />
                        <input type="text" className="w-full bg-transparent border-none text-sm outline-none" placeholder="Search system path..." value={urlSearchTerm} onChange={(e) => setUrlSearchTerm(e.target.value)} />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {urlOptions.filter(u => u.label.toLowerCase().includes(urlSearchTerm.toLowerCase()) || u.value.toLowerCase().includes(urlSearchTerm.toLowerCase())).map(u => (
                            <div key={u.value} className="px-4 py-2 text-sm hover:bg-green-50 cursor-pointer flex justify-between items-center" onClick={() => { setFormData({...formData, url: u.value}); setShowUrlDropdown(false); }}>
                                <span className="font-medium">{u.label}</span>
                                <span className="text-[10px] text-gray-400 font-mono">{u.value}</span>
                            </div>
                        ))}
                        {urlOptions.length === 0 && <div className="p-4 text-center text-xs text-gray-400 italic">No system paths found</div>}
                    </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Icon Class</label>
              <input className="form-input" value={formData.icon} placeholder="bi bi-list" onChange={e => setFormData({ ...formData, icon: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Sequence</label>
              <input className="form-input" type="number" value={formData.sequence} onChange={e => setFormData({ ...formData, sequence: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select className="form-input" value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 mt-4">
              <h6 className="text-sm font-bold text-green-700 mb-3 uppercase tracking-wider">Role-Based Permissions</h6>
              <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-gray-50/50">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">User Role</th>
                      <th className="px-4 py-3 text-center">All</th>
                      <th className="px-4 py-3 text-center">Read</th>
                      <th className="px-4 py-3 text-center">Write</th>
                      <th className="px-4 py-3 text-center">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userTypes.map((utype) => {
                      const uId = utype.usertype_id;
                      const isAllChecked = permissionsData[`readPermission${uId}`] === "Yes" &&
                                           permissionsData[`writePermission${uId}`] === "Yes" &&
                                           permissionsData[`updatePermission${uId}`] === "Yes";
                      return (
                        <tr key={uId} className="hover:bg-white transition-colors">
                          <td className="px-4 py-3 font-semibold text-gray-700">{utype.usertype_name}</td>
                          <td className="px-4 py-3 text-center">
                            <input type="checkbox" className="form-checkbox h-4 w-4 text-green-600 rounded" checked={isAllChecked}
                              onChange={(e) => {
                                const val = e.target.checked ? "Yes" : "No";
                                setPermissionsData(p => ({...p, [`readPermission${uId}`]: val, [`writePermission${uId}`]: val, [`updatePermission${uId}`]: val }));
                              }} 
                            />
                          </td>
                          {['read', 'write', 'update'].map(type => (
                            <td key={type} className="px-4 py-3 text-center">
                              <input type="checkbox" className="form-checkbox h-4 w-4 text-green-600 rounded" checked={permissionsData[`${type}Permission${uId}`] === "Yes"}
                                onChange={(e) => setPermissionsData(p => ({...p, [`${type}Permission${uId}`]: e.target.checked ? "Yes" : "No"}))}
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
              <button className="btn-primary px-10">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="data-table-container">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header-row">
                  <th className="table-th w-16"></th>
                  <th className="table-th">Code</th>
                  <th className="table-th">Module Name</th>
                  <th className="table-th">Endpoint</th>
                  <th className="table-th text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.map((m) => (
                  <tr key={m.module_code} onClick={() => setSelectedModule(selectedModule?.module_code === m.module_code ? null : m)} 
                      className={`table-row ${selectedModule?.module_code === m.module_code ? "table-row-active" : "table-row-hover"}`}>
                    <td className="table-td text-center">
                        <div className={`selection-indicator ${selectedModule?.module_code === m.module_code ? "selection-indicator-active" : "selection-indicator-inactive"}`}>
                            {selectedModule?.module_code === m.module_code && <div className="selection-dot" />}
                        </div>
                    </td>
                    <td className="table-td text-admin-id">{m.module_code}</td>
                    <td className="table-td font-medium">{m.module_name}</td>
                    <td className="table-td text-gray-500 italic text-xs">{m.url || 'N/A'}</td>
                    <td className="table-td text-center">
                      <span className={`badge ${m.status === 1 ? 'badge-success' : 'bg-red-50 text-red-600'}`}>
                        {m.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
};

export default ModuleMst;