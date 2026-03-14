import React, { useState, useMemo } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { 
  FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, 
  FaSearch, FaChevronDown, FaUserTie 
} from "react-icons/fa";

const EmployeeMaster = () => {
  const EMP_PATH = "employee_master";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${EMP_PATH}/`);
  
  // Master Data for Dropdowns
  const { data: companies } = useCrud("companies/");
  const { data: financialYears } = useCrud("financial_years/");
  const { data: departments } = useCrud("departments/");
  const { data: designations } = useCrud("designations/");
  const { data: divisions } = useCrud("divisions/");
  const { data: countries } = useCrud("countries/");
  const { data: states } = useCrud("states/");
  const { data: districts } = useCrud("districts/");
  const { data: cities } = useCrud("cities/");

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

  // Unified search state for all dropdowns
  const [dSearch, setDSearch] = useState({
    co: "", fy: "", dept: "", desig: "", div: "", cn: "", st: "", dt: "", ct: ""
  });

  const initialForm = {
    employee_code: "",
    company_code: "",
    financialyear_code: "",
    department_code: "",
    designation_code: "",
    division_code: "",
    employee_firstname: "",
    employee_middlename: "",
    employee_lastname: "",
    dob: "",
    gender: 1,
    photo: null,
    joining_date: "",
    qualification: "",
    total_experience: "",
    status: 1,
    termination_date: "",
    termination_reason: "",
    email: "",
    mobile: "",
    phone: "",
    landmark: "",
    address1: "",
    address2: "",
    country_code: "",
    state_code: "",
    district_code: "",
    other_district: "", // New Field
    city_code: "",
    other_city: "",     // New Field
    pincode: "",
    sort_order: "",
  };

  const [formData, setFormData] = useState(initialForm);

  const nextEmployeeCode = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const codes = list.map((x) => (x?.employee_code || "").toString()).filter((c) => c.startsWith("EMP"));
    let maxNum = 0;
    for (const code of codes) {
      const num = parseInt(code.replace("EMP", ""), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
    return `EMP${String(maxNum + 1).padStart(6, "0")}`;
  }, [data]);

  /* ================= SORTING LOGIC ================= */
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const sa = (a.sort_order === null || a.sort_order === "" || a.sort_order === undefined) ? 999 : Number(a.sort_order);
      const sb = (b.sort_order === null || b.sort_order === "" || b.sort_order === undefined) ? 999 : Number(b.sort_order);
      return sa - sb;
    });
  }, [data]);

  const {
    search, setSearch, currentPage, setCurrentPage, itemsPerPage,
    setItemsPerPage, paginatedData, effectiveItemsPerPage, filteredData, totalPages,
  } = useTable(sortedData);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setOpenDropdown(null);
    setFormData(initialForm);
    setDSearch({ co: "", fy: "", dept: "", desig: "", div: "", cn: "", st: "", dt: "", ct: "" });
  };

  const showModal = (message, type = "success") => setModal({ visible: true, message, type });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, photo: reader.result });
      reader.readAsDataURL(file);
    }
  };

  /* ================= SEARCHABLE DROPDOWN COMPONENT ================= */
  const SearchDropdown = ({ label, options, valKey, dispKey, stateKey, dKey }) => {
    // Add "Other" for City and District
    const enhancedOptions = (stateKey === 'city_code' || stateKey === 'district_code') 
      ? [...(options || []), { [valKey]: "OTHER", [dispKey]: "Other (Add New)" }]
      : (options || []);

    const selected = enhancedOptions.find(o => o[valKey] === formData[stateKey]);
    const display = selected ? (dispKey === 'fy' ? `${selected.start_year} - ${selected.end_year}` : selected[dispKey]) : `Select ${label}`;

    return (
      <div className="space-y-1.5 relative">
        <label className="form-label">{label}</label>
        <div className="form-input w-full flex justify-between items-center cursor-pointer" onClick={() => setOpenDropdown(openDropdown === dKey ? null : dKey)}>
          <span className={formData[stateKey] ? "" : "opacity-50"}>{display}</span>
          <FaChevronDown size={12} className="opacity-40" />
        </div>
        {openDropdown === dKey && (
          <div className="absolute z-60 w-full mt-2 rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
            <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-hover)" }}>
              <FaSearch className="opacity-40" size={14} />
              <input autoFocus className="bg-transparent outline-none text-sm w-full" placeholder={`Search ${label}...`} value={dSearch[dKey]} onChange={(e) => setDSearch({...dSearch, [dKey]: e.target.value})} />
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              {enhancedOptions.filter(o => {
                const searchVal = dispKey === 'fy' ? `${o.start_year}-${o.end_year}` : o[dispKey];
                return (searchVal || "").toLowerCase().includes(dSearch[dKey].toLowerCase());
              }).map(opt => (
                <div key={opt[valKey]} className={`px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm transition-colors ${opt[valKey] === 'OTHER' ? 'text-emerald-500 font-bold border-t' : ''}`} 
                  style={{ borderTopColor: opt[valKey] === 'OTHER' ? "var(--border-color)" : "transparent" }}
                  onClick={() => { setFormData({ ...formData, [stateKey]: opt[valKey] }); setOpenDropdown(null); }}>
                  {dispKey === 'fy' ? `${opt.start_year} - ${opt.end_year}` : opt[dispKey]}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ================= SUBMIT & DELETE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Build payload - exclude employee_code for updates, include for creates
    const payload = {
      company_code: formData.company_code || null,
      financialyear_code: formData.financialyear_code || null,
      department_code: formData.department_code || null,
      designation_code: formData.designation_code || null,
      division_code: formData.division_code || null,
      employee_firstname: formData.employee_firstname,
      employee_middlename: formData.employee_middlename || null,
      employee_lastname: formData.employee_lastname,
      dob: formData.dob || null,
      gender: formData.gender,
      joining_date: formData.joining_date || null,
      qualification: formData.qualification || null,
      total_experience: formData.total_experience || null,
      status: formData.status,
      termination_date: formData.termination_date || null,
      termination_reason: formData.termination_reason || null,
      email: formData.email || null,
      mobile: formData.mobile || null,
      phone: formData.phone || null,
      landmark: formData.landmark || null,
      address1: formData.address1 || null,
      address2: formData.address2 || null,
      country_code: formData.country_code || null,
      state_code: formData.state_code || null,
      district_code: formData.district_code === "OTHER" ? null : formData.district_code || null,
      other_district: formData.other_district || null,
      city_code: formData.city_code === "OTHER" ? null : formData.city_code || null,
      other_city: formData.other_city || null,
      pincode: formData.pincode || null,
      sort_order: formData.sort_order === "" ? null : Number(formData.sort_order),
    };

    // Only add photo if it's a new value (for updates)
    if (formData.photo !== null && typeof formData.photo === 'string') {
      payload.photo = formData.photo;
    }

    const actionPath = isEdit ? `${EMP_PATH}/update/${formData.employee_code}/` : `${EMP_PATH}/create/`;
    const result = isEdit ? await updateItem(actionPath, payload) : await createItem(actionPath, payload);
    
    if (result.success) {
      showModal(`Employee ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Failed to save", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    // if (!window.confirm("Are you sure you want to delete this employee?")) return;
    const result = await deleteItem(`${EMP_PATH}/delete/${selectedRow.employee_code}/`);
    if (result.success) {
      showModal("Employee deleted successfully!");
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Delete failed", "error");
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
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">
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

      {/* HEADER */}
      <div className="section-header">
        <h4 className="page-title">Employee Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => {
              setFormData({ ...initialForm, employee_code: nextEmployeeCode });
              setShowForm(true);
            }}><FaPlus size={14} /> Add New</button>
            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="btn-warning" onClick={() => { setFormData({ ...selectedRow }); setIsEdit(true); setShowForm(true); }}><FaEdit size={14} /> Edit</button>
                <button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* 1. PERSONAL INFORMATION */}
            <section>
              <h6 className="form-section-title uppercase tracking-tighter mb-6">Personal Information</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">

                <SearchDropdown label="Company" options={companies} valKey="company_code" dispKey="company_name" stateKey="company_code" dKey="co" />
                <div className="space-y-1.5"><label className="form-label">First Name</label><input className="form-input w-full" value={formData.employee_firstname} required onChange={e => setFormData({...formData, employee_firstname: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Middle Name</label><input className="form-input w-full" value={formData.employee_middlename || ""} onChange={e => setFormData({...formData, employee_middlename: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Last Name</label><input className="form-input w-full" value={formData.employee_lastname} required onChange={e => setFormData({...formData, employee_lastname: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">DOB</label><input type="date" className="form-input w-full" value={formData.dob || ""} onChange={e => setFormData({...formData, dob: e.target.value})} /></div>
                <div className="space-y-1.5">
                  <label className="form-label">Gender</label>
                  <select className="form-input w-full cursor-pointer appearance-none" style={{ colorScheme: "dark" }} value={formData.gender} onChange={e => setFormData({...formData, gender: Number(e.target.value)})}>
                    <option value={1}>Male</option><option value={2}>Female</option><option value={3}>Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="form-label">Photo (Optional)</label>
                  <input type="file" className="form-input w-full text-xs" onChange={handlePhotoChange} />
                </div>
              </div>
            </section>

            {/* 2. EMPLOYMENT DETAILS */}
            <section>
              <h6 className="form-section-title uppercase tracking-tighter mb-6">Employment Details</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <SearchDropdown label="Financial Year" options={financialYears} valKey="financialyear_code" dispKey="fy" stateKey="financialyear_code" dKey="fy" />
                <SearchDropdown label="Department" options={departments} valKey="department_code" dispKey="department_name" stateKey="department_code" dKey="dept" />
                <SearchDropdown label="Designation" options={designations} valKey="designation_code" dispKey="designation_name" stateKey="designation_code" dKey="desig" />
                <SearchDropdown label="Division" options={divisions} valKey="division_code" dispKey="division_name" stateKey="division_code" dKey="div" />
                <div className="space-y-1.5"><label className="form-label">Joining Date</label><input type="date" className="form-input w-full" value={formData.joining_date || ""} onChange={e => setFormData({...formData, joining_date: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Qualification</label><input className="form-input w-full" value={formData.qualification || ""} onChange={e => setFormData({...formData, qualification: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Termination Date (Optional)</label><input type="date" className="form-input w-full" value={formData.termination_date || ""} onChange={e => setFormData({...formData, termination_date: e.target.value})} /></div>
                <div className="md:col-span-2 space-y-1.5"><label className="form-label">Termination Reason (Optional)</label><input className="form-input w-full" value={formData.termination_reason || ""} onChange={e => setFormData({...formData, termination_reason: e.target.value})} /></div>
              </div>
            </section>

            {/* 3. CONTACT & ADDRESS */}
            <section>
              <h6 className="form-section-title uppercase tracking-tighter mb-6">Contact & Address</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5"><label className="form-label">Email</label><input type="email" className="form-input w-full" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Mobile</label><input className="form-input w-full" value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
                
                <div className="space-y-1.5"><label className="form-label">Lanmark</label><input className="form-input w-full" value={formData.landmark || ""} onChange={e => setFormData({...formData, landmark: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Address 1</label><input className="form-input w-full" value={formData.address1 || ""} onChange={e => setFormData({...formData, address1: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Address 2</label><input className="form-input w-full" value={formData.address2 || ""} onChange={e => setFormData({...formData, address2: e.target.value})} /></div>
                <SearchDropdown label="Country" options={countries} valKey="country_code" dispKey="country_name" stateKey="country_code" dKey="cn" />
                <SearchDropdown label="State" options={states} valKey="state_code" dispKey="state_name" stateKey="state_code" dKey="st" />
                
                {/* District with Other logic */}
                <div className="space-y-1.5">
                  <SearchDropdown label="District" options={districts} valKey="district_code" dispKey="district_name" stateKey="district_code" dKey="dt" />
                  {formData.district_code === "OTHER" && (
                    <input className="form-input w-full mt-2 animate-in slide-in-from-top-2" placeholder="Enter District Name" value={formData.other_district} onChange={e => setFormData({...formData, other_district: e.target.value})} />
                  )}
                </div>

                {/* City with Other logic */}
                <div className="space-y-1.5">
                  <SearchDropdown label="City" options={cities} valKey="city_code" dispKey="city_name" stateKey="city_code" dKey="ct" />
                  {formData.city_code === "OTHER" && (
                    <input className="form-input w-full mt-2 animate-in slide-in-from-top-2" placeholder="Enter City Name" value={formData.other_city} onChange={e => setFormData({...formData, other_city: e.target.value})} />
                  )}
                </div>

                <div className="space-y-1.5"><label className="form-label">Status</label>
                  <select className="form-input w-full cursor-pointer appearance-none" style={{ colorScheme: "dark" }} value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                    <option value={1}>Active</option><option value={0}>Inactive</option>
                  </select>
                </div>
                <div className="space-y-1.5"><label className="form-label">Sort Order (Optional)</label><input type="number" className="form-input w-full" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: e.target.value})} /></div>
              </div>
            </section>

            <div className="flex justify-end gap-3 border-t pt-8 mt-4" style={{ borderColor: "var(--border-color)" }}>
              <button type="submit" className="btn-primary px-12 py-3">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
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
                  <th className="text-admin-th">Emp Code</th>
                  <th className="text-admin-th">Employee Name</th>
                  <th className="text-admin-th">Department</th>
                  <th className="text-admin-th">Mobile</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={item.employee_code} onClick={() => setSelectedRow(selectedRow?.employee_code === item.employee_code ? null : item)}
                      className={`group cursor-pointer transition-colors ${selectedRow?.employee_code === item.employee_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}>
                      <td className="px-6 py-4">
                        <div className={`selection-indicator ${selectedRow?.employee_code === item.employee_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                          {selectedRow?.employee_code === item.employee_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="text-admin-td">{item.employee_code}</td>
                      <td className="text-admin-td font-medium">{`${item.employee_firstname} ${item.employee_lastname}`}</td>
                      <td className="text-admin-td">
                        {departments?.find(d => d.department_code === item.department_code)?.department_name || item.department_code}
                      </td>
                      <td className="text-admin-td">{item.mobile || "N/A"}</td>
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
                      <FaUserTie size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No Employees Found</p>
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

export default EmployeeMaster;