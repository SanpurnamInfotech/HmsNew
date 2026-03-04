import { useEffect } from "react";
import api from "../../utils/domain";
import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const AppointmentMst = () => {

  /* ================= DATA FETCHING ================= */
  const PATH = "appointment";
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  /* ================= UI STATES ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    appointment_code: "",
    patient_code: "",
    doctor_code: "",
    appointment_type_code: "",
    hospital_code: "",
    appointment_date: "",
    appointment_renew_date: "",
    mobile: "",
    weight_kg: "",
    informant: "",
    appointment_fee: "",
    registration_fee: "",
    sort_order: "",
    status: 1,
  });

    const [modal, setModal] = useState({ message: "", visible: false, type: "success" });
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointmentTypes, setAppointmentTypes] = useState([]);

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

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      appointment_code: "",
      patient_code: "",
      doctor_code: "",
      appointment_type_code: "",
      hospital_code: "",
      appointment_date: "",
      appointment_renew_date: "",
      mobile: "",
      weight_kg: "",
      informant: "",
      appointment_fee: "",
      registration_fee: "",
      sort_order: "",
      status: 1,
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });


  useEffect(() => {
  api.get("patient/").then(res => setPatients(res.data || []));
  api.get("doctors/").then(res => setDoctors(res.data || []));
  api.get("appointment-type-master/").then(res => setAppointmentTypes(res.data || []));
}, []);

  /* ================= CRUD ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.appointment_code}/`
      : `${PATH}/create/`;

    const payload = {
  ...formData,
  patient_code: formData.patient_code || null,
  doctor_code: formData.doctor_code || null,
  appointment_type_code: formData.appointment_type_code || null,
};

    if (payload.sort_order === "" || payload.sort_order === null)
      delete payload.sort_order;

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Appointment ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;

    const result = await deleteItem(
      `${PATH}/delete/${selectedRow.appointment_code}/`
    );

    if (result.success) {
      showModal("Appointment deleted successfully!");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner-container text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-emerald-700 font-bold">Loading Appointments...</p>
      </div>
    </div>
  );

  return (
    <div className="app-container">

      {/* MODAL */}
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-body text-center">
              <div className="modal-icon-container mb-4">
                {modal.type === "success" ? (
                  <FaCheckCircle className="text-4xl text-emerald-500 mx-auto" />
                ) : (
                  <FaTimesCircle className="text-4xl text-red-500 mx-auto" />
                )}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${modal.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
                {modal.type === "success" ? "Success" : "Error"}
              </h3>
              <p className="text-gray-600 mb-6">{modal.message}</p>
              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2.5 rounded-lg font-semibold"
                onClick={() => setModal({ ...modal, visible: false })}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <h4 className="text-2xl font-black text-gray-800 tracking-tight">
          Appointment Master
        </h4>

        {!showForm && (
          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedRow && (
              <>
                <button
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold"
                  onClick={() => {
                    setFormData({
                      ...selectedRow,
                      patient_code: selectedRow.patient_code?.patient_code ?? selectedRow.patient_code,
                      doctor_code: selectedRow.doctor_code?.doctor_code ?? selectedRow.doctor_code,
                      appointment_type_code:
                        selectedRow.appointment_type_code?.appointment_type_code ??
                        selectedRow.appointment_type_code,
                    });
                    setIsEdit(true);
                    setShowForm(true);
                  }}
                >
                  <FaEdit size={14} /> Edit
                </button>

                <button
                  className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold"
                  onClick={handleDelete}
                >
                  <FaTrash size={14} /> Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* FORM (ICD page style) */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 animate-in zoom-in-95 duration-200">
          <h6 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
            {isEdit ? "Update Appointment" : "Create Appointment"}
          </h6>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>

            {[
              ["Appointment Code", "appointment_code", isEdit],
            //   ["Patient Code", "patient_code"],
            //   ["Doctor Code", "doctor_code"],
            //   ["Appointment Type Code", "appointment_type_code"],
              ["Hospital Code", "hospital_code"],
              
            ].map(([label, key, disabled]) => (
              <div className="space-y-1.5" key={key}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                  {label}
                </label>
                <input
                  className={`w-full px-4 py-3 rounded-lg border border-gray-200 ${disabled ? "bg-gray-50 text-gray-400" : ""}`}
                  value={formData[key]}
                  disabled={disabled}
                  required={key === "appointment_code"}
                  onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="space-y-1.5">
  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
    Patient Code
  </label>

  <select
    className="w-full px-4 py-3 rounded-lg border border-gray-200"
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
  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
    Doctor Code
  </label>

  <select
    className="w-full px-4 py-3 rounded-lg border border-gray-200"
    value={formData.doctor_code}
    onChange={e =>
      setFormData({ ...formData, doctor_code: e.target.value })
    }
  >
    <option value="">Select Doctor</option>
    {doctors.map(d => (
      <option key={d.doctor_code} value={d.doctor_code}>
        {d.doctor_code}
      </option>
    ))}
  </select>
</div>
<div className="space-y-1.5">
  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
    Appointment Type Code
  </label>

  <select
    className="w-full px-4 py-3 rounded-lg border border-gray-200"
    value={formData.appointment_type_code}
    onChange={e =>
      setFormData({
        ...formData,
        appointment_type_code: e.target.value
      })
    }
  >
    <option value="">Select Appointment Type</option>
    {appointmentTypes.map(a => (
      <option
        key={a.appointment_type_code}
        value={a.appointment_type_code}
      >
        {a.appointment_type_code}
      </option>
    ))}
  </select>
</div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Appointment Date</label>
              <input type="date" className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.appointment_date || ""}
                onChange={e => setFormData({ ...formData, appointment_date: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Renew Date</label>
              <input type="date" className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.appointment_renew_date || ""}
                onChange={e => setFormData({ ...formData, appointment_renew_date: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Mobile</label>
              <input className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.mobile || ""}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Weight (Kg)</label>
              <input type="number" className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.weight_kg || ""}
                onChange={e => setFormData({ ...formData, weight_kg: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Informant</label>
              <input className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.informant || ""}
                onChange={e => setFormData({ ...formData, informant: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Appointment Fee</label>
              <input type="number" className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.appointment_fee || ""}
                onChange={e => setFormData({ ...formData, appointment_fee: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Registration Fee</label>
              <input type="number" className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.registration_fee || ""}
                onChange={e => setFormData({ ...formData, registration_fee: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Sort Order</label>
              <input type="number" className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.sort_order || ""}
                onChange={e => setFormData({ ...formData, sort_order: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Status</label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-6">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-2.5 rounded-lg font-bold">
                {isEdit ? "Update" : "Save"}
              </button>
              <button type="button" className="px-6 py-2.5 text-sm font-bold text-gray-400" onClick={resetForm}>
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TABLE (same ICD style) */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">

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
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 w-16"></th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Code</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Doctor</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {(paginatedData || []).map(row => (
                  <tr
                    key={row.appointment_code}
                    onClick={() =>
                      setSelectedRow(
                        selectedRow?.appointment_code === row.appointment_code
                          ? null
                          : row
                      )
                    }
                    className={`group cursor-pointer transition-colors duration-150 ${
                      selectedRow?.appointment_code === row.appointment_code
                        ? "bg-emerald-50/40"
                        : "hover:bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedRow?.appointment_code === row.appointment_code
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-gray-200"
                      }`}>
                        {selectedRow?.appointment_code === row.appointment_code && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-black text-gray-800 text-sm">
                      {row.appointment_code}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {row.patient_code?.patient_code ?? row.patient_code}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {row.doctor_code?.doctor_code ?? row.doctor_code}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {row.appointment_date}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        row.status === 1
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}>
                        {row.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          <div className="bg-white border-t border-gray-50 p-6">
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

export default AppointmentMst;