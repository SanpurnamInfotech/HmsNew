import { useEffect, useState } from "react";
import api from "../../utils/domain";
import {
  useCrud,
  useTable,
  Pagination,
  TableToolbar
} from "../../components/common/BaseCRUD";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaLightbulb
} from "react-icons/fa";

const EctMst = () => {

  /* ================= DATA FETCHING ================= */
  const PATH = "ect";
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  /* ================= UI STATES ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [patients, setPatients] = useState([]);

  const [formData, setFormData] = useState({
    ect_code: "",
    patient_code: "",
    ect_date: "",
    anaesthesia: "",
    anaesthetist_name: "",
    duration_seconds: "",
    pulse_width_ms: "",
    frequency_hz: "",
    joules: "",
    result: "",
    remark: "",
    visit_type: "",
    sort_order: "",
    status: 1
  });

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success"
  });

  /* ================= TABLE LOGIC ================= */
  const {
    search, setSearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    paginatedData,
    effectiveItemsPerPage,
    filteredData,
    totalPages
  } = useTable(data || []);

  /* ================= LOAD PATIENTS ================= */
  useEffect(() => {
    api.get("patient/").then(res => setPatients(res.data || []));
  }, []);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      ect_code: "",
      patient_code: "",
      ect_date: "",
      anaesthesia: "",
      anaesthetist_name: "",
      duration_seconds: "",
      pulse_width_ms: "",
      frequency_hz: "",
      joules: "",
      result: "",
      remark: "",
      visit_type: "",
      sort_order: "",
      status: 1
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  /* ================= CRUD ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.ect_code}/`
      : `${PATH}/create/`;

    const payload = {
      ...formData,
      patient_code: formData.patient_code || null
    };

    if (payload.sort_order === "" || payload.sort_order === null)
      delete payload.sort_order;

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`ECT ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;

    const result = await deleteItem(
      `${PATH}/delete/${selectedRow.ect_code}/`
    );

    if (result.success) {
      showModal("ECT deleted successfully!");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );

  return (
    <div className="app-container">

      {/* ================= MODAL ================= */}
      {modal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">

            <div className="mb-4 flex justify-center">
              {modal.type === "success"
                ? <FaCheckCircle className="text-6xl text-emerald-500" />
                : <FaTimesCircle className="text-6xl text-rose-500" />
              }
            </div>

            <h3
              className={`text-xl font-black mb-2 uppercase tracking-tight ${
                modal.type === "success" ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {modal.type === "success" ? "Success" : "Error"}
            </h3>

            <p className="mb-6 font-medium opacity-80">
              {modal.message}
            </p>

            <button
              className="btn-primary w-full justify-center py-3"
              onClick={() => setModal({ ...modal, visible: false })}
            >
              Continue
            </button>

          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="section-header">
        <h4 className="page-title">ECT Master</h4>

        {!showForm && (
          <div className="flex items-center gap-2">

            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">

                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData({
                      ...selectedRow,
                      patient_code:
                        selectedRow.patient_code?.patient_code ??
                        selectedRow.patient_code
                    });
                    setIsEdit(true);
                    setShowForm(true);
                  }}
                >
                  <FaEdit size={14} /> Edit
                </button>

                <button
                  className="btn-danger"
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
        <div className="form-container animate-in zoom-in-95 duration-200">

          <h6 className="form-section-title uppercase tracking-tighter">
            {isEdit ? "Update ECT" : "Create ECT"}
          </h6>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            onSubmit={handleSubmit}
          >

            <div className="space-y-1.5">
              <label className="form-label">ECT Code</label>
              <input
                className={`form-input w-full ${isEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                value={formData.ect_code}
                disabled={isEdit}
                required
                onChange={e =>
                  setFormData({ ...formData, ect_code: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Patient Code</label>
              <select
                className="form-input w-full cursor-pointer appearance-none"
                value={formData.patient_code || ""}
                onChange={e =>
                  setFormData({ ...formData, patient_code: e.target.value })
                }
              >
                <option value="">Select Patient</option>
                {patients.map(p => (
                  <option key={p.patient_code} value={p.patient_code}>
                    {p.patient_code}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">ECT Date</label>
              <input
                type="date"
                className="form-input w-full"
                value={formData.ect_date || ""}
                onChange={e =>
                  setFormData({ ...formData, ect_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Anaesthesia</label>
              <input
                className="form-input w-full"
                value={formData.anaesthesia || ""}
                onChange={e =>
                  setFormData({ ...formData, anaesthesia: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Anaesthetist Name</label>
              <input
                className="form-input w-full"
                value={formData.anaesthetist_name || ""}
                onChange={e =>
                  setFormData({ ...formData, anaesthetist_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Duration (sec)</label>
              <input
                type="number"
                className="form-input w-full"
                value={formData.duration_seconds || ""}
                onChange={e =>
                  setFormData({ ...formData, duration_seconds: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Pulse Width (ms)</label>
              <input
                type="number"
                step="0.01"
                className="form-input w-full"
                value={formData.pulse_width_ms || ""}
                onChange={e =>
                  setFormData({ ...formData, pulse_width_ms: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Frequency (Hz)</label>
              <input
                type="number"
                step="0.01"
                className="form-input w-full"
                value={formData.frequency_hz || ""}
                onChange={e =>
                  setFormData({ ...formData, frequency_hz: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Joules</label>
              <input
                type="number"
                step="0.01"
                className="form-input w-full"
                value={formData.joules || ""}
                onChange={e =>
                  setFormData({ ...formData, joules: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Visit Type</label>
              <select
                className="form-input w-full cursor-pointer appearance-none"
                value={formData.visit_type || ""}
                onChange={e =>
                  setFormData({ ...formData, visit_type: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="IPD">IPD</option>
                <option value="OPD">OPD</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select
                className="form-input w-full cursor-pointer appearance-none"
                value={formData.status}
                onChange={e =>
                  setFormData({ ...formData, status: Number(e.target.value) })
                }
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="form-label">Result</label>
              <textarea
                rows={3}
                className="form-input w-full"
                value={formData.result || ""}
                onChange={e =>
                  setFormData({ ...formData, result: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="form-label">Remark</label>
              <textarea
                rows={3}
                className="form-input w-full"
                value={formData.remark || ""}
                onChange={e =>
                  setFormData({ ...formData, remark: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Sort Order</label>
              <input
                type="number"
                className="form-input w-full"
                value={formData.sort_order || ""}
                onChange={e =>
                  setFormData({ ...formData, sort_order: e.target.value })
                }
              />
            </div>

            <div
              className="md:col-span-2 flex justify-end gap-3 border-t pt-8 mt-4"
              style={{ borderColor: "var(--border-color)" }}
            >
              <button type="submit" className="btn-primary px-12 py-3">
                {isEdit ? "Update" : "Save"}
              </button>

              <button
                type="button"
                className="btn-ghost"
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
        <div className="data-table-container animate-in fade-in duration-500">

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
                <tr>
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">ECT Code</th>
                  <th className="text-admin-th">Patient</th>
                  <th className="text-admin-th">Date</th>
                  <th className="text-admin-th">Visit</th>
                  <th className="text-admin-th text-center">Status</th>
                </tr>
              </thead>

              <tbody
                className="divide-y"
                style={{ borderColor: "var(--border-color)" }}
              >
                {paginatedData.length > 0 ? (
                  (paginatedData || []).map(row => (
                    <tr
                      key={row.ect_code}
                      onClick={() =>
                        setSelectedRow(
                          selectedRow?.ect_code === row.ect_code
                            ? null
                            : row
                        )
                      }
                      className={`group cursor-pointer transition-colors ${
                        selectedRow?.ect_code === row.ect_code
                          ? "bg-emerald-500/10"
                          : "hover:bg-emerald-500/5"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div
                          className={`selection-indicator ${
                            selectedRow?.ect_code === row.ect_code
                              ? "selection-indicator-active"
                              : "group-hover:border-emerald-500/50"
                          }`}
                        >
                          {selectedRow?.ect_code === row.ect_code && (
                            <div className="selection-dot" />
                          )}
                        </div>
                      </td>

                      <td className="text-admin-td font-black">
                        {row.ect_code}
                      </td>

                      <td className="text-admin-td font-bold">
                        {row.patient_code?.patient_code ?? row.patient_code}
                      </td>

                      <td className="text-admin-td font-bold">
                        {row.ect_date}
                      </td>

                      <td className="text-admin-td font-bold">
                        {row.visit_type}
                      </td>

                      <td className="text-admin-td text-center">
                        <span
                          className={`badge ${
                            row.status === 1
                              ? "badge-success"
                              : "badge-danger"
                          }`}
                        >
                          {row.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-24 text-center">
                      <FaLightbulb
                        size={64}
                        className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse"
                      />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">
                        No ECT Records Found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-container">
            <Pagination
              totalEntries={filteredData.length}
              itemsPerPage={effectiveItemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </div>

        </div>
      )}

    </div>
  );
};

export default EctMst;