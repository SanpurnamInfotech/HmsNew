import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaHandHoldingHeart } from "react-icons/fa";

const BloodDonor = () => {
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud("blood_donor/");
  const { data: bloodGroups } = useCrud("blood_group_master/"); // dropdown list

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [formData, setFormData] = useState({
    donor_firstname: "",
    donor_middlename: "",
    donor_lastname: "",
    blood_group_code: "",
    gender: "",
    age: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    last_donation_date: "",
    status: 1,
    sort_order: 1000,
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

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelected(null);
    setFormData({
      donor_firstname: "",
      donor_middlename: "",
      donor_lastname: "",
      blood_group_code: "",
      gender: "",
      age: "",
      phone: "",
      email: "",
      address1: "",
      address2: "",
      last_donation_date: "",
      status: 1,
      sort_order: 1000,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      age: formData.age === "" ? null : Number(formData.age),
      sort_order: formData.sort_order === "" ? null : Number(formData.sort_order),
      status: Number(formData.status),
      // send datetime (if empty -> null)
      last_donation_date: formData.last_donation_date ? formData.last_donation_date : null,
    };

    let result = isEdit
      ? await updateItem(`blood_donor/update/${selected?.id}/`, payload)
      : await createItem(`blood_donor/create/`, payload);

    if (result.success) {
      showModal(`Blood Donor ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteItem(`blood_donor/delete/${selected.id}/`);
    if (result.success) {
      showModal("Blood Donor deleted successfully!");
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
        <p className="loading-text">Loading Blood Donor Data...</p>
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
        <h4 className="text-xl font-bold text-gray-800">Blood Donor</h4>

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
                    setFormData({
                      donor_firstname: selected.donor_firstname || "",
                      donor_middlename: selected.donor_middlename || "",
                      donor_lastname: selected.donor_lastname || "",
                      blood_group_code: selected.blood_group_code || "",
                      gender: selected.gender || "",
                      age: selected.age ?? "",
                      phone: selected.phone || "",
                      email: selected.email || "",
                      address1: selected.address1 || "",
                      address2: selected.address2 || "",
                      // if API gives "2026-02-18T00:00:00Z" it still works in datetime-local sometimes;
                      // if not, keep it blank or adjust later
                      last_donation_date: selected.last_donation_date || "",
                      status: selected.status ?? 1,
                      sort_order: selected.sort_order ?? 1000,
                    });
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
              {isEdit ? "Update Donor Info" : "Add New Donor"}
            </h6>
          </div>

          <form className="grid grid-cols-1 gap-y-10" onSubmit={handleSubmit}>
            {/* Section 1: Basic */}
            <div>
              <h6 className="text-md font-bold text-gray-700 mb-4">Basic Details</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">First Name</label>
                  <input
                    className="form-input"
                    value={formData.donor_firstname}
                    required
                    onChange={(e) => setFormData({ ...formData, donor_firstname: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Middle Name</label>
                  <input
                    className="form-input"
                    value={formData.donor_middlename}
                    onChange={(e) => setFormData({ ...formData, donor_middlename: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Last Name</label>
                  <input
                    className="form-input"
                    value={formData.donor_lastname}
                    required
                    onChange={(e) => setFormData({ ...formData, donor_lastname: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Blood Group</label>
                  <select
                    className="form-input"
                    value={formData.blood_group_code || ""}
                    required
                    onChange={(e) => setFormData({ ...formData, blood_group_code: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {(bloodGroups || []).map((bg) => (
                      <option key={bg.blood_group_code} value={bg.blood_group_code}>
                        {bg.blood_group_name} ({bg.blood_group_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-input"
                    value={formData.gender || ""}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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
                  <label className="form-label">Last Donation Date</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.last_donation_date || ""}
                    onChange={(e) => setFormData({ ...formData, last_donation_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contact */}
            <div>
              <h6 className="text-md font-bold text-gray-700 mb-4">Contact</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Address */}
            <div>
              <h6 className="text-md font-bold text-gray-700 mb-4">Address</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Address 1</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.address1 || ""}
                    onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Address 2</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.address2 || ""}
                    onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
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
                  <th className="table-th">Name</th>
                  <th className="table-th">Blood Group</th>
                  <th className="table-th">Gender</th>
                  <th className="table-th">Phone</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((x) => (
                  <tr
                    key={x.id}
                    onClick={() => setSelected(selected?.id === x.id ? null : x)}
                    className={`table-row ${selected?.id === x.id ? "table-row-active" : "table-row-hover"}`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${selected?.id === x.id ? "selection-indicator-active" : "selection-indicator-inactive"}`}>
                        {selected?.id === x.id && <div className="selection-dot" />}
                      </div>
                    </td>
                    <td className="table-td text-admin-id">
                      {x.donor_firstname} {x.donor_middlename ? `${x.donor_middlename} ` : ""}{x.donor_lastname}
                    </td>
                    <td className="table-td">{x.blood_group_code || "-"}</td>
                    <td className="table-td">{x.gender || "-"}</td>
                    <td className="table-td">{x.phone || "-"}</td>
                    <td className="table-td">{statusBadge(x.status)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaHandHoldingHeart size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">No donors found</p>
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

export default BloodDonor;
