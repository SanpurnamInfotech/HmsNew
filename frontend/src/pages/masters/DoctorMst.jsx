import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaUserMd
} from "react-icons/fa";

const DoctorMst = () => {

  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud("doctors/");

  const { data: departments } = useCrud("departments/");
  const { data: cities } = useCrud("cities/");
  const { data: districts } = useCrud("districts/");
  const { data: states } = useCrud("states/");
  const { data: countries } = useCrud("countries/");
  const { data: maritalStatus } = useCrud("maritalstatus/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [formData, setFormData] = useState({
    doctor_code: "",
    doctor_name: "",
    department_code: "",
    qualification: "",
    total_experience: "",
    dob: "",
    gender: "",
    marital_status_code: "",
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
    status: 1
  });

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success"
  });

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
    setSelectedDoctor(null);
    setFormData({
      doctor_code: "",
      doctor_name: "",
      department_code: "",
      qualification: "",
      total_experience: "",
      dob: "",
      gender: "",
      marital_status_code: "",
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
      status: 1
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      status: parseInt(formData.status)
    };

    const result = isEdit
      ? await updateItem(`doctors/update/${formData.doctor_code}/`, payload)
      : await createItem("doctors/create/", payload);

    if (result?.success) {
      showModal(`Doctor ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result?.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedDoctor) return;

    const result = await deleteItem(
      `doctors/delete/${selectedDoctor.doctor_code}/`
    );

    if (result?.success) {
      showModal("Doctor deleted successfully!");
      setSelectedDoctor(null);
      refresh();
    } else {
      showModal(result?.error || "Delete failed!", "error");
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading Doctor Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">

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

              <p className="modal-message">{modal.message}</p>

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

      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">
          Doctor Master
        </h4>

        {!showForm && (
          <div className="flex gap-2">
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedDoctor && (
              <>
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData(selectedDoctor);
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

      {showForm && (
        <div className="form-container">

          <h6 className="text-lg font-bold mb-4">
            {isEdit ? "Update Doctor" : "Add New Doctor"}
          </h6>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >

            <input
              className="form-input"
              placeholder="Doctor Code"
              value={formData.doctor_code}
              disabled={isEdit}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  doctor_code: e.target.value.toUpperCase()
                })
              }
            />

            <input
              className="form-input"
              placeholder="Doctor Name"
              value={formData.doctor_name}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  doctor_name: e.target.value
                })
              }
            />

            <select
              className="form-input"
              value={formData.department_code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  department_code: e.target.value
                })
              }
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.department_code} value={d.department_code}>
                  {d.department_name}
                </option>
              ))}
            </select>

            <input
              className="form-input"
              placeholder="Qualification"
              value={formData.qualification}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  qualification: e.target.value
                })
              }
            />

            <input
              className="form-input"
              type="date"
              value={formData.dob}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dob: e.target.value
                })
              }
            />

            <select
              className="form-input"
              value={formData.gender}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gender: e.target.value
                })
              }
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button className="btn-primary">
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
                  <th></th>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Department</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((d) => (
                  <tr
                    key={d.doctor_code}
                    onClick={() =>
                      setSelectedDoctor(
                        selectedDoctor?.doctor_code === d.doctor_code
                          ? null
                          : d
                      )
                    }
                  >
                    <td>
                      {selectedDoctor?.doctor_code === d.doctor_code ? "●" : ""}
                    </td>
                    <td>{d.doctor_code}</td>
                    <td>{d.doctor_name}</td>
                    <td>{d.department_code}</td>
                  </tr>
                ))}
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

export default DoctorMst;
