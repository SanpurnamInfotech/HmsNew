import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaHospital
} from "react-icons/fa";

const HospitalDetails = () => {

  const PATH = "hospital";

  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

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
    status: 1
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

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
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
      status: 1
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ visible: true, message, type });

  const handleSubmit = async (e) => {

    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.hospital_code}/`
      : `${PATH}/create/`;

    const result = isEdit
      ? await updateItem(actionPath, formData)
      : await createItem(actionPath, formData);

    if (result && result.success) {

      showModal(isEdit ? "Hospital Updated" : "Hospital Created");
      resetForm();
      refresh();

    } else {

      showModal("Error saving hospital", "error");

    }
  };

  const handleDelete = async () => {

    if (!selectedRow) return;

    const result = await deleteItem(
      `${PATH}/delete/${selectedRow.hospital_code}/`
    );

    if (result.success) {

      showModal("Hospital Deleted");
      setSelectedRow(null);
      refresh();

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

      {/* MODAL */}
      {modal.visible && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="form-container max-w-sm w-full p-8 text-center shadow-2xl">

            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? (
                <FaCheckCircle className="text-6xl text-emerald-500" />
              ) : (
                <FaTimesCircle className="text-6xl text-rose-500" />
              )}
            </div>

            <h3 className="text-xl font-black mb-3 uppercase">
              {modal.type === "success" ? "Success" : "Error"}
            </h3>

            <p className="mb-6">{modal.message}</p>

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

          <div className="flex gap-2">

            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedRow && (

              <div className="flex gap-2 animate-in slide-in-from-right-5">

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

      {/* FORM */}

      {showForm && (

        <div className="form-container animate-in zoom-in-95 duration-200">

          <h6 className="form-section-title">
            {isEdit ? "Update Hospital Profile" : "Add Hospital"}
          </h6>

          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            onSubmit={handleSubmit}
          >

            <div className="space-y-1">
              <label className="form-label">Hospital Code</label>
              <input
                className="form-input"
                value={formData.hospital_code}
                disabled={isEdit}
                onChange={(e) =>
                  setFormData({ ...formData, hospital_code: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="form-label">Hospital Name</label>
              <input
                className="form-input"
                value={formData.hospital_name}
                onChange={(e) =>
                  setFormData({ ...formData, hospital_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="form-label">Mobile</label>
              <input
                className="form-input"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: Number(e.target.value) })
                }
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3">

              <button type="submit" className="btn-primary px-10 py-3">
                {isEdit ? "Update" : "Save"}
              </button>

              <button type="button" className="btn-ghost" onClick={resetForm}>
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}

      {/* TABLE */}

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
                <th></th>
                <th>Hospital Code</th>
                <th>Hospital Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {paginatedData.map((item) => (

                <tr
                  key={item.hospital_code}
                  onClick={() =>
                    setSelectedRow(
                      selectedRow?.hospital_code === item.hospital_code
                        ? null
                        : item
                    )
                  }
                  className={`group cursor-pointer transition-colors ${
                    selectedRow?.hospital_code === item.hospital_code
                      ? "bg-emerald-500/10"
                      : "hover:bg-emerald-500/5"
                  }`}
                >

                  <td className="px-6 py-4">

                    <div
                      className={`selection-indicator ${
                        selectedRow?.hospital_code === item.hospital_code
                          ? "selection-indicator-active"
                          : "group-hover:border-emerald-500/50"
                      }`}
                    >
                      {selectedRow?.hospital_code === item.hospital_code && (
                        <div className="selection-dot" />
                      )}
                    </div>

                  </td>

                  <td className="text-admin-td">{item.hospital_code}</td>
                  <td className="text-admin-td">{item.hospital_name}</td>
                  <td className="text-admin-td">{item.email}</td>
                  <td className="text-admin-td">{item.mobile}</td>

                  <td className="text-admin-td">
                    <span
                      className={`badge ${
                        item.status === 1 ? "badge-success" : "badge-danger"
                      }`}
                    >
                      {item.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>

                </tr>

              ))}

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

export default HospitalDetails;