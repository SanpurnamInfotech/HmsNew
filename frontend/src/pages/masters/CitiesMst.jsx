import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { 
  FaPlus, FaEdit, FaTrash, 
  FaCheckCircle, FaTimesCircle, 
  FaCity 
} from "react-icons/fa";

const Cities = () => {

  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud("cities/");
  const { data: countries } = useCrud("countries/");
  const { data: states } = useCrud("states/");
  const { data: districts } = useCrud("districts/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const [formData, setFormData] = useState({
    city_code: "",
    city_name: "",
    country_code: "",
    state_code: "",
    district_code: ""
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
    setSelectedCity(null);
    setFormData({
      city_code: "",
      city_name: "",
      country_code: "",
      state_code: "",
      district_code: ""
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.country_code || !formData.state_code) {
      showModal("Please select Country and State", "error");
      return;
    }

    let result = isEdit
      ? await updateItem(`cities/update/${formData.city_code}/`, formData)
      : await createItem(`cities/create/`, formData);

    if (result.success) {
      showModal(`City ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedCity) return;

    const result = await deleteItem(`cities/delete/${selectedCity.city_code}/`);
    if (result.success) {
      showModal("City deleted successfully!");
      setSelectedCity(null);
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
          <p className="loading-text">Loading City Data...</p>
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

      {/* Header */}
      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">City Master</h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>

            {selectedCity && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData({ ...selectedCity });
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

      {/* Form */}
      {showForm && (
        <div className="form-container">
          <div className="mb-8 border-b border-gray-50 pb-5">
            <h6 className="text-lg font-bold text-gray-800">
              {isEdit ? "Update City Info" : "Add New City"}
            </h6>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>

            <div className="space-y-1.5">
              <label className="form-label">City Code</label>
              <input
                className={`form-input ${isEdit ? "form-input-disabled" : ""}`}
                value={formData.city_code}
                disabled={isEdit}
                required
                onChange={e =>
                  setFormData({ ...formData, city_code: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">City Name</label>
              <input
                className="form-input"
                value={formData.city_name}
                required
                onChange={e =>
                  setFormData({ ...formData, city_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Country</label>
              <select
                className="form-input"
                value={formData.country_code}
                required
                onChange={e =>
                  setFormData({
                    ...formData,
                    country_code: e.target.value,
                    state_code: ""
                  })
                }
              >
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.country_code} value={c.country_code}>
                    {c.country_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">State</label>
              <select
                className="form-input"
                value={formData.state_code}
                required
                onChange={e =>
                  setFormData({ ...formData, state_code: e.target.value, district_code: "" })
                }
              >
                <option value="">Select State</option>
                {states
                  .filter(s => !formData.country_code || String(s.country_code).trim() === String(formData.country_code).trim())
                  .map(s => (
                    <option key={s.state_code} value={s.state_code}>
                      {s.state_name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">District</label>
              <select
                className="form-input"
                value={formData.district_code}
                required
                onChange={e =>
                  setFormData({ ...formData, district_code: e.target.value })
                }
              >
                <option value="">Select District</option>
                {districts
                  .filter(d => !formData.state_code || String(d.state_code).trim() === String(formData.state_code).trim())
                  .map(d => (
                    <option key={d.district_code} value={d.district_code}>
                      {d.district_name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
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

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header-row">
                  <th className="table-th w-16"></th>
                  <th className="table-th">City Code</th>
                  <th className="table-th">City Name</th>
                  <th className="table-th">Country</th>
                  <th className="table-th">State</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((c) => (
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
                        {selectedCity?.city_code === c.city_code && <div className="selection-dot" />}
                      </div>
                    </td>

                    <td className="table-td text-admin-id">{c.city_code}</td>
                    <td className="table-td text-admin-id">{c.city_name}</td>
                    <td className="table-td">{c.country_code}</td>
                    <td className="table-td">{c.state_code} / {c.district_code}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaCity size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">
                          No cities found
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

export default Cities;
