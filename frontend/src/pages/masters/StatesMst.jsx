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
  FaMapPin
} from "react-icons/fa";

const StatesMst = () => {

  /* ================= CRUD ================= */

  const {
    data,
    loading,
    refresh,
    createItem,
    updateItem,
    deleteItem
  } = useCrud("states/");

  const { data: countries } = useCrud("countries/");

  /* ================= STATE ================= */

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedState, setSelectedState] = useState(null);

  const [formData, setFormData] = useState({
    state_code: "",
    state_name: "",
    country_code: ""
  });

  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });



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

  /* ================= HELPERS ================= */

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedState(null);
    setFormData({
      state_code: "",
      state_name: "",
      country_code: ""
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.country_code) {
      showModal("Please select a Country", "error");
      return;
    }

    let result;

    if (isEdit) {
      result = await updateItem(
        `states/update/${formData.state_code}/`,
        formData
      );
    } else {
      result = await createItem(`states/create/`, formData);
    }

    if (result.success) {
      showModal(`State ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    if (!selectedState) return;

    const result = await deleteItem(
      `states/delete/${selectedState.state_code}/`
    );

    if (result.success) {
      showModal("State deleted successfully!");
      setSelectedState(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  /* ================= LOADING ================= */

  if (loading) return <p>Loading...</p>;

  /* ================= UI ================= */

  return (
    <div className="app-container">

      {/* ===== MODAL ===== */}
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
              <button className="btn-primary w-full" onClick={() => setModal({ ...modal, visible: false })}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">
          State Master
        </h4>

        {!showForm && (
          <div className="flex gap-2">
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedState && (
              <>
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
              </>
            )}
          </div>
        )}
      </div>

      {/* ===== FORM ===== */}
      {showForm && (
        <div className="form-container">

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >

            <div>
              <label className="form-label">State Code</label>
              <input
                className="form-input"
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
            </div>

            <div>
              <label className="form-label">State Name</label>
              <input
                className="form-input"
                value={formData.state_name}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    state_name: e.target.value
                  })
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Country</label>
              <select
                className="form-input"
                value={formData.country_code}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    country_code: e.target.value
                  })
                }
              >
                <option value="">Select Country</option>
                {countries?.map((c) => (
                  <option key={c.country_code} value={c.country_code}>
                    {c.country_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-6">
              <button className="btn-primary px-10">
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

      {/* ===== TABLE ===== */}
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
                <th className="table-th">State Code</th>
                <th className="table-th">State Name</th>
                <th className="table-th">Country</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {paginatedData.length > 0 ? (
                paginatedData.map((s) => {

                  const countryName =
                    countries?.find(x => x.country_code === s.country_code)?.country_name || s.country_code;

                  return (
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
                          {selectedState?.state_code === s.state_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="table-td text-admin-id">{s.state_code}</td>
                      <td className="table-td text-admin-id">{s.state_name}</td>
                      <td className="table-td">{countryName}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="table-td py-20 text-center">
                    <div className="empty-state-container">
                      <FaMapPin size={48} className="mb-4 text-gray-400" />
                      <p className="text-xl font-bold text-gray-500">
                        No states found
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

export default StatesMst;
