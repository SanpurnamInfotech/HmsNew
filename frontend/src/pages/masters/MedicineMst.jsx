import React, { useState, useEffect } from "react";
import api from "../../utils/domain";
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
  FaCapsules,
} from "react-icons/fa";

const MedicineMst = () => {
  /* ================= API ================= */
  const PATH = "medicine";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);

  /* ================= UI STATE ================= */
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    medicine_code: "",
    medicine_cat_code: "",
    medicine_name: "",
    generic_name: "",
    qty: "",
    unit_price: "",
    prescription_required: 0,
    status: 1,
    sort_order: ""
  });

  const [modal, setModal] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  /* ================= TABLE LOGIC ================= */
  const sortedData = React.useMemo(() => {
    return [...(data || [])].sort((a, b) => {
      const sa = a.sort_order ?? 999999;
      const sb = b.sort_order ?? 999999;
      return Number(sa) - Number(sb);
    });
  }, [data]);

  const {
    search, setSearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    paginatedData,
    effectiveItemsPerPage,
    filteredData,
    totalPages
  } = useTable(sortedData);

  /* ================= EFFECTS & FETCHING ================= */
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("medicine-category/");
      const d = res.data?.results || res.data || [];
      setCategories(d);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      medicine_code: "",
      medicine_cat_code: "",
      medicine_name: "",
      generic_name: "",
      qty: "",
      unit_price: "",
      prescription_required: 0,
      status: 1,
      sort_order: ""
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ visible: true, message, type });

  /* ================= CRUD ACTIONS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.medicine_code}/`
      : `${PATH}/create/`;

    const payload = { ...formData };
    if (payload.sort_order === "" || payload.sort_order === null) {
      delete payload.sort_order;
    }

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Medicine ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
      setCurrentPage(1);
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;

    const result = await deleteItem(`${PATH}/delete/${selectedRow.medicine_code}/`);

    if (result.success) {
      showModal("Medicine record deleted successfully!");
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? (
                <FaCheckCircle className="text-6xl text-emerald-500" />
              ) : (
                <FaTimesCircle className="text-6xl text-rose-500" />
              )}
            </div>
            <h3 className={`text-xl font-black mb-2 uppercase tracking-tight ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            <p className="mb-6 font-medium opacity-80">{modal.message}</p>
            <button className="btn-primary w-full justify-center py-3" onClick={() => setModal({ ...modal, visible: false })}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="section-header">
        <h4 className="page-title">Medicine Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>
            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button 
                  className="btn-warning" 
                  onClick={() => { 
                    setFormData({
                      ...selectedRow,
                      medicine_cat_code: selectedRow.medicine_cat_code?.medicine_cat_code || selectedRow.medicine_cat_code
                    }); 
                    setIsEdit(true); 
                    setShowForm(true); 
                  }}
                >
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

      {/* FORM SECTION (2 COLUMNS) */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">
            {isEdit ? "Update Medicine Profile" : "Add New Medicine"}
          </h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            
            <div className="space-y-1.5">
              <label className="form-label">Medicine Code</label>
              <input
                className="form-input w-full"
                value={formData.medicine_code} 
                disabled={isEdit} 
                required
                placeholder="E.G. MED001"
                onChange={e => setFormData({ ...formData, medicine_code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Category</label>
              <select
                className="form-input w-full cursor-pointer"
                style={{ colorScheme: "dark" }}
                required
                value={formData.medicine_cat_code}
                onChange={e => setFormData({ ...formData, medicine_cat_code: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.medicine_cat_code} value={c.medicine_cat_code}>
                    {c.medicine_cat_name || c.medicine_cat_code}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Medicine Name</label>
              <input
                className="form-input w-full"
                value={formData.medicine_name} 
                required
                placeholder="E.G. Paracetamol"
                onChange={e => setFormData({ ...formData, medicine_name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Generic Name</label>
              <input
                className="form-input w-full"
                value={formData.generic_name} 
                placeholder="E.G. Acetaminophen"
                onChange={e => setFormData({ ...formData, generic_name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-input w-full"
                value={formData.qty} 
                placeholder="E.G. 100"
                onChange={e => setFormData({ ...formData, qty: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Unit Price</label>
              <input
                type="number"
                step="0.01"
                className="form-input w-full"
                value={formData.unit_price} 
                placeholder="0.00"
                onChange={e => setFormData({ ...formData, unit_price: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Prescription Required</label>
              <select
                className="form-input w-full cursor-pointer"
                style={{ colorScheme: "dark" }}
                value={formData.prescription_required}
                onChange={e => setFormData({ ...formData, prescription_required: Number(e.target.value) })}
              >
                <option value={1}>Yes (Required)</option>
                <option value={0}>No (OTC)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select 
                className="form-input w-full cursor-pointer" 
                style={{ colorScheme: "dark" }}
                value={formData.status} 
                onChange={e => setFormData({ ...formData, status: parseInt(e.target.value) })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Sort Order</label>
              <input
                type="number"
                className="form-input w-full"
                value={formData.sort_order} 
                placeholder="E.G. 1"
                onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
              />
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
                  <th className="text-admin-th">Code</th>
                  <th className="text-admin-th">Medicine Name</th>
                  <th className="text-admin-th">Category</th>
                  <th className="text-admin-th">Price</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row) => (
                    <tr 
                      key={row.medicine_code} 
                      onClick={() => setSelectedRow(selectedRow?.medicine_code === row.medicine_code ? null : row)}
                      className={`group cursor-pointer transition-colors ${selectedRow?.medicine_code === row.medicine_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}
                    >
                      <td className="px-6 py-4">
                        <div className={`selection-indicator ${selectedRow?.medicine_code === row.medicine_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                          {selectedRow?.medicine_code === row.medicine_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="text-admin-td">{row.medicine_code}</td>
                      <td className="text-admin-td">{row.medicine_name}</td>
                      <td className="text-admin-td">{row.medicine_cat_code}</td>
                      <td className="text-admin-td">{row.unit_price}</td>
                      <td className="text-admin-td">
                        <span className={`badge ${row.status === 1 ? "badge-success" : "badge-danger"}`}>
                          {row.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-24 text-center">
                      <FaCapsules size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No Medicines Found</p>
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

export default MedicineMst;