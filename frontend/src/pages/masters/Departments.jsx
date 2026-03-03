import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useCrud,
  useTable,
  Pagination,
  TableToolbar,
} from "../../components/common/BaseCRUD";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaBuilding,
} from "react-icons/fa";

/* =========================
   Reusable Searchable Select (Updated for Design System)
   ========================= */
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
        className={`form-input w-full text-left flex items-center justify-between ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
      >
        <span className={selectedLabel ? "" : "opacity-40"}>
          {selectedLabel || placeholder}
        </span>
        <span className="text-[10px] opacity-50">▼</span>
      </button>

      {open && !disabled && (
        <div className="absolute z-[110] mt-2 w-full rounded-xl border border-emerald-500/20 bg-[var(--bg-surface)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
          <div className="p-3 border-b border-[var(--border-color)]">
            <input
              autoFocus
              className="form-input w-full py-2 text-xs"
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((o) => (
                <button
                  key={String(o.value)}
                  type="button"
                  className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-emerald-500/10 
                    ${String(o.value) === String(value) ? "bg-emerald-500/20 text-emerald-500 font-bold" : "text-[var(--text-main)]"}`}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                >
                  {o.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-4 text-xs text-center opacity-40">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Departments = () => {
  const PATH = "departments";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);

  // Financial Year & Company Data
  const { data: fyRaw } = useCrud("financialyear_master/");
  const { data: companiesData } = useCrud("company_master/");

  const financialYearsList = useMemo(() => Array.isArray(fyRaw) ? fyRaw : (fyRaw?.results || fyRaw?.data || []), [fyRaw]);

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [formData, setFormData] = useState({
    department_code: "",
    department_name: "",
    financialyear_code: "",
    company_code: "",
    status: 1,
    sort_order: "",
  });

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

  /* ================= LOGIC ================= */
  const nextDepartmentCode = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const codes = list.map((x) => (x?.department_code || "").toString()).filter((c) => c.startsWith("DEP"));
    let maxNum = 0;
    for (const code of codes) {
      const num = parseInt(code.replace("DEP", ""), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
    return `DEP${String(maxNum + 1).padStart(5, "0")}`;
  }, [data]);

  const sortedData = useMemo(() => {
    const list = Array.isArray(data) ? [...data] : [];
    return list.sort((a, b) => (Number(a.sort_order || 99999) - Number(b.sort_order || 99999)));
  }, [data]);

  const {
    search, setSearch, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    paginatedData, effectiveItemsPerPage, filteredData, totalPages,
  } = useTable(sortedData);

  const resetForm = () => {
    setShowForm(false); setIsEdit(false); setSelected(null);
    setFormData({ department_code: "", department_name: "", financialyear_code: "", company_code: "", status: 1, sort_order: "" });
  };

  const showModal = (message, type = "success") => setModal({ visible: true, message, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      status: Number(formData.status),
      sort_order: formData.sort_order === "" ? null : Number(formData.sort_order),
      financialyear_code: formData.financialyear_code || null
    };

    const actionPath = isEdit ? `${PATH}/update/${formData.department_code}/` : `${PATH}/create/`;
    const result = isEdit ? await updateItem(actionPath, payload) : await createItem(`${PATH}/create/`, payload);

    if (result.success) {
      showModal(`Department ${isEdit ? "updated" : "created"} successfully!`);
      resetForm(); refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteItem(`${PATH}/delete/${selected.department_code}/`);
    if (result.success) {
      showModal("Department deleted successfully!");
      setSelected(null); refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  const companyOptions = useMemo(() => (companiesData || []).map(c => ({ value: c.company_code, label: c.company_name })), [companiesData]);
  const fyOptions = useMemo(() => financialYearsList.map(fy => ({ value: fy.financialyear_code, label: fy.financialyear_name || fy.financialyear_code })), [financialYearsList]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="app-container">
      {/* GLOBAL MODAL */}
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
        <h4 className="page-title">Department Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => { setFormData({ ...formData, department_code: nextDepartmentCode }); setShowForm(true); }}>
              <FaPlus size={14} /> Add New
            </button>
            {selected && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="btn-warning" onClick={() => { setFormData(selected); setIsEdit(true); setShowForm(true); }}>
                  <FaEdit size={14} /> Edit
                </button>
                <button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM (2 COLUMNS) */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">{isEdit ? "Update Department" : "Add New Department"}</h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">Department Code</label>
              <input className="form-input w-full opacity-50" value={formData.department_code} disabled />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Department Name</label>
              <input className="form-input w-full" value={formData.department_name} required onChange={(e) => setFormData({ ...formData, department_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Financial Year (Optional)</label>
              <SearchableSelect value={formData.financialyear_code} options={fyOptions} onChange={(val) => setFormData({ ...formData, financialyear_code: val })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Company</label>
              <SearchableSelect value={formData.company_code} options={companyOptions} onChange={(val) => setFormData({ ...formData, company_code: val })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Sort Order</label>
              <input type="number" className="form-input w-full" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select className="form-input w-full cursor-pointer appearance-none" style={{ colorScheme: "dark" }} value={formData.status} onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 border-t pt-8 mt-4" style={{ borderColor: "var(--border-color)" }}>
              <button type="submit" className="btn-primary px-12 py-3">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}
      {!showForm && (
        <div className="data-table-container animate-in fade-in duration-500">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">Code</th>
                  <th className="text-admin-th">Department Name</th>
                  <th className="text-admin-th text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map((d) => (
                    <tr key={d.department_code} onClick={() => setSelected(selected?.department_code === d.department_code ? null : d)}
                      className={`group cursor-pointer transition-colors ${selected?.department_code === d.department_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}>
                      <td className="px-6 py-4">
                        <div className={`selection-indicator ${selected?.department_code === d.department_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                          {selected?.department_code === d.department_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="text-admin-td">{d.department_code}</td>
                      <td className="text-admin-td font-bold">{d.department_name}</td>
                      <td className="text-admin-td text-center">
                        <span className={`badge ${Number(d.status) === 1 ? "badge-success" : "badge-danger"}`}>
                          {Number(d.status) === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-24 text-center">
                      <FaBuilding size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No departments found</p>
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

export default Departments;