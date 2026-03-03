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
  FaUniversity,
} from "react-icons/fa";

/* =========================
   Reusable Searchable Select
   (Styled for Dark/Light external CSS)
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
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
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
        <span className="opacity-50">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-emerald-500/20 bg-surface shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150" 
             style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-color)" }}>
          <div className="p-3 border-b" style={{ borderColor: "var(--border-color)" }}>
            <input
              autoFocus
              className="form-input w-full text-sm"
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
                  className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between
                    ${String(o.value) === String(value) ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-emerald-500/5"}
                  `}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <span>{o.label}</span>
                  {String(o.value) === String(value) && <FaCheckCircle size={12} />}
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center opacity-40 text-xs uppercase font-bold tracking-widest">No Results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const BankDetails = () => {
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud("bankdetails/");

  // Dropdowns
  const { data: employeeData } = useCrud("employee_master/");
  const { data: financialyearDataRaw } = useCrud("financialyear-master/");
  const { data: companyData } = useCrud("company_master/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    bank_code: "",
    bank_name: "",
    employee_code: "",
    bank_address: "",
    bank_phone: "",
    bank_branch: "",
    bank_ifsc: "",
    bank_accountno: "",
    bank_ddpayableaddress: "",
    financialyear_code: "",
    company_code: "",
    status: 1,
    sort_order: "",
  });

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

  /* ================= TABLE LOGIC ================= */
  const sortedData = useMemo(() => {
    const list = Array.isArray(data) ? [...data] : [];
    return list.sort((a, b) => (Number(a.sort_order || 999) - Number(b.sort_order || 999)));
  }, [data]);

  const {
    search, setSearch, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    paginatedData, effectiveItemsPerPage, filteredData, totalPages,
  } = useTable(sortedData);

  /* ================= OPTIONS MAPPING ================= */
  const employeeOptions = useMemo(() => (employeeData || []).map(e => ({
    value: e.employee_code,
    label: `${e.employee_firstname} ${e.employee_lastname || ""}`.trim()
  })), [employeeData]);

  const fyOptions = useMemo(() => {
    const rawList = Array.isArray(financialyearDataRaw) ? financialyearDataRaw : (financialyearDataRaw?.data || []);
    return rawList.map(fy => ({ value: fy.financialyear_code, label: fy.financialyear_name }));
  }, [financialyearDataRaw]);

  const companyOptions = useMemo(() => (companyData || []).map(c => ({
    value: c.company_code,
    label: c.company_name
  })), [companyData]);

  /* ================= ACTIONS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      bank_code: "", bank_name: "", employee_code: "", bank_address: "",
      bank_phone: "", bank_branch: "", bank_ifsc: "", bank_accountno: "",
      bank_ddpayableaddress: "", financialyear_code: "", company_code: "",
      status: 1, sort_order: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      status: Number(formData.status),
      sort_order: formData.sort_order ? Number(formData.sort_order) : null 
    };

    const actionPath = isEdit ? `bankdetails/update/${formData.bank_code}/` : `bankdetails/create/`;
    const result = isEdit ? await updateItem(actionPath, payload) : await createItem(actionPath, payload);

    if (result.success) {
      setModal({ visible: true, message: `Bank ${isEdit ? "updated" : "created"} successfully!`, type: "success" });
      resetForm();
      refresh();
    } else {
      setModal({ visible: true, message: result.error || "Operation failed!", type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    const result = await deleteItem(`bankdetails/delete/${selectedRow.bank_code}/`);
    if (result.success) {
      setModal({ visible: true, message: "Bank deleted successfully!", type: "success" });
      setSelectedRow(null);
      refresh();
    } else {
      setModal({ visible: true, message: result.error || "Delete failed!", type: "error" });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="app-container">
      {/* GLOBAL MODAL */}
      {modal.visible && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
        <h4 className="page-title">Bank Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus size={14} /> Add New</button>
            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="btn-warning" onClick={() => { setFormData(selectedRow); setIsEdit(true); setShowForm(true); }}><FaEdit size={14} /> Edit</button>
                <button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM (2-COLUMN GRID) */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">
            {isEdit ? "Update Bank Information" : "Create Bank Profile"}
          </h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            
            {/* INFORMATION SECTION */}
            <div className="md:col-span-2"><h6 className="form-label text-emerald-600">Basic Info</h6></div>
            <div className="space-y-1.5">
              <label className="form-label">Bank Code</label>
              <input className="form-input w-full" value={formData.bank_code} disabled={isEdit} required onChange={e => setFormData({ ...formData, bank_code: e.target.value.toUpperCase() })} placeholder="E.G. HDFC01" />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Bank Name</label>
              <input className="form-input w-full" value={formData.bank_name} required onChange={e => setFormData({ ...formData, bank_name: e.target.value })} placeholder="E.G. HDFC Bank" />
            </div>

            {/* RELATIONS SECTION */}
            <div className="md:col-span-2 mt-4"><h6 className="form-label text-emerald-600">Associations</h6></div>
            <div className="space-y-1.5">
              <label className="form-label">Employee</label>
              <SearchableSelect value={formData.employee_code} options={employeeOptions} onChange={val => setFormData({ ...formData, employee_code: val })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Financial Year</label>
              <SearchableSelect value={formData.financialyear_code} options={fyOptions} onChange={val => setFormData({ ...formData, financialyear_code: val })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Company</label>
              <SearchableSelect value={formData.company_code} options={companyOptions} onChange={val => setFormData({ ...formData, company_code: val })} />
            </div>

            {/* CONTACT/TECH SECTION */}
            <div className="md:col-span-2 mt-4"><h6 className="form-label text-emerald-600">Bank Details</h6></div>
            <div className="space-y-1.5">
              <label className="form-label">Branch</label>
              <input className="form-input w-full" value={formData.bank_branch} onChange={e => setFormData({ ...formData, bank_branch: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">IFSC Code</label>
              <input className="form-input w-full" value={formData.bank_ifsc} onChange={e => setFormData({ ...formData, bank_ifsc: e.target.value.toUpperCase() })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Account No</label>
              <input className="form-input w-full" value={formData.bank_accountno} onChange={e => setFormData({ ...formData, bank_accountno: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select className="form-input w-full cursor-pointer" style={{ colorScheme: "dark" }} value={formData.status} onChange={e => setFormData({ ...formData, status: parseInt(e.target.value) })}>
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
                  <th className="text-admin-th">Bank Name</th>
                  <th className="text-admin-th">Branch</th>
                  <th className="text-admin-th">IFSC</th>
                  <th className="text-admin-th">Account No</th>
                  <th className="text-admin-th text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <tr key={row.bank_code} onClick={() => setSelectedRow(selectedRow?.bank_code === row.bank_code ? null : row)}
                      className={`group cursor-pointer transition-colors ${selectedRow?.bank_code === row.bank_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}>
                      <td className="px-6 py-4">
                        <div className={`selection-indicator ${selectedRow?.bank_code === row.bank_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                          {selectedRow?.bank_code === row.bank_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="text-admin-td">{row.bank_code}</td>
                      <td className="text-admin-td">{row.bank_name}</td>
                      <td className="text-admin-td">{row.bank_branch || "N/A"}</td>
                      <td className="text-admin-td">{row.bank_ifsc || "-"}</td>
                      <td className="text-admin-td">{row.bank_accountno || "-"}</td>
                      <td className="text-admin-td ">
                        <span className={`badge ${row.status === 1 ? "badge-success" : "badge-danger"}`}>
                          {row.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-24 text-center">
                      <FaUniversity size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No Bank Details</p>
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

export default BankDetails;