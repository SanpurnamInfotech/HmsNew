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
  FaUniversity,
} from "react-icons/fa";

/* =========================
   Reusable Searchable Select
   (same behavior like EmployeeMaster)
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

const BankDetails = () => {
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud("bankdetails/");

  // dropdowns
  const { data: employeeData } = useCrud("employee_master/");
  const { data: financialyearDataRaw } = useCrud("financialyear_master/");
  const { data: companyData } = useCrud("company_master/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [formData, setFormData] = useState({
    bank_code: "",
    bank_name: "",
    employee_code: "",
    bank_address: "",
    bank_phone: "",
    bank_branch: "",
    bank_ifsc: "",
    bank_accountno: "",
    bank_ddpayableaddress: "",
    financialyear_code: "", // ✅ NOT required
    company_code: "",
    status: 1,
    sort_order: "",
  });

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success",
  });

  // ✅ Sort exactly like EmployeeMaster
  const sortedBankDetailies = useMemo(() => {
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

      const ac = (a?.bank_code || "").toString();
      const bc = (b?.bank_code || "").toString();
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
  } = useTable(sortedBankDetailies);

  const showModalMsg = (message, type = "success") =>
    setModal({ message, visible: true, type });

  /* ✅ FIX: normalize financialyear API response */
  const financialyearList = useMemo(() => {
    if (Array.isArray(financialyearDataRaw)) return financialyearDataRaw;
    if (Array.isArray(financialyearDataRaw?.results)) return financialyearDataRaw.results;
    if (Array.isArray(financialyearDataRaw?.data)) return financialyearDataRaw.data;
    return [];
  }, [financialyearDataRaw]);

  /* ===== options for searchable dropdowns ===== */
  const employeeOptions = useMemo(
    () =>
      (employeeData || []).map((e) => ({
        value: e.employee_code, // ✅ REQUIRED
        label:
          `${[
            e.employee_firstname,
          ]
            .filter(Boolean)
            .join(" ")}`.trim() + (e.employee_lastname ? ` ${e.employee_lastname}` : ""),
      })),
    [employeeData]
  );

  const fyOptions = useMemo(
    () =>
      (financialyearList || []).map((fy) => ({
        value: fy.financialyear_code, // ✅ REQUIRED
        label: fy.financialyear_name || fy.financialyear_code,
      })),
    [financialyearList]
  );

  const companyOptions = useMemo(
    () =>
      (companyData || []).map((c) => ({
        value: c.company_code, // ✅ REQUIRED
        label: `${c.company_name}`,
      })),
    [companyData]
  );

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelected(null);
    setFormData({
      bank_code: "",
      bank_name: "",
      employee_code: "",
      bank_address: "",
      bank_phone: "",
      bank_branch: "",
      bank_ifsc: "",
      bank_accountno: "",
      bank_ddpayableaddress: "",
      financialyear_code: "",
      company_code: "",
      status: 1,
      sort_order: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      status: Number(formData.status),
      sort_order:
        formData.sort_order === "" ||
        formData.sort_order === null ||
        formData.sort_order === undefined
          ? null
          : Number(formData.sort_order),

      // ✅ NOT required fields -> send null if empty
      employee_code: formData.employee_code || null,
      financialyear_code: formData.financialyear_code || null,
      company_code: formData.company_code || null,

      bank_address: formData.bank_address || null,
      bank_phone: formData.bank_phone || null,
      bank_branch: formData.bank_branch || null,
      bank_ifsc: formData.bank_ifsc || null,
      bank_accountno: formData.bank_accountno || null,
      bank_ddpayableaddress: formData.bank_ddpayableaddress || null,
    };

    const result = isEdit
      ? await updateItem(`bankdetails/update/${formData.bank_code}/`, payload)
      : await createItem(`bankdetails/create/`, payload);

    if (result.success) {
      showModalMsg(
        `Bank Details ${isEdit ? "updated" : "created"} successfully!`
      );
      resetForm();
      refresh();
    } else {
      showModalMsg(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteItem(`bankdetails/delete/${selected.bank_code}/`);
    if (result.success) {
      showModalMsg("Bank deleted successfully!");
      setSelected(null);
      refresh();
    } else {
      showModalMsg(result.error || "Delete failed!", "error");
    }
  };

  const statusBadge = (s) => {
    const isActive = Number(s) === 1;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
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
          <p className="loading-text">Loading Bank Details...</p>
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
        <h4 className="text-xl font-bold text-gray-800">Bank Details</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => {
                setIsEdit(false);
                setSelected(null);
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
          <div className="mb-8 border-b border-gray-50 pb-5">
            <h6 className="text-lg font-bold text-gray-800">
              {isEdit ? "Update Bank Info" : "Add New Bank"}
            </h6>
            <div className="border-b border-gray-200 mt-3 mb-6"></div>
          </div>

          <form className="grid grid-cols-1 gap-y-10" onSubmit={handleSubmit}>
            <div>
              <h6 className="text-md font-bold text-green-700 mb-4">
                Information
              </h6>
              <div className="border-b border-gray-200 mt-3 mb-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Bank Code</label>
                  <input
                    className={`form-input ${
                      isEdit ? "form-input-disabled" : ""
                    }`}
                    value={formData.bank_code || ""}
                    disabled={isEdit}
                    required
                    maxLength={45}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bank_code: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Bank Name</label>
                  <input
                    className="form-input"
                    value={formData.bank_name || ""}
                    required
                    maxLength={100}
                    onChange={(e) =>
                      setFormData({ ...formData, bank_name: e.target.value })
                    }
                  />
                </div>

              </div>
            </div>

            <div>
              <h6 className="text-md font-bold text-green-700 mb-4">
                Employee Details 
              </h6>
              <div className="border-b border-gray-200 mt-3 mb-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Employee</label>
                  <SearchableSelect
                    value={formData.employee_code || ""}
                    disabled={!!formData.employee_code}
                    placeholder="-- Select --"
                    options={employeeOptions}
                    onChange={(val) =>
                      setFormData({ ...formData, employee_code: val })
                    }
                  />
                </div>

                {/* ✅ Financial Year NOT required */}
                <div className="space-y-1.5">
                  <label className="form-label">Financial Year</label>
                  <SearchableSelect
                    value={formData.financialyear_code || ""}
                    disabled={!!formData.financialyear_code}
                    placeholder="-- Select --"
                    options={fyOptions}
                    onChange={(val) =>
                      setFormData({ ...formData, financialyear_code: val })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Company</label>
                  <SearchableSelect
                    value={formData.company_code || ""}
                    disabled={!!formData.company_code}
                    placeholder="-- Select --"
                    options={companyOptions}
                    onChange={(val) =>
                      setFormData({ ...formData, company_code: val })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h6 className="text-md font-bold text-green-700 mb-4">
                Bank Contact Details
              </h6>
              <div className="border-b border-gray-200 mt-3 mb-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Branch</label>
                  <input
                    className="form-input"
                    value={formData.bank_branch || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bank_branch: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">IFSC</label>
                  <input
                    className="form-input"
                    value={formData.bank_ifsc || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bank_ifsc: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    value={formData.bank_phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bank_phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Account No</label>
                  <input
                    className="form-input"
                    value={formData.bank_accountno || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bank_accountno: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">DD Payable Address</label>
                  <input
                    className="form-input"
                    value={formData.bank_ddpayableaddress || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bank_ddpayableaddress: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Bank Address</label>
                  <input
                    className="form-input"
                    value={formData.bank_address || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bank_address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={Number(formData.status)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: Number(e.target.value),
                      })
                    }
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
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
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">Bank Code</th>
                  <th className="text-admin-th">Bank Name</th>
                  <th className="text-admin-th">IFSC</th>
                  <th className="text-admin-th">Account No</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? (
                  paginatedData.map((x) => (
                    <tr
                      key={x.bank_code}
                      onClick={() =>
                        setSelected(
                          selected?.bank_code === x.bank_code ? null : x
                        )
                      }
                      className={`table-row ${
                        selected?.bank_code === x.bank_code
                          ? "table-row-active"
                          : "table-row-hover"
                      }`}
                    >
                      <td className="text-admin-td">
                        <div
                          className={`selection-indicator rounded-full ${
                            selected?.bank_code === x.bank_code
                              ? "selection-indicator-active"
                              : "selection-indicator-inactive"
                          }`}
                        >
                          {selected?.bank_code === x.bank_code && (
                            <div className="selection-dot rounded-full" />
                          )}
                        </div>
                      </td>
                      <td className="text-admin-td">{x.bank_code}</td>
                      <td className="text-admin-td">{x.bank_name}</td>
                      <td className="text-admin-td">{x.bank_ifsc || "-"}</td>
                      <td className="text-admin-td">{x.bank_accountno || "-"}</td>
                      <td className="text-admin-td">{statusBadge(x.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaUniversity size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">
                          No bank details found
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

export default BankDetails;
