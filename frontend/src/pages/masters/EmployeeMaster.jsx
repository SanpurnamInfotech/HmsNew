import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  useCrud,
  useTable,
  Pagination,
  TableToolbar,
} from "../../components/common/BaseCRUD";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaUserTie,
} from "react-icons/fa";
import { get_domain } from "../../utils/domain";

/* =========================
   Reusable Searchable Select
   ========================= */
const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  disabled = false,
  className = "form-input",
  panelWidth = "w-full",
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef(null);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => String(o.value) === String(value));
    return found ? found.label : "";
  }, [options, value]);

  const filtered = useMemo(() => {
    const query = (q || "").toLowerCase().trim();
    if (!query) return options;
    return options.filter(
      (o) =>
        (o.label || "").toLowerCase().includes(query) ||
        String(o.value || "").toLowerCase().includes(query)
    );
  }, [options, q]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className={`${className} text-left flex items-center justify-between ${
          disabled ? "opacity-70 cursor-not-allowed" : ""
        }`}
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
      >
        <span className={`${selectedLabel ? "text-gray-900" : "text-gray-400"}`}>
          {selectedLabel || placeholder}
        </span>
        <span className="ml-3 text-gray-500">▾</span>
      </button>

      {open && !disabled && (
        <div
          className={`absolute z-50 mt-2 ${panelWidth} rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden`}
        >
          <div className="p-3 border-b border-gray-100">
            <input
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((o) => (
                <button
                  key={String(o.value)}
                  type="button"
                  className={`group w-full text-left px-4 py-3 flex items-center justify-between
                    hover:bg-blue-900 hover:text-white
                    ${String(o.value) === String(value) ? "bg-emerald-50" : ""}
                  `}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <span className="text-gray-800 group-hover:text-white">
                    {o.label}
                  </span>

                  {String(o.value) === String(value) && (
                    <span className="text-emerald-600 font-semibold">✓</span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-sm text-gray-500">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const EmployeeMaster = () => {
  const { data, loading, refresh } = useCrud("employee_master/");

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

  // ✅ keep file UI, but backend expects STRING -> we will send only file name
  const [photoFile, setPhotoFile] = useState(null);

  const [districtIsOther, setDistrictIsOther] = useState(false);
  const [cityIsOther, setCityIsOther] = useState(false);

  const [otherDistrictText, setOtherDistrictText] = useState("");
  const [otherCityText, setOtherCityText] = useState("");

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
    gender: "", // ✅ will store 1/2/3 now (integer)
    photo: "",  // ✅ string only (filename)
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
    sort_order: "",
  });

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success",
  });

  const sortedEmployees = useMemo(() => {
    const list = Array.isArray(data) ? [...data] : [];
    const getOrder = (row) => {
      const raw = row?.sort_order;
      const n = Number(raw);
      return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
    };

    list.sort((a, b) => {
      const ao = getOrder(a);
      const bo = getOrder(b);
      if (ao !== bo) return ao - bo;

      const ac = (a?.employee_code || "").toString();
      const bc = (b?.employee_code || "").toString();
      return ac.localeCompare(bc);
    });

    return list;
  }, [data]);

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
  } = useTable(sortedEmployees);

  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const showModalMsg = (message, type = "success") =>
    setModal({ message, visible: true, type });

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

    setDistrictIsOther(false);
    setCityIsOther(false);

    setOtherDistrictText("");
    setOtherCityText("");

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
      sort_order: "",
    });
  };

  const handleDelete = async () => {
    if (!selected) return;
    const ok = window.confirm(`Delete Employee ${selected.employee_code}?`);
    if (!ok) return;

    try {
      const urlBase = `${get_domain()}/api/`;
      await axios.delete(
        `${urlBase}employee_master/delete/${selected.employee_code}/`,
        { headers: { ...authHeader } }
      );
      showModalMsg("Employee deleted successfully!");
      setSelected(null);
      refresh();
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Delete failed!";
      showModalMsg(msg, "error");
    }
  };

  useEffect(() => {
    const dExists = (districtsData || []).some(
      (d) => d.district_code === formData.district_code
    );
    if (formData.district_code && !dExists) {
      setDistrictIsOther(true);
      setOtherDistrictText(formData.district_code);
    } else if (!districtIsOther) {
      setOtherDistrictText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.district_code, districtsData]);

  useEffect(() => {
    const ciExists = (citiesData || []).some(
      (c) => c.city_code === formData.city_code
    );
    if (formData.city_code && !ciExists) {
      setCityIsOther(true);
      setOtherCityText(formData.city_code);
    } else if (!cityIsOther) {
      setOtherCityText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.city_code, citiesData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const urlBase = `${get_domain()}/api/`;
      const fd = new FormData();

      // ✅ backend expects gender int and photo string, so ensure correct types
      const normalized = {
        ...formData,
        gender: formData.gender === "" ? "" : Number(formData.gender),
        status: Number(formData.status),
      };

      // ✅ do NOT send file object for photo (backend expects string)
      Object.keys(normalized).forEach((k) => {
        if (k === "photo") return; // handle separately
        if (normalized[k] !== null && normalized[k] !== undefined) {
          fd.append(k, normalized[k]);
        }
      });

      // ✅ send only the file name as string
      if (photoFile) {
        fd.append("photo", photoFile.name);
      } else if (normalized.photo) {
        fd.append("photo", normalized.photo);
      }

      let res;
      if (isEdit) {
        res = await axios.put(
          `${urlBase}employee_master/update/${normalized.employee_code}/`,
          fd,
          { headers: { ...authHeader } }
        );
      } else {
        res = await axios.post(`${urlBase}employee_master/create/`, fd, {
          headers: { ...authHeader },
        });
      }

      if (res?.status === 200 || res?.status === 201) {
        showModalMsg(
          `Employee ${isEdit ? "updated" : "created"} successfully!`
        );
        resetForm();
        refresh();
      } else {
        showModalMsg("Operation failed!", "error");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        JSON.stringify(err?.response?.data || {}) ||
        "Operation failed!";
      showModalMsg(msg, "error");
    }
  };

  const employeeStatusBadge = (s) => {
    const n = Number(s);
    const text = n === 1 ? "Existing" : n === 2 ? "Resigned" : "Terminated";
    const cls =
      n === 1
        ? "bg-green-100 text-green-700"
        : n === 2
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
        {text}
      </span>
    );
  };

  /* ===== options for searchable dropdowns ===== */
  const companyOptions = useMemo(
    () =>
      (companiesData || []).map((c) => ({
        value: c.company_code,
        label: c.company_name,
      })),
    [companiesData]
  );

  const fyOptions = useMemo(
    () =>
      (financialYearsData || []).map((fy) => ({
        value: fy.financialyear_code,
        label: fy.financialyear_name || fy.financialyear_code,
      })),
    [financialYearsData]
  );

  const deptOptions = useMemo(
    () =>
      (departmentData || []).map((d) => ({
        value: d.department_code,
        label: d.department_name,
      })),
    [departmentData]
  );

  const userTypeOptions = useMemo(
    () =>
      (userTypesData || []).map((u) => ({
        value: u.usertype_code,
        label: u.usertype_name,
      })),
    [userTypesData]
  );

  const countryOptions = useMemo(
    () =>
      (countriesData || []).map((c) => ({
        value: c.country_code,
        label: c.country_name,
      })),
    [countriesData]
  );

  const stateOptions = useMemo(
    () =>
      (statesData || []).map((s) => ({
        value: s.state_code,
        label: s.state_name,
      })),
    [statesData]
  );

  const districtOptions = useMemo(() => {
    const base = (districtsData || []).map((d) => ({
      value: d.district_code,
      label: d.district_name,
    }));
    return [{ value: "OTHER", label: "Other" }, ...base];
  }, [districtsData]);

  const cityOptions = useMemo(() => {
    const base = (citiesData || []).map((c) => ({
      value: c.city_code,
      label: c.city_name,
    }));
    return [{ value: "OTHER", label: "Other" }, ...base];
  }, [citiesData]);

  // ✅ FIX 1: gender values are INTEGERS now
  const genderOptions = useMemo(
    () => [
      { value: 1, label: "Male" },
      { value: 2, label: "Female" },
      { value: 3, label: "Other" },
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { value: 1, label: "Existing" },
      { value: 2, label: "Resigned" },
      { value: 3, label: "Terminated" },
    ],
    []
  );

  if (loading)
    return (
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
                {modal.type === "success" ? (
                  <div className="modal-icon-success">
                    <FaCheckCircle />
                  </div>
                ) : (
                  <div className="modal-icon-error">
                    <FaTimesCircle />
                  </div>
                )}
              </div>
              <h3
                className={`modal-title ${
                  modal.type === "success"
                    ? "modal-title-success"
                    : "modal-title-error"
                }`}
              >
                {modal.type === "success" ? "Success" : "Error"}
              </h3>
              <p className="modal-message mb-6">{modal.message}</p>
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
        <h4 className="text-xl font-bold text-gray-800">Employee Master</h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => {
                setIsEdit(false);
                setSelected(null);
                setPhotoFile(null);

                setDistrictIsOther(false);
                setCityIsOther(false);
                setOtherDistrictText("");
                setOtherCityText("");

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
                  sort_order: "",
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

      {showForm && (
        <div className="form-container">
          <h6 className="text-lg font-bold text-gray-800">
            {isEdit ? "Update Employee Info" : "Add New Employee"}
          </h6>

          <div className="border-b border-gray-200 mt-3 mb-6"></div>

          <form className="grid grid-cols-1 gap-y-10" onSubmit={handleSubmit}>
            {/* ================= SECTION 1: BASIC ================= */}
            <div>
              <h6 className="text-md font-bold text-green-700 mb-4">
                Information
              </h6>
              <div className="border-b border-gray-200 mt-3 mb-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Employee Code</label>
                  <input
                    className="form-input form-input-disabled"
                    value={formData.employee_code}
                    disabled
                    placeholder="Eg. EMP00001"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Company</label>
                  <SearchableSelect
                    value={formData.company_code || ""}
                    disabled={!!formData.company_code}
                    options={companyOptions}
                    placeholder="Select Company"
                    onChange={(val) =>
                      setFormData({ ...formData, company_code: val })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">First Name</label>
                  <input
                    className="form-input"
                    value={formData.employee_firstname || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employee_firstname: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Middle Name</label>
                  <input
                    className="form-input"
                    value={formData.employee_middlename || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employee_middlename: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Last Name</label>
                  <input
                    className="form-input"
                    value={formData.employee_lastname || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employee_lastname: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">DOB</label>
                  <input
                    type="date"
                    className={`form-input focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                      !formData.dob ? "text-gray-400" : "text-gray-900"
                    }`}
                    value={formData.dob || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                  />
                </div>

                {/* ✅ FIX 2: Gender is now integer values */}
                <div className="space-y-1.5">
                  <label className="form-label">Gender</label>
                  <SearchableSelect
                    value={formData.gender || ""}
                    options={genderOptions}
                    placeholder="Select Gender"
                    onChange={(val) =>
                      setFormData({ ...formData, gender: Number(val) })
                    }
                  />
                </div>

                {/* ✅ FIX 3: Photo sends filename string */}
                <div className="space-y-1.5">
                  <label className="form-label">Photo</label>
                  <input
                    type="file"
                    className={`form-input focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                      !formData.photo ? "text-gray-400" : "text-gray-900"
                    }`}
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setPhotoFile(f);
                      setFormData({ ...formData, photo: f ? f.name : "" });
                    }}
                  />
                  {formData.photo ? (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected Photo: {formData.photo}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* ================= SECTION 2: WORK ================= */}
            <div>
              <h6 className="text-md font-bold text-green-700 mb-4">
                Work Information
              </h6>
              <div className="border-b border-gray-200 mt-3 mb-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Financial Year</label>
                  <SearchableSelect
                    value={formData.financialyear_code || ""}
                    options={fyOptions}
                    placeholder="Select Financial Year"
                    onChange={(val) =>
                      setFormData({ ...formData, financialyear_code: val })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Department</label>
                  <SearchableSelect
                    value={formData.department_code || ""}
                    options={deptOptions}
                    placeholder="Select Department"
                    onChange={(val) =>
                      setFormData({ ...formData, department_code: val })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Designation Code</label>
                  <input
                    className="form-input"
                    value={formData.designation_code || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        designation_code: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">User Type</label>
                  <SearchableSelect
                    value={formData.usertype_code || ""}
                    options={userTypeOptions}
                    placeholder="Select User Type"
                    onChange={(val) =>
                      setFormData({ ...formData, usertype_code: val })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Division Code</label>
                  <input
                    className="form-input"
                    value={formData.division_code || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, division_code: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Joining Date</label>
                  <input
                    type="date"
                    className={`form-input focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                      !formData.joining_date ? "text-gray-400" : "text-gray-900"
                    }`}
                    value={formData.joining_date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, joining_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Qualification</label>
                  <input
                    className="form-input"
                    value={formData.qualification || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, qualification: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Total Experience</label>
                  <input
                    className="form-input"
                    value={formData.total_experience || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_experience: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Termination Date</label>
                  <input
                    type="date"
                    className={`form-input focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                      !formData.termination_date
                        ? "text-gray-400"
                        : "text-gray-900"
                    }`}
                    value={formData.termination_date || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        termination_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Termination Reason</label>
                  <input
                    className="form-input"
                    value={formData.termination_reason || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        termination_reason: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* ================= SECTION 3: CONTACT ================= */}
            <div>
              <h6 className="text-md font-bold text-green-700 mb-4">Contact</h6>
              <div className="border-b border-gray-200 mt-3 mb-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Mobile</label>
                  <input
                    className="form-input"
                    value={formData.mobile || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* ================= SECTION 4: ADDRESS ================= */}
            <div>
              <h6 className="text-md font-bold text-green-700 mb-4">Address</h6>
              <div className="border-b border-gray-200 mt-3 mb-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Landmark</label>
                  <input
                    className="form-input"
                    value={formData.landmark || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, landmark: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Address 1</label>
                  <input
                    className="form-input"
                    value={formData.address1 || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address1: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Address 2</label>
                  <input
                    className="form-input"
                    value={formData.address2 || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address2: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Country</label>
                  <SearchableSelect
                    value={formData.country_code || ""}
                    disabled={!!formData.country_code}
                    options={countryOptions}
                    placeholder="Select Country"
                    onChange={(val) =>
                      setFormData({ ...formData, country_code: val })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">State</label>
                  <SearchableSelect
                    value={formData.state_code || ""}
                    disabled={!!formData.state_code}
                    options={stateOptions}
                    placeholder="Select State"
                    onChange={(val) =>
                      setFormData({ ...formData, state_code: val })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">District</label>
                  <SearchableSelect
                    value={districtIsOther ? "OTHER" : formData.district_code || ""}
                    disabled={!!formData.district_code}
                    options={districtOptions}
                    placeholder="Select District"
                    onChange={(val) => {
                      if (val === "OTHER") {
                        setDistrictIsOther(true);
                        setOtherDistrictText("");
                        setFormData({ ...formData, district_code: "" });
                      } else {
                        setDistrictIsOther(false);
                        setOtherDistrictText("");
                        setFormData({ ...formData, district_code: val });
                      }
                    }}
                  />

                  {districtIsOther && (
                    <input
                      className="form-input mt-2"
                      placeholder="Enter Other District"
                      value={otherDistrictText}
                      onChange={(e) => {
                        const v = e.target.value;
                        setOtherDistrictText(v);
                        setFormData({ ...formData, district_code: v });
                      }}
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">City</label>
                  <SearchableSelect
                    value={cityIsOther ? "OTHER" : formData.city_code || ""}
                    disabled={!!formData.city_code}
                    options={cityOptions}
                    placeholder="Select City"
                    onChange={(val) => {
                      if (val === "OTHER") {
                        setCityIsOther(true);
                        setOtherCityText("");
                        setFormData({ ...formData, city_code: "" });
                      } else {
                        setCityIsOther(false);
                        setOtherCityText("");
                        setFormData({ ...formData, city_code: val });
                      }
                    }}
                  />

                  {cityIsOther && (
                    <input
                      className="form-input mt-2"
                      placeholder="Enter Other City"
                      value={otherCityText}
                      onChange={(e) => {
                        const v = e.target.value;
                        setOtherCityText(v);
                        setFormData({ ...formData, city_code: v });
                      }}
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Pincode</label>
                  <input
                    className="form-input"
                    value={formData.pincode || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Status</label>
                  <SearchableSelect
                    value={Number(formData.status)}
                    options={statusOptions}
                    placeholder="Select Status"
                    onChange={(val) =>
                      setFormData({ ...formData, status: Number(val) })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Sort Order</label>
                  <input
                    className="form-input"
                    type="number"
                    value={formData.sort_order ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, sort_order: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-50 pt-8">
              <button className="btn-primary px-10">
                {isEdit ? "Update" : "Save"}
              </button>
              <button type="button" className="btn-ghost" onClick={resetForm}>
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
                <tr className="table-header-row">
                  <th className="table-admin-th w-16"></th>
                  <th className="table-admin-th">Employee Code</th>
                  <th className="table-admin-th">Name</th>
                  <th className="table-admin-th">Email</th>
                  <th className="table-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? (
                  paginatedData.map((e) => (
                    <tr
                      key={e.employee_code}
                      onClick={() =>
                        setSelected(
                          selected?.employee_code === e.employee_code ? null : e
                        )
                      }
                      className={`table-row ${
                        selected?.employee_code === e.employee_code
                          ? "table-row-active"
                          : "table-row-hover"
                      }`}
                    >
                      <td className="text-admin-td">
                        <div
                          className={`selection-indicator rounded-full ${
                            selected?.employee_code === e.employee_code
                              ? "selection-indicator-active"
                              : "selection-indicator-inactive"
                          }`}
                        >
                          {selected?.employee_code === e.employee_code && (
                            <div className="selection-dot rounded-full" />
                          )}
                        </div>
                      </td>
                      <td className="text-admin-td">{e.employee_code}</td>
                      <td className="text-admin-td">
                        {`${e.employee_firstname || ""} ${
                          e.employee_lastname || ""
                        }`.trim() || "-"}
                      </td>
                      <td className="text-admin-td">{e.email || "-"}</td>
                      <td className="text-admin-td">{employeeStatusBadge(e.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaUserTie size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">
                          No employees found
                        </p>
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