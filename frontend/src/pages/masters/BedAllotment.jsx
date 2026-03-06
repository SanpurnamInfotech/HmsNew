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
  FaBed,
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
  className = "form-input",
  error = false,
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
        className={`${className} w-full text-left flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${error ? "border-rose-500 ring-1 ring-rose-500" : ""}`}
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
      >
        <span className={selectedLabel ? "" : "opacity-40"}>
          {selectedLabel || placeholder}
        </span>
        <span className="text-xs opacity-50">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-(--bg-surface) border-(--border-color) shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
          <div className="p-3 border-b border-(--border-color)">
            <input
              autoFocus
              className="form-input w-full py-2 text-sm"
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-emerald-500/10 
                    ${String(o.value) === String(value) ? "bg-emerald-500/20 font-bold" : ""}`}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  {o.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center opacity-40 text-xs uppercase font-bold">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const BedAllotment = () => {
  const PATH = "bed_allotment";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);
  const { data: bedsData } = useCrud("bed/");
  const { data: patientsData } = useCrud("patient/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    bed_code: "",
    patient_code: "",
    allotment_timestamp: "",
    discharge_timestamp: "",
    status: 1,
    sort_order: "",
  });

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

  /* ================= SORTING LOGIC ================= */
  // Sort data by sort_order ascending (blanks/nulls go to end)
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const sa = (a.sort_order === null || a.sort_order === "" || a.sort_order === undefined) ? 9999 : Number(a.sort_order);
      const sb = (b.sort_order === null || b.sort_order === "" || b.sort_order === undefined) ? 9999 : Number(b.sort_order);
      return sa - sb;
    });
  }, [data]);

  /* ================= TABLE LOGIC ================= */
  const {
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    paginatedData,
    effectiveItemsPerPage,
    filteredData,
    totalPages,
  } = useTable(sortedData);

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({ id: null, bed_code: "", patient_code: "", allotment_timestamp: "", discharge_timestamp: "", status: 1, sort_order: "" });
  };

  const showModal = (message, type = "success") => setModal({ visible: true, message, type });

  const bedOptions = useMemo(() => (bedsData || []).map(b => ({ value: b.bed_code, label: b.bed_name })), [bedsData]);
  const patientOptions = useMemo(() => (patientsData || []).map(p => ({
    value: p.patient_code,
    label: `${p.patient_first_name} ${p.patient_last_name}`.trim()
  })), [patientsData]);

  /* ================= ACTIONS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bed_code || !formData.patient_code) {
        showModal("Please select both a Bed and a Patient.", "error");
        return;
    }

    const actionPath = isEdit ? `${PATH}/update/${formData.id}/` : `${PATH}/create/`;
    
    // Applying the same sort_order processing as Departments
    const payload = { 
        ...formData, 
        sort_order: (formData.sort_order === "" || formData.sort_order === null) ? null : Number(formData.sort_order)
    };
    
    if (!isEdit) delete payload.id;

    const result = isEdit ? await updateItem(actionPath, payload) : await createItem(actionPath, payload);
    if (result.success) {
      showModal(`Allotment ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    const result = await deleteItem(`${PATH}/delete/${selectedRow.id}/`);
    if (result.success) {
      showModal("Record deleted successfully!");
      setSelectedRow(null);
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
      {/* MODAL */}
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
        <h4 className="page-title">Bed Allotment</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus size={14} /> Add New</button>
            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="btn-warning" onClick={() => {
                  setFormData({
                    ...selectedRow,
                    allotment_timestamp: selectedRow.allotment_timestamp?.slice(0, 16) || "",
                    discharge_timestamp: selectedRow.discharge_timestamp?.slice(0, 16) || "",
                    sort_order: selectedRow.sort_order ?? ""
                  });
                  setIsEdit(true);
                  setShowForm(true);
                }}><FaEdit size={14} /> Edit</button>
                <button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">
            {isEdit ? "Update Allotment Details" : "New Bed Allotment"}
          </h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">Bed <span className="text-rose-500">*</span></label>
              <SearchableSelect
                value={formData.bed_code}
                options={bedOptions}
                placeholder="Choose Bed"
                onChange={(val) => setFormData({ ...formData, bed_code: val })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Patient <span className="text-rose-500">*</span></label>
              <SearchableSelect
                value={formData.patient_code}
                options={patientOptions}
                placeholder="Choose Patient"
                onChange={(val) => setFormData({ ...formData, patient_code: val })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Allotment Date & Time <span className="text-rose-500">*</span></label>
              <input
                required
                type="datetime-local"
                className="form-input w-full"
                value={formData.allotment_timestamp}
                onChange={(e) => setFormData({ ...formData, allotment_timestamp: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Discharge Date & Time <span className="text-rose-500">*</span></label>
              <input
                required
                type="datetime-local"
                className="form-input w-full"
                value={formData.discharge_timestamp}
                onChange={(e) => setFormData({ ...formData, discharge_timestamp: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Sort Order</label>
              <input
                type="number"
                className="form-input w-full"
                value={formData.sort_order}
                placeholder="E.G. 1"
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select 
                className="form-input w-full appearance-none" 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
              >
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
                  <th className="text-admin-th">Bed</th>
                  <th className="text-admin-th">Patient</th>
                  <th className="text-admin-th">Allotment</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedRow(selectedRow?.id === item.id ? null : item)}
                      className={`group cursor-pointer transition-colors ${selectedRow?.id === item.id ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}
                    >
                      <td className="px-6 py-4">
                        <div className={`selection-indicator ${selectedRow?.id === item.id ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                          {selectedRow?.id === item.id && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="text-admin-td">{item.bed_code}</td>
                      <td className="text-admin-td">{item.patient_code}</td>
                      <td className="text-admin-td">
                        {item.allotment_timestamp ? new Date(item.allotment_timestamp).toLocaleString() : "-"}
                      </td>
                      <td className="text-admin-td">
                        <span className={`badge ${item.status === 1 ? "badge-success" : "badge-danger"}`}>
                          {item.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                      <FaBed size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No allotments found</p>
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

export default BedAllotment;