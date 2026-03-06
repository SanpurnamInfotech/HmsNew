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
  FaHandHoldingHeart,
} from "react-icons/fa";

/* =========================
    Reusable Searchable Select
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
    <div className="relative w-full" ref={wrapRef}>
      <button
        type="button"
        className={`form-input w-full text-left flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
      >
        <span className={selectedLabel ? "text-current" : "opacity-50"}>
          {selectedLabel || placeholder}
        </span>
        <span className="ml-2 opacity-50">▾</span>
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden animate-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-emerald-500 text-sm text-gray-800"
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
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-emerald-50 ${
                    String(o.value) === String(value) ? "bg-emerald-500 text-white hover:bg-emerald-600" : "text-gray-700"
                  }`}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  {o.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-4 text-xs text-gray-400 text-center">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const BloodDonor = () => {
  const PATH = "blood_donor";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);
  const { data: bloodGroups } = useCrud("blood_group_master/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    blood_donor_code: "",
    donor_firstname: "", 
    donor_middlename: "", 
    donor_lastname: "",
    blood_group_code: "", 
    gender: "", 
    age: "", 
    phone: "",
    email: "", 
    address1: "", 
    address2: "", 
    last_donation_date: "",
    status: 1, 
    sort_order: "",
  });

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

  /* ================= SORTING LOGIC ================= */
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const sa = (a.sort_order === null || a.sort_order === "" || a.sort_order === undefined) ? 999 : Number(a.sort_order);
      const sb = (b.sort_order === null || b.sort_order === "" || b.sort_order === undefined) ? 999 : Number(b.sort_order);
      if (sa !== sb) return sa - sb;
      return (a.donor_firstname || "").localeCompare(b.donor_firstname || "");
    });
  }, [data]);

  const {
    search, setSearch, currentPage, setCurrentPage, itemsPerPage,
    setItemsPerPage, paginatedData, effectiveItemsPerPage, filteredData, totalPages,
  } = useTable(sortedData);

  const bloodGroupOptions = useMemo(() => 
    (bloodGroups || []).map((bg) => ({ value: bg.blood_group_code, label: `${bg.blood_group_code} (${bg.blood_group_name})` })),
    [bloodGroups]
  );

  const resetForm = () => {
    setShowForm(false); setIsEdit(false); setSelectedRow(null);
    setFormData({
      blood_donor_code: "",
      donor_firstname: "", donor_middlename: "", donor_lastname: "",
      blood_group_code: "", gender: "", age: "", phone: "",
      email: "", address1: "", address2: "", last_donation_date: "",
      status: 1, sort_order: "",
    });
  };

  const showModal = (message, type = "success") => setModal({ visible: true, message, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
        ...formData, 
        age: formData.age === "" ? null : Number(formData.age),
        status: Number(formData.status),
        sort_order: (formData.sort_order === "" || formData.sort_order === null) ? null : Number(formData.sort_order) 
    };

    const actionPath = isEdit 
        ? `${PATH}/update/${formData.blood_donor_code}/` 
        : `${PATH}/create/`;
    
    const result = isEdit ? await updateItem(actionPath, payload) : await createItem(actionPath, payload);
    
    if (result.success) {
      showModal(`Donor ${isEdit ? "updated" : "created"} successfully!`);
      resetForm(); refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    const result = await deleteItem(`${PATH}/delete/${selectedRow.blood_donor_code}/`);
    if (result.success) {
      showModal("Record deleted successfully!");
      setSelectedRow(null); refresh();
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
      {/* MODAL */}
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
        <h4 className="page-title">Blood Donor Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus size={14} /> Add New</button>
            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="btn-warning" onClick={() => { 
                    setFormData({ ...selectedRow, sort_order: selectedRow.sort_order ?? "", age: selectedRow.age ?? "" }); 
                    setIsEdit(true); 
                    setShowForm(true); 
                }}>
                    <FaEdit size={14} /> Edit
                </button>
                <button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM (2 Columns) */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">{isEdit ? "Update Donor Profile" : "Add New Donor"}</h6>
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5"><label className="form-label">Donor Code</label>
              <input className="form-input w-full" value={formData.blood_donor_code} disabled={isEdit} required onChange={e => setFormData({...formData, blood_donor_code: e.target.value.toUpperCase()})} placeholder="DONOR-001" />
            </div>

            <div className="space-y-1.5"><label className="form-label">First Name</label>
              <input className="form-input w-full" value={formData.donor_firstname} required onChange={e => setFormData({...formData, donor_firstname: e.target.value})} />
            </div>
            <div className="space-y-1.5"><label className="form-label">Middle Name</label>
              <input className="form-input w-full" value={formData.donor_middlename || ""} onChange={e => setFormData({...formData, donor_middlename: e.target.value})} />
            </div>
            <div className="space-y-1.5"><label className="form-label">Last Name</label>
              <input className="form-input w-full" value={formData.donor_lastname} required onChange={e => setFormData({...formData, donor_lastname: e.target.value})} />
            </div>
            
            <div className="space-y-1.5"><label className="form-label">Blood Group</label>
              <SearchableSelect value={formData.blood_group_code} options={bloodGroupOptions} onChange={val => setFormData({...formData, blood_group_code: val})} placeholder="Select Blood Group" />
            </div>

            <div className="space-y-1.5"><label className="form-label">Gender</label>
              <select className="form-input w-full cursor-pointer appearance-none" style={{ colorScheme: "dark" }} value={formData.gender || ""} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5"><label className="form-label">Age</label>
              <input type="number" className="form-input w-full" value={formData.age ?? ""} onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>

            <div className="space-y-1.5"><label className="form-label">Phone</label>
              <input className="form-input w-full" value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div className="space-y-1.5"><label className="form-label">Email</label>
              <input type="email" className="form-input w-full" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="space-y-1.5"><label className="form-label">Last Donation Date</label>
              <input type="date" className="form-input w-full" value={formData.last_donation_date ? formData.last_donation_date.split('T')[0] : ""} onChange={e => setFormData({...formData, last_donation_date: e.target.value})} />
            </div>

            <div className="space-y-1.5"><label className="form-label">Address</label>
              <textarea className="form-input w-full" value={formData.address1 || ""} onChange={e => setFormData({...formData, address1: e.target.value})} placeholder="Address 1" />
            </div>

            <div className="space-y-1.5"><label className="form-label">Address 2</label>
              <textarea className="form-input w-full" value={formData.address2 || ""} onChange={e => setFormData({...formData, address2: e.target.value})} placeholder="Address 2" />
            </div>
            <div className="space-y-1.5"><label className="form-label">Sort Order</label>
              <input type="number" className="form-input w-full" value={formData.sort_order ?? ""} onChange={e => setFormData({...formData, sort_order: e.target.value})} />
            </div>

            <div className="space-y-1.5"><label className="form-label">Status</label>
              <select className="form-input w-full cursor-pointer appearance-none" style={{ colorScheme: "dark" }} value={formData.status} onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t pt-8 mt-4" style={{ borderColor: "var(--border-color)" }}>
              <button type="submit" className="btn-primary px-12 py-3">{isEdit ? "Update Donor" : "Save Donor"}</button>
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
                  <th className="text-admin-th">Donor Name</th>
                  <th className="text-admin-th">Blood Group</th>
                  <th className="text-admin-th">Phone</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <tr key={row.blood_donor_code} onClick={() => setSelectedRow(selectedRow?.blood_donor_code === row.blood_donor_code ? null : row)} className={`group cursor-pointer transition-colors ${selectedRow?.blood_donor_code === row.blood_donor_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}>
                      <td className="px-6 py-4">
                        <div className={`selection-indicator ${selectedRow?.blood_donor_code === row.blood_donor_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                          {selectedRow?.blood_donor_code === row.blood_donor_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="text-admin-td">{row.blood_donor_code}</td>
                      <td className="text-admin-td">{`${row.donor_firstname} ${row.donor_lastname}`}</td>
                      <td className="text-admin-td"><span className="font-bold text-rose-600">{row.blood_group_code}</span></td>
                      <td className="text-admin-td">{row.phone || "-"}</td>
                      <td className="text-admin-td">
                        <span className={`badge ${row.status === 1 ? "badge-success" : "badge-danger"}`}>{row.status === 1 ? "Active" : "Inactive"}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-24 text-center">
                      <FaHandHoldingHeart size={64} className="mb-6 mx-auto opacity-10 text-rose-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No donors found</p>
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

export default BloodDonor;