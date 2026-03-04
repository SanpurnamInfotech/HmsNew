import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaLightbulb } from "react-icons/fa";

const IcdMasterMst = () => {
  /* ================= DATA FETCHING ================= */
  const ICD_PATH = "icd-master";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${ICD_PATH}/`);

  /* ================= UI STATES ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    icd_code: "",
    icd_name: "",
    status: 1,
    sort_order: "",
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
  } = useTable(data || []);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({ icd_code: "", icd_name: "", status: 1, sort_order: "" });
  };

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  /* ================= CRUD ACTIONS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionPath = isEdit ? `${ICD_PATH}/update/${formData.icd_code}/` : `${ICD_PATH}/create/`;
    
    const payload = { ...formData };
    if (payload.sort_order === "" || payload.sort_order === null || payload.sort_order === undefined) {
        payload.sort_order = null; 
      } else {
        payload.sort_order = Number(payload.sort_order);
      }


    const result = isEdit ? await updateItem(actionPath, payload) : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`ICD Record ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow || !selectedRow.icd_code) return;

    const result = await deleteItem(`${ICD_PATH}/delete/${selectedRow.icd_code}/`);
    if (result.success) {
      showModal("ICD Record deleted successfully!");
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

      {/* HEADER SECTION */}
      <div className="section-header">
        <h4 className="page-title">ICD Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>
            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="btn-warning" onClick={() => { setFormData(selectedRow); setIsEdit(true); setShowForm(true); }}>
                  <FaEdit size={14} /> Edit
                </button>
                <button className="btn-danger" onClick={handleDelete}>
                  <FaTrash size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM SECTION (2 Columns) */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">
            {isEdit ? "Update ICD Details" : "Create New ICD"}
          </h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            
            <div className="space-y-1.5">
              <label className="form-label">ICD Code</label>
              <input
                className={`form-input w-full ${isEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                value={formData.icd_code} disabled={isEdit} required
                placeholder="E.G. A00.0"
                onChange={e => setFormData({ ...formData, icd_code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">ICD Name</label>
              <input
                className="form-input w-full"
                value={formData.icd_name} required
                placeholder="Enter disease or condition name"
                onChange={e => setFormData({ ...formData, icd_name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Sort Order</label>
              <input 
                type="number" 
                className="form-input w-full"
                value={formData.sort_order} 
                placeholder="0"
                onChange={e => setFormData({ ...formData, sort_order: e.target.value })} 
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select 
                className="form-input w-full cursor-pointer appearance-none" 
                value={formData.status} 
                onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t pt-8 mt-4" style={{ borderColor: "var(--border-color)" }}>
              <button type="submit" className="btn-primary px-12 py-3">
                {isEdit ? "Update" : "Save"}
              </button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE SECTION */}
      {!showForm && (
        <div className="data-table-container animate-in fade-in duration-500">
          <TableToolbar 
            itemsPerPage={itemsPerPage} 
            setItemsPerPage={setItemsPerPage} 
            search={search} 
            setSearch={setSearch} 
            setCurrentPage={setCurrentPage} 
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">ICD Code</th>
                  <th className="text-admin-th">ICD Name</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  [...(paginatedData || [])]
                  .sort((a, b) => {
                    const sa = (a.sort_order === null || a.sort_order === "" || a.sort_order === undefined) 
                              ? 999 : Number(a.sort_order);
                    const sb = (b.sort_order === null || b.sort_order === "" || b.sort_order === undefined) 
                              ? 999 : Number(b.sort_order);
                    return sa - sb;
                  })
                  .map(row => (
                    <tr 
                      key={row.icd_code} 
                      onClick={() => setSelectedRow(selectedRow?.icd_code === row.icd_code ? null : row)}
                      className={`group cursor-pointer transition-colors ${selectedRow?.icd_code === row.icd_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}
                    >
                      <td className="px-6 py-4">
                        <div className={`selection-indicator ${selectedRow?.icd_code === row.icd_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                          {selectedRow?.icd_code === row.icd_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="text-admin-td">{row.icd_code}</td>
                      <td className="text-admin-td">{row.icd_name}</td>
                      <td className="text-admin-td">
                        <span className={`badge ${row.status === 1 ? "badge-success" : "badge-danger"}`}>
                          {row.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                      <FaLightbulb size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No ICD Records Found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination-container">
            <Pagination 
              totalEntries={filteredData.length} 
              itemsPerPage={effectiveItemsPerPage} 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              totalPages={totalPages} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IcdMasterMst;