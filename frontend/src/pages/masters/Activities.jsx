import React, { useState, useEffect } from "react";
import api from "../../utils/domain"; 
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaRunning, FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';

const Activities = () => {
  /* ================= DATA FETCHING ================= */
  const ACTIVITY_PATH = "engine-activity";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${ACTIVITY_PATH}/`);
  
  const [modules, setModules] = useState([]);
  const [submodules, setSubmodules] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [permissionsData, setPermissionsData] = useState({});

  /* ================= URL OPTIONS ================= */
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
    fetchSubmodules();
    fetchUserTypes();
    fetchAvailableUrls(); // Add this line to fetch dynamic URLs
  }, []);

  useEffect(() => {
    if (isEdit && formData.activity_code) {
      fetchActivityPermissions(formData.activity_code);
    }
  }, [isEdit, formData.activity_code]);

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

  const fetchActivityPermissions = async (code) => {
    try {
      const response = await api.get(`${ACTIVITY_PATH}/permissions/${code}/`);
      setPermissionsData(response.data || {});
    } catch (error) { setPermissionsData({}); }
  };

  const fetchAvailableUrls = async () => {
    try {
      const response = await api.get("available-urls/"); 
      // Format the response to match the expected structure
      const formattedUrls = response.data.map(item => ({
        label: item.label,
        value: item.value.startsWith('/') ? item.value : `/${item.value}`
      }));
      setUrlOptions(formattedUrls);
    } catch (error) {
      console.error("Error fetching dynamic URLs:", error);
      // Fallback to some common URLs if API fails
      setUrlOptions([
        { label: "Dashboard", value: "/admin/dashboard" },
        { label: "Countries", value: "/admin/countries" },
        { label: "Module Master", value: "/admin/moduleMst" },
        { label: "Submodule Master", value: "/admin/submoduleMst" },
        { label: "Activities", value: "/admin/activities" }
      ]);
    }
  };

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedActivity(null);
    setPermissionsData({});
    setUrlSearchTerm("");
    setShowUrlDropdown(false);
    setFormData({ module_code: "", submodule_code: "", activity_code: "", activity_name: "", url: "", status: 1 });
  };

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  const availableSubmodules = submodules.filter(sm => sm.module_code === formData.module_code);

  /* ================= CRUD OPERATIONS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
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
    const result = await deleteItem(`${ACTIVITY_PATH}/delete/${selectedActivity.activity_code}/`);
    if (result.success) {
      showModal("Activity deleted successfully!");
      setSelectedActivity(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return <div className="loading-overlay"><div className="loading-spinner"></div></div>;

  return (
    <div className="app-container">
      {/* NOTIFICATION MODAL */}
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-body text-center p-6">
              <div className="mb-4">
                {modal.type === "success" ? <FaCheckCircle size={50} className="text-green-500 mx-auto" /> : <FaTimesCircle size={50} className="text-red-500 mx-auto" />}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${modal.type === "success" ? "text-green-600" : "text-red-600"}`}>
                {modal.type === "success" ? "Success" : "Error"}
              </h3>
              <p className="text-gray-600 mb-6">{modal.message}</p>
              <button className="btn-primary w-full" onClick={() => setModal({ ...modal, visible: false })}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">Activity Master</h4>
        {!showForm && (
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus size={14} /> Add New</button>
            {selectedActivity && (
              <>
                <button className="btn-warning" onClick={() => { setFormData({...selectedActivity}); setIsEdit(true); setShowForm(true); }}><FaEdit size={14} /> Edit</button>
                <button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </>
            )}
          </div>
        )}
      </div>

      {/* FORM SECTION */}
      {showForm && (
        <div className="form-container">
          <h6 className="text-lg font-bold mb-6 text-gray-800">{isEdit ? "Update Activity" : "Create New Activity"}</h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">Activity Code</label>
              <input className={`form-input ${isEdit ? "bg-gray-100" : ""}`} value={formData.activity_code} disabled={isEdit} required onChange={e => setFormData({ ...formData, activity_code: e.target.value.toUpperCase() })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Activity Name</label>
              <input className="form-input" value={formData.activity_name} required onChange={e => setFormData({ ...formData, activity_name: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Parent Module</label>
              <select className="form-input" value={formData.module_code} required onChange={e => setFormData({ ...formData, module_code: e.target.value, submodule_code: "" })}>
                <option value="">Select Module</option>
                {modules.map(m => <option key={m.module_code} value={m.module_code}>{m.module_name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Submodule</label>
              <select className="form-input" value={formData.submodule_code} required disabled={!formData.module_code} onChange={e => setFormData({ ...formData, submodule_code: e.target.value })}>
                <option value="">Select Submodule</option>
                {availableSubmodules.map(sm => <option key={sm.submodule_code} value={sm.submodule_code}>{sm.submodule_name}</option>)}
              </select>
            </div>

            {/* SEARCHABLE URL DROPDOWN */}
            <div className="space-y-1.5 relative">
              <label className="form-label">Target URL</label>
              <div className="form-input flex justify-between items-center cursor-pointer bg-white border" onClick={() => setShowUrlDropdown(!showUrlDropdown)}>
                <span className={formData.url ? "text-gray-800" : "text-gray-400"}>{formData.url || "Select Route Path"}</span>
                {showUrlDropdown ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              </div>
              {showUrlDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl overflow-hidden">
                  <div className="p-2 border-b bg-gray-50 flex items-center gap-2">
                    <FaSearch className="text-gray-400" size={12} />
                    <input autoFocus className="w-full bg-transparent text-sm outline-none" placeholder="Search paths..." value={urlSearchTerm} onChange={e => setUrlSearchTerm(e.target.value)} />
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {urlOptions.filter(u => u.label.toLowerCase().includes(urlSearchTerm.toLowerCase())).map(u => (
                      <div key={u.value} className="px-4 py-2 text-sm hover:bg-green-50 cursor-pointer" onClick={() => { setFormData({...formData, url: u.value}); setShowUrlDropdown(false); }}>
                        {u.label} <span className="text-xs text-gray-400 block">{u.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select className="form-input" value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            {/* PERMISSIONS MATRIX */}
            <div className="md:col-span-2 mt-4">
              <h6 className="text-sm font-bold text-green-700 mb-3 uppercase tracking-wider">Role Access Permissions</h6>
              <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-gray-50/50">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600">
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
                      const isAll = permissionsData[`readPermission${uId}`] === "Yes" && permissionsData[`writePermission${uId}`] === "Yes" && permissionsData[`updatePermission${uId}`] === "Yes";
                      return (
                        <tr key={uId} className="hover:bg-white transition-colors">
                          <td className="px-4 py-3 font-semibold text-gray-700">{utype.usertype_name}</td>
                          <td className="px-4 py-3 text-center">
                            <input type="checkbox" className="form-checkbox text-green-600 h-4 w-4 cursor-pointer" checked={isAll}
                              onChange={(e) => {
                                const val = e.target.checked ? "Yes" : "No";
                                setPermissionsData(p => ({...p, [`readPermission${uId}`]: val, [`writePermission${uId}`]: val, [`updatePermission${uId}`]: val }));
                              }} 
                            />
                          </td>
                          {['read', 'write', 'update'].map(type => (
                            <td key={type} className="px-4 py-3 text-center">
                              <input type="checkbox" className="form-checkbox text-green-600 h-4 w-4 cursor-pointer" checked={permissionsData[`${type}Permission${uId}`] === "Yes"}
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

      {/* TABLE SECTION */}
      {!showForm && (
        <div className="data-table-container">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header-row">
                  <th className="table-th w-16"></th>
                  <th className="table-th">Code</th>
                  <th className="table-th">Activity Name</th>
                  <th className="table-th">Submodule</th>
                  <th className="table-th">Module</th>
                  <th className="table-th text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((a) => (
                  <tr 
                    key={a.activity_code} 
                    onClick={() => setSelectedActivity(selectedActivity?.activity_code === a.activity_code ? null : a)} 
                    className={`table-row ${selectedActivity?.activity_code === a.activity_code ? "table-row-active" : "table-row-hover"}`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${selectedActivity?.activity_code === a.activity_code ? "selection-indicator-active" : "selection-indicator-inactive"}`}>
                        {selectedActivity?.activity_code === a.activity_code && <div className="selection-dot" />}
                      </div>
                    </td>
                    <td className="table-td text-admin-id">{a.activity_code}</td>
                    <td className="table-td font-medium">{a.activity_name}</td>
                    <td className="table-td text-gray-500">{a.submodule_code}</td>
                    <td className="table-td text-gray-500">{a.module_code}</td>
                    <td className="table-td text-center">
                      <span className={`badge ${a.status === 1 ? 'badge-success' : 'bg-red-50 text-red-600'}`}>
                        {a.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="table-td py-20 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <FaRunning size={40} className="opacity-20" />
                        <p>No activities found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
};

export default Activities;