import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle
} from "react-icons/fa";

const ComplaintMaster = () => {

  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud("complaints/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [formData, setFormData] = useState({
    complaint_code: "",
    complaint_name: "",
    sort_order: "",
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
    setSelectedComplaint(null);
    setFormData({
      complaint_code: "",
      complaint_name: "",
      sort_order: "",
      status: 1
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result = isEdit
      ? await updateItem(
          `complaints/update/${formData.complaint_code}/`,
          formData
        )
      : await createItem("complaints/create/", formData);

    if (result.success) {
      showModal(
        `Complaint ${isEdit ? "updated" : "created"} successfully!`
      );
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedComplaint) return;

    const result = await deleteItem(
      `complaints/delete/${selectedComplaint.complaint_code}/`
    );

    if (result.success) {
      showModal("Complaint deleted successfully!");
      setSelectedComplaint(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading)
    return (
      <div className="loading-overlay">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading Complaint Data...</p>
        </div>
      </div>
    );

  return (
    <div className="app-container">

      {/* Modal */}
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-body">
              <div className="modal-icon-container">
                {modal.type === "success"
                  ? <div className="modal-icon-success"><FaCheckCircle /></div>
                  : <div className="modal-icon-error"><FaTimesCircle /></div>
                }
              </div>
              <h3 className={`modal-title ${
                modal.type === "success"
                  ? "modal-title-success"
                  : "modal-title-error"
              }`}>
                {modal.type === "success" ? "Success" : "Error"}
              </h3>
              <p className="modal-message mb-6">{modal.message}</p>
              <button
                className="btn-primary w-full"
                onClick={() => setModal({ ...modal, visible: false })}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">
          Complaint Master
        </h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedComplaint && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData({ ...selectedComplaint });
                    setIsEdit(true);
                    setShowForm(true);
                  }}
                >
                  <FaEdit size={14} /> Edit
                </button>

                <button
                  className="btn-danger"
                  onClick={handleDelete}
                >
                  <FaTrash size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="form-container">
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >

            <div>
              <label className="form-label">Complaint Code</label>
              <input
                className={`form-input ${isEdit ? "form-input-disabled" : ""}`}
                value={formData.complaint_code}
                disabled={isEdit}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    complaint_code: e.target.value.toUpperCase()
                  })
                }
              />
            </div>

            <div>
              <label className="form-label">Complaint Name</label>
              <input
                className="form-input"
                value={formData.complaint_name}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    complaint_name: e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="form-label">Sort Order</label>
              <input
                type="number"
                className="form-input"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sort_order: e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value
                  })
                }
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-6">
              <button className="btn-primary px-8">
                {isEdit ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Table */}
      {!showForm && (
        <div className="data-table-container">

          <TableToolbar
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            search={search}
            setSearch={setSearch}
            setCurrentPage={setCurrentPage}
          />

          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="table-th w-16"></th>
                <th className="table-th">Code</th>
                <th className="table-th">Name</th>
                <th className="table-th">Sort</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {paginatedData.length > 0 ? (
                paginatedData.map((c) => (
                  <tr
                    key={c.complaint_code}
                    onClick={() =>
                      setSelectedComplaint(
                        selectedComplaint?.complaint_code === c.complaint_code
                          ? null
                          : c
                      )
                    }
                    className={`table-row ${
                      selectedComplaint?.complaint_code === c.complaint_code
                        ? "table-row-active"
                        : "table-row-hover"
                    }`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${
                        selectedComplaint?.complaint_code === c.complaint_code
                          ? "selection-indicator-active"
                          : "selection-indicator-inactive"
                      }`}>
                        {selectedComplaint?.complaint_code === c.complaint_code && <div className="selection-dot" />}
                      </div>
                    </td>
                    <td className="table-td text-admin-id">{c.complaint_code}</td>
                    <td className="table-td">{c.complaint_name}</td>
                    <td className="table-td">{c.sort_order}</td>
                    <td className="table-td">
                      <span className={c.status === 1 ? "status-badge-active" : "status-badge-inactive"}>
                        {c.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="table-td py-20 text-center">
                    <div className="empty-state-container">
                      <FaExclamationCircle size={48} className="mb-4 text-gray-400" />
                      <p className="text-xl font-bold text-gray-500">
                        No complaints found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagination
            totalEntries={filteredData.length}
            itemsPerPage={effectiveItemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />

        </div>
      )}

    </div>
  );
};

export default ComplaintMaster;
