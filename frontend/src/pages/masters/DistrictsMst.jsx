import React, { useState, useMemo } from "react";
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
  FaMapMarkedAlt
} from "react-icons/fa";

const DistrictsMst = () => {

  /* ================= CRUD ================= */

  const {
    data,
    loading,
    refresh,
    createItem,
    updateItem,
    deleteItem
  } = useCrud("districts/");

  const { data: countries } = useCrud("countries/");
  const { data: states } = useCrud("states/");

  /* ================= STATE ================= */

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const [formData, setFormData] = useState({
    district_code: "",
    district_name: "",
    country_code: "",
    state_code: ""
  });

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success"
  });

  /* ================= FILTER STATE ================= */

  const filteredStates = useMemo(() => {
    return states?.filter(
      (s) => s.country_code === formData.country_code
    );
  }, [states, formData.country_code]);

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

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedDistrict(null);
    setFormData({
      district_code: "",
      district_name: "",
      country_code: "",
      state_code: ""
    });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.country_code || !formData.state_code) {
      showModal("Please select Country and State", "error");
      return;
    }

    let result;

    if (isEdit) {
      result = await updateItem(
        `districts/update/${formData.district_code}/`,
        formData
      );
    } else {
      result = await createItem(
        `districts/create/`,
        formData
      );
    }

    if (result.success) {
      showModal(`District ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    if (!selectedDistrict) return;

    const result = await deleteItem(
      `districts/delete/${selectedDistrict.district_code}/`
    );

    if (result.success) {
      showModal("District deleted successfully!");
      setSelectedDistrict(null);
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
          District Master
        </h4>

        {!showForm && (
          <div className="flex gap-2">
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedDistrict && (
              <>
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
              <label className="form-label">District Code</label>
              <input
                className="form-input"
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
            </div>

            <div>
              <label className="form-label">District Name</label>
              <input
                className="form-input"
                value={formData.district_name}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    district_name: e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="form-label">Country</label>
              <select
                className="form-input"
                value={formData.country_code}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    country_code: e.target.value,
                    state_code: ""
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

            <div>
              <label className="form-label">State</label>
              <select
                className="form-input"
                value={formData.state_code}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    state_code: e.target.value
                  })
                }
              >
                <option value="">Select State</option>
                {filteredStates?.map((s) => (
                  <option key={s.state_code} value={s.state_code}>
                    {s.state_name}
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
                <th className="table-th">District Code</th>
                <th className="table-th">District Name</th>
                <th className="table-th">Country</th>
                <th className="table-th">State</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {paginatedData.length > 0 ? (
                paginatedData.map((d) => {

                  const countryName =
                    countries?.find(x => x.country_code === d.country_code)?.country_name || d.country_code;

                  const stateName =
                    states?.find(x => x.state_code === d.state_code)?.state_name || d.state_code;

                  return (
                    <tr
                      key={d.district_code}
                      onClick={() =>
                        setSelectedDistrict(
                          selectedDistrict?.district_code === d.district_code ? null : d
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
                          {selectedDistrict?.district_code === d.district_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="table-td text-admin-id">{d.district_code}</td>
                      <td className="table-td text-admin-id">{d.district_name}</td>
                      <td className="table-td">{countryName}</td>
                      <td className="table-td">{stateName}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="table-td py-20 text-center">
                    <div className="empty-state-container">
                      <FaMapMarkedAlt size={48} className="mb-4 text-gray-400" />
                      <p className="text-xl font-bold text-gray-500">
                        No districts found
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

export default DistrictsMst;
