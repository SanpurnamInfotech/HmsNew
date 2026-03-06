import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaUserInjured,
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
  className = "w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all",
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
      if (!wrapRef.current.contains(e.target)) setOpen(false);
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
          disabled ? "opacity-70 cursor-not-allowed bg-gray-50" : "bg-white"
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
        <div className={`absolute z-50 mt-2 ${panelWidth} rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden`}>
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
              <div className="px-4 py-6 text-sm text-gray-500">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Patient = () => {
  /* ================= API ================= */
  const PATH = "patient";
  const { data, loading, refresh, deleteItem } = useCrud(`${PATH}/`);

  // dropdown masters
  const { data: hospitalData } = useCrud("hospital_details/");
  const { data: maritalData } = useCrud("marital_status_master/");
  const { data: bloodGroupData } = useCrud("blood_group_master/");
  const { data: relationData } = useCrud("relation_master/");
  const { data: doctorData } = useCrud("doctors/");

  const { data: countriesData } = useCrud("countries/");
  const { data: statesData } = useCrud("states/");
  const { data: districtsData } = useCrud("districts/");
  const { data: citiesData } = useCrud("cities/");

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // ✅ District/City Other (like EmployeeMaster)
  const [districtIsOther, setDistrictIsOther] = useState(false);
  const [cityIsOther, setCityIsOther] = useState(false);
  const [otherDistrictText, setOtherDistrictText] = useState("");
  const [otherCityText, setOtherCityText] = useState("");

  const [formData, setFormData] = useState({
    patient_code: "",
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
    weight_kg: "",
    informant: "",

    relation_code: "",
    reliability: "",
    referred_by_dr: "",

    emergency_contact_name: "",
    emergency_contact_relation: "",

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

    patient_photo_path: "",
    renew_date: "",

    status: 1,
    sort_order: "",
  });

  const [modal, setModal] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  /* ================= AUTH ================= */
  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  /* ================= HELPERS ================= */
  const showModal = (message, type = "success") =>
    setModal({ visible: true, message, type });

  // ✅ Patient code generator like EmployeeMaster
  const nextPatientCode = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const codes = list
      .map((x) => (x?.patient_code || "").toString())
      .filter((c) => c.startsWith("PAT"));

    let maxNum = 0;
    for (const code of codes) {
      const num = parseInt(code.replace("PAT", ""), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }

    const next = maxNum + 1;
    return `PAT${String(next).padStart(5, "0")}`;
  }, [data]);

  // ✅ Sort like EmployeeMaster (before pagination)
  const sortedPatients = useMemo(() => {
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

      const ac = (a?.patient_code || "").toString();
      const bc = (b?.patient_code || "").toString();
      return ac.localeCompare(bc);
    });

    return list;
  }, [data]);

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
  } = useTable(sortedPatients);

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setPhotoFile(null);

    setDistrictIsOther(false);
    setCityIsOther(false);
    setOtherDistrictText("");
    setOtherCityText("");

    setFormData({
      patient_code: "",
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
      weight_kg: "",
      informant: "",

      relation_code: "",
      reliability: "",
      referred_by_dr: "",

      emergency_contact_name: "",
      emergency_contact_relation: "",

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

      patient_photo_path: "",
      renew_date: "",

      status: 1,
      sort_order: "",
    });
  };

  const statusBadge = (s) => {
    const isActive = Number(s) === 1;
    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  // Optional: auto-calc age when dob chosen
  const calcAge = (dobStr) => {
    if (!dobStr) return "";
    const dob = new Date(dobStr);
    if (Number.isNaN(dob.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age < 0 ? "" : String(age);
  };

  // ✅ When editing existing record: district/city not in list => Other
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

  /* ================= options for searchable dropdowns ================= */
  const hospitalOptions = useMemo(
    () =>
      (hospitalData || []).map((h) => ({
        value: h.hospital_code,
        label: `${h.hospital_code} - ${h.hospital_name || ""}`,
      })),
    [hospitalData]
  );

  const maritalOptions = useMemo(
    () =>
      (maritalData || []).map((m) => ({
        value: m.marital_status_code,
        label: m.marital_status_name,
      })),
    [maritalData]
  );

  const bloodOptions = useMemo(
    () =>
      (bloodGroupData || []).map((b) => ({
        value: b.blood_group_code,
        label: `${b.blood_group_code} - ${b.blood_group_name}`,
      })),
    [bloodGroupData]
  );

  const relationOptions = useMemo(
    () =>
      (relationData || []).map((r) => ({
        value: r.relation_code,
        label: r.relation_name || r.relation_code,
      })),
    [relationData]
  );

  const doctorOptions = useMemo(
    () =>
      (doctorData || []).map((d) => ({
        value: d.doctor_code,
        label: `${d.doctor_code} - ${d.doctor_name || ""}`,
      })),
    [doctorData]
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

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const urlBase = `${get_domain()}/api/`;
      const fd = new FormData();

      const appendIfNotEmpty = (key, val) => {
        if (val === undefined || val === null) return;
        if (typeof val === "string") {
          if (val.trim() === "") return;
          fd.append(key, val);
          return;
        }
        fd.append(key, val);
      };

      // REQUIRED
      fd.append("patient_code", formData.patient_code || "");
      fd.append("patient_first_name", formData.patient_first_name || "");
      fd.append("patient_last_name", formData.patient_last_name || "");

      // hospital_code should be optional now
      if (formData.hospital_code && formData.hospital_code.trim() !== "") {
        fd.append("hospital_code", formData.hospital_code);
      }

      // Optional fields
      appendIfNotEmpty("patient_middle_name", formData.patient_middle_name);

      appendIfNotEmpty("dob", formData.dob);
      appendIfNotEmpty("age", formData.age === "" ? "" : String(formData.age));
      // ✅ gender must be integer string (1/2/3)
      if (formData.gender !== "" && formData.gender !== null && formData.gender !== undefined) {
        fd.append("gender", String(Number(formData.gender)));
      }

      appendIfNotEmpty("marital_status_code", formData.marital_status_code);
      appendIfNotEmpty("blood_group_code", formData.blood_group_code);
      appendIfNotEmpty("occupation", formData.occupation);

      appendIfNotEmpty("aadhar_no", formData.aadhar_no);
      appendIfNotEmpty("weight_kg", formData.weight_kg);
      appendIfNotEmpty("informant", formData.informant);

      appendIfNotEmpty("relation_code", formData.relation_code);
      appendIfNotEmpty("reliability", formData.reliability);
      appendIfNotEmpty("referred_by_dr", formData.referred_by_dr);

      appendIfNotEmpty("emergency_contact_name", formData.emergency_contact_name);
      appendIfNotEmpty("emergency_contact_relation", formData.emergency_contact_relation);

      appendIfNotEmpty("email", formData.email);
      appendIfNotEmpty("mobile", formData.mobile);
      appendIfNotEmpty("phone", formData.phone);

      appendIfNotEmpty("landmark", formData.landmark);
      appendIfNotEmpty("address1", formData.address1);
      appendIfNotEmpty("address2", formData.address2);

      appendIfNotEmpty("country_code", formData.country_code);
      appendIfNotEmpty("state_code", formData.state_code);
      appendIfNotEmpty("district_code", formData.district_code);
      appendIfNotEmpty("city_code", formData.city_code);
      appendIfNotEmpty("pincode", formData.pincode);

      appendIfNotEmpty("renew_date", formData.renew_date);

      // status + sort_order
      fd.append("status", String(Number(formData.status)));
      if (formData.sort_order !== "" && formData.sort_order !== null && formData.sort_order !== undefined) {
        fd.append("sort_order", String(Number(formData.sort_order)));
      }

      // ✅ patient_photo_path expects STRING, so send file name only
      if (photoFile) {
        fd.set("patient_photo_path", String(photoFile.name));
      } else {
        appendIfNotEmpty("patient_photo_path", formData.patient_photo_path);
      }

      const endpoint = isEdit
        ? `${urlBase}${PATH}/update/${formData.patient_code}/`
        : `${urlBase}${PATH}/create/`;

      const method = isEdit ? "put" : "post";

      const res = await axios({
        method,
        url: endpoint,
        data: fd,
        headers: { ...authHeader, "Content-Type": "multipart/form-data" },
      });

      if (res?.status === 200 || res?.status === 201) {
        showModal(`Patient ${isEdit ? "updated" : "created"} successfully`);
        resetForm();
        refresh();
      } else {
        showModal("Operation failed", "error");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        JSON.stringify(err?.response?.data || {}) ||
        "Operation failed";
      showModal(msg, "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedRow) return;

    const result = await deleteItem(`${PATH}/delete/${selectedRow.patient_code}/`);

    if (result.success) {
      showModal("Record deleted successfully");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed", "error");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner-container text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-emerald-700 font-bold">Loading Patient...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* ================= MODAL ================= */}
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-body text-center">
              <div className="modal-icon-container mb-4">
                {modal.type === "success" ? (
                  <FaCheckCircle className="text-4xl text-emerald-500 mx-auto" />
                ) : (
                  <FaTimesCircle className="text-4xl text-red-500 mx-auto" />
                )}
              </div>

              <h3
                className={`text-xl font-bold mb-2 ${
                  modal.type === "success" ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {modal.type === "success" ? "Success" : "Error"}
              </h3>

              <p className="text-gray-600 mb-6">{modal.message}</p>

              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2.5 rounded-lg font-semibold"
                onClick={() => setModal({ ...modal, visible: false })}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <div>
          <h4 className="text-xl font-bold text-gray-800">Patient</h4>
        </div>

        {!showForm && (
          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-emerald-100"
              onClick={() => {
                setIsEdit(false);
                setSelectedRow(null);
                setPhotoFile(null);

                setDistrictIsOther(false);
                setCityIsOther(false);
                setOtherDistrictText("");
                setOtherCityText("");

                setFormData({
                  ...formData,
                  patient_code: nextPatientCode,
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
                  weight_kg: "",
                  informant: "",
                  relation_code: "",
                  reliability: "",
                  referred_by_dr: "",
                  emergency_contact_name: "",
                  emergency_contact_relation: "",
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
                  patient_photo_path: "",
                  renew_date: "",
                  status: 1,
                  sort_order: "",
                });

                setShowForm(true);
              }}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedRow && (
              <div className="flex gap-2 animate-in slide-in-from-right-5">
                <button
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md"
                  onClick={() => {
                    setFormData({ ...selectedRow });
                    setIsEdit(true);
                    setShowForm(true);
                    setPhotoFile(null);
                  }}
                >
                  <FaEdit size={14} /> Edit
                </button>

                <button
                  className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md"
                  onClick={handleDelete}
                >
                  <FaTrash size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 animate-in zoom-in-95 duration-200">
          <div className="mb-6 border-b border-gray-50 pb-4">
            <h6 className="text-lg font-bold text-gray-800">
              {isEdit ? "Update Patient" : "Create Patient"}
            </h6>
            <div className="border-b border-gray-200 mt-3 mb-6"></div>
          </div>

          <form className="grid grid-cols-1 gap-y-10" onSubmit={handleSubmit}>
            {/* ================= SECTION 1: BASIC ================= */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h6 className="text-md font-bold text-green-700">Information</h6>
                <div className="border-b border-gray-200 mt-3 mb-6"></div>
                <div className="h-px flex-1 bg-gray-100 ml-6" />
              </div>

              {/* ✅ 1 row = 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Hospital (Searchable) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Hospital
                  </label>
                  <SearchableSelect
                    value={formData.hospital_code || ""}
                    options={hospitalOptions}
                    placeholder="-- Select --"
                    onChange={(val) => setFormData({ ...formData, hospital_code: val })}
                  />
                </div>

                {/* First Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    First Name
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.patient_first_name || ""}
                    onChange={(e) => setFormData({ ...formData, patient_first_name: e.target.value })}
                    required
                  />
                </div>

                {/* Middle Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Middle Name
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.patient_middle_name || ""}
                    onChange={(e) => setFormData({ ...formData, patient_middle_name: e.target.value })}
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Last Name
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.patient_last_name || ""}
                    onChange={(e) => setFormData({ ...formData, patient_last_name: e.target.value })}
                    required
                  />
                </div>

                {/* DOB */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    DOB
                  </label>
                  <input
                    type="date"
                    className={`form-input focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                      !formData.dob ? "text-gray-400" : "text-gray-900"
                    }`}
                    value={formData.dob || ""}
                    onChange={(e) => {
                      const dob = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        dob,
                        age: prev.age ? prev.age : calcAge(dob),
                      }));
                    }}
                  />
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Age
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.age || ""}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                {/* ✅ Gender values are integers now */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Gender
                  </label>
                  <select
                    className={`form-input focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                      !formData.gender ? "text-gray-400" : "text-gray-900"
                    }`}
                    value={formData.gender === null || formData.gender === undefined ? "" : String(formData.gender)}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                    <option value="3">Other</option>
                  </select>
                </div>

                {/* Photo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Photo
                  </label>
                  <input
                    type="file"
                    className={`form-input focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                      !formData.patient_photo_path ? "text-gray-400" : "text-gray-900"
                    }`}
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>

            {/* ================= SECTION 2: MEDICAL / RELATION ================= */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h6 className="text-md font-bold text-green-700">Personal Information</h6>
                <div className="h-px flex-1 bg-gray-100 ml-6" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Marital (Searchable) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Marital Status
                  </label>
                  <SearchableSelect
                    value={formData.marital_status_code || ""}
                    disabled={!!formData.marital_status_code}
                    options={maritalOptions}
                    placeholder="-- Select --"
                    onChange={(val) => setFormData({ ...formData, marital_status_code: val })}
                  />
                </div>

                {/* Blood (Searchable) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Blood Group
                  </label>
                  <SearchableSelect
                    value={formData.blood_group_code || ""}
                    disabled={!!formData.blood_group_code}
                    options={bloodOptions}
                    placeholder="-- Select --"
                    onChange={(val) => setFormData({ ...formData, blood_group_code: val })}
                  />
                </div>

                {/* Relation (Searchable) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Relation
                  </label>
                  <SearchableSelect
                    value={formData.relation_code || ""}
                    disabled={!!formData.relation_code}
                    options={relationOptions}
                    placeholder="-- Select --"
                    onChange={(val) => setFormData({ ...formData, relation_code: val })}
                  />
                </div>

                {/* Doctor (Searchable) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Referred By Doctor
                  </label>
                  <SearchableSelect
                    value={formData.referred_by_dr || ""}
                    disabled={!!formData.referred_by_dr}
                    options={doctorOptions}
                    placeholder="-- Select --"
                    onChange={(val) => setFormData({ ...formData, referred_by_dr: val })}
                  />
                </div>

                {/* Renew Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Renew Date
                  </label>
                  <input
                    type="date"
                    className={`form-input focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                      !formData.dob ? "text-gray-400" : "text-gray-900"
                    }`}
                    value={formData.renew_date || ""}
                    onChange={(e) => setFormData({ ...formData, renew_date: e.target.value })}
                  />
                </div>

                {/* Occupation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Occupation
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.occupation || ""}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  />
                </div>

                {/* Reliability */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Reliability
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.reliability || ""}
                    onChange={(e) => setFormData({ ...formData, reliability: e.target.value })}
                    placeholder="Eg. High"
                  />
                </div>

                {/* Emergency Contact Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Emergency Contact Name
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.emergency_contact_name || ""}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  />
                </div>

                {/* Emergency Contact Relation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Emergency Contact Relation
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.emergency_contact_relation || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, emergency_contact_relation: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* ================= SECTION 3: CONTACT ================= */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h6 className="text-md font-bold text-green-700">Contact</h6>
                <div className="h-px flex-1 bg-gray-100 ml-6" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Mobile */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Mobile
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.mobile || ""}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Email
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Phone
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* ================= SECTION 4: ADDRESS ================= */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h6 className="text-md font-bold text-green-700">Address</h6>
                <div className="h-px flex-1 bg-gray-100 ml-6" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Landmark */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Landmark
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.landmark || ""}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  />
                </div>

                {/* Address 1 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Address 1
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.address1 || ""}
                    onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                  />
                </div>

                {/* Address 2 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Address 2
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.address2 || ""}
                    onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  />
                </div>

                {/* Country (Searchable) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Country
                  </label>
                  <SearchableSelect
                    value={formData.country_code || ""}
                    disabled={!!formData.country_code}
                    options={countryOptions}
                    placeholder="-- Select --"
                    onChange={(val) => setFormData({ ...formData, country_code: val })}
                  />
                </div>

                {/* State (Searchable) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    State
                  </label>
                  <SearchableSelect
                    value={formData.state_code || ""}
                    disabled={!!formData.state_code}
                    options={stateOptions}
                    placeholder="-- Select --"
                    onChange={(val) => setFormData({ ...formData, state_code: val })}
                  />
                </div>

                {/* District (Searchable + Other) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    District
                  </label>
                  <SearchableSelect
                    value={districtIsOther ? "OTHER" : (formData.district_code || "")}
                    disabled={!!formData.district_code && !districtIsOther}
                    options={districtOptions}
                    placeholder="-- Select --"
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
                      className="w-full px-4 py-3 mt-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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

                {/* City (Searchable + Other) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    City
                  </label>
                  <SearchableSelect
                    value={cityIsOther ? "OTHER" : (formData.city_code || "")}
                    disabled={!!formData.city_code && !cityIsOther}
                    options={cityOptions}
                    placeholder="-- Select --"
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
                      className="w-full px-4 py-3 mt-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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

                {/* Pincode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Pincode
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.pincode || ""}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                    value={Number(formData.status)}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.sort_order ?? ""}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-emerald-100">
                {isEdit ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-700"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TABLE ================= */}
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
                  <th className="px-6 py-4 w-16"></th>
                  <th className="text-admin-th">Patient Code</th>
                  <th className="text-admin-th">Name</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? (
                  paginatedData.map((p) => (
                    <tr
                      key={p.patient_code}
                      onClick={() =>
                        setSelectedRow(
                          selectedRow?.patient_code === p.patient_code ? null : p
                        )
                      }
                      className={`group cursor-pointer transition-colors duration-150 ${
                        selectedRow?.patient_code === p.patient_code
                          ? "bg-emerald-50/40"
                          : "hover:bg-gray-50/50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div
                          className={`selection-indicator rounded-full ${
                            selectedRow?.patient_code === p.patient_code
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-gray-200 group-hover:border-emerald-300"
                          }`}
                        >
                          {selectedRow?.patient_code === p.patient_code && (
                            <div className="selection-dot rounded-full" />
                          )}
                        </div>
                      </td>

                      <td className="text-admin-td">{p.patient_code}</td>
                      <td className="text-admin-td">
                        {[p.patient_first_name, p.patient_last_name]
                          .filter(Boolean)
                          .join(" ") || "-"}
                      </td>
                      <td className="text-admin-td">{statusBadge(p.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaUserInjured size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">
                          No patients found
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

export default Patient;