import React, { useMemo, useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaUsers } from "react-icons/fa";

const RelationMaster = () => {
  /* ================= API ================= */
  const PATH = "relation_master";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    relation_code: "",
    relation_name: "",
    status: 1,
    sort_order: "",
  });

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

  /* ================= SORTING LOGIC ================= */
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      // Consistent sorting logic: blanks/nulls go to the end (9999)
      const sa = (a.sort_order === null || a.sort_order === "" || a.sort_order === undefined) ? 9999 : Number(a.sort_order);
      const sb = (b.sort_order === null || b.sort_order === "" || b.sort_order === undefined) ? 9999 : Number(b.sort_order);
      
      if (sa !== sb) return sa - sb;
      
      // Secondary sort by code if sort_order is identical
      return (a.relation_code || "").localeCompare(b.relation_code || "");
    });
  }, [data]);

  /* ================= TABLE ================= */
  const {
    search, setSearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    paginatedData,
    effectiveItemsPerPage,
    filteredData,
    totalPages
  } = useTable(sortedData);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      relation_code: "",
      relation_name: "",
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
      ? `${PATH}/update/${formData.relation_code}/`
      : `${PATH}/create/`;

    const payload = {
      ...formData,
      status: Number(formData.status),
      // Corrected sort_order processing for DB
      sort_order: (formData.sort_order === "" || formData.sort_order === null) ? null : Number(formData.sort_order),
    };

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(`${PATH}/create/`, payload);

    if (result.success) {
      showModal(`Relation ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedRow) return;

    const result = await deleteItem(`${PATH}/delete/${selectedRow.relation_code}/`);

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

      {/* HEADER */}
      <div className="section-header">
        <h4 className="page-title">Relation Master</h4>
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
                    setFormData({ ...selectedRow, sort_order: selectedRow.sort_order ?? "" });
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

      {/* FORM */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">
            {isEdit ? "Update Relation Profile" : "Add New Relation"}
          </h6>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">Relation Code <span className="text-rose-500">*</span></label>
              <input
                className="form-input w-full"
                value={formData.relation_code}
                disabled={isEdit}
                required
                onChange={(e) => setFormData({ ...formData, relation_code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                placeholder="E.G. MOT"
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Relation Name <span className="text-rose-500">*</span></label>
              <input
                className="form-input w-full"
                value={formData.relation_name}
                required
                onChange={(e) => setFormData({ ...formData, relation_name: e.target.value })}
                placeholder="E.G. Mother"
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Sort Order</label>
              <input
                className="form-input w-full"
                type="number"
                value={formData.sort_order}
                placeholder="E.G. 1"
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select
                className="form-input w-full cursor-pointer appearance-none"
                style={{ colorScheme: "dark" }}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
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
                  <th className="text-admin-th">Relation Name</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? paginatedData.map((item) => (
                  <tr
                    key={item.relation_code}
                    onClick={() => setSelectedRow(selectedRow?.relation_code === item.relation_code ? null : item)}
                    className={`group cursor-pointer transition-colors ${selectedRow?.relation_code === item.relation_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}
                  >
                    <td className="px-6 py-4">
                      <div className={`selection-indicator ${selectedRow?.relation_code === item.relation_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                        {selectedRow?.relation_code === item.relation_code && <div className="selection-dot" />}
                      </div>
                    </td>
                    <td className="text-admin-td">{item.relation_code}</td>
                    <td className="text-admin-td">{item.relation_name}</td>
                    <td className="text-admin-td">
                      <span className={`badge ${item.status === 1 ? "badge-success" : "badge-danger"}`}>
                        {item.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-24 text-center">
                      <FaUsers size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No relations found</p>
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

export default RelationMaster;