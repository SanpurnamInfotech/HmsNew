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
  FaLightbulb,
} from "react-icons/fa";

/*
========================================================
 IPD Services
 - Layout & grid identical to IPD Registration
 - Only text / number fields
========================================================
*/

const IpdServices = () => {
  /* ================= CRUD ================= */
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud("ipd-services/");

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    service: "",
    description: "",
    per_quantity: 1,
    amount: "",
    is_billable: "Yes",
  });

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success",
  });

  /* ================= TABLE UTILS ================= */
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
  } = useTable(data);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      service: "",
      description: "",
      per_quantity: 1,
      amount: "",
      is_billable: "Yes",
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = isEdit
      ? await updateItem(
          `ipd-services/update/${selectedRow.service_id}/`,
          formData
        )
      : await createItem("ipd-services/create/", formData);

    if (result.success) {
      showModal(`Service ${isEdit ? "updated" : "created"} successfully`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedRow) {
      showModal("Please select a service first", "error");
      return;
    }

    const result = await deleteItem(
      `ipd-services/delete/${selectedRow.service_id}/`
    );

    if (result.success) {
      showModal("Service deleted successfully");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed", "error");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading IPD Services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* ================= MODAL ================= */}
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-body">
              <div className="modal-icon-container">
                {modal.type === "success" ? (
                  <div className="modal-icon-success">
                    <FaCheckCircle />
                  </div>
                ) : (
                  <div className="modal-icon-error">
                    <FaTimesCircle />
                  </div>
                )}
              </div>
              <h3
                className={`modal-title ${
                  modal.type === "success"
                    ? "modal-title-success"
                    : "modal-title-error"
                }`}
              >
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

      {/* ================= HEADER ================= */}
      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">IPD Services</h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add Service
            </button>

            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData(selectedRow);
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

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="form-container">
          <div className="mb-8 border-b border-gray-50 pb-5">
            <h6 className="text-lg font-bold text-gray-800">
              {isEdit ? "Update Service" : "New Service"}
            </h6>
          </div>

          <form
            className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-1.5 md:col-span-2">
              <label className="form-label">Service Name</label>
              <input
                className="form-input"
                value={formData.service}
                onChange={(e) =>
                  setFormData({ ...formData, service: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="form-label">Amount</label>
              <input
                className="form-input"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="form-label">Per Quantity</label>
              <input
                type="number"
                className="form-input"
                value={formData.per_quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    per_quantity: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="form-label">Billable</label>
              <select
                className="form-input"
                value={formData.is_billable}
                onChange={(e) =>
                  setFormData({ ...formData, is_billable: e.target.value })
                }
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-4">
              <label className="form-label">Description</label>
              <textarea
                className="form-input min-h-[45px]"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
              <button className="btn-primary px-10">
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

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header-row">
                  <th className="table-th"></th>
                  <th className="table-th">Service ID</th>
                  <th className="table-th">Service</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Billable</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr
                      key={item.service_id}
                      onClick={() =>
                        setSelectedRow(
                          selectedRow?.service_id === item.service_id
                            ? null
                            : item
                        )
                      }
                      className={`table-row ${
                        selectedRow?.service_id === item.service_id
                          ? "table-row-active"
                          : "table-row-hover"
                      }`}
                    >
                      <td className="table-td">
                        <div
                          className={`selection-indicator ${
                            selectedRow?.service_id === item.service_id
                              ? "selection-indicator-active"
                              : "selection-indicator-inactive"
                          }`}
                        >
                          {selectedRow?.service_id === item.service_id && (
                            <div className="selection-dot" />
                          )}
                        </div>
                      </td>
                      <td className="table-td text-admin-id">
                        {item.service_id}
                      </td>
                      <td className="table-td text-admin-id">
                        {item.service}
                      </td>
                      <td className="table-td text-admin-id">
                        {item.amount}
                      </td>
                      <td className="table-td text-admin-id">
                        {item.is_billable}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaLightbulb
                          size={48}
                          className="mb-4 text-gray-400 mx-auto"
                        />
                        <p className="text-xl font-bold text-gray-500">
                          No services found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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

export default IpdServices;