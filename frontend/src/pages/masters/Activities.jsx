import React, { useState, useEffect, useMemo } from "react";
import api from "../../utils/domain"; 
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaRunning, FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
// Import your central route config
import { adminRoutes } from "../../routes/routeConfig"; 

const Activities = () => {
  /* ================= DATA FETCHING ================= */
  const ACTIVITY_PATH = "engine-activity";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${ACTIVITY_PATH}/`);
  
  const [modules, setModules] = useState([]);
  const [submodules, setSubmodules] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [permissionsData, setPermissionsData] = useState({});
  const [urlOptions, setUrlOptions] = useState([]);

  /* ================= UI STATES ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showUrlDropdown, setShowUrlDropdown] = useState(false);
  const [urlSearchTerm, setUrlSearchTerm] = useState(""); 
  
  const [formData, setFormData] = useState({
    module_code: "",
    submodule_code: "",
    activity_code: "",
    activity_name: "",
    url: "",
    sequence: "",
    status: 1,
  });
  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

  /* ================= SORTING LOGIC ================= */
  // Sorting by sequence number (ascending)
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
    fetchModules();
    fetchSubmodules();
    fetchUserTypes();
    
    // Process local routes into dropdown options
    const formattedRoutes = adminRoutes.map(route => ({
      label: route.label,
      value: `/admin/${route.path}`
    }));
    setUrlOptions(formattedRoutes);
  }, []);

  useEffect(() => {
    if (isEdit && formData.activity_code && formData.module_code && formData.submodule_code) {
      fetchActivityPermissions();
    }
  }, [isEdit, formData.activity_code, formData.module_code, formData.submodule_code]);

  /* ================= API CALLS ================= */
  const fetchModules = async () => {
    try {
      const res = await api.get("engine-module/");
      setModules(res.data.results || (Array.isArray(res.data) ? res.data : []));
    } catch (err) { console.error(err); }
  };

  const fetchSubmodules = async () => {
    try {
      const res = await api.get("engine-submodule/");
      setSubmodules(res.data.results || (Array.isArray(res.data) ? res.data : []));
    } catch (err) { console.error(err); }
  };

  const fetchUserTypes = async () => {
    try {
      const response = await api.get("usertypes/"); 
      const incomingData = response.data.results || response.data;
      if (Array.isArray(incomingData)) setUserTypes(incomingData);
    } catch (error) { console.error(error); }
  };

  const fetchActivityPermissions = async () => {
    try {
      const { module_code, submodule_code, activity_code } = formData;
      const response = await api.get(`universal-permissions/?module=${module_code}&submodule=${submodule_code}&activity=${activity_code}`);
      setPermissionsData(response.data || {});
    } catch (error) { setPermissionsData({}); }
  };

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedActivity(null);
    setPermissionsData({});
    setUrlSearchTerm("");
    setShowUrlDropdown(false);
    setFormData({ module_code: "", submodule_code: "", activity_code: "", activity_name: "", url: "",sequence: "", status: 1 });
  };

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  const availableSubmodules = submodules.filter(sm => sm.module_code === formData.module_code);

  /* ================= CRUD OPERATIONS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.url) {
        showModal("Target URL is required", "error");
        return;
    }

    const finalPayload = { ...formData, ...permissionsData };
    const actionPath = isEdit 
      ? `${ACTIVITY_PATH}/update/${formData.activity_code}/` 
      : `${ACTIVITY_PATH}/create/`;

    const result = isEdit ? await updateItem(actionPath, finalPayload) : await createItem(actionPath, finalPayload);

    if (result.success) {
      showModal(`Activity ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedActivity) return;
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    const result = await deleteItem(`${ACTIVITY_PATH}/delete/${selectedActivity.activity_code}/`);
    if (result.success) {
      showModal("Activity deleted successfully!");
      setSelectedActivity(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;

  return (
    <div className="app-container p-6">
      {/* NOTIFICATION MODAL */}
      {modal.visible && (
        <div className="modal-overlay fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
             <div className="mb-4">
                {modal.type === "success" ? <FaCheckCircle size={50} className="text-green-500 mx-auto" /> : <FaTimesCircle size={50} className="text-red-500 mx-auto" />}
             </div>
             <h3 className={`text-xl font-bold mb-2 ${modal.type === "success" ? "text-green-600" : "text-red-600"}`}>
               {modal.type === "success" ? "Success" : "Error"}
             </h3>
             <p className="text-gray-600 mb-6">{modal.message}</p>
             <button className="bg-green-600 hover:bg-green-700 text-white w-full py-2.5 rounded-lg font-bold" onClick={() => setModal({ ...modal, visible: false })}>OK</button>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
        <h4 className="text-xl font-bold text-gray-800">Activity Master</h4>
        {!showForm && (
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>
            {selectedActivity && (
              <>
                <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all" onClick={() => { setFormData({...selectedActivity}); setIsEdit(true); setShowForm(true); }}><FaEdit size={14} /> Edit</button>
                <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-8 mb-8 border border-gray-100 animate-in slide-in-from-top-4">
          <h6 className="text-lg font-bold mb-6 text-gray-800 border-b pb-4">{isEdit ? "Update Activity" : "Create New Activity"}</h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Activity Code</label>
              <input 
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500/20 outline-none transition-all ${isEdit ? "bg-gray-100 text-gray-500" : "border-gray-200"}`} 
                value={formData.activity_code} 
                disabled={isEdit} 
                required 
                onChange={e => setFormData({ ...formData, activity_code: e.target.value.toUpperCase().replace(/\s/g, '_') })} 
                placeholder="ACT_VIEW_REPORTS"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Activity Name</label>
              <input className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500/20 outline-none" value={formData.activity_name} required onChange={e => setFormData({ ...formData, activity_name: e.target.value })} placeholder="View Monthly Reports" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Parent Module</label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none" value={formData.module_code} required onChange={e => setFormData({ ...formData, module_code: e.target.value, submodule_code: "" })}>
                <option value="">Select Module</option>
                {modules.map(m => <option key={m.module_code} value={m.module_code}>{m.module_name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Submodule</label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none disabled:bg-gray-50" value={formData.submodule_code} required disabled={!formData.module_code} onChange={e => setFormData({ ...formData, submodule_code: e.target.value })}>
                <option value="">Select Submodule</option>
                {availableSubmodules.map(sm => <option key={sm.submodule_code} value={sm.submodule_code}>{sm.submodule_name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-gray-500 uppercase">Target URL (React Route)</label>
              <div className="w-full px-4 py-3 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer bg-white" onClick={() => setShowUrlDropdown(!showUrlDropdown)}>
                <span className={formData.url ? "text-gray-800" : "text-gray-400"}>{formData.url || "Select Route Path"}</span>
                {showUrlDropdown ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              </div>
              {showUrlDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b bg-gray-50 flex items-center gap-2">
                    <FaSearch className="text-gray-400" size={12} />
                    <input autoFocus className="w-full bg-transparent text-sm outline-none" placeholder="Search paths..." value={urlSearchTerm} onChange={e => setUrlSearchTerm(e.target.value)} />
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {urlOptions.filter(u => u.label.toLowerCase().includes(urlSearchTerm.toLowerCase())).map(u => (
                      <div key={u.value} className="px-4 py-3 text-sm hover:bg-green-50 cursor-pointer border-b border-gray-50 last:border-0" onClick={() => { setFormData({...formData, url: u.value}); setShowUrlDropdown(false); }}>
                        <div className="font-bold text-gray-700">{u.label}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{u.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Sequence</label>
              <input className="w-full px-4 py-3 rounded-lg border border-gray-200" type="number" value={formData.sequence} onChange={e => setFormData({ ...formData, sequence: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none" value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            {/* PERMISSIONS MATRIX */}
            <div className="md:col-span-2 mt-4">
              <h6 className="text-sm font-bold text-green-700 mb-3 uppercase tracking-wider">Role-Based Access Control</h6>
              <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-gray-50/50">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-[10px] font-black">
                    <tr>
                      <th className="px-4 py-4">User Role</th>
                      <th className="px-4 py-4 text-center">Full Access</th>
                      <th className="px-4 py-4 text-center">Read</th>
                      <th className="px-4 py-4 text-center">Write</th>
                      <th className="px-4 py-4 text-center">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userTypes.map((utype) => {
                      const uId = utype.usertype_code;
                      const isAll = permissionsData[`readPermission${uId}`] === "Yes" && permissionsData[`writePermission${uId}`] === "Yes" && permissionsData[`updatePermission${uId}`] === "Yes";
                      return (
                        <tr key={uId} className="hover:bg-white transition-colors">
                          <td className="px-4 py-4 font-bold text-gray-700">{utype.usertype_name}</td>
                          <td className="px-4 py-4 text-center">
                            <input type="checkbox" className="w-4 h-4 rounded text-green-600 cursor-pointer" checked={isAll}
                              onChange={(e) => {
                                const val = e.target.checked ? "Yes" : "No";
                                setPermissionsData(p => ({...p, [`readPermission${uId}`]: val, [`writePermission${uId}`]: val, [`updatePermission${uId}`]: val }));
                              }} 
                            />
                          </td>
                          {['read', 'write', 'update'].map(type => (
                            <td key={type} className="px-4 py-4 text-center">
                              <input type="checkbox" className="w-4 h-4 rounded text-green-600 cursor-pointer" checked={permissionsData[`${type}Permission${uId}`] === "Yes"}
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
               <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-12 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all">{isEdit ? "Update Activity" : "Save Activity"}</button>
               <button type="button" className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE SECTION */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 w-16"></th>
                  <th className="text-admin-th">Code</th>
                  <th className="text-admin-th">Activity Name</th>
                  <th className="text-admin-th">Hierarchy (Sub / Mod)</th>
                  {/* <th className="text-admin-th text-center">Sequence</th> */}
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((a) => (
                  <tr 
                    key={a.activity_code} 
                    onClick={() => setSelectedActivity(selectedActivity?.activity_code === a.activity_code ? null : a)} 
                    className={`cursor-pointer transition-colors ${selectedActivity?.activity_code === a.activity_code ? "bg-green-50/50" : "hover:bg-gray-50/50"}`}
                  >
                    <td className="px-6 py-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedActivity?.activity_code === a.activity_code ? "border-green-500 bg-green-500" : "border-gray-200"}`}>
                        {selectedActivity?.activity_code === a.activity_code && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </td>
                    <td className="text-admin-td">{a.activity_code}</td>
                    <td className="text-admin-td">{a.activity_name}</td>
                    <td className="text-admin-td">
                        {a.submodule_code} <span className="text-admin-td">/</span> {a.module_code}
                    </td>
                    {/* <td className="text-admin-td">{a.sequence || '-'}</td> */}
                    <td className="text-admin-td">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${a.status === 1 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {a.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <FaRunning size={40} className="opacity-10" />
                        <p className="font-medium">No records matching your search</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-gray-50">
             <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;