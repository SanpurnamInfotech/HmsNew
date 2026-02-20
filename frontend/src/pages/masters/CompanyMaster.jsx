import React, { useMemo, useState } from "react";
import axios from "axios";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaBuilding } from "react-icons/fa";
import { get_domain } from "../../utils/domain";

const CompanyMaster = () => {
  const { data, loading, refresh, deleteItem } = useCrud("company_master/");

  // dropdown masters
  const { data: countriesData } = useCrud("countries/");
  const { data: statesData } = useCrud("states/");
  const { data: districtsData } = useCrud("districts/");
  const { data: citiesData } = useCrud("cities/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [logoFile, setLogoFile] = useState(null);

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
    currency: "INR",
    reg_number: "",
    gst_number: "",
    timezone: "Asia/Kolkata",
    company_logo: "",
    status: 1,
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

  // ✅ company_code generator like COMP00001
  const nextCompanyCode = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const codes = list
      .map((x) => (x?.company_code || "").toString())
      .filter((c) => c.startsWith("COMP"));

    let maxNum = 0;
    for (const code of codes) {
      const num = parseInt(code.replace("COMP", ""), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }

    const next = maxNum + 1;
    return `COMP${String(next).padStart(5, "0")}`;
  }, [data]);

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelected(null);
    setLogoFile(null);
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
      currency: "INR",
      reg_number: "",
      gst_number: "",
      timezone: "Asia/Kolkata",
      company_logo: "",
      status: 1,
    });
  };

  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteItem(`company_master/delete/${selected.company_code}/`);
    if (result.success) {
      showModal("Company deleted successfully!");
      setSelected(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  // ✅ Create/Update with FormData because of file upload
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const urlBase = `${get_domain()}/api/`;
      const fd = new FormData();

      // append all fields
      Object.keys(formData).forEach((k) => {
        if (formData[k] !== null && formData[k] !== undefined) {
          fd.append(k, formData[k]);
        }
      });

      // company_logo file (optional)
      if (logoFile) {
        fd.set("company_logo", logoFile);
      }

      let res;
      if (isEdit) {
        res = await axios.put(
          `${urlBase}company_master/update/${formData.company_code}/`,
          fd,
          { headers: { ...authHeader, "Content-Type": "multipart/form-data" } }
        );
      } else {
        res = await axios.post(
          `${urlBase}company_master/create/`,
          fd,
          { headers: { ...authHeader, "Content-Type": "multipart/form-data" } }
        );
      }

      if (res?.status === 200 || res?.status === 201) {
        showModal(`Company ${isEdit ? "updated" : "created"} successfully!`);
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
        <p className="loading-text">Loading Company Data...</p>
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
        <h4 className="text-xl font-bold text-gray-800">Company Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            {/* ✅ FIX: set company_code ONLY on Add New click (NO useEffect) */}
            <button
              className="btn-primary"
              onClick={() => {
                setIsEdit(false);
                setSelected(null);
                setLogoFile(null);
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
                  currency: "INR",
                  reg_number: "",
                  gst_number: "",
                  timezone: "Asia/Kolkata",
                  company_logo: "",
                  status: 1,
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

      {/* ✅ FORM */}
      {showForm && (
        <div className="form-container">
          <div className="mb-8 border-b border-gray-50 pb-5">
            <h6 className="text-lg font-bold text-gray-800">{isEdit ? "Update Company Info" : "Add New Company"}</h6>
          </div>

          <form className="grid grid-cols-1 gap-y-10" onSubmit={handleSubmit}>

            {/* ✅ Section 1: Basic */}
            <div>
              <h6 className="text-md font-bold text-gray-700 mb-4">Basic Details</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Company Code</label>
                  <input
                    className="form-input form-input-disabled"
                    value={formData.company_code}
                    disabled
                    placeholder="Eg. COMP00001"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="form-label">Company Name</label>
                  <input
                    className="form-input"
                    value={formData.company_name}
                    required
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
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
              </div>
            </div>

            {/* ✅ Section 2: Contact */}
            <div>
              <h6 className="text-md font-bold text-gray-700 mb-4">Contact & Address</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Email</label>
                  <input className="form-input" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Mobile</label>
                  <input className="form-input" value={formData.mobile || ""} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Fax</label>
                  <input className="form-input" value={formData.fax || ""} onChange={(e) => setFormData({ ...formData, fax: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Contact Person</label>
                  <input className="form-input" value={formData.contact_person || ""} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Landmark</label>
                  <input className="form-input" value={formData.landmark || ""} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} />
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

            {/* ✅ Section 3: Location + Registration + Logo */}
            <div>
              <h6 className="text-md font-bold text-gray-700 mb-4">Location, Registration & Logo</h6>
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

                <div className="space-y-1.5">
                  <label className="form-label">Currency</label>
                  <input className="form-input" value={formData.currency || ""} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Timezone</label>
                  <input className="form-input" value={formData.timezone || ""} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Registration Number</label>
                  <input className="form-input" value={formData.reg_number || ""} onChange={(e) => setFormData({ ...formData, reg_number: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">GST Number</label>
                  <input className="form-input" value={formData.gst_number || ""} onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Company Logo</label>
                  <input
                    type="file"
                    className="form-input"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
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
                  <th className="table-th">Company Code</th>
                  <th className="table-th">Company Name</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Mobile</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((c) => (
                  <tr
                    key={c.company_code}
                    onClick={() => setSelected(selected?.company_code === c.company_code ? null : c)}
                    className={`table-row ${selected?.company_code === c.company_code ? "table-row-active" : "table-row-hover"}`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${selected?.company_code === c.company_code ? "selection-indicator-active" : "selection-indicator-inactive"}`}>
                        {selected?.company_code === c.company_code && <div className="selection-dot" />}
                      </div>
                    </td>
                    <td className="table-td text-admin-id">{c.company_code}</td>
                    <td className="table-td text-admin-id">{c.company_name}</td>
                    <td className="table-td">{c.email || "-"}</td>
                    <td className="table-td">{c.mobile || "-"}</td>
                    <td className="table-td">{statusBadge(c.status)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaBuilding size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">No companies found</p>
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
