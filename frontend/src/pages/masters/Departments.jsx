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
  FaBuilding,
} from "react-icons/fa";

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

const Departments = () => {
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud("departments/");

  // ✅ Financial Year dropdown (supports array / results / data)
  const { data: financialYearsDataRaw } = useCrud("financialyear_master/");
  const financialYearsList = useMemo(() => {
    if (Array.isArray(financialYearsDataRaw)) return financialYearsDataRaw;
    return (
      financialYearsDataRaw?.results ||
      financialYearsDataRaw?.data ||
      []
    );
  }, [financialYearsDataRaw]);

  const { data: companiesData } = useCrud("company_master/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [formData, setFormData] = useState({
    department_code: "",
    department_name: "",
    financialyear_code: "", // ✅ optional
    company_code: "",
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

  /* ============================
     ✅ Department code generator
     DEP00001, DEP00002, ...
     ============================ */
  const nextDepartmentCode = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const codes = list
      .map((x) => (x?.department_code || "").toString())
      .filter((c) => c.startsWith("DEP"));

    let maxNum = 0;
    for (const code of codes) {
      const num = parseInt(code.replace("DEP", ""), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }

    const next = maxNum + 1;
    return `DEP${String(next).padStart(5, "0")}`;
  }, [data]);

  /* ============================
     ✅ Sort like EmployeeMaster
     by sort_order asc, blank last
     ============================ */
  const sortedDepartments = useMemo(() => {
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

      const ac = (a?.department_code || "").toString();
      const bc = (b?.department_code || "").toString();
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
  } = useTable(sortedDepartments);

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelected(null);
    setFormData({
      department_code: "",
      department_name: "",
      financialyear_code: "", // ✅ optional
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

      // ✅ IMPORTANT: if not selected, send null (not required)
      financialyear_code:
        formData.financialyear_code === "" ||
        formData.financialyear_code === null ||
        formData.financialyear_code === undefined
          ? null
          : formData.financialyear_code,
    };

    const result = isEdit
      ? await updateItem(
          `departments/update/${formData.department_code}/`,
          payload
        )
      : await createItem(`departments/create/`, payload);

    if (result.success) {
      showModal(`Department ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteItem(
      `departments/delete/${selected.department_code}/`
    );
    if (result.success) {
      showModal("Department deleted successfully!");
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
          isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
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

  const fyOptions = useMemo(() => {
    const list = Array.isArray(financialYearsList) ? financialYearsList : [];
    return list.map((fy) => {
      const code = fy.financialyear_code;
      const label =
        fy.financialyear_name ||
        (fy.start_year && fy.end_year
          ? `${code} (${fy.start_year}-${fy.end_year})`
          : code);

      return { value: code, label };
    });
  }, [financialYearsList]);

  if (loading)
    return (
      <div className="loading-overlay">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading Departments Data...</p>
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
        <h4 className="text-xl font-bold text-gray-800">Departments</h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => {
                setIsEdit(false);
                setSelected(null);

                setFormData({
                  department_code: nextDepartmentCode,
                  department_name: "",
                  financialyear_code: "", // ✅ optional
                  company_code: "",
                  status: 1,
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
              {isEdit ? "Update Department" : "Add New Department"}
            </h6>
            <div className="border-b border-gray-200 mt-3 mb-6"></div>
          </div>

          <form className="grid grid-cols-1 gap-y-10" onSubmit={handleSubmit}>
            <div>
              

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Department Code</label>
                  <input
                    className="form-input form-input-disabled"
                    value={formData.department_code}
                    disabled
                    placeholder="Eg. DEP00001"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Department Name</label>
                  <input
                    className="form-input"
                    value={formData.department_name}
                    required
                    maxLength={100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department_name: e.target.value,
                      })
                    }
                  />
                </div>

                {/* ✅ Financial Year (NOT required) */}
                <div className="space-y-1.5">
                  <label className="form-label">Financial Year</label>
                  <SearchableSelect
                    value={formData.financialyear_code || ""}
                    disabled={!!formData.financialyear_code}
                    options={fyOptions}
                    placeholder="-- Select --"
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
                    options={companyOptions}
                    placeholder="-- Select --"
                    onChange={(val) =>
                      setFormData({ ...formData, company_code: val })
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
                  <th className="table-admin-th w-16"></th>
                  <th className="table-admin-th">Department Code</th>
                  <th className="table-admin-th">Department Name</th>
                  <th className="table-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? (
                  paginatedData.map((d) => (
                    <tr
                      key={d.department_code}
                      onClick={() =>
                        setSelected(
                          selected?.department_code === d.department_code
                            ? null
                            : d
                        )
                      }
                      className={`table-row ${
                        selected?.department_code === d.department_code
                          ? "table-row-active"
                          : "table-row-hover"
                      }`}
                    >
                      <td className="text-admin-td">
                        <div
                          className={`selection-indicator rounded-full ${
                            selected?.department_code === d.department_code
                              ? "selection-indicator-active"
                              : "selection-indicator-inactive"
                          }`}
                        >
                          {selected?.department_code === d.department_code && (
                            <div className="selection-dot rounded-full" />
                          )}
                        </div>
                      </td>
                      <td className="text-admin-td">{d.department_code}</td>
                      <td className="text-admin-td">{d.department_name}</td>
                      <td className="text-admin-td">{statusBadge(d.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaBuilding size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">
                          No departments found
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

export default Departments;
