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
  FaBuilding,
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
                    <span className="text-emerald-600 font-semibold group-hover:text-white">
                      ✓
                    </span>
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

const CompanyMaster = () => {
  const PATH = "company_master";

  const { data, loading, refresh } = useCrud(`${PATH}/`);

  // dropdowns
  const { data: countryData } = useCrud("countries/");
  const { data: stateData } = useCrud("states/");
  const { data: districtData } = useCrud("districts/");
  const { data: cityData } = useCrud("cities/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [logoFile, setLogoFile] = useState(null);

  // ✅ Other toggles + text (only for District & City)
  const [districtIsOther, setDistrictIsOther] = useState(false);
  const [cityIsOther, setCityIsOther] = useState(false);
  const [otherDistrictText, setOtherDistrictText] = useState("");
  const [otherCityText, setOtherCityText] = useState("");

  const [formData, setFormData] = useState({
    company_code: "",
    company_name: "",
    email: "",
    phone: "",
    mobile: "",
    landmark: "",
    address1: "",
    address2: "",
    fax: "",
    contact_person: "",
    country_code: "",
    state_code: "",
    district_code: "",
    city_code: "",
    currency: "",
    reg_number: "",
    gst_number: "",
    timezone: "",
    company_logo: "", // string from API
    status: 1,
    sort_order: "",
  });

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success",
  });

  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const showModalMsg = (message, type = "success") =>
    setModal({ message, visible: true, type });

  /* =========================
     Sorting (like EmployeeMaster)
     ========================= */
  const sortedCompanies = useMemo(() => {
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

      const ac = (a?.company_code || "").toString();
      const bc = (b?.company_code || "").toString();
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
  } = useTable(sortedCompanies);

  /* =========================
     Auto Company Code like COM00001
     ========================= */
  const nextCompanyCode = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const codes = list
      .map((x) => (x?.company_code || "").toString())
      .filter((c) => c.toUpperCase().startsWith("COM"));

    let maxNum = 0;
    for (const code of codes) {
      const num = parseInt(code.toUpperCase().replace("COM", ""), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }

    const next = maxNum + 1;
    return `COM${String(next).padStart(5, "0")}`;
  }, [data]);

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);

    setLogoFile(null);

    setDistrictIsOther(false);
    setCityIsOther(false);
    setOtherDistrictText("");
    setOtherCityText("");

    setFormData({
      company_code: "",
      company_name: "",
      email: "",
      phone: "",
      mobile: "",
      landmark: "",
      address1: "",
      address2: "",
      fax: "",
      contact_person: "",
      country_code: "",
      state_code: "",
      district_code: "",
      city_code: "",
      currency: "",
      reg_number: "",
      gst_number: "",
      timezone: "",
      company_logo: "",
      status: 1,
      sort_order: "",
    });
  };

  /* =========================
     If editing and district/city not in dropdown -> treat as Other
     ========================= */
  useEffect(() => {
    const dExists = (districtData || []).some(
      (d) => d.district_code === formData.district_code
    );
    if (formData.district_code && !dExists) {
      setDistrictIsOther(true);
      setOtherDistrictText(formData.district_code);
    } else if (!districtIsOther) {
      setOtherDistrictText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.district_code, districtData]);

  useEffect(() => {
    const cExists = (cityData || []).some(
      (c) => c.city_code === formData.city_code
    );
    if (formData.city_code && !cExists) {
      setCityIsOther(true);
      setOtherCityText(formData.city_code);
    } else if (!cityIsOther) {
      setOtherCityText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.city_code, cityData]);

  /* =========================
     Searchable options
     ========================= */
  const countryOptions = useMemo(
    () =>
      (countryData || []).map((c) => ({
        value: c.country_code,
        label: c.country_name,
      })),
    [countryData]
  );

  const stateOptions = useMemo(
    () =>
      (stateData || []).map((s) => ({
        value: s.state_code,
        label: s.state_name,
      })),
    [stateData]
  );

  const districtOptions = useMemo(() => {
    const base = (districtData || []).map((d) => ({
      value: d.district_code,
      label: d.district_name,
    }));
    return [{ value: "OTHER", label: "Other" }, ...base];
  }, [districtData]);

  const cityOptions = useMemo(() => {
    const base = (cityData || []).map((c) => ({
      value: c.city_code,
      label: c.city_name,
    }));
    return [{ value: "OTHER", label: "Other" }, ...base];
  }, [cityData]);

  const statusOptions = useMemo(
    () => [
      { value: 1, label: "Active" },
      { value: 0, label: "Inactive" },
    ],
    []
  );

  const statusBadge = (s) => {
    const isActive = Number(s) === 1;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

 


  /* =========================
     Submit (multipart)
     ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const urlBase = `${get_domain()}/api/`;
      const fd = new FormData();
      
      const normalized = {
        ...formData,
        
      };
      // ✅ do NOT send file object for photo (backend expects string)
      Object.keys(normalized).forEach((k) => {
        if (k === "photo") return; // handle separately
        if (normalized[k] !== null && normalized[k] !== undefined) {
          fd.append(k, normalized[k]);
        }
      });

      // ✅ send only the file name as string
      if (logoFile) {
        fd.append("photo", logoFile.name);
      } else if (normalized.photo) {
        fd.append("photo", normalized.photo);
      }

      // normalize: "" -> null for backend
      const payload = { ...formData };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") payload[k] = null;
      });

      // force numeric
      payload.status = Number(payload.status);
      payload.sort_order =
        payload.sort_order === "" ||
        payload.sort_order === null ||
        payload.sort_order === undefined
          ? null
          : Number(payload.sort_order);

      // ✅ FIX for: {"company_logo":["Not a valid string."]}
      // Backend expects company_logo as STRING, not a File.
      // If user selects a file, send it as base64 string.
      
      // else: keep existing payload.company_logo (string) on edit,
      // and if empty on create, it will become null and won't be appended.

      // append
      Object.keys(payload).forEach((k) => {
        if (payload[k] !== null && payload[k] !== undefined) {
          fd.append(k, payload[k]);
        }
      });

      let res;
      if (isEdit) {
        res = await axios.put(
          `${urlBase}${PATH}/update/${formData.company_code}/`,
          fd,
          {
            headers: { ...authHeader, "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        res = await axios.post(`${urlBase}${PATH}/create/`, fd, {
          headers: { ...authHeader, "Content-Type": "multipart/form-data" },
        });
      }

      if (res?.status === 200 || res?.status === 201) {
        showModalMsg(
          `Company ${isEdit ? "updated" : "created"} successfully!`
        );
        resetForm();
        refresh();
      } else {
        showModalMsg(
          res?.data ? JSON.stringify(res.data) : "Operation failed!",
          "error"
        );
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

  const handleDelete = async () => {
    if (!selectedRow) return;
    const ok = window.confirm(`Delete Company ${selectedRow.company_code}?`);
    if (!ok) return;

    try {
      const urlBase = `${get_domain()}/api/`;
      await axios.delete(
        `${urlBase}${PATH}/delete/${selectedRow.company_code}/`,
        {
          headers: { ...authHeader },
        }
      );
      showModalMsg("Company deleted successfully!");
      setSelectedRow(null);
      refresh();
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        JSON.stringify(err?.response?.data || {}) ||
        "Delete failed!";
      showModalMsg(msg, "error");
    }
  };

  if (loading)
    return (
      <div className="loading-overlay">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading Company Master...</p>
        </div>
      </div>
    );

  return (
    <div className="app-container">
      {/* MODAL */}
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

      {/* HEADER */}
      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">Company Master</h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => {
                setIsEdit(false);
                setSelectedRow(null);
                setLogoFile(null);

                setDistrictIsOther(false);
                setCityIsOther(false);
                setOtherDistrictText("");
                setOtherCityText("");

                setFormData({
                  company_code: nextCompanyCode,
                  company_name: "",
                  email: "",
                  phone: "",
                  mobile: "",
                  landmark: "",
                  address1: "",
                  address2: "",
                  fax: "",
                  contact_person: "",
                  country_code: "",
                  state_code: "",
                  district_code: "",
                  city_code: "",
                  currency: "",
                  reg_number: "",
                  gst_number: "",
                  timezone: "",
                  company_logo: "",
                  status: 1,
                  sort_order: "",
                });

                setShowForm(true);
              }}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData({ ...selectedRow });
                    setIsEdit(true);
                    setShowForm(true);
                    setLogoFile(null);
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

      {/* FORM */}
      {showForm && (
        <div className="form-container">
          <h6 className="text-lg font-bold text-gray-800">
            {isEdit ? "Update Company" : "Add New Company"}
          </h6>
          <div className="border-b border-gray-200 mt-3 mb-6"></div>

          <form
            className="grid grid-cols-1 gap-y-10 mt-6"
            onSubmit={handleSubmit}
          >
            {/* ================= SECTION 1: BASIC ================= */}
            <div>
              <h6 className="text-md font-bold text-green-700 mb-4">Basic</h6>
              <div className="border-b border-gray-200 mt-3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Company Name</label>
                  <input
                    className="form-input"
                    value={formData.company_name || ""}
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Reg Number</label>
                  <input
                    className="form-input"
                    value={formData.reg_number || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, reg_number: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* ================= SECTION 2: CONTACT ================= */}
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
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
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
                  <label className="form-label">Fax</label>
                  <input
                    className="form-input"
                    value={formData.fax || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, fax: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Contact Person</label>
                  <input
                    className="form-input"
                    value={formData.contact_person || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_person: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* ================= SECTION 3: ADDRESS ================= */}
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
              </div>
            </div>

            {/* ================= SECTION 4: LOCATION ================= */}
            <div>
              <h6 className="text-md font-bold text-green-700 mb-4">Location</h6>
              <div className="border-b border-gray-200 mt-3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Country</label>
                  <SearchableSelect
                    value={formData.country_code || ""}
                    options={countryOptions}
                    placeholder="Select Country"
                    disabled={!!formData.country_code}
                    onChange={(val) =>
                      setFormData({ ...formData, country_code: val })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">State</label>
                  <SearchableSelect
                    value={formData.state_code || ""}
                    options={stateOptions}
                    placeholder="Select State"
                    disabled={!!formData.state_code}
                    onChange={(val) =>
                      setFormData({ ...formData, state_code: val })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">District</label>
                  <SearchableSelect
                    value={
                      districtIsOther ? "OTHER" : formData.district_code || ""
                    }
                    options={districtOptions}
                    placeholder="Select District"
                    disabled={!!formData.district_code}
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
                    options={cityOptions}
                    placeholder="Select City"
                    disabled={!!formData.city_code}
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
              </div>
            </div>

            {/* ================= SECTION 5: OTHER ================= */}
            <div>
              <h6 className="text-md font-bold text-green-700 mb-4">Other</h6>
              <div className="border-b border-gray-200 mt-3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Currency</label>
                  <input
                    className="form-input"
                    value={formData.currency || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">GST Number</label>
                  <input
                    className="form-input"
                    value={formData.gst_number || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, gst_number: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Timezone</label>
                  <input
                    className="form-input"
                    value={formData.timezone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, timezone: e.target.value })
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
                      setLogoFile(f);
                      setFormData({ ...formData, photo: f ? f.name : "" });
                    }}
                  />
                  {formData.photo ? (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected Photo: {formData.photo}
                    </p>
                  ) : null}
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

            {/* Buttons */}
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

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header-row">
                  <th className="table-admin-th w-16"></th>
                  <th className="table-admin-th">Company Code</th>
                  <th className="table-admin-th">Company Name</th>
                  <th className="table-admin-th">Email</th>
                  <th className="table-admin-th">Phone</th>
                  <th className="table-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? (
                  paginatedData.map((m) => (
                    <tr
                      key={m.company_code}
                      onClick={() =>
                        setSelectedRow(
                          selectedRow?.company_code === m.company_code ? null : m
                        )
                      }
                      className={`table-row ${
                        selectedRow?.company_code === m.company_code
                          ? "table-row-active"
                          : "table-row-hover"
                      }`}
                    >
                      <td className="text-admin-td">
                        <div
                          className={`selection-indicator rounded-full ${
                            selectedRow?.company_code === m.company_code
                              ? "selection-indicator-active"
                              : "selection-indicator-inactive"
                          }`}
                        >
                          {selectedRow?.company_code === m.company_code && (
                            <div className="selection-dot rounded-full" />
                          )}
                        </div>
                      </td>

                      <td className="text-admin-td">{m.company_code}</td>
                      <td className="text-admin-td">{m.company_name || "-"}</td>
                      <td className="text-admin-td">{m.email || "-"}</td>
                      <td className="text-admin-td">{m.phone || "-"}</td>
                      <td className="text-admin-td">{statusBadge(m.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaBuilding size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">
                          No companies found
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

export default CompanyMaster;
