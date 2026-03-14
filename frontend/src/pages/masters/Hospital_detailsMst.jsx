import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

const HospitalDetails = () => {
  const PATH = "hospital";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);

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

  const showModal = (message, type = "success") => {
    setModal({ visible: true, message, type });
  };

  const generateHospitalCode = () => {
    const count = data ? data.length + 1 : 1;
    return `HOSP${String(count).padStart(3, "0")}`;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hospital_code || !formData.hospital_name) {
      showModal("Hospital code and name required", "error");
      return;
    }
    if (formData.mobile.toString().length !== 10) {
      showModal("Mobile must be 10 digits", "error");
      return;
    }
    if (!formData.email.includes("@")) {
      showModal("Invalid email", "error");
      return;
    }

    const actionPath = isEdit
      ? `${PATH}/update/${formData.hospital_code}/`
      : `${PATH}/create/`;

    const payload = {
      ...formData,
      mobile: Number(formData.mobile),
      phone: Number(formData.phone),
      pincode: Number(formData.pincode),
      status: Number(formData.status)
    };

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(isEdit ? "Hospital Updated" : "Hospital Created");
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Save failed", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    const result = await deleteItem(`${PATH}/delete/${selectedRow.hospital_code}/`);
    if (result.success) {
      showModal("Hospital deleted");
      setSelectedRow(null);
      refresh();
    } else {
      showModal("Delete failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="app-container">
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
            <button className="btn-primary w-full justify-center py-3" onClick={() => setModal({ ...modal, visible: false })}>
              Continue
            </button>
          </div>
        </div>
      )}

      <div className="section-header">
        <h4 className="page-title">Hospital Details</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => {
                setFormData({ ...formData, hospital_code: generateHospitalCode() });
                setShowForm(true);
              }}
            >
              <FaPlus size={14} /> Add New
            </button>
            {selectedRow && (
              <div className="flex items-center gap-2">
                <button className="btn-warning" onClick={() => { setFormData(selectedRow); setShowForm(true); setIsEdit(true); }}>
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
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter mb-6">
            {isEdit ? "Update Hospital" : "Add Hospital"}
          </h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <input className="form-input" placeholder="Hospital Code" value={formData.hospital_code} readOnly />
            <input className="form-input" placeholder="Hospital Name" value={formData.hospital_name} onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })} />
            <input className="form-input" placeholder="Registration Number" value={formData.hospital_reg_number} onChange={(e) => setFormData({ ...formData, hospital_reg_number: e.target.value })} />
            <input className="form-input" placeholder="CST Number" value={formData.hospital_cst_number} onChange={(e) => setFormData({ ...formData, hospital_cst_number: e.target.value })} />
            <input className="form-input" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <input type="number" className="form-input" placeholder="Mobile" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
            <input type="number" className="form-input" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <input className="form-input" placeholder="Address Line 1" value={formData.address1} onChange={(e) => setFormData({ ...formData, address1: e.target.value })} />
            <input className="form-input" placeholder="Address Line 2" value={formData.address2} onChange={(e) => setFormData({ ...formData, address2: e.target.value })} />
            <input className="form-input" placeholder="Landmark" value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} />
            <input className="form-input" placeholder="City Code" value={formData.city_code} onChange={(e) => setFormData({ ...formData, city_code: e.target.value })} />
            <input className="form-input" placeholder="District Code" value={formData.district_code} onChange={(e) => setFormData({ ...formData, district_code: e.target.value })} />
            <input className="form-input" placeholder="State Code" value={formData.state_code} onChange={(e) => setFormData({ ...formData, state_code: e.target.value })} />
            <input className="form-input" placeholder="Country Code" value={formData.country_code} onChange={(e) => setFormData({ ...formData, country_code: e.target.value })} />
            <input type="number" className="form-input" placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
            <input className="form-input" placeholder="Lunch Timing" value={formData.lunch_timing} onChange={(e) => setFormData({ ...formData, lunch_timing: e.target.value })} />
            <input className="form-input" placeholder="Weekly Off Day" value={formData.weeklyoff_day} onChange={(e) => setFormData({ ...formData, weeklyoff_day: e.target.value })} />
            <input className="form-input" placeholder="Logo Path" value={formData.logo_path} onChange={(e) => setFormData({ ...formData, logo_path: e.target.value })} />
            <input className="form-input" placeholder="Developed By" value={formData.developed_by} onChange={(e) => setFormData({ ...formData, developed_by: e.target.value })} />
            <select className="form-input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
            <div className="md:col-span-2 flex justify-end gap-3 border-t pt-8 mt-4">
              <button type="submit" className="btn-primary px-12 py-3">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

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
                  <th className="text-admin-th w-12 text-center">Select</th>
                  <th className="text-admin-th">Hospital Code</th>
                  <th className="text-admin-th">Name</th>
                  <th className="text-admin-th">Email</th>
                  <th className="text-admin-th">Mobile</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr
                      key={item.hospital_code}
                      onClick={() => setSelectedRow(selectedRow?.hospital_code === item.hospital_code ? null : item)}
                      className={`cursor-pointer transition-colors ${selectedRow?.hospital_code === item.hospital_code ? "bg-emerald-100" : "hover:bg-emerald-50"}`}
                    >
                      <td className="text-admin-td text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 accent-emerald-600 cursor-pointer"
                          checked={selectedRow?.hospital_code === item.hospital_code}
                          readOnly 
                        />
                      </td>
                      <td className="text-admin-td font-bold">{item.hospital_code}</td>
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
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No Hospitals Found</p>
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

export default HospitalDetails;