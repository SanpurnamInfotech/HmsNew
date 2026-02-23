import React, { useState } from "react";
import {
  useCrud,
  useTable,
  Pagination,
  TableToolbar
} from "../../components/common/BaseCRUD";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaLightbulb
} from "react-icons/fa";

const ThoughtContentMaster = () => {
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud("thought_content_master/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [formData, setFormData] = useState({
    thought_content_code: "",
    thought_content_name: "",
    sort_order: 0,
    status: 1
  });

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success"
  });

  const {
    search, setSearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    paginatedData,
    effectiveItemsPerPage,
    filteredData,
    totalPages
  } = useTable(data);

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelected(null);
    setFormData({
      thought_content_code: "",
      thought_content_name: "",
      sort_order: 0,
      status: 1
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };

    const result = isEdit
      ? await updateItem(
          `thought_content_master/update/${formData.thought_content_code}/`,
          payload
        )
      : await createItem(
          "thought_content_master/create/",
          payload
        );

    if (result?.success) {
      showModal(
        `Thought content ${isEdit ? "updated" : "created"} successfully!`
      );
      resetForm();
      refresh();
    } else {
      showModal(result?.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected || !selected.thought_content_code) {
      showModal("Please select a record first", "error");
      return;
    }

    const res = await deleteItem(
      `thought_content_master/delete/${selected.thought_content_code}/`
    );

    if (res?.success) {
      showModal("Deleted successfully!");
      setSelected(null);
      refresh();
    } else {
      showModal(res?.error || "Delete failed!", "error");
    }
  };

  if (loading)
    return (
      <div className="loading-overlay">
        <div className="loading-spinner-container text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-emerald-700 font-bold">
            Loading Thought Content...
          </p>
        </div>
      </div>
    );

  return (
    <div className="app-container">
      {/* ================= MODAL ================= */}
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-body">
              <div className="modal-icon-container">
                {modal.type === "success" 
                  ? <FaCheckCircle className="modal-icon-success" /> 
                  : <FaTimesCircle className="modal-icon-error" />}
              </div>
              <h3 className={`modal-title ${modal.type === "success" ? "modal-title-success" : "modal-title-error"}`}>
                {modal.type === "success" ? "Success" : "Error"}
              </h3>
              <p className="modal-message">{modal.message}</p>
              <button className="btn-primary w-full justify-center" onClick={() => setModal({ ...modal, visible: false })}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="section-header">
        <h4 className="page-title">Thought Content Master</h4>
        {!showForm && (
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>
            {selected && (
              <div className="selection-actions animate-slide-in">
                <button className="btn-warning" onClick={() => { setFormData({...selected}); setIsEdit(true); setShowForm(true); }}>
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

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="form-container animate-zoom-in">
          <h6 className="form-section-title">
            {isEdit ? "Update Thought Content" : "Create Thought Content"}
          </h6>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Code</label>
              <input
                type="text"
                className={`form-input w-full ${isEdit ? "form-input-disabled" : ""}`}
                value={formData.thought_content_code}
                disabled={isEdit}
                required
                onChange={e => setFormData({ ...formData, thought_content_code: e.target.value.toUpperCase().replace(/\s/g, "_") })}
                placeholder="E.G. THOUGHT_DELUSION"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input w-full"
                value={formData.thought_content_name}
                required
                onChange={e => setFormData({ ...formData, thought_content_name: e.target.value })}
                placeholder="E.G. Delusions of Grandeur"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sort Order</label>
              <input
                type="number"
                className="form-input w-full"
                value={formData.sort_order}
                onChange={e => setFormData({ ...formData, sort_order: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input w-full appearance-none"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="form-actions">
              <button className="btn-primary px-12">
                {isEdit ? "Update" : "Save"}
              </button>
              <button type="button" className="btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TABLE ================= */}
      {!showForm && (
        <div className="data-table-container">
          <TableToolbar
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            search={search}
            setSearch={setSearch}
            setCurrentPage={setCurrentPage}
          />

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr className="table-header-row">
                  <th className="table-th w-16 text-center"></th>
                  <th className="text-admin-th">Code</th>
                  <th className="text-admin-th">Name</th>
                  <th className="text-admin-th">Sort</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr
                      key={item.thought_content_code}
                      onClick={() => setSelected(selected?.thought_content_code === item.thought_content_code ? null : item)}
                      className={`table-row ${selected?.thought_content_code === item.thought_content_code ? "table-row-active" : "table-row-hover"}`}
                    >
                      <td className="table-td text-center">
                        <div className={`selection-indicator mx-auto ${selected?.thought_content_code === item.thought_content_code ? "selection-indicator-active" : "selection-indicator-inactive"}`}>
                          {selected?.thought_content_code === item.thought_content_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="text-admin-td">{item.thought_content_code}</td>
                      <td className="text-admin-td">{item.thought_content_name}</td>
                      <td className="text-admin-td">{item.sort_order}</td>
                      <td className="table-td">
                        <span className={`badge ${item.status === 1 ? "badge-success" : "badge-danger"}`}>
                          {item.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="table-td py-20 text-center">
                      <FaLightbulb size={48} className="mb-4 text-gray-200 mx-auto" />
                      <p className="text-lg font-medium text-gray-400">No records found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-gray-50">
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

export default ThoughtContentMaster;