import React, { useMemo, useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaRing } from "react-icons/fa";

const OpdBilling = () => {
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud("opd_billing/");

  // dropdown sources
  const { data: patientsData } = useCrud("patient_master/");
  const { data: appointmentsData } = useCrud("appointment_master/");
  const { data: hospitalsData } = useCrud("hospital_master/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });
  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  // normalize (array / pagination / wrapper)
  const normalizeList = (val) => {
    if (Array.isArray(val)) return val;
    if (val && Array.isArray(val.results)) return val.results;
    if (val && Array.isArray(val.data)) return val.data;
    return [];
  };

  // ✅ table data sorted
  const sortedBills = useMemo(() => {
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
  } = useTable(sortedBills);

  // ✅ auto generate code like OPD00001
  const nextOpdBillingCode = useMemo(() => {
    const PREFIX = "OPD";
    const list = normalizeList(data);
    const codes = list
      .map((x) => (x?.opd_billing_code || "").toString())
      .filter((c) => c.toUpperCase().startsWith(PREFIX));

    let maxNum = 0;
    for (const code of codes) {
      const num = parseInt(code.toUpperCase().replace(PREFIX, ""), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }

    const next = maxNum + 1;
    return `${PREFIX}${String(next).padStart(5, "0")}`;
  }, [data]);

  const [formData, setFormData] = useState({
    opd_billing_code: "",
    patient_code: "",
    bill_no: "",
    appointment_code: "",
    appointment_type_code: "",
    hospital_name: "",
    billing_date: "",
    total_amount: "0.00",
    discount_amount: "0.00",
    bill_amount: "0.00",
    amt_received: "0.00",
    dues_amount: "0.00",
    types_of_items: "",
    sort_order: "",
    status: 1,
  });

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelected(null);
    setSearch("");
    setCurrentPage(1);
    setFormData({
      opd_billing_code: "",
      patient_code: "",
      bill_no: "",
      appointment_code: "",
      appointment_type_code: "",
      hospital_name: "",
      billing_date: "",
      total_amount: "0.00",
      discount_amount: "0.00",
      bill_amount: "0.00",
      amt_received: "0.00",
      dues_amount: "0.00",
      types_of_items: "",
      sort_order: "",
      status: 1,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      opd_billing_code: (formData.opd_billing_code || "").toString().trim(),
      patient_code: (formData.patient_code || "").toString().trim(),
      appointment_code: (formData.appointment_code || "").toString().trim() || null,
      appointment_type_code: (formData.appointment_type_code || "").toString().trim() || null,
      hospital_name: (formData.hospital_name || "").toString().trim() || null,

      total_amount: Number(formData.total_amount || 0),
      discount_amount: Number(formData.discount_amount || 0),
      bill_amount: Number(formData.bill_amount || 0),
      amt_received: Number(formData.amt_received || 0),
      dues_amount: Number(formData.dues_amount || 0),

      status: Number(formData.status),
      sort_order: formData.sort_order === "" || formData.sort_order === null ? null : Number(formData.sort_order),
    };

    if (!payload.opd_billing_code) return showModal("opd_billing_code is required", "error");
    if (!payload.patient_code) return showModal("Please select patient", "error");

    const result = isEdit
      ? await updateItem(`opd_billing/update/${payload.opd_billing_code}/`, payload)
      : await createItem(`opd_billing/create/`, payload);

    if (result.success) {
      showModal(`OPD Billing ${isEdit ? "updated" : "created"} successfully!`);
      await refresh();            // ✅ IMPORTANT
      resetForm();
    } else {
      showModal(extractError(result.error), "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteItem(`opd_billing/delete/${selected.opd_billing_code}/`);
    if (result.success) {
      showModal("Deleted successfully!");
      setSelected(null);
      await refresh();
    } else {
      showModal(extractError(result.error), "error");
    }
  };

  const patients = normalizeList(patientsData);
  const appointments = normalizeList(appointmentsData);
  const hospitals = normalizeList(hospitalsData);

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading OPD Billing...</p>
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
        <h4 className="text-xl font-bold text-gray-800">Opd Billing</h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              className="btn-primary"
              onClick={() => {
                setIsEdit(false);
                setSelected(null);
                setFormData({
                  ...formData,
                  opd_billing_code: nextOpdBillingCode, // ✅ auto
                  patient_code: "",
                  bill_no: "",
                  appointment_code: "",
                  appointment_type_code: "",
                  hospital_name: "",
                  billing_date: "",
                  total_amount: "0.00",
                  discount_amount: "0.00",
                  bill_amount: "0.00",
                  amt_received: "0.00",
                  dues_amount: "0.00",
                  types_of_items: "",
                  sort_order: "",
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
                    setFormData({
                      opd_billing_code: selected.opd_billing_code || "",
                      patient_code: selected.patient_code || "",
                      bill_no: selected.bill_no || "",
                      appointment_code: selected.appointment_code || "",
                      appointment_type_code: selected.appointment_type_code || "",
                      hospital_name: selected.hospital_name || "",
                      billing_date: selected.billing_date || "",
                      total_amount: selected.total_amount ?? "0.00",
                      discount_amount: selected.discount_amount ?? "0.00",
                      bill_amount: selected.bill_amount ?? "0.00",
                      amt_received: selected.amt_received ?? "0.00",
                      dues_amount: selected.dues_amount ?? "0.00",
                      types_of_items: selected.types_of_items || "",
                      sort_order: selected.sort_order ?? "",
                      status: Number(selected.status ?? 1),
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
              {isEdit ? "Update OPD Billing" : "Add New OPD Billing"}
            </h6>
            <div className="border-b border-gray-200 mt-3 mb-6"></div>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">OPD Billing Code</label>
              <input className="form-input form-input-disabled" value={formData.opd_billing_code} disabled />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Patient</label>
              <select
                className="form-input"
                value={formData.patient_code || ""}
                required
                onChange={(e) => setFormData({ ...formData, patient_code: e.target.value })}
              >
                <option value="">-- Select --</option>
                {patients.map((p) => (
                  <option key={p.patient_code} value={p.patient_code}>
                    {p.patient_code} {p.patient_name ? `- ${p.patient_name}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Appointment Code</label>
              <select
                className="form-input"
                value={formData.appointment_code || ""}
                onChange={(e) => {
                  const code = e.target.value;
                  const found = appointments.find((a) => a.appointment_code === code);
                  setFormData({
                    ...formData,
                    appointment_code: code,
                    appointment_type_code: found?.appointment_type_code || "",
                  });
                }}
              >
                <option value="">-- Select --</option>
                {appointments.map((a) => (
                  <option key={a.appointment_code} value={a.appointment_code}>
                    {a.appointment_code}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Appointment Type Code</label>
              <input className="form-input form-input-disabled" value={formData.appointment_type_code || ""} disabled />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Hospital</label>
              <select
                className="form-input"
                value={formData.hospital_name || ""}
                onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
              >
                <option value="">-- Select --</option>
                {hospitals.map((h, idx) => {
                  const name = h.hospital_name || h.name || "";
                  return (
                    <option key={`${name}-${idx}`} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Billing Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.billing_date || ""}
                onChange={(e) => setFormData({ ...formData, billing_date: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Total Amount</label>
              <input className="form-input" type="number" step="0.01"
                value={formData.total_amount ?? "0.00"}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Discount Amount</label>
              <input className="form-input" type="number" step="0.01"
                value={formData.discount_amount ?? "0.00"}
                onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Bill Amount</label>
              <input className="form-input" type="number" step="0.01"
                value={formData.bill_amount ?? "0.00"}
                onChange={(e) => setFormData({ ...formData, bill_amount: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Amount Received</label>
              <input className="form-input" type="number" step="0.01"
                value={formData.amt_received ?? "0.00"}
                onChange={(e) => setFormData({ ...formData, amt_received: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Dues Amount</label>
              <input className="form-input" type="number" step="0.01"
                value={formData.dues_amount ?? "0.00"}
                onChange={(e) => setFormData({ ...formData, dues_amount: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Types of Items</label>
              <input className="form-input"
                value={formData.types_of_items || ""}
                onChange={(e) => setFormData({ ...formData, types_of_items: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Sort Order</label>
              <input className="form-input" type="number"
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
                  <th className="table-admin-th">Patient</th>
                  <th className="table-admin-th">Appointment</th>
                  <th className="table-admin-th">Hospital</th>
                  <th className="table-admin-th">Billing Date</th>
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
                    <td className="text-admin-td">{m.patient_code}</td>
                    <td className="text-admin-td">{m.appointment_code || "-"}</td>
                    <td className="text-admin-td">{m.hospital_name || "-"}</td>
                    <td className="text-admin-td">{m.billing_date || "-"}</td>
                    <td className="text-admin-td">{statusBadge(m.status)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaRing size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">No opd billing found</p>
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

export default OpdBilling;