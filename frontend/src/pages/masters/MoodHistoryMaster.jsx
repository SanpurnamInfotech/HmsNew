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
  FaSmile
} from "react-icons/fa";

const MoodHistoryMaster = () => {

  /* ================= CRUD ================= */
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud("mood-history/");

  /* ================= STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const initialForm = {
    mood_history_code: "",
    mood_history_name: "",
    sort_order: "",
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
    setSelectedItem(null);
    setFormData(initialForm);
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      status: Number(formData.status)
    };

    const result = isEdit
      ? await updateItem(
          `mood-history/update/${formData.mood_history_code}/`,
          payload
        )
      : await createItem("mood-history/create/", payload);

    if (result?.success) {
      showModal(`Record ${isEdit ? "updated" : "created"} successfully!`);
      refresh();
      resetForm();
    } else {
      showModal(result?.error || "Operation failed!", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedItem) return;

    const result = await deleteItem(
      `mood-history/delete/${selectedItem.mood_history_code}/`
    );

    if (result?.success) {
      showModal("Record deleted successfully!");
      setSelectedItem(null);
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
          Mood History Master
        </h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedItem && (
              <div className="flex items-center gap-2">
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData(selectedItem);
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
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 animate-in zoom-in-95 duration-200">

          <h6 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
            {isEdit ? "Update Mood History" : "Create Mood History"}
          </h6>
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >

            <input
              className={`form-input ${isEdit ? "form-input-disabled" : ""}`}
              placeholder="Code"
              value={formData.mood_history_code}
              disabled={isEdit}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mood_history_code: e.target.value.toUpperCase()
                })
              }
            />

            <input
              className="form-input"
              placeholder="Name"
              value={formData.mood_history_name}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mood_history_name: e.target.value
                })
              }
            />

            <input
              type="number"
              className="form-input"
              placeholder="Sort Order"
              value={formData.sort_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sort_order: e.target.value
                })
              }
            />

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
                <th className="table-th">Sort</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((m) => (
                  <tr
                    key={m.mood_history_code}
                    onClick={() =>
                      setSelectedItem(
                        selectedItem?.mood_history_code === m.mood_history_code
                          ? null
                          : m
                      )
                    }
                    className={`table-row ${
                      selectedItem?.mood_history_code === m.mood_history_code
                        ? "table-row-active"
                        : "table-row-hover"
                    }`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${
                        selectedItem?.mood_history_code === m.mood_history_code
                          ? "selection-indicator-active"
                          : "selection-indicator-inactive"
                      }`}>
                        {selectedItem?.mood_history_code === m.mood_history_code &&
                          <div className="selection-dot" />}
                      </div>
                    </td>

                    <td className="table-td">{m.mood_history_code}</td>
                    <td className="table-td">{m.mood_history_name}</td>
                    <td className="table-td">{m.sort_order}</td>
                    <td className="table-td">
                      <span className={
                        m.status === 1
                          ? "status-badge-active"
                          : "status-badge-inactive"
                      }>
                        {m.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-20">
                    <FaSmile size={48} className="text-gray-400 mb-4" />
                    <p className="text-gray-500 font-bold">
                      No records found
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

export default MoodHistoryMaster;