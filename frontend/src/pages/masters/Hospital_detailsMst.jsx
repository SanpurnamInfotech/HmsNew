import React, { useState, useMemo } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaChevronDown,
  FaMapMarkerAlt,
} from "react-icons/fa";

const HospitalDetails = () => {
  const PATH = "hospital";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);
  const { data: cities } = useCrud("cities/");
  const { data: states } = useCrud("states/");
  const { data: countries } = useCrud("countries/");

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [openDropdown, setOpenDropdown] = useState(null); // For city/state/country dropdowns
  const [searchDropdown, setSearchDropdown] = useState(""); // Search in dropdown

  const [formData, setFormData] = useState({
    hospital_code: "",
    hospital_name: "",
    hospital_reg_number: "",
    hospital_cst_number: "",
    email: "",
    mobile: "",
    phone: "",
    landmark: "",
    address1: "",
    address2: "",
    city_code: "",
    district_code: "",
    state_code: "",
    country_code: "",
    pincode: "",
    lunch_timing: "",
    weeklyoff_day: "",
    logo_path: "",
    developed_by: "",
    status: 1,
  });

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

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
  } = useTable(data || []);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setOpenDropdown(null);
    setSearchDropdown("");
    setFormData({
      hospital_code: "",
      hospital_name: "",
      hospital_reg_number: "",
      hospital_cst_number: "",
      email: "",
      mobile: "",
      phone: "",
      landmark: "",
      address1: "",
      address2: "",
      city_code: "",
      district_code: "",
      state_code: "",
      country_code: "",
      pincode: "",
      lunch_timing: "",
      weeklyoff_day: "",
      logo_path: "",
      developed_by: "",
      status: 1,
    });
  };

  const showModal = (message, type = "success") => setModal({ visible: true, message, type });

  /* ================= DROPDOWN FILTER ================= */
  const filteredCountries = useMemo(() => {
    if (!countries) return [];
    return countries.filter(c =>
      c.country_name.toLowerCase().includes(searchDropdown.toLowerCase()) ||
      c.country_code.toLowerCase().includes(searchDropdown.toLowerCase())
    );
  }, [countries, searchDropdown]);

  const filteredStates = useMemo(() => {
    if (!states) return [];
    return states.filter(s =>
      s.state_name.toLowerCase().includes(searchDropdown.toLowerCase()) ||
      s.state_code.toLowerCase().includes(searchDropdown.toLowerCase())
    );
  }, [states, searchDropdown]);

  const filteredCities = useMemo(() => {
    if (!cities) return [];
    return cities.filter(c =>
      c.city_name.toLowerCase().includes(searchDropdown.toLowerCase()) ||
      c.city_code.toLowerCase().includes(searchDropdown.toLowerCase())
    );
  }, [cities, searchDropdown]);

  const selectedCountryName = countries?.find(c => c.country_code === formData.country_code)?.country_name || "Select Country";
  const selectedStateName = states?.find(s => s.state_code === formData.state_code)?.state_name || "Select State";
  const selectedCityName = cities?.find(c => c.city_code === formData.city_code)?.city_name || "Select City";

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hospital_code || !formData.hospital_name) {
      showModal("Hospital code and name are required", "error");
      return;
    }

    const actionPath = isEdit
      ? `${PATH}/update/${formData.hospital_code}/`
      : `${PATH}/create/`;

    const payload = { ...formData };
    const result = isEdit ? await updateItem(actionPath, payload) : await createItem(actionPath, payload);

    if (result.success) {
      showModal(isEdit ? "Hospital updated" : "Hospital created");
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Failed to save data", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedRow || !selectedRow.hospital_code) return;

    const result = await deleteItem(`${PATH}/delete/${selectedRow.hospital_code}/`);
    if (result.success) {
      showModal("Hospital deleted successfully!");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  /* ================= LOADING ================= */
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="app-container">
      {/* MODAL */}
      {modal.visible && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? (
                <FaCheckCircle className="text-6xl text-emerald-500" />
              ) : (
                <FaTimesCircle className="text-6xl text-rose-500" />
              )}
            </div>
            <h3 className={`text-xl font-black mb-2 uppercase tracking-tight ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            <p className="mb-6 font-medium opacity-80">{modal.message}</p>
            <button
              className="btn-primary w-full justify-center py-3"
              onClick={() => setModal({ ...modal, visible: false })}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="section-header">
        <h4 className="page-title">Hospital Details</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>
            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
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

      {/* FORM */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">
            {isEdit ? "Update Hospital Profile" : "Add Hospital"}
          </h6>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4" onSubmit={handleSubmit}>
            {/* Hospital Code */}
            <div className="space-y-1.5">
              <label className="form-label">Hospital Code</label>
              <input
                className="form-input w-full"
                value={formData.hospital_code}
                disabled={isEdit}
                onChange={(e) => setFormData({ ...formData, hospital_code: e.target.value.toUpperCase() })}
              />
            </div>

            {/* Hospital Name */}
            <div className="space-y-1.5">
              <label className="form-label">Hospital Name</label>
              <input
                className="form-input w-full"
                value={formData.hospital_name}
                onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="form-label">Email</label>
              <input
                className="form-input w-full"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <label className="form-label">Mobile</label>
              <input
                className="form-input w-full"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select
                className="form-input w-full cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            {/* Form Buttons */}
            <div className="md:col-span-2 flex justify-end gap-3 border-t pt-6 mt-4" style={{ borderColor: "var(--border-color)" }}>
              <button type="submit" className="btn-primary px-12 py-3">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}
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
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">Hospital Code</th>
                  <th className="text-admin-th">Hospital Name</th>
                  <th className="text-admin-th">Email</th>
                  <th className="text-admin-th">Mobile</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map(item => (
                    <tr
                      key={item.hospital_code}
                      onClick={() => setSelectedRow(selectedRow?.hospital_code === item.hospital_code ? null : item)}
                      className={`group cursor-pointer transition-colors ${
                        selectedRow?.hospital_code === item.hospital_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className={`selection-indicator ${selectedRow?.hospital_code === item.hospital_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                          {selectedRow?.hospital_code === item.hospital_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="text-admin-td">{item.hospital_code}</td>
                      <td className="text-admin-td">{item.hospital_name}</td>
                      <td className="text-admin-td">{item.email}</td>
                      <td className="text-admin-td">{item.mobile}</td>
                      <td className="text-admin-td">
                        <span className={`badge ${item.status === 1 ? "badge-success" : "badge-danger"}`}>
                          {item.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-24 text-center">
                      <FaMapMarkerAlt size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No hospitals found</p>
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

export default HospitalDetails;