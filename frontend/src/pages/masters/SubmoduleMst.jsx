import React, { useState, useEffect } from "react";
import api from "../../utils/domain"; 
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';

const SubmoduleMst = () => {
  /* ================= DATA FETCHING ================= */
  const SUBMODULE_PATH = "engine-submodule";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${SUBMODULE_PATH}/`);
  
  const [modules, setModules] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [permissionsData, setPermissionsData] = useState({});
  const [urlOptions, setUrlOptions] = useState([]); 

  /* ================= UI STATES ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedSubmodule, setSelectedSubmodule] = useState(null);
  const [showUrlDropdown, setShowUrlDropdown] = useState(false);
  const [urlSearchTerm, setUrlSearchTerm] = useState(""); 
  
  const [formData, setFormData] = useState({
    module_code: "",
    submodule_code: "",
    submodule_name: "",
    url: "",
    icon: "",
    sequence: "",
    status: 1,
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
    fetchModules();
    fetchUserTypes();
    fetchNavigationUrls();
  }, []);

  // Fetch permissions using the Universal View format
  useEffect(() => {
    if (isEdit && formData.submodule_code && formData.module_code) {
      fetchSubmodulePermissions();
    }
  }, [isEdit, formData.submodule_code, formData.module_code]);

  /* ================= API CALLS ================= */
  const fetchModules = async () => {
    try {
      const res = await api.get("engine-module/");
      const moduleData = res.data.results || (Array.isArray(res.data) ? res.data : []);
      setModules(moduleData);
    } catch (err) { console.error("Module fetch error:", err); }
  };

  const fetchUserTypes = async () => {
    try {
      const response = await api.get("usertypes/"); 
      const incomingData = response.data.results || response.data;
      if (Array.isArray(incomingData)) setUserTypes(incomingData);
    } catch (error) { console.error("UserType fetch error:", error); }
  };

  const fetchNavigationUrls = async () => {
    try {
      const response = await api.get("available_urls/"); 
      setUrlOptions(response.data || []);
    } catch (error) { console.error("Error fetching engine URLs:", error); }
  };

  const fetchSubmodulePermissions = async () => {
    try {
      // Corrected to use the Universal view with Query Params
      const { module_code, submodule_code } = formData;
      const response = await api.get(`universal-permissions/?module=${module_code}&submodule=${submodule_code}`);
      setPermissionsData(response.data || {});
    } catch (error) { setPermissionsData({}); }
  };

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedSubmodule(null);
    setPermissionsData({});
    setUrlSearchTerm("");
    setShowUrlDropdown(false);
    setFormData({ module_code: "", submodule_code: "", submodule_name: "", url: "", icon: "", sequence: "", status: 1 });
  };

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  /* ================= CRUD OPERATIONS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalPayload = { ...formData, ...permissionsData };
    const actionPath = isEdit 
      ? `${SUBMODULE_PATH}/update/${formData.submodule_code}/` 
      : `${SUBMODULE_PATH}/create/`;

    const result = isEdit ? await updateItem(actionPath, finalPayload) : await createItem(actionPath, finalPayload);

    if (result.success) {
      showModal(`Submodule ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedSubmodule) return;
    if (!window.confirm("Are you sure you want to delete this submodule?")) return;
    
    const result = await deleteItem(`${SUBMODULE_PATH}/delete/${selectedSubmodule.submodule_code}/`);
    if (result.success) {
      showModal("Submodule deleted successfully!");
      setSelectedSubmodule(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner-container text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-emerald-700 font-bold">Synchronizing Engine...</p>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {/* NOTIFICATION MODAL */}
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-body text-center p-6">
              <div className="mb-4">
                {modal.type === "success" ? (
                  <FaCheckCircle size={50} className="text-emerald-500 mx-auto" />
                ) : (
                  <FaTimesCircle size={50} className="text-red-500 mx-auto" />
                )}
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
        <div>
          <h4 className="text-xl font-bold text-gray-800">Submodule Master</h4>
        </div>
        {!showForm && (
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-emerald-100" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>
            {selectedSubmodule && (
              <div className="flex gap-2 animate-in slide-in-from-right-5">
                <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md" onClick={() => { setFormData({...selectedSubmodule}); setIsEdit(true); setShowForm(true); }}>
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

      {/* FORM */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 animate-in zoom-in-95 duration-200">
          <h6 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">{isEdit ? "Update Submodule Profile" : "Create New Submodule"}</h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Submodule Code</label>
              <input className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${isEdit ? 'bg-gray-50 text-gray-400' : ''}`} value={formData.submodule_code} disabled={isEdit} required onChange={e => setFormData({ ...formData, submodule_code: e.target.value.toUpperCase().replace(/\s/g, '_') })} placeholder="E.G. SUB_USER_LST"/>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Submodule Name</label>
              <input className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" value={formData.submodule_name} required onChange={e => setFormData({ ...formData, submodule_name: e.target.value })} placeholder="E.G. User List View" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Parent Module</label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none" value={formData.module_code} required onChange={e => setFormData({ ...formData, module_code: e.target.value })}>
                <option value="">Select Parent Engine</option>
                {modules.map(m => <option key={m.module_code} value={m.module_code}>{m.module_name}</option>)}
              </select>
            </div>

            {/* SEARCHABLE URL DROPDOWN */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Navigation URL</label>
              <div className="w-full px-4 py-3 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer bg-white" onClick={() => setShowUrlDropdown(!showUrlDropdown)}>
                <span className={formData.url ? "text-gray-800" : "text-gray-400"}>{formData.url || "Select Path"}</span>
                {showUrlDropdown ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              </div>
              {showUrlDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b bg-gray-50 flex items-center gap-2">
                    <FaSearch className="text-gray-400" size={12} />
                    <input autoFocus className="w-full bg-transparent text-sm outline-none" placeholder="Search Paths..." value={urlSearchTerm} onChange={e => setUrlSearchTerm(e.target.value)} />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {urlOptions.filter(u => (u.label || "").toLowerCase().includes(urlSearchTerm.toLowerCase())).map(u => (
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
              <input className="w-full px-4 py-3 rounded-lg border border-gray-200" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="bi bi-list" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Sequence</label>
              <input className="w-full px-4 py-3 rounded-lg border border-gray-200" type="number" value={formData.sequence} onChange={e => setFormData({ ...formData, sequence: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Status</label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none" value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            {/* PERMISSIONS MATRIX */}
            <div className="md:col-span-2 mt-4">
              <h6 className="text-sm font-bold text-emerald-700 mb-3 uppercase tracking-wider">Submodule Permissions</h6>
              <div className="overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/30">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100/50 text-gray-400 text-[10px] uppercase font-black">
                    <tr>
                      <th className="px-6 py-4">User Type / Role</th>
                      <th className="px-4 py-4 text-center">Full Access</th>
                      <th className="px-4 py-4 text-center">Read</th>
                      <th className="px-4 py-4 text-center">Write</th>
                      <th className="px-4 py-4 text-center">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userTypes.map((utype) => {
                      const uId = utype.usertype_code;
                      const isAllChecked = 
                        permissionsData[`readPermission${uId}`] === "Yes" && 
                        permissionsData[`writePermission${uId}`] === "Yes" && 
                        permissionsData[`updatePermission${uId}`] === "Yes";

                      return (
                        <tr key={uId} className="hover:bg-white transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-700">{utype.usertype_name}</td>
                          <td className="px-4 py-4 text-center">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded text-emerald-600 cursor-pointer" 
                              checked={isAllChecked}
                              onChange={(e) => {
                                const val = e.target.checked ? "Yes" : "No";
                                setPermissionsData(prev => ({
                                  ...prev, 
                                  [`readPermission${uId}`]: val, 
                                  [`writePermission${uId}`]: val, 
                                  [`updatePermission${uId}`]: val 
                                }));
                              }} 
                            />
                          </td>
                          {['read', 'write', 'update'].map(permType => (
                            <td key={permType} className="px-4 py-4 text-center">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded text-emerald-600 cursor-pointer" 
                                checked={permissionsData[`${permType}Permission${uId}`] === "Yes"}
                                onChange={(e) => setPermissionsData(prev => ({
                                  ...prev, 
                                  [`${permType}Permission${uId}`]: e.target.checked ? "Yes" : "No"
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
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-emerald-100">
                {isEdit ? "Update " : "Save"}
              </button>
              <button type="button" className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-700" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE VIEW */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header-row">
                  <th className="table-th w-16"></th>
                  <th className="table-th">Submodule Code</th>
                  <th className="table-th">Submodule Name</th>
                  <th className="table-th">Module Name</th>
                  <th className="table-th">Endpoint</th>
                  <th className="table-th text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.map((s) => (
                  <tr key={s.submodule_code} onClick={() => setSelectedSubmodule(selectedSubmodule?.submodule_code === s.submodule_code ? null : s)} 
                      className={`group cursor-pointer transition-colors duration-150 ${selectedSubmodule?.submodule_code === s.submodule_code ? "bg-emerald-50/40" : "hover:bg-gray-50/50"}`}>
                    <td className="px-6 py-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedSubmodule?.submodule_code === s.submodule_code ? "border-emerald-500 bg-emerald-500" : "border-gray-200 group-hover:border-emerald-300"}`}>
                            {selectedSubmodule?.submodule_code === s.submodule_code && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                    </td>
                    <td className="table-td text-admin-id">{s.submodule_code}</td>
                    <td className="table-td font-medium text-gray-800">{s.submodule_name}</td>
                    <td className="table-td text-gray-500">{s.module_code}</td>
                    <td className="table-td text-gray-400 text-xs italic">{s.url || 'N/A'}</td>
                    <td className="table-td text-center">
                      <span className={`badge ${s.status === 1 ? 'badge-success' : 'badge-danger'}`}>
                        {s.status === 1 ? 'Active' : 'Inactive'}
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

export default SubmoduleMst;