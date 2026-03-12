import React, { useState, useEffect } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import SearchableSelect from "../../components/common/SearchableSelect";

const DischargeSummary = () => {

  const PATH = "discharge-summary";

  /* -------- API -------- */
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);
  const { data: patients } = useCrud("patient/");
  const { data: doctors } = useCrud("doctor/");
  const { data: appointments } = useCrud("appointment/");

  const patientList = patients?.results || patients || [];
  const doctorList = doctors?.results || doctors || [];
  const appointmentList = appointments?.results || appointments || [];

  /* -------- STATE -------- */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

  const initialForm = {
    discharge_summary_code: "",
    patient_code: "",
    doctor_code: "",
    appointment_code: "",
    summary_date: "",
    age_at_discharge: "",
    gender: "",
    address_snapshot: "",
    admission_date: "",
    discharge_date: "",
    visit_type: "",
    complaints: "",
    mse: "",
    investigations: "",
    diagnosis: "",
    treatment_given: "",
    advice_on_discharge: "",
    next_visit_date: "",
    status: 1
  };

  const [formData, setFormData] = useState(initialForm);

  /* -------- TABLE -------- */
  const {
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    paginatedData,
    filteredData,
    totalPages
  } = useTable(data || []);

  /* -------- RESET -------- */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData(initialForm);
  };

  /* -------- MODAL -------- */
  const showModal = (message, type = "success") => {
    setModal({ visible: true, message, type });
  };

  /* -------- AUTO GENERATE CODE -------- */
  const generateDischargeCode = () => {
    const last = data?.length ? data[data.length - 1].discharge_summary_code : null;
    let newNumber = 1;
    if (last) {
      const lastNumber = parseInt(last.replace("DS", "")) || 0;
      newNumber = lastNumber + 1;
    }
    return `DS${newNumber.toString().padStart(4, "0")}`;
  };

  useEffect(() => {
    if (!isEdit) {
      setFormData(prev => ({ ...prev, discharge_summary_code: generateDischargeCode() }));
    }
  }, [showForm, data, isEdit]);

  /* -------- SUBMIT -------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("FORM SUBMIT TRIGGERED", formData); 

    const actionPath = isEdit
      ? `${PATH}/update/${formData.discharge_summary_code}/`
      : `${PATH}/create/`;

    const result = isEdit
      ? await updateItem(actionPath, formData)
      : await createItem(actionPath, formData);

    if (result.success) {
      showModal(`Discharge Summary ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Failed to save", "error");
    }
  };

  /* -------- DELETE -------- */
  const handleDelete = async () => {
    if (!selectedRow) return showModal("Select record", "error");
    if (window.confirm("Delete this discharge summary?")) {
      const result = await deleteItem(`${PATH}/delete/${selectedRow.discharge_summary_code}/`);
      if (result.success) {
        showModal("Deleted!");
        refresh();
        setSelectedRow(null);
      }
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-emerald-600">Loading...</div>;

  return (
    <div className="app-container">

      {/* MODAL */}
      {modal.visible && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center shadow-2xl">
            <div className="mb-4 flex justify-center">
              {modal.type === "success"
                ? <FaCheckCircle className="text-6xl text-emerald-500" />
                : <FaTimesCircle className="text-6xl text-rose-500" />}
            </div>
            <h3 className={`text-xl font-black mb-2 ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            <p className="mb-6">{modal.message}</p>
            <button
              className="btn-primary w-full"
              onClick={() => setModal({ ...modal, visible: false })}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <h4 className="text-2xl font-black text-gray-800">Discharge Summary</h4>
        <div className="flex gap-2">
          {!showForm ? (
            <>
              <button
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                onClick={() => setShowForm(true)}
              >
                <FaPlus size={12} /> Add Summary
              </button>
              {selectedRow && (
                <>
                  <button
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                    onClick={() => {
                      setFormData(selectedRow);
                      setIsEdit(true);
                      setShowForm(true);
                    }}
                  >
                    <FaEdit size={12} /> Edit
                  </button>
                  <button
                    className="bg-rose-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                    onClick={handleDelete}
                  >
                    <FaTrash size={12} /> Delete
                  </button>
                </>
              )}
            </>
          ) : (
            <button className="text-gray-500 font-bold" onClick={resetForm}>Back to List</button>
          )}
        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-8 mb-8 border">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Discharge Code */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Discharge Code *</label>
              <input
                className="w-full px-3 py-2 rounded border"
                value={formData.discharge_summary_code}
                onChange={e => setFormData({ ...formData, discharge_summary_code: e.target.value })}
                required
                readOnly
              />
            </div>

            {/* Patient */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Patient *</label>
              <SearchableSelect
                placeholder="Select Patient"
                required
                value={formData.patient_code}
                onChange={v => setFormData({ ...formData, patient_code: v })}
                options={patientList.map(p => ({
  value: p.patient_code,
  label: `${p.patient_first_name} ${p.patient_last_name} (${p.patient_code})`
}))}
              />
            </div>

            {/* Doctor */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Doctor *</label>
              <SearchableSelect
                placeholder="Select Doctor"
                required
                value={formData.doctor_code}
                onChange={v => setFormData({ ...formData, doctor_code: v })}
                options={doctorList.map(d => ({
                  key: d.doctor_code,
                  value: d.doctor_code,
                  label: `${d.doctor_name} (${d.doctor_code})`
                }))}
              />
            </div>

            {/* Appointment */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Appointment *</label>
              <SearchableSelect
                placeholder="Select Appointment"
                required
                value={formData.appointment_code}
                onChange={v => setFormData({ ...formData, appointment_code: v })}
                options={appointmentList.map(a => ({
                  key: a.appointment_code,
                  value: a.appointment_code,
                  label: `${a.appointment_code} - ${a.patient_name}`
                }))}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Gender</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* All other fields */}
            <input type="date" placeholder="Summary Date" value={formData.summary_date} onChange={e => setFormData({ ...formData, summary_date: e.target.value })} className="px-3 py-2 border rounded" />
            <input type="number" placeholder="Age at Discharge" value={formData.age_at_discharge} onChange={e => setFormData({ ...formData, age_at_discharge: e.target.value })} className="px-3 py-2 border rounded" />
            <input type="text" placeholder="Address Snapshot" value={formData.address_snapshot} onChange={e => setFormData({ ...formData, address_snapshot: e.target.value })} className="px-3 py-2 border rounded" />
            <input type="date" placeholder="Admission Date" value={formData.admission_date} onChange={e => setFormData({ ...formData, admission_date: e.target.value })} className="px-3 py-2 border rounded" />
            <input type="date" placeholder="Discharge Date" value={formData.discharge_date} onChange={e => setFormData({ ...formData, discharge_date: e.target.value })} className="px-3 py-2 border rounded" />
            <input type="text" placeholder="Visit Type" value={formData.visit_type} onChange={e => setFormData({ ...formData, visit_type: e.target.value })} className="px-3 py-2 border rounded" />
            <textarea placeholder="Complaints" className="col-span-3 px-3 py-2 border rounded" value={formData.complaints} onChange={e => setFormData({ ...formData, complaints: e.target.value })} />
            <textarea placeholder="MSE" className="col-span-3 px-3 py-2 border rounded" value={formData.mse} onChange={e => setFormData({ ...formData, mse: e.target.value })} />
            <textarea placeholder="Investigations" className="col-span-3 px-3 py-2 border rounded" value={formData.investigations} onChange={e => setFormData({ ...formData, investigations: e.target.value })} />
            <textarea placeholder="Diagnosis" className="col-span-3 px-3 py-2 border rounded" value={formData.diagnosis} onChange={e => setFormData({ ...formData, diagnosis: e.target.value })} />
            <textarea placeholder="Treatment Given" className="col-span-3 px-3 py-2 border rounded" value={formData.treatment_given} onChange={e => setFormData({ ...formData, treatment_given: e.target.value })} />
            <textarea placeholder="Advice on Discharge" className="col-span-3 px-3 py-2 border rounded" value={formData.advice_on_discharge} onChange={e => setFormData({ ...formData, advice_on_discharge: e.target.value })} />
            <input type="date" placeholder="Next Visit Date" value={formData.next_visit_date} onChange={e => setFormData({ ...formData, next_visit_date: e.target.value })} className="px-3 py-2 border rounded" />

            {/* Status */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="col-span-3 flex justify-end gap-3 pt-4 border-t">
              <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-emerald-600 text-white px-10 py-2.5 rounded-lg font-bold">
                  Save Summary
                </button>
              <button type="button" className="text-gray-400 font-bold px-4" onClick={resetForm}>Cancel</button>
            </div>

          </form>
        </div>
      )}

      {/* TABLE */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

          <TableToolbar
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            search={search}
            setSearch={setSearch}
            setCurrentPage={setCurrentPage}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 w-12"></th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Discharge Code</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Patient</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Doctor</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Summary Date</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedData.map(row => (
                  <tr
                    key={row.discharge_summary_code}
                    onClick={() => setSelectedRow(selectedRow?.discharge_summary_code === row.discharge_summary_code ? null : row)}
                    className={`cursor-pointer ${selectedRow?.discharge_summary_code === row.discharge_summary_code ? "bg-emerald-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="p-4 text-center">
                      <div className={`w-4 h-4 rounded-full border-2 ${selectedRow?.discharge_summary_code === row.discharge_summary_code ? "border-emerald-500 bg-emerald-500" : "border-gray-200"}`} />
                    </td>
                    <td className="p-4 text-sm font-bold">{row.discharge_summary_code}</td>
                    <td className="p-4 text-sm text-gray-500">{row.patient_code}</td>
                    <td className="p-4 text-sm text-gray-500">{row.doctor_code}</td>
                    <td className="p-4 text-sm text-gray-500">{row.summary_date}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${row.status === 1 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {row.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t">
            <Pagination
              totalEntries={filteredData.length}
              itemsPerPage={itemsPerPage}
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

export default DischargeSummary;