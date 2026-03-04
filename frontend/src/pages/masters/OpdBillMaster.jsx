import React, { useMemo, useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaRing } from "react-icons/fa";

const OpdBillMaster = () => {
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud("opd_bill_master/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [formData, setFormData] = useState({
    opd_bill_code: "",
    opd_bill_name: "",
    opd_bill_charge: "",
    status: 1,
    sort_order: "",
  });

  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

  // ✅ Sort exactly like EmployeeMaster
  const sortedOpdBills = useMemo(() => {
    const list = Array.isArray(data) ? [...data] : [];

    const getOrder = (row) => {
      const raw = row?.sort_order;
      const n = Number(raw);
      return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY; // blank goes to bottom
    };

    list.sort((a, b) => {
      const ao = getOrder(a);
      const bo = getOrder(b);
      if (ao !== bo) return ao - bo;

      const ac = (a?.opd_bill_code || "").toString();
      const bc = (b?.opd_bill_code || "").toString();
      return ac.localeCompare(bc);
    });

    return list;
  }, [data]);

  const {
    search, setSearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    paginatedData,
    effectiveItemsPerPage,
    filteredData,
    totalPages
  } = useTable(sortedOpdBills);

  /* =========================
     AUTO CODE: OPD00001
     ========================= */
  const nextOpdBillCode = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const codes = list
      .map((x) => (x?.opd_bill_code || "").toString())
      .filter((c) => c.toUpperCase().startsWith("OPD"));

    let maxNum = 0;
    for (const code of codes) {
      const num = parseInt(code.toUpperCase().replace("OPD", ""), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }

    const next = maxNum + 1;
    return `OPD${String(next).padStart(5, "0")}`;
  }, [data]);

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelected(null);
    setFormData({
      opd_bill_code: "",
      opd_bill_name: "",
      opd_bill_charge: "",
      status: 1,
      sort_order: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ FIX: send correct datatypes (especially opd_bill_charge)
    const payload = {
      ...formData,
      status: Number(formData.status),
      opd_bill_charge:
        formData.opd_bill_charge === "" || formData.opd_bill_charge === null || formData.opd_bill_charge === undefined
          ? null
          : Number(formData.opd_bill_charge),
      sort_order:
        formData.sort_order === "" || formData.sort_order === null || formData.sort_order === undefined
          ? null
          : Number(formData.sort_order),
    };

    // basic validation
    if (!payload.opd_bill_name) {
      showModal("opd_bill_name is required", "error");
      return;
    }
    if (payload.opd_bill_charge === null || Number.isNaN(payload.opd_bill_charge)) {
      showModal("opd_bill_charge must be a number", "error");
      return;
    }

    let result = isEdit
      ? await updateItem(`opd_bill_master/update/${formData.opd_bill_code}/`, payload)
      : await createItem(`opd_bill_master/create/`, payload);

    if (result.success) {
      showModal(`Opd Bill ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteItem(`opd_bill_master/delete/${selected.opd_bill_code}/`);
    if (result.success) {
      showModal("Opd Bill deleted successfully!");
      setSelected(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
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
        <p className="loading-text">Loading Opd Bill Data...</p>
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
        <h4 className="text-xl font-bold text-gray-800">Opd Bill Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => {
                setIsEdit(false);
                setSelected(null);
                setFormData({
                  opd_bill_code: nextOpdBillCode,
                  opd_bill_name: "",
                  opd_bill_charge: "",
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
                    setFormData({
                      opd_bill_code: selected.opd_bill_code || "",
                      opd_bill_name: selected.opd_bill_name || "",
                      opd_bill_charge: selected.opd_bill_charge ?? "",
                      status: Number(selected.status ?? 1),
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

      {showForm && (
        <div className="form-container">
          <div className="mb-8 border-b border-gray-50 pb-5">
            <h6 className="text-lg font-bold text-gray-800">
              {isEdit ? "Update Opd Bill" : "Add New Opd Bill"}
            </h6>
            <div className="border-b border-gray-200 mt-3 mb-6"></div>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">Opd Bill Code</label>
              <input className="form-input form-input-disabled" value={formData.opd_bill_code} disabled />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Opd Bill Name</label>
              <input
                className="form-input"
                value={formData.opd_bill_name}
                required
                maxLength={100}
                onChange={(e) => setFormData({ ...formData, opd_bill_name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">OPD Bill Charge</label>
              <input
                type="number"
                className="form-input"
                value={formData.opd_bill_charge ?? ""}
                required
                onChange={(e) => setFormData({ ...formData, opd_bill_charge: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Sort Order</label>
              <input
                className="form-input"
                type="number"
                value={formData.sort_order ?? ""}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
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

            <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
              <button className="btn-primary px-10">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
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
                  <th className="table-admin-th">Code</th>
                  <th className="table-admin-th">Name</th>
                  <th className="table-admin-th">Charge</th>
                  <th className="table-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((m) => (
                  <tr
                    key={m.opd_bill_code}
                    onClick={() => setSelected(selected?.opd_bill_code === m.opd_bill_code ? null : m)}
                    className={`table-row ${selected?.opd_bill_code === m.opd_bill_code ? "table-row-active" : "table-row-hover"}`}
                  >
                    <td className="text-admin-td">
                      <div className={`selection-indicator rounded-full ${selected?.opd_bill_code === m.opd_bill_code ? "selection-indicator-active" : "selection-indicator-inactive"}`}>
                        {selected?.opd_bill_code === m.opd_bill_code && <div className="selection-dot rounded-full" />}
                      </div>
                    </td>
                    <td className="text-admin-td">{m.opd_bill_code}</td>
                    <td className="text-admin-td">{m.opd_bill_name}</td>
                    <td className="text-admin-td">{m.opd_bill_charge}</td>
                    <td className="text-admin-td">{statusBadge(m.status)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaRing size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">No opd bill found</p>
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

export default OpdBillMaster;