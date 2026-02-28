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

const AdviceMaster = () => {
  /* ================= API ================= */
  const PATH = "advice_master";

  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    advice_code: "",
    advice_name: "",
    sort_order: "",
    status: 1,
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
  } = useTable(data);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      advice_code: "",
      advice_name: "",
      sort_order: "",
      status: 1,
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ visible: true, message, type });

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.advice_code}/`
      : `${PATH}/create/`;

    const payload = { ...formData };

    if (payload.sort_order === "" || payload.sort_order === null) {
      delete payload.sort_order;
    }

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Advice ${isEdit ? "updated" : "created"} successfully`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedRow) return;
    const result = await deleteItem(
      `${PATH}/delete/${selectedRow.advice_code}/`
    );

    if (result.success) {
      showModal("Record deleted successfully");
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
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="font-bold" style={{ color: "var(--primary-accent)" }}>
            Loading Advice Master...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* ================= MODAL ================= */}
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container animate-zoom-in">
            <div className="p-8 text-center">
              <div className="mb-4">
                {modal.type === "success" ? (
                  <FaCheckCircle className="text-4xl text-emerald-500 mx-auto" />
                ) : (
                  <FaTimesCircle className="text-4xl text-red-500 mx-auto" />
                )}
              </div>

              <h3 className={modal.type === "success" ? "modal-title-success" : "modal-title-error"}>
                {modal.type === "success" ? "Success" : "Error"}
              </h3>

              <p className="modal-message">{modal.message}</p>

              <button
                className="btn-primary w-full justify-center"
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
        <div>
          <h4 className="page-title">Advice Master</h4>
        </div>

        {!showForm && (
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>

            {selectedRow && (
              <div className="flex gap-2 animate-slide-in">
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
        <div className="form-container animate-zoom-in">
          <h6 className="form-section-title">
            {isEdit ? "Update Advice" : "Create Advice"}
          </h6>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >
            {/* CODE */}
            <div className="space-y-1.5">
              <label className="form-label">Advice Code</label>
              <input
                className="form-input w-full"
                value={formData.advice_code}
                disabled={isEdit}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    advice_code: e.target.value.toUpperCase().replace(/\s/g, "_"),
                  })
                }
                placeholder="E.G. ADV_DAILY_REST"
              />
            </div>

            {/* NAME */}
            <div className="space-y-1.5">
              <label className="form-label">Description</label>
              <input
                className="form-input w-full"
                value={formData.advice_name}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    advice_name: e.target.value,
                  })
                }
                placeholder="E.G. Take 8 hours of sleep"
              />
            </div>

            {/* SORT */}
            <div className="space-y-1.5">
              <label className="form-label">Sort Order</label>
              <input
                type="number"
                className="form-input w-full"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sort_order: e.target.value,
                  })
                }
              />
            </div>

            {/* STATUS */}
            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select 
                className="form-input w-full appearance-none" 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t pt-8 mt-4" style={{ borderColor: "var(--border-color)" }}>
              <button className="btn-primary px-12">
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

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">Code</th>
                  <th className="text-admin-th">Description</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  [...paginatedData]
                    .sort((a, b) => {
                      const sa = a.sort_order ?? 999999;
                      const sb = b.sort_order ?? 999999;
                      return Number(sa) - Number(sb);
                    })
                    .map((item) => (
                      <tr
                        key={item.advice_code}
                        onClick={() =>
                          setSelectedRow(
                            selectedRow?.advice_code === item.advice_code
                              ? null
                              : item
                          )
                        }
                        className={`table-row ${
                          selectedRow?.advice_code === item.advice_code
                            ? "table-row-active"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div
                            className={`selection-indicator ${
                              selectedRow?.advice_code === item.advice_code
                                ? "selection-indicator-active"
                                : ""
                            }`}
                          >
                            {selectedRow?.advice_code === item.advice_code && (
                              <div className="selection-dot" />
                            )}
                          </div>
                        </td>

                        <td className="text-admin-td">{item.advice_code}</td>
                        <td className="text-admin-td">{item.advice_name}</td>
                        <td className="text-admin-td">
                          <span
                            className={`badge ${
                              item.status === 1
                                ? "badge-success"
                                : "badge-danger"
                            }`}
                          >
                            {item.status === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <FaLightbulb
                        size={48}
                        className="mb-4 mx-auto opacity-20"
                      />
                      <p className="text-lg font-medium text-muted">
                        No advice records found
                      </p>
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

export default AdviceMaster;