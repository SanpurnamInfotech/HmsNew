import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar }
  from "../../components/common/BaseCRUD";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle
} from "react-icons/fa";

const States = () => {

  /* ================= CRUD ================= */
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud("states/");
  const { data: countries = [] } = useCrud("countries/");

  /* ================= STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedState, setSelectedState] = useState(null);

  const initialForm = {
    state_code: "",
    state_name: "",
    country_code: "",
    status: 1
  };

  const [formData, setFormData] = useState(initialForm);

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success"
  });

  /* ================= TABLE ================= */
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
    setSelectedState(null);
    setFormData(initialForm);
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.country_code) {
      showModal("Please select Country", "error");
      return;
    }

    const payload = {
      ...formData,
      status: Number(formData.status)
    };

    const result = isEdit
      ? await updateItem(`states/update/${formData.state_code}/`, payload)
      : await createItem(`states/create/`, payload);

    if (result?.success) {
      showModal(`State ${isEdit ? "updated" : "created"} successfully!`);
      refresh();
      resetForm();
    } else {
      showModal(result?.error || "Operation failed!", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedState) return;

    const result = await deleteItem(
      `states/delete/${selectedState.state_code}/`
    );

    if (result?.success) {
      showModal("State deleted successfully!");
      setSelectedState(null);
      refresh();
    } else {
      showModal(result?.error || "Delete failed!", "error");
    }
  };

  if (loading)
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
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
                  ? <div className="modal-icon-success"><FaCheckCircle /></div>
                  : <div className="modal-icon-error"><FaTimesCircle /></div>}
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

      {/* ================= HEADER ================= */}
      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">
          State Master
        </h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedState && (
              <div className="flex items-center gap-2">
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData(selectedState);
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

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="form-container">
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >

            <input
              className={`form-input ${isEdit ? "form-input-disabled" : ""}`}
              placeholder="State Code"
              value={formData.state_code}
              disabled={isEdit}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  state_code: e.target.value.toUpperCase()
                })
              }
            />

            <input
              className="form-input"
              placeholder="State Name"
              value={formData.state_name}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  state_name: e.target.value
                })
              }
            />

            {/* COUNTRY DROPDOWN */}
            <select
              className="form-input"
              value={formData.country_code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  country_code: e.target.value
                })
              }
            >
              <option value="" disabled>
                Select Country
              </option>

              {countries.map((c) => (
                <option key={c.country_code} value={c.country_code}>
                  {c.country_name}
                </option>
              ))}
            </select>

            <select
              className="form-input"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: Number(e.target.value)
                })
              }
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>

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

          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="table-th w-16"></th>
                <th className="table-th">Code</th>
                <th className="table-th">Name</th>
                <th className="table-th">Country</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((s) => (
                  <tr
                    key={s.state_code}
                    onClick={() =>
                      setSelectedState(
                        selectedState?.state_code === s.state_code ? null : s
                      )
                    }
                    className={`table-row ${
                      selectedState?.state_code === s.state_code
                        ? "table-row-active"
                        : "table-row-hover"
                    }`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${
                        selectedState?.state_code === s.state_code
                          ? "selection-indicator-active"
                          : "selection-indicator-inactive"
                      }`}>
                        {selectedState?.state_code === s.state_code &&
                          <div className="selection-dot" />}
                      </div>
                    </td>

                    <td className="table-td">{s.state_code}</td>
                    <td className="table-td">{s.state_name}</td>
                    <td className="table-td">{s.country_code}</td>
                    <td className="table-td">
                      <span className={
                        s.status === 1
                          ? "status-badge-active"
                          : "status-badge-inactive"
                      }>
                        {s.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-20">
                    <FaExclamationCircle size={48} className="text-gray-400 mb-4" />
                    <p className="text-gray-500 font-bold">
                      No states found
                    </p>
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

export default States;