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
  FaExclamationCircle
} from "react-icons/fa";

const Districts = () => {

  /* ================= CRUD ================= */
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud("districts/");
  const { data: states = [] } = useCrud("states/");
  const { data: countries = [] } = useCrud("countries/");

  /* ================= STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const initialForm = {
    district_code: "",
    district_name: "",
    country_code: "",
    state_code: "",
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
    setSelectedDistrict(null);
    setFormData(initialForm);
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.country_code || !formData.state_code) {
      showModal("Please select Country and State", "error");
      return;
    }

    const payload = {
      ...formData,
      status: Number(formData.status)
    };

    const result = isEdit
      ? await updateItem(`districts/update/${formData.district_code}/`, payload)
      : await createItem(`districts/create/`, payload);

    if (result?.success) {
      showModal(`District ${isEdit ? "updated" : "created"} successfully!`);
      refresh();
      resetForm();
    } else {
      showModal(result?.error || "Operation failed!", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedDistrict) return;

    const result = await deleteItem(
      `districts/delete/${selectedDistrict.district_code}/`
    );

    if (result?.success) {
      showModal("District deleted successfully!");
      setSelectedDistrict(null);
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
          District Master
        </h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedDistrict && (
              <div className="flex items-center gap-2">
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData(selectedDistrict);
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
              placeholder="District Code"
              value={formData.district_code}
              disabled={isEdit}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  district_code: e.target.value.toUpperCase()
                })
              }
            />

            <input
              className="form-input"
              placeholder="District Name"
              value={formData.district_name}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  district_name: e.target.value
                })
              }
            />

            {/* COUNTRY */}
            <select
              className="form-input"
              value={formData.country_code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  country_code: e.target.value,
                  state_code: ""
                })
              }
            >
              <option value="" disabled>Select Country</option>
              {countries.map((c) => (
                <option key={c.country_code} value={c.country_code}>
                  {c.country_name}
                </option>
              ))}
            </select>

            {/* STATE */}
            <select
              className="form-input"
              value={formData.state_code}
              disabled={!formData.country_code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  state_code: e.target.value
                })
              }
            >
              <option value="" disabled>Select State</option>
              {states
                .filter((s) => s.country_code === formData.country_code)
                .map((s) => (
                  <option key={s.state_code} value={s.state_code}>
                    {s.state_name}
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
                <th className="table-th">State</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((d) => (
                  <tr
                    key={d.district_code}
                    onClick={() =>
                      setSelectedDistrict(
                        selectedDistrict?.district_code === d.district_code
                          ? null
                          : d
                      )
                    }
                    className={`table-row ${
                      selectedDistrict?.district_code === d.district_code
                        ? "table-row-active"
                        : "table-row-hover"
                    }`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${
                        selectedDistrict?.district_code === d.district_code
                          ? "selection-indicator-active"
                          : "selection-indicator-inactive"
                      }`}>
                        {selectedDistrict?.district_code === d.district_code &&
                          <div className="selection-dot" />}
                      </div>
                    </td>

                    <td className="table-td">{d.district_code}</td>
                    <td className="table-td">{d.district_name}</td>
                    <td className="table-td">{d.country_code}</td>
                    <td className="table-td">{d.state_code}</td>
                    <td className="table-td">
                      <span className={
                        d.status === 1
                          ? "status-badge-active"
                          : "status-badge-inactive"
                      }>
                        {d.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-20">
                    <FaExclamationCircle size={48} className="text-gray-400 mb-4" />
                    <p className="text-gray-500 font-bold">
                      No districts found
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

export default Districts;