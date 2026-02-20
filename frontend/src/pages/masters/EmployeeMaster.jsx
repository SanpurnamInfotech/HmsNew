import React, { useMemo, useState } from "react";
import axios from "axios";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaUserTie } from "react-icons/fa";
import { get_domain } from "../../utils/domain";

const EmployeeMaster = () => {
  const { data, loading, refresh, deleteItem } = useCrud("employee_master/");


  const { data: companiesData } = useCrud("company_master/");
  const { data: financialYearsData } = useCrud("financialyear_master/");
  const { data: userTypesData } = useCrud("usertype_master/");
  const { data: departmentData } = useCrud("departments/");

  const { data: countriesData } = useCrud("countries/");
  const { data: statesData } = useCrud("states/");
  const { data: districtsData } = useCrud("districts/");
  const { data: citiesData } = useCrud("cities/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [photoFile, setPhotoFile] = useState(null);

  const [formData, setFormData] = useState({
    employee_code: "",
    company_code: "",
    financialyear_code: "",
    department_code: "",
    designation_code: "",
    usertype_code: "",
    division_code: "",
    employee_firstname: "",
    employee_middlename: "",
    employee_lastname: "",
    dob: "",
    gender: "",
    photo: "",
    joining_date: "",
    qualification: "",
    total_experience: "",
    status: 1, // 1 Existing, 2 Resigned, 3 Terminated
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
    city_code: "",
    pincode: "",
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

  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  // ✅ employee_code generator like EMP00001 (same logic as Company)
  const nextEmployeeCode = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const codes = list
      .map((x) => (x?.employee_code || "").toString())
      .filter((c) => c.startsWith("EMP"));

    let maxNum = 0;
    for (const code of codes) {
      const num = parseInt(code.replace("EMP", ""), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }

    const next = maxNum + 1;
    return `EMP${String(next).padStart(5, "0")}`;
  }, [data]);

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelected(null);
    setPhotoFile(null);
    setFormData({
      employee_code: "",
      company_code: "",
      financialyear_code: "",
      department_code: "",
      designation_code: "",
      usertype_code: "",
      division_code: "",
      employee_firstname: "",
      employee_middlename: "",
      employee_lastname: "",
      dob: "",
      gender: "",
      photo: "",
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
      city_code: "",
      pincode: "",
    });
  };

  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteItem(`employee_master/delete/${selected.employee_code}/`);
    if (result.success) {
      showModal("Employee deleted successfully!");
      setSelected(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const urlBase = `${get_domain()}/api/`;
      const fd = new FormData();

      // append all fields (send empty "" also ok)
      Object.keys(formData).forEach((k) => {
        if (formData[k] !== null && formData[k] !== undefined) {
          fd.append(k, formData[k]);
        }
      });

      // file upload photo
      if (photoFile) {
        fd.set("photo", photoFile);
      }

      let res;
      if (isEdit) {
        res = await axios.put(
          `${urlBase}employee_master/update/${formData.employee_code}/`,
          fd,
          { headers: { ...authHeader, "Content-Type": "multipart/form-data" } }
        );
      } else {
        res = await axios.post(
          `${urlBase}employee_master/create/`,
          fd,
          { headers: { ...authHeader, "Content-Type": "multipart/form-data" } }
        );
      }

      if (res?.status === 200 || res?.status === 201) {
        showModal(`Employee ${isEdit ? "updated" : "created"} successfully!`);
        resetForm();
        refresh();
      } else {
        showModal("Operation failed!", "error");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Operation failed!";
      showModal(msg, "error");
    }
  };

  const employeeStatusBadge = (s) => {
    const n = Number(s);
    const text = n === 1 ? "Existing" : n === 2 ? "Resigned" : "Terminated";
    const cls =
      n === 1 ? "bg-green-100 text-green-700"
      : n === 2 ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
        {text}
      </span>
    );
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Employee Data...</p>
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
        <h4 className="text-xl font-bold text-gray-800">Employee Master</h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            {/* ✅ Add New */}
            <button
              className="btn-primary"
              onClick={() => {
                setIsEdit(false);
                setSelected(null);
                setPhotoFile(null);

                setFormData({
                  employee_code: nextEmployeeCode,
                  company_code: "",
                  financialyear_code: "",
                  department_code: "",
                  designation_code: "",
                  usertype_code: "",
                  division_code: "",
                  employee_firstname: "",
                  employee_middlename: "",
                  employee_lastname: "",
                  dob: "",
                  gender: "",
                  photo: "",
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
                  city_code: "",
                  pincode: "",
                });

                setShowForm(true);
              }}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selected && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData({ ...selected });
                    setIsEdit(true);
                    setShowForm(true);
                    setPhotoFile(null);
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

      {/* ✅ FORM */}
      {showForm && (
        <div className="form-container">
          <div className="mb-8 border-b border-gray-50 pb-5">
            <h6 className="text-lg font-bold text-gray-800">
              {isEdit ? "Update Employee Info" : "Add New Employee"}
            </h6>
          </div>

          <form className="grid grid-cols-1 gap-y-10" onSubmit={handleSubmit}>

            {/* ✅ Section 1: Basic + Job */}
            <div>
              <h6 className="text-md font-bold text-gray-700 mb-4">Basic & Job Details</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Employee Code</label>
                  <input className="form-input form-input-disabled" value={formData.employee_code} disabled placeholder="Eg. EMP00001" />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Company</label>
                  <select className="form-input" value={formData.company_code || ""} onChange={(e) => setFormData({ ...formData, company_code: e.target.value })}>
                    <option value="">-- Select --</option>
                    {(companiesData || []).map((c) => (
                      <option key={c.company_code} value={c.company_code}>
                        {c.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Financial Year</label>
                  <select
                    className="form-input"
                    value={formData.financialyear_code || ""}
                    onChange={(e) => setFormData({ ...formData, financialyear_code: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {(financialYearsData || []).map((fy) => (
                      <option key={fy.financialyear_code} value={fy.financialyear_code}>
                        {fy.financialyear_name || fy.financialyear_code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">First Name</label>
                  <input className="form-input" value={formData.employee_firstname || ""} required onChange={(e) => setFormData({ ...formData, employee_firstname: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Middle Name</label>
                  <input className="form-input" value={formData.employee_middlename || ""} onChange={(e) => setFormData({ ...formData, employee_middlename: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" value={formData.employee_lastname || ""} required onChange={(e) => setFormData({ ...formData, employee_lastname: e.target.value })} />
                </div>

                {/* ✅ Date picker for DOB */}
                <div className="space-y-1.5">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dob || ""}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>

                {/* ✅ Gender dropdown */}
                <div className="space-y-1.5">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-input"
                    value={formData.gender === null || formData.gender === undefined ? "" : String(formData.gender)}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value === "" ? "" : Number(e.target.value) })}
                  >
                    <option value="">-- Select --</option>
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                    <option value="3">Other</option>
                  </select>
                </div>

                {/* ✅ Joining Date */}
                <div className="space-y-1.5">
                  <label className="form-label">Joining Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.joining_date || ""}
                    onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">User Type</label>
                  <select
                    className="form-input"
                    value={formData.usertype_code || ""}
                    onChange={(e) => setFormData({ ...formData, usertype_code: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {(userTypesData || []).map((u) => (
                      <option key={u.usertype_code} value={u.usertype_code}>
                        {u.usertype_name || u.usertype_code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Department Code</label>
                  <select
                    className="form-input"
                    value={formData.department_code || ""}
                    onChange={(e) => setFormData({ ...formData, department_code: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {(departmentData || []).map((fy) => (
                      <option key={fy.department_code} value={fy.department_code}>
                        {fy.department_name || fy.department_code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Designation Code</label>
                  <input className="form-input" value={formData.designation_code || ""} onChange={(e) => setFormData({ ...formData, designation_code: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Division Code</label>
                  <input className="form-input" value={formData.division_code || ""} onChange={(e) => setFormData({ ...formData, division_code: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Qualification</label>
                  <input className="form-input" value={formData.qualification || ""} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Total Experience</label>
                  <input className="form-input" value={formData.total_experience || ""} onChange={(e) => setFormData({ ...formData, total_experience: e.target.value })} />
                </div>

                {/* ✅ Photo upload */}
                <div className="space-y-1.5">
                  <label className="form-label">Photo</label>
                  <input
                    type="file"
                    className="form-input"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>

            {/* ✅ Section 2: Contact + Address */}
            <div>
              <h6 className="text-md font-bold text-gray-700 mb-4">Contact & Address</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Email</label>
                  <input className="form-input" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="form-label">Mobile</label>
                  <input className="form-input" value={formData.mobile || ""} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Landmark</label>
                  <input className="form-input" value={formData.landmark || ""} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Pincode</label>
                  <input className="form-input" value={formData.pincode || ""} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="form-label">Address 1</label>
                  <input className="form-input" value={formData.address1 || ""} onChange={(e) => setFormData({ ...formData, address1: e.target.value })} />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="form-label">Address 2</label>
                  <input className="form-input" value={formData.address2 || ""} onChange={(e) => setFormData({ ...formData, address2: e.target.value })} />
                </div>
              </div>
            </div>

            {/* ✅ Section 3: Location + Status */}
            <div>
              <h6 className="text-md font-bold text-gray-700 mb-4">Location & Employment Status</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">

                <div className="space-y-1.5">
                  <label className="form-label">Country</label>
                  <select className="form-input" value={formData.country_code || ""} onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}>
                    <option value="">-- Select --</option>
                    {(countriesData || []).map((c) => (
                      <option key={c.country_code} value={c.country_code}>{c.country_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">State</label>
                  <select className="form-input" value={formData.state_code || ""} onChange={(e) => setFormData({ ...formData, state_code: e.target.value })}>
                    <option value="">-- Select --</option>
                    {(statesData || []).map((s) => (
                      <option key={s.state_code} value={s.state_code}>{s.state_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">District</label>
                  <select className="form-input" value={formData.district_code || ""} onChange={(e) => setFormData({ ...formData, district_code: e.target.value })}>
                    <option value="">-- Select --</option>
                    {(districtsData || []).map((d) => (
                      <option key={d.district_code} value={d.district_code}>{d.district_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">City</label>
                  <select className="form-input" value={formData.city_code || ""} onChange={(e) => setFormData({ ...formData, city_code: e.target.value })}>
                    <option value="">-- Select --</option>
                    {(citiesData || []).map((c) => (
                      <option key={c.city_code} value={c.city_code}>{c.city_name}</option>
                    ))}
                  </select>
                </div>

                {/* ✅ Employment Status */}
                <div className="space-y-1.5">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={Number(formData.status)}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                  >
                    <option value={1}>Existing</option>
                    <option value={2}>Resigned</option>
                    <option value={3}>Terminated</option>
                  </select>
                </div>

                {/* ✅ Termination Date */}
                <div className="space-y-1.5">
                  <label className="form-label">Termination Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.termination_date || ""}
                    onChange={(e) => setFormData({ ...formData, termination_date: e.target.value })}
                  />
                </div>

                {/* ✅ Termination Reason */}
                <div className="space-y-1.5 md:col-span-3">
                  <label className="form-label">Termination Reason</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.termination_reason || ""}
                    onChange={(e) => setFormData({ ...formData, termination_reason: e.target.value })}
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

      {/* ✅ TABLE */}
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
                  <th className="table-th">Employee Code</th>
                  <th className="table-th">Name</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Mobile</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((e) => (
                  <tr
                    key={e.employee_code}
                    onClick={() => setSelected(selected?.employee_code === e.employee_code ? null : e)}
                    className={`table-row ${selected?.employee_code === e.employee_code ? "table-row-active" : "table-row-hover"}`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${selected?.employee_code === e.employee_code ? "selection-indicator-active" : "selection-indicator-inactive"}`}>
                        {selected?.employee_code === e.employee_code && <div className="selection-dot" />}
                      </div>
                    </td>
                    <td className="table-td text-admin-id">{e.employee_code}</td>
                    <td className="table-td">
                      {`${e.employee_firstname || ""} ${e.employee_lastname || ""}`.trim() || "-"}
                    </td>
                    <td className="table-td">{e.email || "-"}</td>
                    <td className="table-td">{e.mobile || "-"}</td>
                    <td className="table-td">{employeeStatusBadge(e.status)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaUserTie size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">No employees found</p>
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

export default EmployeeMaster;
