import React, { useState } from "react";
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

const RoomTypeMasterMst = () => {
  /* ================= API ================= */
  const PATH = "room-type-master";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    room_type_code: "",
    room_type_name: "",
    bed_charges: "",
    status: 1,
    sort_order: "",
  });

  const [modal, setModal] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  /* ================= TABLE ================= */
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
  } = useTable(data || []);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      room_type_code: "",
      room_type_name: "",
      bed_charges: "",
      status: 1,
      sort_order: "",
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ visible: true, message, type });

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.room_type_code}/`
      : `${PATH}/create/`;

    const payload = { ...formData };
    if (payload.sort_order === "" || payload.sort_order === null) {
      delete payload.sort_order;
    }

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Room Type ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  /* ================= DELETE (Confirmation Removed) ================= */
  const handleDelete = async () => {
    if (!selectedRow) return;

    const result = await deleteItem(`${PATH}/delete/${selectedRow.room_type_code}/`);

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
        <h4 className="page-title">Room Type Master</h4>
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

      {/* FORM SECTION (2 COLUMNS) */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">
            {isEdit ? "Update Room Type Profile" : "Add New Room Type"}
          </h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            
            <div className="space-y-1.5">
              <label className="form-label">Room Type Code</label>
              <input
                className="form-input w-full"
                value={formData.room_type_code} 
                disabled={isEdit} 
                required
                placeholder="E.G. DLX"
                onChange={e => setFormData({ ...formData, room_type_code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Room Type Name</label>
              <input
                className="form-input w-full"
                value={formData.room_type_name} 
                required
                placeholder="E.G. Deluxe Room"
                onChange={e => setFormData({ ...formData, room_type_name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Bed Charges</label>
              <input
                type="number"
                step="0.01"
                className="form-input w-full"
                value={formData.bed_charges} 
                placeholder="0.00"
                onChange={e => setFormData({ ...formData, bed_charges: e.target.value })}
              />
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

            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select 
                className="form-input w-full cursor-pointer appearance-none" 
                style={{ colorScheme: "dark" }}
                value={formData.status} 
                onChange={e => setFormData({ ...formData, status: parseInt(e.target.value) })}
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
                  <th className="text-admin-th">Code</th>
                  <th className="text-admin-th">Room Type Name</th>
                  <th className="text-admin-th">Bed Charges</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  [...paginatedData]
                    .sort((a, b) => (Number(a.sort_order || 999) - Number(b.sort_order || 999)))
                    .map((row) => (
                    <tr 
                      key={row.room_type_code} 
                      onClick={() => setSelectedRow(selectedRow?.room_type_code === row.room_type_code ? null : row)}
                      className={`group cursor-pointer transition-colors ${selectedRow?.room_type_code === row.room_type_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}
                    >
                      <td className="px-6 py-4">
                        <div className={`selection-indicator ${selectedRow?.room_type_code === row.room_type_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                          {selectedRow?.room_type_code === row.room_type_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="text-admin-td">{row.room_type_code}</td>
                      <td className="text-admin-td">{row.room_type_name}</td>
                      <td className="text-admin-td">{row.bed_charges || "0.00"}</td>
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
                      <FaBed size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No Records Found</p>
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

export default RoomTypeMasterMst;