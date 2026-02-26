import React, { useEffect, useMemo, useRef, useState } from "react";
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
  FaHandHoldingHeart,
} from "react-icons/fa";

/* =========================
   Reusable Searchable Select
   (same behavior like EmployeeMaster searchable dropdowns)
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
              className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
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
                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition ${
                    String(o.value) === String(value) ? "bg-blue-50" : ""
                  } hover:bg-blue-900 hover:text-white`}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <span className="text-inherit">{o.label}</span>
                  {String(o.value) === String(value) && (
                    <span className="text-blue-600 font-semibold group-hover:text-white">
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

const BloodDonor = () => {
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud("blood_donor/");

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
    sort_order: "",
  });

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success",
  });

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  /* ================= SORT ORDER like EmployeeMaster ================= */
  const sortedBloodDonors = useMemo(() => {
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

      // tie-break by name then id
      const an = `${a?.donor_firstname || ""} ${a?.donor_lastname || ""}`.trim();
      const bn = `${b?.donor_firstname || ""} ${b?.donor_lastname || ""}`.trim();
      const nameCmp = an.localeCompare(bn);
      if (nameCmp !== 0) return nameCmp;

      return Number(a?.id || 0) - Number(b?.id || 0);
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
  } = useTable(sortedBloodDonors);

  /* ===== searchable dropdown options ===== */
  const bloodGroupOptions = useMemo(
    () =>
      (bloodGroups || []).map((bg) => ({
        value: bg.blood_group_code,
        label: `${bg.blood_group_code}`,
      })),
    [bloodGroups]
  );

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
      sort_order: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      age: formData.age === "" ? null : Number(formData.age),
      sort_order: formData.sort_order === "" ? null : Number(formData.sort_order),
      status: Number(formData.status),
      last_donation_date: formData.last_donation_date
        ? formData.last_donation_date
        : null,
    };

    const result = isEdit
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
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  if (loading)
    return (
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
        <h4 className="text-xl font-bold text-gray-800">Blood Donor</h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => {
                setIsEdit(false);
                setSelected(null);
                resetForm();
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
                      last_donation_date: selected.last_donation_date || "",
                      status: selected.status ?? 1,
                      sort_order: selected.sort_order ?? "",
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

      {/* FORM */}
      {showForm && (
        <div className="form-container">
          {/* Title + line like EmployeeMaster */}
          <div className="mb-8 border-b border-gray-50 pb-5">
            <h6 className="text-lg font-bold text-gray-800">
              {isEdit ? "Update Donor Info" : "Add New Donor"}
            </h6>
            <div className="border-b border-gray-200 mt-3 mb-6"></div>
          </div>

          <form className="grid grid-cols-1 gap-y-10" onSubmit={handleSubmit}>
            {/* SECTION 1 */}
            <div>
              <h6 className="text-md font-bold text-green-700 mb-4">
                Information
              </h6>
              <div className="border-b border-gray-200 mt-3 mb-6"></div>

              {/* 1 row = 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">First Name</label>
                  <input
                    className="form-input"
                    value={formData.donor_firstname}
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, donor_firstname: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Middle Name</label>
                  <input
                    className="form-input"
                    value={formData.donor_middlename}
                    onChange={(e) =>
                      setFormData({ ...formData, donor_middlename: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Last Name</label>
                  <input
                    className="form-input"
                    value={formData.donor_lastname}
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, donor_lastname: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Blood Group</label>
                  <SearchableSelect
                    className="form-input"
                    value={formData.blood_group_code || ""}
                    disabled={!!formData.blood_group_code}
                    placeholder="Select Blood Group"
                    options={bloodGroupOptions}
                    onChange={(val) =>
                      setFormData({ ...formData, blood_group_code: val })
                    }
                  />
                </div>

                {/* ✅ Gender - now same look like Blood Group (placeholder grey + blue focus) */}
                <div className="space-y-1.5">
                  <label className="form-label">Gender</label>
                  <select
                    className={`form-input focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                      !formData.gender ? "text-gray-400" : "text-gray-900"
                    }`}
                    value={formData.gender || ""}
                    disabled={!!formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="Male" className="text-gray-900">
                      Male
                    </option>
                    <option value="Female" className="text-gray-900">
                      Female
                    </option>
                    <option value="Other" className="text-gray-900">
                      Other
                    </option>
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


                {/* ✅ Last Donation Date - same look + grey when empty + blue focus */}
                <div className="space-y-1.5">
                  <label className="form-label">Last Donation Date</label>
                  <input
                    type="datetime-local"
                    className={`form-input focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                      !formData.last_donation_date ? "text-gray-400" : "text-gray-900"
                    }`}
                    value={formData.last_donation_date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, last_donation_date: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2 */}
            <div>
              <h6 className="text-md font-bold text-green-700 mb-4">Contact</h6>
              <div className="border-b border-gray-200 mt-3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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

            {/* SECTION 3 */}
            <div>
              <h6 className="text-md font-bold text-green-700 mb-4">Address</h6>
              <div className="border-b border-gray-200 mt-3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Address 1</label>
                  <textarea
                    className="form-input"
                    value={formData.address1 || ""}
                    onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Address 2</label>
                  <textarea
                    className="form-input"
                    value={formData.address2 || ""}
                    onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
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

                {/* ✅ Status - same look + blue focus */}
                <div className="space-y-1.5">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    value={Number(formData.status)}
                    onChange={(e) =>
                      setFormData({ ...formData, status: Number(e.target.value) })
                    }
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
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
                  <th className="table-admin-th">Name</th>
                  <th className="table-admin-th">Blood Group</th>
                  <th className="table-admin-th">Gender</th>
                  <th className="table-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? (
                  paginatedData.map((x) => (
                    <tr
                      key={x.id}
                      onClick={() => setSelected(selected?.id === x.id ? null : x)}
                      className={`table-row ${
                        selected?.id === x.id ? "table-row-active" : "table-row-hover"
                      }`}
                    >
                      <td className="text-admin-td">
                        <div
                          className={`selection-indicator rounded-full ${
                            selected?.id === x.id
                              ? "selection-indicator-active"
                              : "selection-indicator-inactive"
                          }`}
                        >
                          {selected?.id === x.id && <div className="selection-dot rounded-full" />}
                        </div>
                      </td>

                      <td className="text-admin-td">
                        {x.donor_firstname} {x.donor_lastname}
                      </td>
                      <td className="text-admin-td">{x.blood_group_code || "-"}</td>
                      <td className="text-admin-td">{x.gender || "-"}</td>
                      <td className="text-admin-td">{statusBadge(x.status)}</td>
                    </tr>
                  ))
                ) : (
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
