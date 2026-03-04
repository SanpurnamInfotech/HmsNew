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

const FollowUpMst = () => {

  const PATH = "follow-up";

  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success"
  });

  const [formData, setFormData] = useState({
    follow_up_code: "",
    appointment_code: "",
    patient_code: "",
    follow_up_date: "",
    next_follow_up_date: "",
    complaints: "",
    pulse: "",
    bp: "",
    temperature: "",
    hydration: "",
    rs: "",
    cvs: "",
    pa: "",
    sensory_system: "",
    duration_days: "",
    is_regular_followup: "",
    is_on_medication: "",
    present_status: "",
    advise: "",
    clinical_notes: "",
    sort_order: "",
    status: 1
  });

  const {
    search, setSearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    paginatedData,
    effectiveItemsPerPage,
    filteredData,
    totalPages
  } = useTable(data || []);

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      follow_up_code: "",
      appointment_code: "",
      patient_code: "",
      follow_up_date: "",
      next_follow_up_date: "",
      complaints: "",
      pulse: "",
      bp: "",
      temperature: "",
      hydration: "",
      rs: "",
      cvs: "",
      pa: "",
      sensory_system: "",
      duration_days: "",
      is_regular_followup: "",
      is_on_medication: "",
      present_status: "",
      advise: "",
      clinical_notes: "",
      sort_order: "",
      status: 1
    });
  };

  useEffect(() => {
    api.get("appointment/").then(res => setAppointments(res.data || []));
    api.get("patient/").then(res => setPatients(res.data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.follow_up_code}/`
      : `${PATH}/create/`;

    const payload = {
      ...formData,
      appointment_code: formData.appointment_code || null,
      patient_code: formData.patient_code || null
    };

    if (payload.sort_order === "" || payload.sort_order === null)
      delete payload.sort_order;

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Follow up ${isEdit ? "updated" : "created"} successfully`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;

    const result = await deleteItem(
      `${PATH}/delete/${selectedRow.follow_up_code}/`
    );

    if (result.success) {
      showModal("Follow up deleted successfully");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed", "error");
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

      {/* GLOBAL MODAL (ICD STYLE) */}
      {modal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">

            <div className="mb-4 flex justify-center">
              {modal.type === "success"
                ? <FaCheckCircle className="text-6xl text-emerald-500" />
                : <FaTimesCircle className="text-6xl text-rose-500" />
              }
            </div>

            <h3 className={`text-xl font-black mb-2 uppercase tracking-tight ${
              modal.type === "success" ? "text-emerald-500" : "text-rose-500"
            }`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>

            <p className="mb-6 font-medium opacity-80">{modal.message}</p>

            <button
              className="btn-primary w-full justify-center py-3"
              onClick={() => setModal({ ...modal, visible: false })}
            >
              Continue
            </button>

          </div>
        </div>
      )}

      {/* HEADER (ICD STYLE) */}
      <div className="section-header">
        <h4 className="page-title">Follow Up Master</h4>

        {!showForm && (
          <div className="flex items-center gap-2">

            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14}/> Add New
            </button>

            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">

                <button
                  className="btn-warning"
                  onClick={() => {

                    setFormData({
                      ...selectedRow,
                      appointment_code:
                        selectedRow.appointment_code?.appointment_code ?? selectedRow.appointment_code,
                      patient_code:
                        selectedRow.patient_code?.patient_code ?? selectedRow.patient_code
                    });

                    setIsEdit(true);
                    setShowForm(true);
                  }}
                >
                  <FaEdit size={14}/> Edit
                </button>

                <button className="btn-danger" onClick={handleDelete}>
                  <FaTrash size={14}/> Delete
                </button>

              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM (ICD MOOD) */}
      {showForm && (

        <div className="form-container animate-in zoom-in-95 duration-200">

          <h6 className="form-section-title uppercase tracking-tighter">
            {isEdit ? "Update Follow Up" : "Create Follow Up"}
          </h6>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            onSubmit={handleSubmit}
          >

            {/* Follow up code */}
            <div className="space-y-1.5">
              <label className="form-label">Follow Up Code</label>
              <input
                className={`form-input w-full ${isEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                value={formData.follow_up_code}
                disabled={isEdit}
                required
                onChange={e =>
                  setFormData({ ...formData, follow_up_code: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Appointment Code</label>
              <select
                className="form-input w-full"
                value={formData.appointment_code}
                onChange={e =>
                  setFormData({ ...formData, appointment_code: e.target.value })
                }
              >
                <option value="">Select Appointment</option>
                {appointments.map(a => (
                  <option key={a.appointment_code} value={a.appointment_code}>
                    {a.appointment_code}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Patient Code</label>
              <select
                className="form-input w-full"
                value={formData.patient_code}
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
              <label className="form-label">Follow Up Date</label>
              <input
                type="date"
                className="form-input w-full"
                value={formData.follow_up_date || ""}
                onChange={e =>
                  setFormData({ ...formData, follow_up_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Next Follow Up Date</label>
              <input
                type="date"
                className="form-input w-full"
                value={formData.next_follow_up_date || ""}
                onChange={e =>
                  setFormData({ ...formData, next_follow_up_date: e.target.value })
                }
              />
            </div>

            {/* TEXTAREA */}
            {[
              ["Complaints", "complaints"],
              ["Advise", "advise"],
              ["Clinical Notes", "clinical_notes"]
            ].map(([label, key]) => (
              <div key={key} className="space-y-1.5 md:col-span-2">
                <label className="form-label">{label}</label>
                <textarea
                  rows="3"
                  className="form-input w-full"
                  value={formData[key] || ""}
                  onChange={e =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                />
              </div>
            ))}

            {[
              ["Pulse", "pulse"],
              ["BP", "bp"],
              ["Temperature", "temperature"],
              ["Hydration", "hydration"],
              ["RS", "rs"],
              ["CVS", "cvs"],
              ["PA", "pa"],
              ["Sensory System", "sensory_system"],
              ["Is Regular Followup", "is_regular_followup"],
              ["Is On Medication", "is_on_medication"],
              ["Present Status", "present_status"]
            ].map(([label, key]) => (
              <div key={key} className="space-y-1.5">
                <label className="form-label">{label}</label>
                <input
                  className="form-input w-full"
                  value={formData[key] || ""}
                  onChange={e =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="form-label">Duration (days)</label>
              <input
                type="number"
                className="form-input w-full"
                value={formData.duration_days || ""}
                onChange={e =>
                  setFormData({ ...formData, duration_days: e.target.value })
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

            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select
                className="form-input w-full"
                value={formData.status}
                onChange={e =>
                  setFormData({ ...formData, status: Number(e.target.value) })
                }
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
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

      {/* TABLE (ICD MOOD) */}
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
                  <th className="text-admin-th">Code</th>
                  <th className="text-admin-th">Patient</th>
                  <th className="text-admin-th">Follow Date</th>
                  <th className="text-admin-th text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>

                {paginatedData.length > 0 ? (

                  paginatedData.map(row => (

                    <tr
                      key={row.follow_up_code}
                      onClick={() =>
                        setSelectedRow(
                          selectedRow?.follow_up_code === row.follow_up_code
                            ? null
                            : row
                        )
                      }
                      className={`group cursor-pointer transition-colors ${
                        selectedRow?.follow_up_code === row.follow_up_code
                          ? "bg-emerald-500/10"
                          : "hover:bg-emerald-500/5"
                      }`}
                    >

                      <td className="px-6 py-4">
                        <div
                          className={`selection-indicator ${
                            selectedRow?.follow_up_code === row.follow_up_code
                              ? "selection-indicator-active"
                              : "group-hover:border-emerald-500/50"
                          }`}
                        >
                          {selectedRow?.follow_up_code === row.follow_up_code &&
                            <div className="selection-dot" />}
                        </div>
                      </td>

                      <td className="text-admin-td font-black">
                        {row.follow_up_code}
                      </td>

                      <td className="text-admin-td font-bold">
                        {row.patient_code?.patient_code ?? row.patient_code}
                      </td>

                      <td className="text-admin-td">
                        {row.follow_up_date}
                      </td>

                      <td className="text-admin-td text-center">
                        <span className={`badge ${
                          row.status === 1 ? "badge-success" : "badge-danger"
                        }`}>
                          {row.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                      <FaLightbulb
                        size={64}
                        className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse"
                      />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">
                        No Follow Up Records Found
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

export default FollowUpMst;