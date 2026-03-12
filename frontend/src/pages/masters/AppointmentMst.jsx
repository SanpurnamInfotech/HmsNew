import React, { useState, useEffect, useMemo } from "react";
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
  FaLightbulb,
  FaSearch,
  FaChevronDown
} from "react-icons/fa";

const AppointmentMst = () => {

  const PATH = "appointment";
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

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
  const [hospitals, setHospitals] = useState([]); 
  const [hospitalSearch, setHospitalSearch] = useState("");

  /* ---------- search dropdown states ---------- */
  const [openDropdown, setOpenDropdown] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [apptTypeSearch, setApptTypeSearch] = useState("");

  const {
    search, setSearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    paginatedData,
    effectiveItemsPerPage,
    filteredData,
    totalPages
  } = useTable(data || []);

  useEffect(() => {
    api.get("patient/").then(r => setPatients(r.data || []));
    api.get("doctor/").then(r => setDoctors(r.data || []));
    api.get("appointment-type-master/").then(r => setAppointmentTypes(r.data || []));
    api.get("hospital/").then(r => setHospitals(r.data || []));
  }, []);

  /* ---------- filtered lists ---------- */
  const filteredPatients = useMemo(() => {
    return patients.filter(p =>
      p.patient_code
        ?.toLowerCase()
        .includes(patientSearch.toLowerCase())
    );
  }, [patients, patientSearch]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(d =>
      d.doctor_code
        ?.toLowerCase()
        .includes(doctorSearch.toLowerCase())
    );
  }, [doctors, doctorSearch]);

  const filteredAppointmentTypes = useMemo(() => {
    return appointmentTypes.filter(a =>
      a.appointment_type_code
        ?.toLowerCase()
        .includes(apptTypeSearch.toLowerCase())
    );
  }, [appointmentTypes, apptTypeSearch]);

  const filteredHospitals = useMemo(() => {
  return hospitals.filter(h =>
    h.hospital_code
      ?.toLowerCase()
      .includes(hospitalSearch.toLowerCase())
  );
}, [hospitals, hospitalSearch]);

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setOpenDropdown(null);
    setPatientSearch("");
    setDoctorSearch("");
    setApptTypeSearch("");
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

  /* appointment_code backend generate karnaar */
  if (!isEdit) {
    delete payload.appointment_code;
  }

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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );

  return (
    <div className="app-container">

      {/* MODAL */}
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

      {/* HEADER */}
      <div className="section-header">
        <h4 className="page-title">Appointment Master</h4>

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
                      patient_code:
                        selectedRow.patient_code?.patient_code ?? selectedRow.patient_code,
                      doctor_code:
                        selectedRow.doctor_code?.doctor_code ?? selectedRow.doctor_code,
                      appointment_type_code:
                        selectedRow.appointment_type_code?.appointment_type_code ??
                        selectedRow.appointment_type_code,
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

      {/* FORM */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">

          <h6 className="form-section-title uppercase tracking-tighter">
            {isEdit ? "Update Appointment" : "Create Appointment"}
          </h6>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            onSubmit={handleSubmit}
          >

            {/* Appointment code */}
            <div className="space-y-1.5">
              <label className="form-label">Appointment Code</label>
              <input
  className="form-input w-full opacity-50 cursor-not-allowed"
  value={formData.appointment_code || "Auto Generated"}
  disabled
/>
            </div>

            <div className="space-y-1.5 relative">
  <label className="form-label">Hospital Code</label>

  <div
    className="form-input w-full flex justify-between items-center cursor-pointer"
    onClick={() =>
      setOpenDropdown(openDropdown === "hospital" ? null : "hospital")
    }
  >
    <span className={formData.hospital_code ? "" : "opacity-50"}>
      {formData.hospital_code || "Select Hospital"}
    </span>
    <FaChevronDown size={12} className="opacity-50" />
  </div>

  {openDropdown === "hospital" && (
    <div
      className="absolute z-[60] w-full mt-2 rounded-xl shadow-2xl border overflow-hidden"
      style={{
        backgroundColor: "var(--input-bg)",
        borderColor: "var(--border-color)",
      }}
    >
      <div
        className="p-3 border-b flex items-center gap-2"
        style={{ borderColor: "var(--border-color)" }}
      >
        <FaSearch size={14} className="opacity-40" />
        <input
          autoFocus
          className="bg-transparent outline-none text-sm w-full"
          placeholder="Search hospital..."
          value={hospitalSearch}
          onChange={e => setHospitalSearch(e.target.value)}
        />
      </div>

      <div className="max-h-48 overflow-y-auto custom-scrollbar">
        {filteredHospitals.map(h => (
          <div
            key={h.hospital_code}
            className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm"
            onClick={() => {
              setFormData({
                ...formData,
                hospital_code: h.hospital_code
              });
              setOpenDropdown(null);
              setHospitalSearch("");
            }}
          >
            {h.hospital_code}
          </div>
        ))}
      </div>
    </div>
  )}
</div>
            {/* ---------------- Patient dropdown ---------------- */}
            <div className="space-y-1.5 relative">
              <label className="form-label">Patient Code</label>

              <div
                className="form-input w-full flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setOpenDropdown(openDropdown === "patient" ? null : "patient")
                }
              >
                <span className={formData.patient_code ? "" : "opacity-50"}>
                  {formData.patient_code || "Select Patient"}
                </span>
                <FaChevronDown size={12} className="opacity-50" />
              </div>

              {openDropdown === "patient" && (
                <div
                  className="absolute z-[60] w-full mt-2 rounded-xl shadow-2xl border overflow-hidden"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div
                    className="p-3 border-b flex items-center gap-2"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <FaSearch size={14} className="opacity-40" />
                    <input
                      autoFocus
                      className="bg-transparent outline-none text-sm w-full"
                      placeholder="Search patient..."
                      value={patientSearch}
                      onChange={e => setPatientSearch(e.target.value)}
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredPatients.map(p => (
                      <div
                        key={p.patient_code}
                        className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm"
                        onClick={() => {
                          setFormData({ ...formData, patient_code: p.patient_code });
                          setOpenDropdown(null);
                          setPatientSearch("");
                        }}
                      >
                        {p.patient_code}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ---------------- Doctor dropdown ---------------- */}
            <div className="space-y-1.5 relative">
              <label className="form-label">Doctor Code</label>

              <div
                className="form-input w-full flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setOpenDropdown(openDropdown === "doctor" ? null : "doctor")
                }
              >
                <span className={formData.doctor_code ? "" : "opacity-50"}>
                  {formData.doctor_code || "Select Doctor"}
                </span>
                <FaChevronDown size={12} className="opacity-50" />
              </div>

              {openDropdown === "doctor" && (
                <div
                  className="absolute z-[60] w-full mt-2 rounded-xl shadow-2xl border overflow-hidden"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div
                    className="p-3 border-b flex items-center gap-2"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <FaSearch size={14} className="opacity-40" />
                    <input
                      autoFocus
                      className="bg-transparent outline-none text-sm w-full"
                      placeholder="Search doctor..."
                      value={doctorSearch}
                      onChange={e => setDoctorSearch(e.target.value)}
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredDoctors.map(d => (
                      <div
                        key={d.doctor_code}
                        className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm"
                        onClick={() => {
                          setFormData({ ...formData, doctor_code: d.doctor_code });
                          setOpenDropdown(null);
                          setDoctorSearch("");
                        }}
                      >
                        {d.doctor_code}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ---------------- Appointment type dropdown ---------------- */}
            <div className="space-y-1.5 relative">
              <label className="form-label">Appointment Type</label>

              <div
                className="form-input w-full flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setOpenDropdown(openDropdown === "apptType" ? null : "apptType")
                }
              >
                <span className={formData.appointment_type_code ? "" : "opacity-50"}>
                  {formData.appointment_type_code || "Select Appointment Type"}
                </span>
                <FaChevronDown size={12} className="opacity-50" />
              </div>

              {openDropdown === "apptType" && (
                <div
                  className="absolute z-[60] w-full mt-2 rounded-xl shadow-2xl border overflow-hidden"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div
                    className="p-3 border-b flex items-center gap-2"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <FaSearch size={14} className="opacity-40" />
                    <input
                      autoFocus
                      className="bg-transparent outline-none text-sm w-full"
                      placeholder="Search appointment type..."
                      value={apptTypeSearch}
                      onChange={e => setApptTypeSearch(e.target.value)}
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredAppointmentTypes.map(a => (
                      <div
                        key={a.appointment_type_code}
                        className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            appointment_type_code: a.appointment_type_code
                          });
                          setOpenDropdown(null);
                          setApptTypeSearch("");
                        }}
                      >
                        {a.appointment_type_code}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Appointment Date</label>
              <input
                type="date"
                className="form-input w-full"
                value={formData.appointment_date || ""}
                onChange={e =>
                  setFormData({ ...formData, appointment_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Renew Date</label>
              <input
                type="date"
                className="form-input w-full"
                value={formData.appointment_renew_date || ""}
                onChange={e =>
                  setFormData({ ...formData, appointment_renew_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Mobile</label>
              <input
                className="form-input w-full"
                value={formData.mobile || ""}
                onChange={e =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Weight (Kg)</label>
              <input
                type="number"
                className="form-input w-full"
                value={formData.weight_kg || ""}
                onChange={e =>
                  setFormData({ ...formData, weight_kg: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Informant</label>
              <input
                className="form-input w-full"
                value={formData.informant || ""}
                onChange={e =>
                  setFormData({ ...formData, informant: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Appointment Fee</label>
              <input
                type="number"
                className="form-input w-full"
                value={formData.appointment_fee || ""}
                onChange={e =>
                  setFormData({ ...formData, appointment_fee: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Registration Fee</label>
              <input
                type="number"
                className="form-input w-full"
                value={formData.registration_fee || ""}
                onChange={e =>
                  setFormData({ ...formData, registration_fee: e.target.value })
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
              <button type="button" className="btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TABLE */}
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
                  <th className="text-admin-th">Doctor</th>
                  <th className="text-admin-th">Date</th>
                  <th className="text-admin-th text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map(row => (
                    <tr
                      key={row.appointment_code}
                      onClick={() =>
                        setSelectedRow(
                          selectedRow?.appointment_code === row.appointment_code
                            ? null
                            : row
                        )
                      }
                      className={`group cursor-pointer transition-colors ${
                        selectedRow?.appointment_code === row.appointment_code
                          ? "bg-emerald-500/10"
                          : "hover:bg-emerald-500/5"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div
                          className={`selection-indicator ${
                            selectedRow?.appointment_code === row.appointment_code
                              ? "selection-indicator-active"
                              : "group-hover:border-emerald-500/50"
                          }`}
                        >
                          {selectedRow?.appointment_code === row.appointment_code &&
                            <div className="selection-dot" />}
                        </div>
                      </td>

                      <td className="text-admin-td font-black">
                        {row.appointment_code}
                      </td>

                      <td className="text-admin-td font-bold">
                        {row.patient_code?.patient_code ?? row.patient_code}
                      </td>

                      <td className="text-admin-td font-bold">
                        {row.doctor_code?.doctor_code ?? row.doctor_code}
                      </td>

                      <td className="text-admin-td">
                        {row.appointment_date}
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
                    <td colSpan="6" className="px-6 py-24 text-center">
                      <FaLightbulb
                        size={64}
                        className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse"
                      />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">
                        No Appointment Records Found
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

export default AppointmentMst;