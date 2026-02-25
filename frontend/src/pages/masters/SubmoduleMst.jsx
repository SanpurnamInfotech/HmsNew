import React, { useState, useEffect, useMemo, useRef } from "react";
import api from "../../utils/domain"; 
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';
import { adminRoutes } from "../../routes/routeConfig"; 

/* ==========================================================
   REUSABLE SEARCHABLE SELECT (Internal to this file now)
   ========================================================== */
const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  disabled = false,
  className = "w-full px-4 py-3 rounded-lg border border-gray-200 outline-none transition-all",
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef(null);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => String(o.value) === String(value));
    return found ? found.label : "";
  }, [options, value]);

  const filtered = useMemo(() => {
    const query = (q || "").toLowerCase().trim();
    if (!query) return options;
    return options.filter(
      (o) =>
        (o.label || "").toLowerCase().includes(query) ||
        String(o.value || "").toLowerCase().includes(query)
    );
  }, [options, q]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className={`${className} text-left flex items-center justify-between ${
          disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
        } ${open ? "ring-2 ring-emerald-500/20 border-emerald-500" : ""}`}
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
      >
        <span className={`${selectedLabel ? "text-gray-900" : "text-gray-400"}`}>
          {selectedLabel || placeholder}
        </span>
        <span className="ml-3 text-gray-500">{open ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>}</span>
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-2 border-b bg-gray-50 flex items-center gap-2">
            <FaSearch className="text-gray-400" size={12} />
            <input
              autoFocus
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((o) => (
                <div
                  key={String(o.value)}
                  className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                    String(o.value) === String(value) ? "bg-emerald-50 text-emerald-700 font-bold" : "hover:bg-emerald-50 text-gray-700"
                  }`}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setQ("");
                  }}
                >
                  {o.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-sm text-gray-400 text-center">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================
   MAIN COMPONENT
   ========================================================== */
const SubmoduleMst = () => {
  const SUBMODULE_PATH = "engine-submodule";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${SUBMODULE_PATH}/`);
  
  const [modules, setModules] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [permissionsData, setPermissionsData] = useState({});
  const [urlOptions, setUrlOptions] = useState([]); 

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

  const moduleOptions = useMemo(() => 
    modules.map(m => ({ value: m.module_code, label: m.module_name })), 
  [modules]);

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => (parseInt(a.sequence) || 999) - (parseInt(b.sequence) || 999));
  }, [data]);

  const { 
    search, setSearch, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage, 
    paginatedData, effectiveItemsPerPage, filteredData, totalPages 
  } = useTable(sortedData);

  useEffect(() => {
    fetchUserTypes();
    fetchModules();
    setUrlOptions(adminRoutes.map(route => ({ label: route.label, value: `/admin/${route.path}` })));
  }, []);

  useEffect(() => {
    if (isEdit && formData.submodule_code && formData.module_code) fetchSubmodulePermissions();
  }, [isEdit, formData.submodule_code, formData.module_code]);

  const fetchModules = async () => {
    try {
      const res = await api.get("engine-module/");
      setModules(res.data.results || (Array.isArray(res.data) ? res.data : []));
    } catch (err) { console.error(err); }
  };

  const fetchUserTypes = async () => {
    try {
      const response = await api.get("usertypes/"); 
      const incomingData = response.data.results || response.data;
      if (Array.isArray(incomingData)) setUserTypes(incomingData);
    } catch (error) { console.error(error); }
  };

  const fetchSubmodulePermissions = async () => {
    try {
      const { module_code, submodule_code } = formData;
      const response = await api.get(`universal-permissions/?module=${module_code}&submodule=${submodule_code}`);
      setPermissionsData(response.data || {});
    } catch (error) { setPermissionsData({}); }
  };

  const resetForm = () => {
    setShowForm(false); setIsEdit(false); setSelectedSubmodule(null);
    setPermissionsData({}); setUrlSearchTerm(""); setShowUrlDropdown(false);
    setFormData({ module_code: "", submodule_code: "", submodule_name: "", url: "", icon: "", sequence: "", status: 1 });
  };

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.url) return showModal("Navigation URL is required", "error");

    const finalPayload = { ...formData, ...permissionsData };
    const actionPath = isEdit ? `${SUBMODULE_PATH}/update/${formData.submodule_code}/` : `${SUBMODULE_PATH}/create/`;
    const result = isEdit ? await updateItem(actionPath, finalPayload) : await createItem(actionPath, finalPayload);

    if (result.success) {
      showModal(`Submodule ${isEdit ? "updated" : "created"} successfully!`);
      resetForm(); refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedSubmodule || !window.confirm("Are you sure?")) return;
    const result = await deleteItem(`${SUBMODULE_PATH}/delete/${selectedSubmodule.submodule_code}/`);
    if (result.success) { showModal("Deleted successfully!"); setSelectedSubmodule(null); refresh(); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-100"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="app-container">
      {modal.visible && (
        <div className="modal-overlay fixed inset-0 bg-black/50 z-100 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="mb-4">{modal.type === "success" ? <FaCheckCircle size={50} className="text-emerald-500 mx-auto" /> : <FaTimesCircle size={50} className="text-red-500 mx-auto" />}</div>
            <h3 className={`text-xl font-bold mb-2 ${modal.type === "success" ? "text-emerald-700" : "text-red-700"}`}>{modal.type === "success" ? "Success" : "Error"}</h3>
            <p className="text-gray-600 mb-6">{modal.message}</p>
            <button className="bg-emerald-600 text-white w-full py-2.5 rounded-lg font-semibold" onClick={() => setModal({ ...modal, visible: false })}>OK</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <h4 className="text-xl font-bold text-gray-800">Submodule Master</h4>
        {!showForm && (
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md" onClick={() => setShowForm(true)}><FaPlus size={14} /> Add New</button>
            {selectedSubmodule && (
              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md" onClick={() => { setFormData({...selectedSubmodule}); setIsEdit(true); setShowForm(true); }}><FaEdit size={14} /> Edit</button>
                <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

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
              <SearchableSelect 
                value={formData.module_code} 
                options={moduleOptions} 
                placeholder="Select"
                onChange={(val) => setFormData({...formData, module_code: val})} 
              />
            </div>

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
              <input className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="bi bi-list" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Sequence</label>
              <input className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" type="number" value={formData.sequence} onChange={e => setFormData({ ...formData, sequence: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Status</label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none bg-white" value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 mt-4">
              <h6 className="text-sm font-bold text-emerald-700 mb-3 uppercase tracking-wider">Submodule Permissions</h6>
              <div className="overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/30">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100/50 text-gray-400 text-[10px] uppercase font-black">
                    <tr><th className="px-6 py-4">User Type</th><th className="text-center">Full Access</th><th className="text-center">Read</th><th className="text-center">Write</th><th className="text-center">Update</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userTypes.map((utype) => {
                      const uId = utype.usertype_code;
                      const isAllChecked = permissionsData[`readPermission${uId}`] === "Yes" && permissionsData[`writePermission${uId}`] === "Yes" && permissionsData[`updatePermission${uId}`] === "Yes";
                      return (
                        <tr key={uId} className="hover:bg-white transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-700">{utype.usertype_name}</td>
                          <td className="px-4 py-4 text-center"><input type="checkbox" className="w-4 h-4 rounded text-emerald-600" checked={isAllChecked} onChange={(e) => { const val = e.target.checked ? "Yes" : "No"; setPermissionsData(prev => ({ ...prev, [`readPermission${uId}`]: val, [`writePermission${uId}`]: val, [`updatePermission${uId}`]: val })); }} /></td>
                          {['read', 'write', 'update'].map(perm => <td key={perm} className="px-4 py-4 text-center"><input type="checkbox" className="w-4 h-4 rounded text-emerald-600 cursor-pointer" checked={permissionsData[`${perm}Permission${uId}`] === "Yes"} onChange={(e) => setPermissionsData(prev => ({ ...prev, [`${perm}Permission${uId}`]: e.target.checked ? "Yes" : "No" }))} /></td>)}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-8 mt-4 border-t border-gray-50">
              <button type="submit" className="bg-emerald-600 text-white px-12 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-emerald-100">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="px-6 py-2.5 text-sm font-bold text-gray-400" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-gray-50/50"><th className="px-6 py-4 w-16"></th><th className="text-admin-th">Submodule Code</th><th className="text-admin-th">Submodule Name</th><th className="text-admin-th">Module Name</th><th className="text-admin-th">Endpoint</th><th className="text-admin-th">Status</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.map((s) => (
                  <tr key={s.submodule_code} onClick={() => setSelectedSubmodule(selectedSubmodule?.submodule_code === s.submodule_code ? null : s)} className={`group cursor-pointer transition-colors ${selectedSubmodule?.submodule_code === s.submodule_code ? "bg-emerald-50/40" : "hover:bg-gray-50/50"}`}>
                    <td className="px-6 py-4"><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSubmodule?.submodule_code === s.submodule_code ? "border-emerald-500 bg-emerald-500" : "border-gray-200"}`}>{selectedSubmodule?.submodule_code === s.submodule_code && <div className="w-1.5 h-1.5 rounded-full bg-white" />}</div></td>
                    <td className="text-admin-td">{s.submodule_code}</td><td className="text-admin-td">{s.submodule_name}</td><td className="text-admin-td">{s.module_code}</td><td className="text-admin-td">{s.url || 'N/A'}</td>
                    <td className="text-admin-td"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.status === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{s.status === 1 ? 'Active' : 'Inactive'}</span></td>
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

export default SubmoduleMst;