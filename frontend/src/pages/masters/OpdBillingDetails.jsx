import React, { useMemo, useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaRing } from "react-icons/fa";

const OpdBillingDetails = () => {
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud("opd_billing_details/");
  const { data: opdBillsData } = useCrud("opd_bill_master/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [billSearch, setBillSearch] = useState("");

  const [formData, setFormData] = useState({
    opd_billing_code: "",
    opd_bill_code: "",
    opd_bill_name: "",
    quantity: 1,
    rate: "0.00",
    amount: "0.00",
    status: 1,
    sort_order: "",
  });

  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });
  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  const normalizeList = (val) => {
    if (Array.isArray(val)) return val;
    if (val && Array.isArray(val.results)) return val.results;
    if (val && Array.isArray(val.data)) return val.data;
    return [];
  };

  const sortedDetails = useMemo(() => {
    const list = [...normalizeList(data)];

    const getOrder = (row) => {
      const n = Number(row?.sort_order);
      return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
    };

    list.sort((a, b) => {
      const ao = getOrder(a);
      const bo = getOrder(b);
      if (ao !== bo) return ao - bo;

      const ac = (a?.opd_billing_code || "").toString();
      const bc = (b?.opd_billing_code || "").toString();
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
  } = useTable(sortedDetails);

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelected(null);
    setBillSearch("");
    setFormData({
      opd_billing_code: "",
      opd_bill_code: "",
      opd_bill_name: "",
      quantity: 1,
      rate: "0.00",
      amount: "0.00",
      status: 1,
      sort_order: "",
    });
  };

  const statusBadge = (s) => {
    const isActive = Number(s) === 1;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const calcAmount = (qty, rate) => {
    const q = Number(qty);
    const r = Number(rate);
    if (!Number.isFinite(q) || !Number.isFinite(r)) return "0.00";
    return (q * r).toFixed(2);
  };

  const extractError = (errObj) => {
    if (!errObj) return "Operation failed!";
    if (typeof errObj === "string") return errObj;
    if (errObj.detail) return errObj.detail;
    if (errObj.error) return errObj.error;
    if (errObj.message) return errObj.message;

    const keys = Object.keys(errObj || {});
    if (keys.length) {
      const k = keys[0];
      const v = errObj[k];
      if (Array.isArray(v)) return `${k}: ${v.join(", ")}`;
      if (typeof v === "string") return `${k}: ${v}`;
    }
    try { return JSON.stringify(errObj); } catch { return "Operation failed!"; }
  };

  const filteredBills = useMemo(() => {
    const list = normalizeList(opdBillsData);
    const q = (billSearch || "").toLowerCase().trim();
    if (!q) return list;

    return list.filter((b) => {
      const code = (b?.opd_bill_code || "").toLowerCase();
      const name = (b?.opd_bill_name || "").toLowerCase();
      return code.includes(q) || name.includes(q);
    });
  }, [opdBillsData, billSearch]);

  const handleBillSelect = (code) => {
    const list = normalizeList(opdBillsData);
    const found = list.find((x) => x.opd_bill_code === code);

    setFormData((prev) => {
      const qty = prev.quantity ?? 1;
      const rate = found?.opd_bill_charge ?? prev.rate ?? "0.00";
      const amount = calcAmount(qty, rate);

      return {
        ...prev,
        opd_bill_code: code,
        opd_bill_name: found?.opd_bill_name || "",
        rate: String(rate),
        amount,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      opd_billing_code: (formData.opd_billing_code || "").toString().trim(),
      opd_bill_code: (formData.opd_bill_code || "").toString(),
      opd_bill_name: (formData.opd_bill_name || "").toString(),
      quantity: formData.quantity === "" || formData.quantity == null ? 1 : Number(formData.quantity),
      rate: formData.rate === "" || formData.rate == null ? 0 : Number(formData.rate),
      amount: formData.amount === "" || formData.amount == null ? 0 : Number(formData.amount),
      status: Number(formData.status),
      sort_order: formData.sort_order === "" || formData.sort_order == null ? null : Number(formData.sort_order),
    };

    if (!payload.opd_billing_code) return showModal("OPD Billing Code is required", "error");
    if (!payload.opd_bill_code) return showModal("Please select OPD Bill", "error");

    const result = isEdit
      ? await updateItem(`opd_billing_details/update/${payload.opd_billing_code}/`, payload)
      : await createItem(`opd_billing_details/create/`, payload);

    if (result.success) {
      showModal(`Opd Billing Details ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh(); // ✅ now list will work and table will show
    } else {
      showModal(extractError(result.error), "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;

    const result = await deleteItem(`opd_billing_details/delete/${selected.opd_billing_code}/`);
    if (result.success) {
      showModal("Deleted successfully!");
      setSelected(null);
      refresh();
    } else {
      showModal(extractError(result.error), "error");
    }
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Opd Billing Details...</p>
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

              <button className="btn-primary w-full" onClick={() => setModal({ ...modal, visible: false })}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">Opd Billing Details</h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => {
                setIsEdit(false);
                setSelected(null);
                setFormData({
                  opd_billing_code: "",
                  opd_bill_code: "",
                  opd_bill_name: "",
                  quantity: 1,
                  rate: "0.00",
                  amount: "0.00",
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
                      opd_billing_code: selected.opd_billing_code || "",
                      opd_bill_code: selected.opd_bill_code || "",
                      opd_bill_name: selected.opd_bill_name || "",
                      quantity: selected.quantity ?? 1,
                      rate: selected.rate ?? "0.00",
                      amount: selected.amount ?? "0.00",
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
              {isEdit ? "Update Opd Billing Details" : "Add New Opd Billing Details"}
            </h6>
            <div className="border-b border-gray-200 mt-3 mb-6"></div>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">OPD Billing Code</label>
              <input
                className={`form-input ${isEdit ? "form-input-disabled" : ""}`}
                value={formData.opd_billing_code}
                disabled={isEdit}
                required
                maxLength={45}
                onChange={(e) => setFormData({ ...formData, opd_billing_code: e.target.value })}
                placeholder="Enter OPD Billing Code"
              />
            </div>


            <div className="space-y-1.5">
              <label className="form-label">OPD Bill</label>
              <select
                className="form-input"
                value={formData.opd_bill_code || ""}
                required
                onChange={(e) => handleBillSelect(e.target.value)}
              >
                <option value="">-- Select --</option>
                {filteredBills.map((b) => (
                  <option key={b.opd_bill_code} value={b.opd_bill_code}>
                    {b.opd_bill_code} - {b.opd_bill_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">OPD Bill Name</label>
              <input className="form-input form-input-disabled" value={formData.opd_bill_name || ""} disabled />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-input"
                value={formData.quantity ?? 1}
                onChange={(e) => {
                  const qty = e.target.value;
                  setFormData((p) => ({ ...p, quantity: qty, amount: calcAmount(qty, p.rate) }));
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Rate</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.rate ?? "0.00"}
                onChange={(e) => {
                  const rate = e.target.value;
                  setFormData((p) => ({ ...p, rate, amount: calcAmount(p.quantity, rate) }));
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Amount</label>
              <input className="form-input form-input-disabled" value={formData.amount ?? "0.00"} disabled />
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
                  <th className="table-admin-th">Billing Code</th>
                  <th className="table-admin-th">Bill Code</th>
                  <th className="table-admin-th">Bill Name</th>
                  <th className="table-admin-th">Qty</th>
                  <th className="table-admin-th">Rate</th>
                  <th className="table-admin-th">Amount</th>
                  <th className="table-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((m) => (
                  <tr
                    key={m.opd_billing_code}
                    onClick={() => setSelected(selected?.opd_billing_code === m.opd_billing_code ? null : m)}
                    className={`table-row ${selected?.opd_billing_code === m.opd_billing_code ? "table-row-active" : "table-row-hover"}`}
                  >
                    <td className="text-admin-td">
                      <div className={`selection-indicator rounded-full ${selected?.opd_billing_code === m.opd_billing_code ? "selection-indicator-active" : "selection-indicator-inactive"}`}>
                        {selected?.opd_billing_code === m.opd_billing_code && <div className="selection-dot rounded-full" />}
                      </div>
                    </td>

                    <td className="text-admin-td">{m.opd_billing_code}</td>
                    <td className="text-admin-td">{m.opd_bill_code}</td>
                    <td className="text-admin-td">{m.opd_bill_name || "-"}</td>
                    <td className="text-admin-td">{m.quantity ?? "-"}</td>
                    <td className="text-admin-td">{m.rate ?? "-"}</td>
                    <td className="text-admin-td">{m.amount ?? "-"}</td>
                    <td className="text-admin-td">{statusBadge(m.status)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaRing size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">No opd billing details found</p>
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

export default OpdBillingDetails;