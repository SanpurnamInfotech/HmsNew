import React, { useState, useMemo } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { 
  FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, 
  FaSearch, FaChevronDown, FaUserInjured, FaPhone, 
  FaHospital, FaUserCheck
} from "react-icons/fa";

const Patient = () => {
  const PATH = "patient";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);

  // Master Data
  const { data: countries } = useCrud("countries/");
  const { data: hospital } = useCrud("hospital/");
  const { data: states } = useCrud("states/");
  const { data: districts } = useCrud("districts/");
  const { data: cities } = useCrud("cities/");
  const { data: relations } = useCrud("relation_master/");
  const { data: bloodGroups } = useCrud("blood_group_master/");
  const { data: maritalStatuses } = useCrud("marital_status_master/");

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });
  const [dSearch, setDSearch] = useState({ hos: "", st: "", dt: "", ct: "", rel: "", bg: "", ms: "", cn: "" });

  const initialForm = {
    uhid: "",
    patient_code: "", 
    hospital_code: "",
    patient_first_name: "",
    patient_middle_name: "",
    patient_last_name: "",
    dob: null,
    age: "",
    gender: 1, 
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
    patient_photo_path: "",
    renew_date: null,
    status: 1,
    sort_order: "",
    other_city: "", 
    other_district: "", 
  };

  const [formData, setFormData] = useState(initialForm);

  /* ================= LOGIC: AUTO-GENERATE PATIENT CODE ================= */
  const nextPatientCode = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const codes = list.map((x) => (x?.patient_code || "").toString()).filter((c) => c.startsWith("PAT"));
    let maxNum = 0;
    for (const code of codes) {
      const num = parseInt(code.replace("PAT", ""), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
    return `PAT${String(maxNum + 1).padStart(6, "0")}`;
  }, [data]);

  /* ================= LOGIC: SORTING & TABLE ================= */
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  }, [data]);

  const {
    search, setSearch, currentPage, setCurrentPage, itemsPerPage,
    setItemsPerPage, paginatedData, effectiveItemsPerPage, filteredData, totalPages,
  } = useTable(sortedData);

  /* ================= HELPERS ================= */
  const handleDobChange = (dobValue) => {
    if (!dobValue) return;
    const birthDate = new Date(dobValue);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (new Date(today.getFullYear(), today.getMonth(), today.getDate()) < 
        new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) age--;
    setFormData({ ...formData, dob: dobValue, age: age > 0 ? age : 0 });
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setOpenDropdown(null);
    setFormData(initialForm);
    setDSearch({ hos: "", st: "", dt: "", ct: "", rel: "", bg: "", ms: "", cn: "" });
  };

  const showModal = (message, type = "success") => setModal({ visible: true, message, type });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, patient_photo_path: reader.result });
      reader.readAsDataURL(file);
    }
  };

  /* ================= SEARCHABLE DROPDOWN ================= */
  const SearchDropdown = ({ label, options, valKey, dispKey, stateKey, dKey }) => {
    const rawList = Array.isArray(options) ? options : [];
    const list = (stateKey === 'city_code' || stateKey === 'district_code') 
      ? [...rawList, { [valKey]: "OTHER", [dispKey]: "Other (Add New)" }]
      : rawList;

    const selected = list.find(o => o[valKey] === formData[stateKey]);
    const display = selected ? selected[dispKey] : `Select ${label}`;

    return (
      <div className="space-y-1.5 relative">
        <label className="form-label">{label}</label>
        <div className="form-input w-full flex justify-between items-center cursor-pointer" 
             onClick={() => setOpenDropdown(openDropdown === dKey ? null : dKey)}>
          <span className={formData[stateKey] ? "" : "opacity-50"}>{display}</span>
          <FaChevronDown size={12} className={`transition-transform ${openDropdown === dKey ? 'rotate-180' : ''} opacity-40`} />
        </div>
        {openDropdown === dKey && (
          <div className="absolute z-50 w-full mt-2 rounded-xl shadow-2xl border overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="p-3 border-b flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <FaSearch className="opacity-40" size={14} />
              <input autoFocus className="bg-transparent outline-none text-sm w-full" placeholder={`Search ${label}...`} 
                     value={dSearch[dKey] || ""} onChange={(e) => setDSearch({...dSearch, [dKey]: e.target.value})} />
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              {list.filter(o => (o[dispKey] || "").toLowerCase().includes((dSearch[dKey] || "").toLowerCase())).map(opt => (
                <div key={opt[valKey]} className={`px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm transition-colors ${opt[valKey] === 'OTHER' ? 'text-emerald-500 font-bold border-t border-slate-100 dark:border-slate-700' : ''}`}
                     onClick={() => { setFormData({ ...formData, [stateKey]: opt[valKey] }); setOpenDropdown(null); }}>
                  {opt[dispKey]}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ================= ACTIONS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create Clean Payload
    const payload = { ...formData };
    
    // Logic: If 'OTHER' is selected, ensure the 'other' text is sent and code is null
    if (payload.city_code === "OTHER") {
        payload.city_code = null;
    } else {
        payload.other_city = null;
    }
    
    if (payload.district_code === "OTHER") {
        payload.district_code = null;
    } else {
        payload.other_district = null;
    }

    // Convert strings to numbers where necessary
    const numericFields = ["age", "weight_kg", "sort_order", "gender", "status"];
    numericFields.forEach(field => {
        payload[field] = (payload[field] === "" || payload[field] === null) ? null : Number(payload[field]);
    });

    // Clean empty strings to null for backend
    Object.keys(payload).forEach(key => {
      if (payload[key] === "") payload[key] = null;
    });

    const actionPath = isEdit ? `${PATH}/update/${formData.patient_code}/` : `${PATH}/create/`;
    const result = isEdit ? await updateItem(actionPath, payload) : await createItem(actionPath, payload);
    
    if (result.success) {
      showModal(`Patient ${isEdit ? "updated" : "registered"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Failed to save.", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    const result = await deleteItem(`${PATH}/delete/${selectedRow.patient_code}/`);
    if (result.success) {
      showModal("Patient record deleted!");
      resetForm();
      refresh();
    }
  };

  if (loading) return <div className="flex justify-center p-20 text-emerald-600 animate-pulse font-bold">LOADING...</div>;

  return (
    <div className="app-container">
      {modal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center shadow-2xl">
            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? <FaCheckCircle className="text-6xl text-emerald-500" /> : <FaTimesCircle className="text-6xl text-rose-500" />}
            </div>
            <h3 className={`text-xl font-black mb-2 uppercase ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            <p className="mb-6 font-medium opacity-80">{modal.message}</p>
            <button className="btn-primary w-full justify-center py-3" onClick={() => setModal({ ...modal, visible: false })}>Continue</button>
          </div>
        </div>
      )}

      <div className="section-header">
        <h4 className="page-title">Patient Registration</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => {
                setFormData({ ...initialForm, patient_code: nextPatientCode });
                setShowForm(true);
            }}><FaPlus size={14} />Add New</button>
            {selectedRow && (
              <div className="flex items-center gap-2">
                <button className="btn-warning" onClick={() => { setFormData({ ...selectedRow }); setIsEdit(true); setShowForm(true); }}><FaEdit size={14} /> Edit</button>
                <button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm ? (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* 1. SYSTEM ID */}
            <section>
              <h6 className="form-section-title uppercase tracking-tighter mb-6 text-emerald-500 flex items-center gap-2"><FaHospital /> Identification</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5"><label className="form-label">UHID</label><input className="form-input w-full font-bold text-emerald-600" value={formData.uhid} required onChange={e => setFormData({...formData, uhid: e.target.value})} /></div>
                <SearchDropdown label="Hospital" options={hospital} valKey="hospital_code" dispKey="hospital_name" stateKey="hospital_code" dKey="hos" />
                <div className="space-y-1.5"><label className="form-label">Aadhar No.</label><input className="form-input w-full" maxLength={12} value={formData.aadhar_no || ""} onChange={e => setFormData({...formData, aadhar_no: e.target.value})} /></div>
              </div>
            </section>

            {/* 2. PATIENT DETAILS */}
            <section>
              <h6 className="form-section-title uppercase tracking-tighter mb-6 text-emerald-500 flex items-center gap-2"><FaUserInjured /> Patient Details</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5"><label className="form-label">First Name</label><input className="form-input w-full" value={formData.patient_first_name} required onChange={e => setFormData({...formData, patient_first_name: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Middle Name</label><input className="form-input w-full" value={formData.patient_middle_name || ""} onChange={e => setFormData({...formData, patient_middle_name: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Last Name</label><input className="form-input w-full" value={formData.patient_last_name} required onChange={e => setFormData({...formData, patient_last_name: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">DOB</label><input type="date" className="form-input w-full" value={formData.dob || ""} onChange={e => handleDobChange(e.target.value)} /></div>
                <div className="space-y-1.5"><label className="form-label">Age</label><input type="number" className="form-input w-full bg-slate-100/10" value={formData.age || ""} readOnly /></div>
                <div className="space-y-1.5">
                  <label className="form-label">Gender</label>
                  <select className="form-input w-full" style={{colorScheme: 'dark'}} value={formData.gender} onChange={e => setFormData({...formData, gender: Number(e.target.value)})}>
                    <option value={1}>Male</option><option value={2}>Female</option><option value={3}>Other</option>
                  </select>
                </div>
                <SearchDropdown label="Marital Status" options={maritalStatuses} valKey="marital_status_code" dispKey="marital_status_name" stateKey="marital_status_code" dKey="ms" />
                <SearchDropdown label="Blood Group" options={bloodGroups} valKey="blood_group_code" dispKey="blood_group_name" stateKey="blood_group_code" dKey="bg" />
                <div className="space-y-1.5"><label className="form-label">Occupation</label><input className="form-input w-full" value={formData.occupation || ""} onChange={e => setFormData({...formData, occupation: e.target.value})} /></div>
              </div>
            </section>

            {/* 3. ADDRESS */}
            <section>
              <h6 className="form-section-title uppercase tracking-tighter mb-6 text-emerald-500 flex items-center gap-2"><FaPhone /> Contact & Address</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5"><label className="form-label">Mobile</label><input className="form-input w-full" value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Email</label><input type="email" className="form-input w-full" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Address Line 1</label><input className="form-input w-full" value={formData.address1 || ""} onChange={e => setFormData({...formData, address1: e.target.value})} /></div>
                
                <SearchDropdown label="Country" options={countries} valKey="country_code" dispKey="country_name" stateKey="country_code" dKey="cn" />
                <SearchDropdown label="State" options={states} valKey="state_code" dispKey="state_name" stateKey="state_code" dKey="st" />
                
                <div className="space-y-1.5">
                  <SearchDropdown label="District" options={districts} valKey="district_code" dispKey="district_name" stateKey="district_code" dKey="dt" />
                  {formData.district_code === "OTHER" && (
                    <input className="form-input w-full mt-2 animate-in slide-in-from-top-2" placeholder="Enter District Name" value={formData.other_district} onChange={e => setFormData({...formData, other_district: e.target.value})} />
                  )}
                </div>

                <div className="space-y-1.5">
                  <SearchDropdown label="City" options={cities} valKey="city_code" dispKey="city_name" stateKey="city_code" dKey="ct" />
                  {formData.city_code === "OTHER" && (
                    <input className="form-input w-full mt-2 animate-in slide-in-from-top-2" placeholder="Enter City Name" value={formData.other_city} onChange={e => setFormData({...formData, other_city: e.target.value})} />
                  )}
                </div>
                <div className="space-y-1.5"><label className="form-label">Pincode</label><input className="form-input w-full" value={formData.pincode || ""} onChange={e => setFormData({...formData, pincode: e.target.value})} /></div>
              </div>
            </section>

            {/* 4. MEDICAL/REF */}
            <section>
              <h6 className="form-section-title uppercase tracking-tighter mb-6 text-emerald-500 flex items-center gap-2"><FaUserCheck /> Referral & Emergency</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5"><label className="form-label">Weight (kg)</label><input type="number" step="0.1" className="form-input w-full" value={formData.weight_kg || ""} onChange={e => setFormData({...formData, weight_kg: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Emergency Contact Name</label><input className="form-input w-full" value={formData.emergency_contact_name || ""} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} /></div>
                <SearchDropdown label="Relation" options={relations} valKey="relation_code" dispKey="relation_name" stateKey="relation_code" dKey="rel" />
                <div className="space-y-1.5"><label className="form-label">Referred By Dr.</label><input className="form-input w-full" value={formData.referred_by_dr || ""} onChange={e => setFormData({...formData, referred_by_dr: e.target.value})} /></div>
                <div className="space-y-1.5">
                  <label className="form-label">Photo</label>
                  <input type="file" className="form-input w-full text-xs" onChange={handlePhotoChange} />
                </div>
                <div className="space-y-1.5">
                  <label className="form-label">Status</label>
                  <select className="form-input w-full" style={{colorScheme: 'dark'}} value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                    <option value={1}>Active</option><option value={0}>Inactive</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="flex justify-end gap-3 border-t pt-8 mt-4" style={{ borderColor: "var(--border-color)" }}>
              <button type="submit" className="btn-primary px-12 py-3">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="data-table-container">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">PATIENT CODE</th>
                  <th className="text-admin-th">UHID</th>
                  <th className="text-admin-th">NAME</th>
                  <th className="text-admin-th">MOBILE</th>
                  <th className="text-admin-th">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.map((item) => (
                  <tr key={item.patient_code} onClick={() => setSelectedRow(selectedRow?.patient_code === item.patient_code ? null : item)}
                      className={`group cursor-pointer transition-colors ${selectedRow?.patient_code === item.patient_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}>
                    <td className="px-6 py-4">
                      <div className={`selection-indicator ${selectedRow?.patient_code === item.patient_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                        {selectedRow?.patient_code === item.patient_code && <div className="selection-dot" />}
                      </div>
                    </td>
                    <td className="text-admin-td">{item.patient_code}</td>
                    <td className="text-admin-td">{item.uhid}</td>
                    <td className="text-admin-td uppercase font-medium">{`${item.patient_first_name} ${item.patient_last_name}`}</td>
                    <td className="text-admin-td">{item.mobile || "---"}</td>
                    <td className="text-admin-td">
                      <span className={`badge ${item.status === 1 ? "badge-success" : "badge-danger"}`}>{item.status === 1 ? "Active" : "Inactive"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
};

export default Patient;