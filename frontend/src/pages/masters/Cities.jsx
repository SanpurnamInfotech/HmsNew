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

const Cities = () => {

  /* ================= CRUD ================= */
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud("cities/");
  const { data: countries = [] } = useCrud("countries/");
  const { data: states = [] } = useCrud("states/");
  const { data: districts = [] } = useCrud("districts/");

  /* ================= STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const initialForm = {
    city_code: "",
    city_name: "",
    country_code: "",
    state_code: "",
    district_code: "",
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
    setSelectedCity(null);
    setFormData(initialForm);
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.country_code || !formData.state_code || !formData.district_code) {
      showModal("Please select Country, State and District", "error");
      return;
    }

    const payload = {
      ...formData,
      status: Number(formData.status)
    };

    const result = isEdit
      ? await updateItem(`cities/update/${formData.city_code}/`, payload)
      : await createItem(`cities/create/`, payload);

    if (result?.success) {
      showModal(`City ${isEdit ? "updated" : "created"} successfully!`);
      refresh();
      resetForm();
    } else {
      showModal(result?.error || "Operation failed!", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedCity) return;

    const result = await deleteItem(
      `cities/delete/${selectedCity.city_code}/`
    );

    if (result?.success) {
      showModal("City deleted successfully!");
      setSelectedCity(null);
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
          City Master
        </h4>

        {!showForm && (
          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-emerald-100"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedCity && (
              <div className="flex items-center gap-2">
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData(selectedCity);
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
              placeholder="City Code"
              value={formData.city_code}
              disabled={isEdit}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  city_code: e.target.value.toUpperCase()
                })
              }
            />

            <input
              className="form-input"
              placeholder="City Name"
              value={formData.city_name}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  city_name: e.target.value
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
                  state_code: "",
                  district_code: ""
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

            {/* STATE */}
            <select
              className="form-input"
              value={formData.state_code}
              disabled={!formData.country_code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  state_code: e.target.value,
                  district_code: ""
                })
              }
            >
              <option value="" disabled>
                Select State
              </option>

              {states
                .filter((s) => s.country_code === formData.country_code)
                .map((s) => (
                  <option key={s.state_code} value={s.state_code}>
                    {s.state_name}
                  </option>
                ))}
            </select>

            {/* DISTRICT */}
            <select
              className="form-input"
              value={formData.district_code}
              disabled={!formData.state_code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  district_code: e.target.value
                })
              }
            >
              <option value="" disabled>
                Select District
              </option>

              {districts
                .filter((d) => d.state_code === formData.state_code)
                .map((d) => (
                  <option key={d.district_code} value={d.district_code}>
                    {d.district_name}
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
                <th className="table-th">State/District</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((c) => (
                  <tr
                    key={c.city_code}
                    onClick={() =>
                      setSelectedCity(
                        selectedCity?.city_code === c.city_code ? null : c
                      )
                    }
                    className={`table-row ${
                      selectedCity?.city_code === c.city_code
                        ? "table-row-active"
                        : "table-row-hover"
                    }`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${
                        selectedCity?.city_code === c.city_code
                          ? "selection-indicator-active"
                          : "selection-indicator-inactive"
                      }`}>
                        {selectedCity?.city_code === c.city_code &&
                          <div className="selection-dot" />}
                      </div>
                    </td>

                    <td className="table-td">{c.city_code}</td>
                    <td className="table-td">{c.city_name}</td>
                    <td className="table-td">{c.country_code}</td>
                    <td className="table-td">
                      {c.state_code} / {c.district_code}
                    </td>
                    <td className="table-td">
                      <span className={
                        c.status === 1
                          ? "status-badge-active"
                          : "status-badge-inactive"
                      }>
                        {c.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-20">
                    <FaExclamationCircle size={48} className="text-gray-400 mb-4" />
                    <p className="text-gray-500 font-bold">
                      No cities found
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

export default Cities;