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
  FaTimesCircle
} from "react-icons/fa";

const PremorbidPersonalityMst = () => {

  const PATH = "premorbid-personality-master";

  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    premorbid_personality_code: "",
    premorbid_personality_name: "",
    sort_order: "",
    status: 1
  });

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success"
  });

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
    totalPages
  } = useTable(data || []);

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedItem(null);

    setFormData({
      premorbid_personality_code: "",
      premorbid_personality_name: "",
      sort_order: "",
      status: 1
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.premorbid_personality_code}/`
      : `${PATH}/create/`;

    const payload = { ...formData };

    if (payload.sort_order === "" || payload.sort_order === null) {
      delete payload.sort_order;
    }

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(
        `Premorbid personality ${isEdit ? "updated" : "created"} successfully`
      );
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed", "error");
    }
  };

  const handleDelete = async () => {

    if (!selectedItem) return;

    const result = await deleteItem(
      `${PATH}/delete/${selectedItem.premorbid_personality_code}/`
    );

    if (result.success) {
      showModal("Deleted successfully");
      setSelectedItem(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed", "error");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );

  return (
    <div className="app-container">

      {/* Modal */}
      {modal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">

          <div className="form-container max-w-sm w-full p-8 text-center">

            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? (
                <FaCheckCircle className="text-6xl text-emerald-500" />
              ) : (
                <FaTimesCircle className="text-6xl text-rose-500" />
              )}
            </div>

            <h3
              className={`text-xl font-bold mb-2 ${
                modal.type === "success"
                  ? "text-emerald-500"
                  : "text-rose-500"
              }`}
            >
              {modal.type === "success" ? "Success" : "Error"}
            </h3>

            <p className="mb-6">{modal.message}</p>

            <button
              className="btn-primary w-full"
              onClick={() =>
                setModal({ ...modal, visible: false })
              }
            >
              Continue
            </button>

          </div>

        </div>
      )}

      {/* Header */}

      <div className="section-header">

        <h4 className="page-title">
          Premorbid Personality Master
        </h4>

        {!showForm && (
          <div className="flex gap-2">

            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add
            </button>

            {selectedItem && (
              <>
                <button
                  className="btn-warning flex items-center gap-2"
                  onClick={() => {
                    setFormData(selectedItem);
                    setIsEdit(true);
                    setShowForm(true);
                  }}
                >
                  <FaEdit size={14} /> Edit
                </button>

                <button
                  className="btn-danger flex items-center gap-2"
                  onClick={handleDelete}
                >
                  <FaTrash size={14} /> Delete
                </button>
              </>
            )}

          </div>
        )}

      </div>

      {/* Form */}

      {showForm && (

        <div className="form-container animate-in zoom-in-95 duration-200">

          <h6 className="form-section-title">
            {isEdit
              ? "Update Premorbid Personality"
              : "Create Premorbid Personality"}
          </h6>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >

            <div>
              <label className="form-label">Code</label>

              <input
                required
                disabled={isEdit}
                className={`form-input w-full ${
                  isEdit ? "opacity-50 cursor-not-allowed" : ""
                }`}
                value={formData.premorbid_personality_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    premorbid_personality_code: e.target.value
                  })
                }
              />

            </div>

            <div>
              <label className="form-label">Name</label>

              <input
                className="form-input w-full"
                value={formData.premorbid_personality_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    premorbid_personality_name: e.target.value
                  })
                }
              />

            </div>

            <div>
              <label className="form-label">Sort Order</label>

              <input
                type="number"
                className="form-input w-full"
                value={formData.sort_order || ""}
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
                className="form-input w-full"
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

            </div>

            <div
              className="md:col-span-2 flex justify-end gap-3 border-t pt-6"
              style={{ borderColor: "var(--border-color)" }}
            >

              <button type="submit" className="btn-primary">
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

        <div className="data-table-container animate-in fade-in duration-500">

          <TableToolbar
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            search={search}
            setSearch={setSearch}
            setCurrentPage={setCurrentPage}
          />

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr>
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">Code</th>
                  <th className="text-admin-th">Name</th>
                  <th className="text-admin-th">Sort Order</th>
                  <th className="text-admin-th text-center">Status</th>
                </tr>
              </thead>

              <tbody
                className="divide-y"
                style={{ borderColor: "var(--border-color)" }}
              >

                {paginatedData.map((row) => (

                  <tr
                    key={row.premorbid_personality_code}
                    onClick={() => setSelectedItem(row)}
                    className={`cursor-pointer transition ${
                      selectedItem?.premorbid_personality_code ===
                      row.premorbid_personality_code
                        ? "bg-emerald-500/10"
                        : "hover:bg-emerald-500/5"
                    }`}
                  >

                    <td></td>

                    <td className="text-admin-td font-bold">
                      {row.premorbid_personality_code}
                    </td>

                    <td className="text-admin-td">
                      {row.premorbid_personality_name}
                    </td>

                    <td className="text-admin-td">
                      {row.sort_order}
                    </td>

                    <td className="text-admin-td text-center">

                      <span
                        className={`badge ${
                          row.status === 1
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {row.status === 1
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                  </tr>

                ))}

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

export default PremorbidPersonalityMst;