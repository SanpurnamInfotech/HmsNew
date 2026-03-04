import React, { useState, useEffect, useMemo } from "react";
import api from "../../utils/domain"; 
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { 
  FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, 
  FaChevronDown, FaChevronUp, FaSearch, FaLayerGroup 
} from 'react-icons/fa';
import { adminRoutes } from "../../routes/routeConfig";  

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

  /* ================= SORTING LOGIC ================= */
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const seqA = parseInt(a.sequence) || 999;
      const seqB = parseInt(b.sequence) || 999;
      return seqA - seqB;
    });
  }, [data]);

  /* ================= TABLE LOGIC ================= */
  const { 
    search, setSearch, 
    currentPage, setCurrentPage, 
    itemsPerPage, setItemsPerPage, 
    paginatedData, 
    effectiveItemsPerPage, 
    filteredData,
    totalPages 
  } = useTable(sortedData);

  /* ================= EFFECTS ================= */
  useEffect(() => {
    fetchUserTypes();

    const formattedRoutes = adminRoutes.map(route => ({
      label: route.label,
      value: `/admin/${route.path}` 
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

    setUrlOptions(formattedRoutes);
  }, []);

  useEffect(() => {
    if (isEdit && formData.module_code) {
      fetchModulePermissions();
    }
  }, [isEdit, formData.module_code]);

  /* ================= API CALLS ================= */
  const fetchUserTypes = async () => {
    try {
      const response = await api.get("usertypes/"); 
      const incomingData = response.data.results || response.data;
      if (Array.isArray(incomingData)) setUserTypes(incomingData);
    } catch (error) {
      console.error("Error fetching user types:", error);
    }
  };

  const fetchModulePermissions = async () => {
    try {
      const response = await api.get(`universal-permissions/?module=${formData.module_code}`);
      setPermissionsData(response.data || {});
    } catch (error) {
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="app-container">
      {/* SUCCESS/ERROR MODAL */}
      {modal.visible && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? (
                <FaCheckCircle className="text-6xl text-emerald-500" />
              ) : (
                <FaTimesCircle className="text-6xl text-rose-500" />
              )}
            </div>
            
            <h3 className={`text-xl font-black mb-2 uppercase tracking-tight ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            
            <p className="mb-6 font-medium opacity-80">{modal.message}</p>
            
            <button
              className="btn-primary w-full justify-center py-3"
              onClick={() => setModal({ ...modal, visible: false })}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="section-header">
        <h4 className="page-title">Module Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>
            {selectedModule && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="btn-warning" onClick={() => { setFormData({...selectedModule}); setIsEdit(true); setShowForm(true); }}>
                  <FaEdit size={14} /> Edit
                </button>
                <button className="btn-danger" onClick={handleDelete}>
                  <FaTrash size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">{isEdit ? "Update Module Profile" : "Add New Module"}</h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">Module Code</label>
              <input 
                className="form-input w-full" 
                value={formData.module_code} 
                disabled={isEdit} 
                required 
                onChange={e => setFormData({ ...formData, module_code: e.target.value.toUpperCase().replace(/\s/g, '_') })} 
                placeholder="E.G. MOD_HR_SYSTEM"
              />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Module Name</label>
              <input className="form-input w-full" value={formData.module_name} required onChange={e => setFormData({ ...formData, module_name: e.target.value })} placeholder="E.G. Human Resources" />
            </div>

            {/* URL SELECTOR - Fixed for Dark Mode */}
            <div className="space-y-1.5 relative">
              <label className="form-label">URL Path (Optional)</label>
              <div 
                className="form-input w-full flex justify-between items-center cursor-pointer select-none" 
                onClick={() => setShowUrlDropdown(!showUrlDropdown)}
              >
                <span className={formData.url ? "opacity-100" : "opacity-40"}>{formData.url || "Select Navigation Path"}</span>
                <div className="flex items-center gap-2">
                   {formData.url && <FaTimesCircle className="text-rose-400 hover:scale-110 transition-transform" onClick={(e) => { e.stopPropagation(); setFormData({...formData, url: ""}); }} />}
                   {showUrlDropdown ? <FaChevronUp size={12} className="text-emerald-500" /> : <FaChevronDown size={12} />}
                </div>
              </div>

              {/* Dropdown Menu - Linked to CSS variables */}
              {showUrlDropdown && (
                <div className="absolute z-50 w-full mt-2 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-top-2"
                     style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-color)" }}>
                    <div className="p-3 border-b flex items-center gap-3" style={{ backgroundColor: "var(--bg-hover)", borderColor: "var(--border-color)" }}>
                        <FaSearch className="text-emerald-500" size={14} />
                        <input 
                          type="text" 
                          autoFocus 
                          className="w-full bg-transparent border-none text-sm outline-none placeholder:opacity-50" 
                          placeholder="Search routes..." 
                          value={urlSearchTerm} 
                          onChange={(e) => setUrlSearchTerm(e.target.value)} 
                        />
                    </div>
                    <div className="max-h-56 overflow-y-auto custom-scrollbar">
                        {urlOptions.filter(u => u.label.toLowerCase().includes(urlSearchTerm.toLowerCase())).length > 0 ? (
                          urlOptions.filter(u => u.label.toLowerCase().includes(urlSearchTerm.toLowerCase())).map(u => (
                            <div 
                              key={u.value} 
                              className="px-5 py-3 hover:bg-emerald-500/10 cursor-pointer transition-colors border-b last:border-0"
                              style={{ borderColor: "var(--border-color)" }}
                              onClick={() => { setFormData({...formData, url: u.value}); setShowUrlDropdown(false); }}
                            >
                                <div className="text-sm font-bold tracking-tight">{u.label}</div>
                                <div className="text-[10px] opacity-50 font-mono mt-0.5 italic">{u.value}</div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center opacity-40 text-xs italic">No matching routes</div>
                        )}
                    </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Icon Class</label>
              <input className="form-input w-full" value={formData.icon} placeholder="bi bi-list" onChange={e => setFormData({ ...formData, icon: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Sequence (Optional)</label>
              <input className="form-input w-full" type="number" value={formData.sequence} placeholder="E.G. 1" onChange={e => setFormData({ ...formData, sequence: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select className="form-input w-full cursor-pointer appearance-none" style={{ colorScheme: "dark" }} value={formData.status} onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            {/* PERMISSIONS SECTION */}
            <div className="md:col-span-2 mt-4">
              <h6 className="form-label mb-4 block">Module Permissions</h6>
              <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border-color)" }}>
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] uppercase font-black" style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}>
                    <tr>
                      <th className="px-6 py-4">User Role</th>
                      <th className="px-4 py-4 text-center">Full Access</th>
                      <th className="px-4 py-4 text-center">Read</th>
                      <th className="px-4 py-4 text-center">Write</th>
                      <th className="px-4 py-4 text-center">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                    {userTypes.map((utype) => {
                      const uCode = utype.usertype_code; 
                      const isAllChecked = 
                        permissionsData[`readPermission${uCode}`] === "Yes" &&
                        permissionsData[`writePermission${uCode}`] === "Yes" &&
                        permissionsData[`updatePermission${uCode}`] === "Yes";

                      return (
                        <tr key={uCode} className="hover:bg-emerald-500/5 transition-colors">
                          <td className="px-6 py-4 font-bold opacity-90">{uCode}</td>
                          <td className="px-4 py-4 text-center">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer" 
                              checked={isAllChecked}
                              onChange={(e) => {
                                const val = e.target.checked ? "Yes" : "No";
                                setPermissionsData(prev => ({
                                  ...prev, 
                                  [`readPermission${uCode}`]: val, 
                                  [`writePermission${uCode}`]: val, 
                                  [`updatePermission${uCode}`]: val 
                                }));
                              }} 
                            />
                          </td>
                          {['read', 'write', 'update'].map(permType => (
                            <td key={permType} className="px-4 py-4 text-center">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer" 
                                checked={permissionsData[`${permType}Permission${uCode}`] === "Yes"}
                                onChange={(e) => setPermissionsData(prev => ({
                                  ...prev, 
                                  [`${permType}Permission${uCode}`]: e.target.checked ? "Yes" : "No"
                                }))}
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

            <div className="md:col-span-2 flex justify-end gap-3 border-t pt-8 mt-4" style={{ borderColor: "var(--border-color)" }}>
              <button type="submit" className="btn-primary px-12 py-3">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE SECTION */}
      {!showForm && (
        <div className="data-table-container animate-in fade-in duration-500">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">Code</th>
                  <th className="text-admin-th">Module Name</th>
                  <th className="text-admin-th">Endpoint</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map((m) => (
                  <tr 
                    key={m.module_code} 
                    onClick={() => setSelectedModule(selectedModule?.module_code === m.module_code ? null : m)} 
                    className={`group cursor-pointer transition-colors ${selectedModule?.module_code === m.module_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}
                  >
                    <td className="px-6 py-4">
                        <div className={`selection-indicator ${selectedModule?.module_code === m.module_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                            {selectedModule?.module_code === m.module_code && <div className="selection-dot" />}
                        </div>
                    </td>
                    <td className="text-admin-td">{m.module_code}</td>
                    <td className="text-admin-td">{m.module_name}</td>
                    <td className="text-admin-td">{m.url || 'N/A'}</td>
                    <td className="text-admin-td">
                      <span className={`badge ${m.status === 1 ? 'badge-success' : 'badge-danger'}`}>
                        {m.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                      <FaLayerGroup size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No modules found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination-container">
            <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleMst;