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
} from "react-icons/fa";

/* =========================
   Reusable Searchable Select
   (same like EmployeeMaster)
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

const BedAllotment = () => {
  const PATH = "bed_allotment";

  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  // dropdown data
  const { data: bedsData } = useCrud("bed/");
  const { data: patientsData } = useCrud("patient/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    bed_code: "",
    patient_code: "",
    allotment_timestamp: "",
    discharge_timestamp: "",
    status: 1,
    sort_order: "",
  });

  const [modal, setModal] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  /* ================= SORT ORDER like EmployeeMaster ================= */
  const sortedBedAllotments = useMemo(() => {
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

      const ac = (a?.bed_code || "").toString();
      const bc = (b?.bed_code || "").toString();
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
  } = useTable(sortedBedAllotments);

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      id: null,
      bed_code: "",
      patient_code: "",
      allotment_timestamp: "",
      discharge_timestamp: "",
      status: 1,
      sort_order: "",
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ visible: true, message, type });

  /* ===== options for searchable dropdowns ===== */
  const bedOptions = useMemo(
    () =>
      (bedsData || []).map((c) => ({
        value: c.bed_code,
        label: c.bed_name,
      })),
    [bedsData]
  );

  /* ===== Patient options with name + surname ===== */
  const patientOptions = useMemo(() => {
    return (patientsData || []).map((p) => {
      const fullName = [p.patient_first_name, p.patient_last_name]
        .filter(Boolean)
        .join(" ");
      return {
        // ✅ FIX: add value so selection works
        value: p.patient_code,
        // NOTE: keeping your same label format
        label: `${fullName ? `  ${fullName}` : ""}`,
      };
    });
  }, [patientsData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.id}/`
      : `${PATH}/create/`;

    const payload = {
      ...formData,
      status: Number(formData.status),
      sort_order:
        formData.sort_order === "" ||
        formData.sort_order === null ||
        formData.sort_order === undefined
          ? null
          : Number(formData.sort_order),
    };

    if (payload.bed_code === "") payload.bed_code = null;
    if (payload.patient_code === "") payload.patient_code = null;
    if (payload.allotment_timestamp === "") payload.allotment_timestamp = null;
    if (payload.discharge_timestamp === "") payload.discharge_timestamp = null;

    if (payload.sort_order === "" || payload.sort_order === null) {
      delete payload.sort_order;
    }

    if (!isEdit) delete payload.id;

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Bed Allotment ${isEdit ? "updated" : "created"} successfully`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;

    const result = await deleteItem(`${PATH}/delete/${selectedRow.id}/`);

    if (result.success) {
      showModal("Record deleted successfully");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed", "error");
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

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner-container text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="loading-text">Loading Bed Allotment...</p>
        </div>
      </div>
    );
  }

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

      {/* HEADER (same like EmployeeMaster) */}
      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">Bed Allotment</h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => {
                setIsEdit(false);
                setSelectedRow(null);
                resetForm();
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
                    setFormData({
                      id: selectedRow.id,
                      bed_code: selectedRow.bed_code || "",
                      patient_code: selectedRow.patient_code || "",
                      allotment_timestamp: selectedRow.allotment_timestamp
                        ? selectedRow.allotment_timestamp.replace("Z", "").slice(0, 16)
                        : "",
                      discharge_timestamp: selectedRow.discharge_timestamp
                        ? selectedRow.discharge_timestamp.replace("Z", "").slice(0, 16)
                        : "",
                      status: selectedRow.status ?? 1,
                      sort_order: selectedRow.sort_order ?? "",
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

      {/* FORM (EmployeeMaster style: sections + 2 columns) */}   
      {showForm && (
        <div className="form-container">
          <div className="mb-8 border-b border-gray-50 pb-5">
            <h6 className="text-lg font-bold text-gray-800">
              {isEdit ? "Update Bed Allotment" : "Create Bed Allotment"}
            </h6>
            <div className="border-b border-gray-200 mt-3 mb-6"></div>
          </div>

          <form className="grid grid-cols-1 gap-y-10" onSubmit={handleSubmit}>
            {/* SECTION 1 */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Bed (Searchable + show name) */}
                <div className="space-y-1.5">
                  <label className="form-label">Bed</label>
                  <SearchableSelect
                    className="form-input"
                    value={formData.bed_code || ""}
                    disabled={!!formData.bed_code}
                    placeholder="Select Bed"
                    options={bedOptions}
                    onChange={(val) =>
                      setFormData({ ...formData, bed_code: val })
                    }
                  />
                </div>

                {/* Patient (Searchable + show name) */}
                <div className="space-y-1.5">
                  <label className="form-label">Patient</label>
                  <SearchableSelect
                    className="form-input"
                    value={formData.patient_code || ""}
                    disabled={!!formData.patient_code}
                    placeholder="Select Patient"
                    options={patientOptions}
                    onChange={(val) =>
                      setFormData({ ...formData, patient_code: val })
                    }
                  />
                </div>

                {/* Allotment Timestamp */}
                <div className="space-y-1.5">
                  <label className="form-label">Allotment DateTime</label>
                  <input
                    type="datetime-local"
                    className={`form-input focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                      !formData.allotment_timestamp ? "text-gray-400" : "text-gray-900"
                    }`}
                    value={formData.allotment_timestamp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allotment_timestamp: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Discharge Timestamp */}
                <div className="space-y-1.5">
                  <label className="form-label">Discharge DateTime</label>
                  <input
                    type="datetime-local"
                    className={`form-input focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                      !formData.discharge_timestamp ? "text-gray-400" : "text-gray-900"
                    }`}
                    value={formData.discharge_timestamp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discharge_timestamp: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Sort Order */}
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

                {/* Status */}
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

            {/* Buttons */}
            <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
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

      {/* TABLE (EmployeeMaster style) */}
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
                  <th className="text-admin-th">Bed</th>
                  <th className="text-admin-th">Patient</th>
                  <th className="text-admin-th">Allotment</th>
                  <th className="text-admin-th">Discharge</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? (
                  paginatedData.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() =>
                        setSelectedRow(selectedRow?.id === m.id ? null : m)
                      }
                      className={`table-row ${
                        selectedRow?.id === m.id
                          ? "table-row-active"
                          : "table-row-hover"
                      }`}
                    >
                      <td className="text-admin-td">
                        <div
                          className={`selection-indicator rounded-full ${
                            selectedRow?.id === m.id
                              ? "selection-indicator-active"
                              : "selection-indicator-inactive"
                          }`}
                        >
                          {selectedRow?.id === m.id && (
                            <div className="selection-dot rounded-full" />
                          )}
                        </div>
                      </td>

                      <td className="text-admin-td">{m.bed_code || "-"}</td>
                      <td className="text-admin-td">{m.patient_code || "-"}</td>
                      <td className="text-admin-td">{m.allotment_timestamp || "-"}</td>
                      <td className="text-admin-td">{m.discharge_timestamp || "-"}</td>
                      <td className="text-admin-td">{statusBadge(m.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <p className="text-xl font-bold text-gray-500">
                          No bed allotments found
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

export default BedAllotment;