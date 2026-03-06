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
  FaLightbulb,
  FaUserInjured,
} from "react-icons/fa";

const PatientMst = () => {
  const PATH = "patient";

  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const initialFormState = {
    patient_code: "",
    uhid: "",
    hospital_code: "",
    patient_first_name: "",
    patient_middle_name: "",
    patient_last_name: "",
    dob: "",
    age: "",
    gender: "",
    marital_status_code: "",
    blood_group_code: "",
    occupation: "",
    aadhar_no: "",
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
    weight_kg: "",
    informant: "",
    relation_code: "",
    reliability: "",
    referred_by_dr: "",
    emergency_contact_name: "",
    emergency_contact_relation: "",
    renew_date: "",
    sort_order: "",
    status: 1
  };

  const [formData, setFormData] = useState(initialFormState);
  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

  // Table Data Mapping
  const tableData = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : (data.results || []);
  }, [data]);

  const {
    search, setSearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    paginatedData,
    effectiveItemsPerPage,
    filteredData,
    totalPages
  } = useTable(tableData);

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData(initialFormState);
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.patient_code}/`
      : `${PATH}/create/`;

    const payload = { ...formData };
    
    // Numeric/Decimal fields cleaning
    const numericFields = ["age", "weight_kg", "sort_order", "gender", "status"];
    numericFields.forEach(field => {
      if (payload[field] === "" || payload[field] === null || payload[field] === undefined) {
        delete payload[field];
      } else {
        payload[field] = Number(payload[field]);
      }
    });

    // Date fields cleaning
    ["dob", "renew_date"].forEach(field => {
      if (!payload[field] || payload[field] === "") delete payload[field];
    });

    // String fields - converting empty to null
    Object.keys(payload).forEach(key => {
      if (payload[key] === "") payload[key] = null;
    });

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Patient ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      console.error("Backend Error:", result.error);
      const errorMsg = typeof result.error === 'object' 
        ? Object.entries(result.error).map(([k, v]) => `${k}: ${v}`).join(", ")
        : result.error;
      showModal(errorMsg || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    const result = await deleteItem(`${PATH}/delete/${selectedRow.patient_code}/`);
    if (result.success) {
      showModal("Patient deleted successfully!");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="app-container">
      {/* MODAL */}
      {modal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? <FaCheckCircle className="text-6xl text-emerald-500" /> : <FaTimesCircle className="text-6xl text-rose-500" />}
            </div>
            <h3 className={`text-xl font-black mb-2 uppercase tracking-tight ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            <p className="mb-6 font-medium opacity-80">{modal.message}</p>
            <button className="btn-primary w-full justify-center py-3" onClick={() => setModal({ ...modal, visible: false })}>Continue</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="section-header">
        <h4 className="page-title flex items-center gap-2">
           <FaUserInjured /> Patient Master
        </h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus size={14} /> Add New</button>
            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                <button className="btn-warning" onClick={() => { setFormData(selectedRow); setIsEdit(true); setShowForm(true); }}><FaEdit size={14} /> Edit</button>
                <button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FULL MODEL FORM */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200 max-w-6xl mx-auto">
          <h6 className="form-section-title uppercase tracking-tighter border-b pb-2 mb-6">
            {isEdit ? "Update Patient Profile" : "Register New Patient"}
          </h6>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
              
              {/* Section 1: Identity */}
              <div className="md:col-span-4 font-bold text-emerald-600 text-sm border-l-4 border-emerald-500 pl-2 mb-2">Identity & Hospital Info</div>
              <div className="space-y-1">
                <label className="form-label">Patient Code *</label>
                <input className={`form-input w-full ${isEdit ? "opacity-50" : ""}`} disabled={isEdit} required value={formData.patient_code} onChange={e => setFormData({ ...formData, patient_code: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">UHID</label>
                <input className="form-input w-full" value={formData.uhid || ""} onChange={e => setFormData({ ...formData, uhid: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">Hospital Code</label>
                <input className="form-input w-full" value={formData.hospital_code || ""} onChange={e => setFormData({ ...formData, hospital_code: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">Aadhar No</label>
                <input className="form-input w-full" value={formData.aadhar_no || ""} onChange={e => setFormData({ ...formData, aadhar_no: e.target.value })} />
              </div>

              {/* Section 2: Personal Details */}
              <div className="md:col-span-4 font-bold text-emerald-600 text-sm border-l-4 border-emerald-500 pl-2 mt-2 mb-2">Personal Details</div>
              <div className="space-y-1">
                <label className="form-label">First Name *</label>
                <input className="form-input w-full" required value={formData.patient_first_name} onChange={e => setFormData({ ...formData, patient_first_name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">Middle Name</label>
                <input className="form-input w-full" value={formData.patient_middle_name || ""} onChange={e => setFormData({ ...formData, patient_middle_name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">Last Name *</label>
                <input className="form-input w-full" required value={formData.patient_last_name} onChange={e => setFormData({ ...formData, patient_last_name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">Gender</label>
                <select className="form-input w-full" value={formData.gender || ""} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option value="1">Male</option>
                  <option value="2">Female</option>
                  <option value="3">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="form-label">DOB</label>
                <input type="date" className="form-input w-full" value={formData.dob || ""} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">Age</label>
                <input type="number" className="form-input w-full" value={formData.age || ""} onChange={e => setFormData({ ...formData, age: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">Blood Group</label>
                <input className="form-input w-full" value={formData.blood_group_code || ""} onChange={e => setFormData({ ...formData, blood_group_code: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">Marital Status</label>
                <input className="form-input w-full" value={formData.marital_status_code || ""} onChange={e => setFormData({ ...formData, marital_status_code: e.target.value })} />
              </div>

              {/* Section 3: Contact & Address */}
              <div className="md:col-span-4 font-bold text-emerald-600 text-sm border-l-4 border-emerald-500 pl-2 mt-2 mb-2">Contact & Address</div>
              <div className="space-y-1">
                <label className="form-label">Mobile</label>
                <input className="form-input w-full" value={formData.mobile || ""} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">Email</label>
                <input type="email" className="form-input w-full" value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="form-label">Address 1</label>
                <input className="form-input w-full" value={formData.address1 || ""} onChange={e => setFormData({ ...formData, address1: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">City</label>
                <input className="form-input w-full" value={formData.city_code || ""} onChange={e => setFormData({ ...formData, city_code: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">State</label>
                <input className="form-input w-full" value={formData.state_code || ""} onChange={e => setFormData({ ...formData, state_code: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">Pincode</label>
                <input className="form-input w-full" value={formData.pincode || ""} onChange={e => setFormData({ ...formData, pincode: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">Weight (kg)</label>
                <input type="number" step="0.01" className="form-input w-full" value={formData.weight_kg || ""} onChange={e => setFormData({ ...formData, weight_kg: e.target.value })} />
              </div>

              {/* Section 4: Emergency & Other */}
              <div className="md:col-span-4 font-bold text-emerald-600 text-sm border-l-4 border-emerald-500 pl-2 mt-2 mb-2">Emergency & Other</div>
              <div className="space-y-1">
                <label className="form-label">Emergency Contact Name</label>
                <input className="form-input w-full" value={formData.emergency_contact_name || ""} onChange={e => setFormData({ ...formData, emergency_contact_name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">Relation</label>
                <input className="form-input w-full" value={formData.emergency_contact_relation || ""} onChange={e => setFormData({ ...formData, emergency_contact_relation: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">Occupation</label>
                <input className="form-input w-full" value={formData.occupation || ""} onChange={e => setFormData({ ...formData, occupation: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="form-label">Status</label>
                <select className="form-input w-full" value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-6 mt-8">
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn-primary px-12 py-3 tracking-wider uppercase font-bold text-sm">
                {isEdit ? "Update Patient" : "Save Patient"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}
      {!showForm && (
        <div className="data-table-container animate-in fade-in duration-500">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">Code</th>
                  <th className="text-admin-th">Patient Name</th>
                  <th className="text-admin-th">Mobile</th>
                  <th className="text-admin-th">City</th>
                  <th className="text-admin-th text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map(row => (
                    <tr key={row.patient_code} onClick={() => setSelectedRow(selectedRow?.patient_code === row.patient_code ? null : row)}
                      className={`group cursor-pointer transition-colors ${selectedRow?.patient_code === row.patient_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}>
                      <td className="px-6 py-4">
                        <div className={`selection-indicator ${selectedRow?.patient_code === row.patient_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                          {selectedRow?.patient_code === row.patient_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="text-admin-td font-black">{row.patient_code}</td>
                      <td className="text-admin-td font-bold uppercase">{`${row.patient_first_name} ${row.patient_last_name}`}</td>
                      <td className="text-admin-td">{row.mobile || "-"}</td>
                      <td className="text-admin-td">{row.city_code || "-"}</td>
                      <td className="text-admin-td text-center">
                        <span className={`badge ${row.status === 1 ? "badge-success" : "badge-danger"}`}>
                          {row.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <FaLightbulb size={64} className="mb-4 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No Records Found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
};

export default PatientMst;