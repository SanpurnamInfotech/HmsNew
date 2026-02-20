import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaTint } from "react-icons/fa";

const BloodGroupMaster = () => {
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud("blood_group_master/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [formData, setFormData] = useState({
    blood_group_code: "",
    blood_group_name: "",
    description: "",
    sort_order: 1000,
    status: 1,
  });

  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

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
      blood_group_code: "",
      blood_group_name: "",
      description: "",
      sort_order: 1000,
      status: 1,
    });
  };

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      sort_order: formData.sort_order === "" ? null : Number(formData.sort_order),
      status: Number(formData.status),
    };

    let result = isEdit
      ? await updateItem(`blood_group_master/update/${formData.blood_group_code}/`, payload)
      : await createItem(`blood_group_master/create/`, payload);

    if (result.success) {
      showModal(`Blood Group ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteItem(`blood_group_master/delete/${selected.blood_group_code}/`);
    if (result.success) {
      showModal("Blood Group deleted successfully!");
      setSelected(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  const statusBadge = (s) => {
    const isActive = Number(s) === 1;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Blood Group Data...</p>
      </div>
    </div>
  );

  return (
    <div className="app-container">
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
              <h3 className={`modal-title ${modal.type === "success" ? "modal-title-success" : "modal-title-error"}`}>
                {modal.type === "success" ? "Success" : "Error"}
              </h3>
              <p className="modal-message mb-6">{modal.message}</p>
              <button className="btn-primary w-full" onClick={() => setModal({ ...modal, visible: false })}>OK</button>
            </div>
          </div>
        </div>
      )}

      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">Blood Group Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>

            {selected && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData({ ...selected });
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

      {showForm && (
        <div className="form-container">
          <div className="mb-8 border-b border-gray-50 pb-5">
            <h6 className="text-lg font-bold text-gray-800">
              {isEdit ? "Update Blood Group Info" : "Add New Blood Group"}
            </h6>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">Blood Group Code</label>
              <input
                className={`form-input ${isEdit ? "form-input-disabled" : ""}`}
                value={formData.blood_group_code || ""}
                disabled={isEdit}
                required
                maxLength={10}
                onChange={(e) => setFormData({ ...formData, blood_group_code: e.target.value.toUpperCase() })}
                placeholder="Eg. A+"
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Blood Group Name</label>
              <input
                className="form-input"
                value={formData.blood_group_name || ""}
                required
                maxLength={20}
                onChange={(e) => setFormData({ ...formData, blood_group_name: e.target.value })}
                placeholder="Eg. A Positive"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="form-label">Description</label>
              <input
                className="form-input"
                value={formData.description || ""}
                maxLength={255}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Sort Order</label>
              <input
                type="number"
                className="form-input"
                value={formData.sort_order ?? ""}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={Number(formData.status)}
                onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
              <button className="btn-primary px-10">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

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
                  <th className="table-th w-16"></th>
                  <th className="table-th">Code</th>
                  <th className="table-th">Name</th>
                  <th className="table-th">Description</th>
                  <th className="table-th">Sort</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((x) => (
                  <tr
                    key={x.blood_group_code}
                    onClick={() => setSelected(selected?.blood_group_code === x.blood_group_code ? null : x)}
                    className={`table-row ${selected?.blood_group_code === x.blood_group_code ? "table-row-active" : "table-row-hover"}`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${selected?.blood_group_code === x.blood_group_code ? "selection-indicator-active" : "selection-indicator-inactive"}`}>
                        {selected?.blood_group_code === x.blood_group_code && <div className="selection-dot" />}
                      </div>
                    </td>
                    <td className="table-td text-admin-id">{x.blood_group_code}</td>
                    <td className="table-td text-admin-id">{x.blood_group_name}</td>
                    <td className="table-td">{x.description || "-"}</td>
                    <td className="table-td">{x.sort_order ?? "-"}</td>
                    <td className="table-td">{statusBadge(x.status)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaTint size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">No blood groups found</p>
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

export default BloodGroupMaster;
