import React, { useState, useEffect, useMemo } from "react";
import api from "../../utils/domain"; 
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
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
  // Senior Dev Tip: We sort the data here before passing it to useTable 
  // to ensure 'sequence' is respected regardless of backend behavior.
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const seqA = parseInt(a.sequence) || 999; // Default high number if empty
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
    
    // Removed the "URL is required" check to make it optional as requested
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
    // if (!window.confirm("Are you sure you want to delete this module?")) return;
    
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
    <div className="flex items-center justify-center min-h-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="app-container">
      {/* MODAL */}
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-body text-center p-6">
              <div className="mb-4">
                {modal.type === "success" 
                  ? <FaCheckCircle className="text-emerald-500 text-5xl mx-auto" /> 
                  : <FaTimesCircle className="text-red-500 text-5xl mx-auto" />
                }
              </div>
              <h3 className={`text-xl font-bold mb-2 ${modal.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
                {modal.type === "success" ? "Success" : "Error"}
              </h3>
              <p className="text-gray-600 mb-6">{modal.message}</p>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2.5 rounded-lg font-semibold" onClick={() => setModal({ ...modal, visible: false })}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <h4 className="text-xl font-bold text-gray-800">Module Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>
            {selectedModule && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md" onClick={() => { setFormData({...selectedModule}); setIsEdit(true); setShowForm(true); }}>
                  <FaEdit size={14} /> Edit
                </button>
                <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md" onClick={handleDelete}>
                  <FaTrash size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 animate-in zoom-in-95 duration-200">
          <h6 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">{isEdit ? "Update Module Profile" : "Add New Module"}</h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Module Code</label>
              <input 
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${isEdit ? "bg-gray-50 text-gray-400" : ""}`} 
                value={formData.module_code} 
                disabled={isEdit} 
                required 
                onChange={e => setFormData({ ...formData, module_code: e.target.value.toUpperCase().replace(/\s/g, '_') })} 
                placeholder="E.G. MOD_HR_SYSTEM"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Module Name</label>
              <input className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" value={formData.module_name} required onChange={e => setFormData({ ...formData, module_name: e.target.value })} placeholder="E.G. Human Resources" />
            </div>

            {/* URL SELECTOR - Optional */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">URL Path (Optional)</label>
              <div className="w-full px-4 py-3 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer bg-white" onClick={() => setShowUrlDropdown(!showUrlDropdown)}>
                <span className={formData.url ? "text-gray-800" : "text-gray-400"}>{formData.url || "Select Navigation Path"}</span>
                <div className="flex items-center gap-2">
                   {formData.url && <FaTimesCircle className="text-gray-300 hover:text-red-400" onClick={(e) => { e.stopPropagation(); setFormData({...formData, url: ""}); }} />}
                   {showUrlDropdown ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </div>
              </div>
              {showUrlDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b bg-gray-50 flex items-center gap-2">
                        <FaSearch className="text-gray-400" size={12} />
                        <input type="text" autoFocus className="w-full bg-transparent border-none text-sm outline-none" placeholder="Search path..." value={urlSearchTerm} onChange={(e) => setUrlSearchTerm(e.target.value)} />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {urlOptions.filter(u => u.label.toLowerCase().includes(urlSearchTerm.toLowerCase())).map(u => (
                            <div key={u.value} className="px-4 py-3 text-sm hover:bg-emerald-50 cursor-pointer border-b border-gray-50 last:border-0" onClick={() => { setFormData({...formData, url: u.value}); setShowUrlDropdown(false); }}>
                                <div className="font-bold text-gray-700">{u.label}</div>
                                <div className="text-[10px] text-gray-400 font-mono italic">{u.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Icon Class</label>
              <input className="w-full px-4 py-3 rounded-lg border border-gray-200" value={formData.icon} placeholder="bi bi-list" onChange={e => setFormData({ ...formData, icon: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Sequence (Optional)</label>
              <input className="w-full px-4 py-3 rounded-lg border border-gray-200" type="number" value={formData.sequence} placeholder="E.G. 1" onChange={e => setFormData({ ...formData, sequence: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Status</label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-200 appearance-none" value={formData.status} onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            {/* PERMISSIONS SECTION */}
            <div className="md:col-span-2 mt-4">
              <h6 className="text-sm font-bold text-emerald-700 mb-3 uppercase tracking-wider">Module Permissions</h6>
              <div className="overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/30">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100/50 text-gray-400 text-[10px] uppercase font-black">
                    <tr>
                      <th className="px-6 py-4">User Role</th>
                      <th className="px-4 py-4 text-center">Full Access</th>
                      <th className="px-4 py-4 text-center">Read</th>
                      <th className="px-4 py-4 text-center">Write</th>
                      <th className="px-4 py-4 text-center">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userTypes.map((utype) => {
                      const uCode = utype.usertype_code; 
                      const isAllChecked = 
                        permissionsData[`readPermission${uCode}`] === "Yes" &&
                        permissionsData[`writePermission${uCode}`] === "Yes" &&
                        permissionsData[`updatePermission${uCode}`] === "Yes";

                      return (
                        <tr key={uCode} className="hover:bg-white transition-colors">
                          <td className="text-admin-td">{utype.usertype_code}</td>
                          <td className="px-4 py-4 text-center">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded text-emerald-600 cursor-pointer" 
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
                                className="w-4 h-4 rounded text-emerald-600 cursor-pointer" 
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

            <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-2.5 rounded-lg text-sm font-bold shadow-lg">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE SECTION */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 w-16"></th>
                  <th className="text-admin-th">Code</th>
                  <th className="text-admin-th">Module Name</th>
                  <th className="text-admin-th">Endpoint</th>
                  {/* <th className="text-admin-th text-center">Sequence</th> */}
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.map((m) => (
                  <tr key={m.module_code} onClick={() => setSelectedModule(selectedModule?.module_code === m.module_code ? null : m)} 
                      className={`group cursor-pointer transition-colors ${selectedModule?.module_code === m.module_code ? "bg-emerald-50/40" : "hover:bg-gray-50/50"}`}>
                    <td className="px-6 py-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedModule?.module_code === m.module_code ? "border-emerald-500 bg-emerald-500" : "border-gray-200 group-hover:border-emerald-300"}`}>
                            {selectedModule?.module_code === m.module_code && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                    </td>
                    <td className="text-admin-td">{m.module_code}</td>
                    <td className="text-admin-td">{m.module_name}</td>
                    <td className="text-admin-td">{m.url || 'N/A'}</td>
                    {/* <td className="text-admin-td ">{m.sequence || '-'}</td> */}
                    <td className="text-admin-td">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${m.status === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {m.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white border-t border-gray-50 p-6">
            <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleMst;