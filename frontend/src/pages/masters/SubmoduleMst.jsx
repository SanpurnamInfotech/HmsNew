import React, { useState, useEffect, useMemo, useRef } from "react";
import api from "../../utils/domain"; 
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { 
  FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, 
  FaChevronDown, FaChevronUp, FaSearch, FaLayerGroup 
} from 'react-icons/fa';
import { adminRoutes } from "../../routes/routeConfig"; 

/* ==========================================================
   REUSABLE SEARCHABLE SELECT (Themed for Dark/Light)
   ========================================================== */
const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  disabled = false,
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
        className={`form-input w-full text-left flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
      >
        <span className={selectedLabel ? "" : "opacity-40"}>
          {selectedLabel || placeholder}
        </span>
        <span className="ml-3 text-emerald-500">{open ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>}</span>
      </button>

      {open && !disabled && (
        <div 
          className="absolute z-50 mt-1 w-full rounded-xl border shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-color)" }}
        >
          <div className="p-2 border-b flex items-center gap-2" style={{ backgroundColor: "var(--bg-hover)", borderColor: "var(--border-color)" }}>
            <FaSearch className="text-emerald-500" size={12} />
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
                  className={`px-4 py-3 text-sm cursor-pointer transition-colors border-b last:border-0 ${
                    String(o.value) === String(value) ? "bg-emerald-500/10 text-emerald-500 font-bold" : "hover:bg-emerald-500/5"
                  }`}
                  style={{ borderColor: "var(--border-color)" }}
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
              <div className="px-4 py-6 text-sm opacity-40 text-center italic">No results found</div>
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
    const result = await deleteItem(`${SUBMODULE_PATH}/delete/${selectedSubmodule.submodule_code}/`);
    if (result.success) { showModal("Deleted successfully!"); setSelectedSubmodule(null); refresh(); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="app-container">
      {/* MODAL SYSTEM */}
      {modal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? <FaCheckCircle className="text-6xl text-emerald-500" /> : <FaTimesCircle className="text-6xl text-rose-500" />}
            </div>
            <h3 className={`text-xl font-black mb-2 uppercase tracking-tight ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            <p className="mb-6 font-medium opacity-80">{modal.message}</p>
            <button className="btn-primary w-full justify-center py-3" onClick={() => setModal({ ...modal, visible: false })}>Continue</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="section-header">
        <h4 className="page-title">Submodule Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus size={14} /> Add New</button>
            {selectedSubmodule && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="btn-warning" onClick={() => { setFormData({...selectedSubmodule}); setIsEdit(true); setShowForm(true); }}><FaEdit size={14} /> Edit</button>
                <button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">{isEdit ? "Update Submodule Profile" : "Create New Submodule"}</h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">Submodule Code</label>
              <input className="form-input w-full" value={formData.submodule_code} disabled={isEdit} required onChange={e => setFormData({ ...formData, submodule_code: e.target.value.toUpperCase().replace(/\s/g, '_') })} placeholder="E.G. SUB_USER_LST"/>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Submodule Name</label>
              <input className="form-input w-full" value={formData.submodule_name} required onChange={e => setFormData({ ...formData, submodule_name: e.target.value })} placeholder="E.G. User List View" />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Parent Module</label>
              <SearchableSelect 
                value={formData.module_code} 
                options={moduleOptions} 
                placeholder="Select Module"
                onChange={(val) => setFormData({...formData, module_code: val})} 
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="form-label">Navigation URL</label>
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
              {showUrlDropdown && (
                <div 
                  className="absolute z-50 w-full mt-2 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-top-2"
                  style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-color)" }}
                >
                  <div className="p-3 border-b flex items-center gap-3" style={{ backgroundColor: "var(--bg-hover)", borderColor: "var(--border-color)" }}>
                    <FaSearch className="text-emerald-500" size={14} />
                    <input autoFocus className="w-full bg-transparent text-sm outline-none placeholder:opacity-50" placeholder="Search routes..." value={urlSearchTerm} onChange={e => setUrlSearchTerm(e.target.value)} />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {urlOptions.filter(u => (u.label || "").toLowerCase().includes(urlSearchTerm.toLowerCase())).map(u => (
                      <div key={u.value} className="px-5 py-3 hover:bg-emerald-500/10 cursor-pointer transition-colors border-b last:border-0" style={{ borderColor: "var(--border-color)" }} onClick={() => { setFormData({...formData, url: u.value}); setShowUrlDropdown(false); }}>
                        <div className="text-sm font-bold tracking-tight">{u.label}</div>
                        <div className="text-[10px] opacity-50 font-mono mt-0.5 italic">{u.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Icon Class</label>
              <input className="form-input w-full" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="bi bi-list" />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Sequence</label>
              <input className="form-input w-full" type="number" value={formData.sequence} onChange={e => setFormData({ ...formData, sequence: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select className="form-input w-full cursor-pointer appearance-none" style={{ colorScheme: "dark" }} value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            {/* PERMISSIONS SECTION */}
            <div className="md:col-span-2 mt-4">
              <h6 className="form-label mb-4 block">Submodule Permissions</h6>
              <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border-color)" }}>
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] uppercase font-black" style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}>
                    <tr><th className="px-6 py-4">User Type</th><th className="text-center">Full Access</th><th className="text-center">Read</th><th className="text-center">Write</th><th className="text-center">Update</th></tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                    {userTypes.map((utype) => {
                      const uId = utype.usertype_code;
                      const isAllChecked = permissionsData[`readPermission${uId}`] === "Yes" && permissionsData[`writePermission${uId}`] === "Yes" && permissionsData[`updatePermission${uId}`] === "Yes";
                      return (
                        <tr key={uId} className="hover:bg-emerald-500/5 transition-colors">
                          <td className="px-6 py-4 font-bold opacity-90">{utype.usertype_name}</td>
                          <td className="px-4 py-4 text-center"><input type="checkbox" className="w-4 h-4 rounded accent-emerald-500 cursor-pointer" checked={isAllChecked} onChange={(e) => { const val = e.target.checked ? "Yes" : "No"; setPermissionsData(prev => ({ ...prev, [`readPermission${uId}`]: val, [`writePermission${uId}`]: val, [`updatePermission${uId}`]: val })); }} /></td>
                          {['read', 'write', 'update'].map(perm => <td key={perm} className="px-4 py-4 text-center"><input type="checkbox" className="w-4 h-4 rounded accent-emerald-500 cursor-pointer" checked={permissionsData[`${perm}Permission${uId}`] === "Yes"} onChange={(e) => setPermissionsData(prev => ({ ...prev, [`${perm}Permission${uId}`]: e.target.checked ? "Yes" : "No" }))} /></td>)}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-8 mt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
              <button type="submit" className="btn-primary px-12 py-3">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="data-table-container animate-in fade-in duration-500">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">Submodule Code</th>
                  <th className="text-admin-th">Submodule Name</th>
                  <th className="text-admin-th">Module Name</th>
                  <th className="text-admin-th">Endpoint</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map((s) => (
                    <tr 
                      key={s.submodule_code} 
                      onClick={() => setSelectedSubmodule(selectedSubmodule?.submodule_code === s.submodule_code ? null : s)} 
                      className={`group cursor-pointer transition-colors ${selectedSubmodule?.submodule_code === s.submodule_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}
                    >
                      <td className="px-6 py-4">
                        <div className={`selection-indicator ${selectedSubmodule?.submodule_code === s.submodule_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                            {selectedSubmodule?.submodule_code === s.submodule_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="text-admin-td">{s.submodule_code}</td>
                      <td className="text-admin-td">{s.submodule_name}</td>
                      <td className="text-admin-td">{s.module_code}</td>
                      <td className="text-admin-td ">{s.url || 'N/A'}</td>
                      <td className="text-admin-td">
                        <span className={`badge ${s.status === 1 ? 'badge-success' : 'badge-danger'}`}>{s.status === 1 ? 'Active' : 'Inactive'}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-24 text-center">
                      <FaLayerGroup size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No submodules found</p>
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

export default SubmoduleMst;