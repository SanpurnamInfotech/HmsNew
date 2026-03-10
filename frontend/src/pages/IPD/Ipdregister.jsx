import React, { useEffect, useState } from "react";
import api from "../../utils/domain"; // ✅ SAME axios instance as Activities
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
  FaLightbulb,
} from "react-icons/fa";

/*
========================================================
 IPD Registration
 Django analogy:
 - useCrud        → CBV CRUD views
 - formData       → Django Form.cleaned_data
 - useEffect      → get_queryset / initial data load
========================================================
*/

const IpdRegistration = () => {
  /* ================= CRUD ================= */
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud("ipd-registration/");

  /* ================= MASTER DATA ================= */
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    patient_code: "",
    doctor_code: "",
    bed_id: "",
    admission_date: "",
    discharge_date: null,
    remarks: "",
    status: "ADMITTED",
  });

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success",
  });

  /* ================= TABLE UTILS ================= */
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
  } = useTable(data);

  /* ==================================================
     LOAD DROPDOWNS
     IMPORTANT:
     We use axios `api`, NOT fetch
     (same as Activities page)
     ================================================== */
  useEffect(() => {
    const fetchMasters = async () => {
        try {
        const [patientRes, doctorRes, bedRes] = await Promise.all([
            api.get("patients/"),
            api.get("doctor/"),
            api.get("bed/"),
        ]);

        console.log("PATIENTS:", patientRes.data);
        console.log("DOCTORS:", doctorRes.data);
        console.log("BEDS:", bedRes.data);

        setPatients(Array.isArray(patientRes.data) ? patientRes.data : []);
        setDoctors(Array.isArray(doctorRes.data) ? doctorRes.data : []);
        setBeds(Array.isArray(bedRes.data) ? bedRes.data : []);
        } catch (error) {
        console.error("MASTER FETCH ERROR:", error);
        }
    };
    fetchMasters();
    }, []);
    // ================= LOOKUP MAPS =================
    const patientMap = patients.reduce((acc, p) => {
    acc[p.patient_code] = `${p.patient_first_name} ${
        p.patient_middle_name ?? ""
    } ${p.patient_last_name}`;
    return acc;
    }, {});

    const doctorMap = doctors.reduce((acc, d) => {
    acc[d.doctor_code] = d.doctor_name;
    return acc;
    }, {});

    const bedMap = beds.reduce((acc, b) => {
    acc[b.bed_code] = b.bed_name;
    return acc;
    }, {});

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      patient_code: "",
      doctor_code: "",
      bed_id: "",
      admission_date: "",
      discharge_date: null,
      remarks: "",
      status: "ADMITTED",
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  /* ================= SAVE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("SUBMITTING IPD FORM:", formData);

    const result = isEdit
      ? await updateItem(
          `ipd-registration/update/${selectedRow.ipd_registeration_code}/`,
          formData
        )
      : await createItem("ipd-registration/create/", formData);

    if (result.success) {
      showModal(`IPD ${isEdit ? "updated" : "registered"} successfully`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedRow) {
      showModal("Please select a record first", "error");
      return;
    }

    const result = await deleteItem(
      `ipd-registration/delete/${selectedRow.ipd_registeration_code}/`
    );

    if (result.success) {
      showModal("IPD Registration deleted");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed", "error");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading IPD Registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* ================= MODAL ================= */}
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

      {/* ================= HEADER ================= */}
      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">
          IPD Registration
        </h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>

            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData(selectedRow);
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

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="form-container">
          <div className="mb-8 border-b border-gray-50 pb-5">
            <h6 className="text-lg font-bold text-gray-800">
              {isEdit ? "Update IPD Registration" : "New IPD Registration"}
            </h6>
          </div>

          <form
            className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6"
            onSubmit={handleSubmit}
          >
            {/* Patient */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="form-label">Patient</label>
              <select
                className="form-input"
                value={formData.patient_code}
                onChange={(e) =>
                  setFormData({ ...formData, patient_code: e.target.value })
                }
                required
              >
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p.patient_code} value={p.patient_code}>
                    {`${p.patient_first_name} ${
                      p.patient_middle_name ?? ""
                    } ${p.patient_last_name}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="form-label">Doctor</label>
              <select
                className="form-input"
                value={formData.doctor_code}
                onChange={(e) =>
                  setFormData({ ...formData, doctor_code: e.target.value })
                }
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.doctor_code} value={d.doctor_code}>
                    {d.doctor_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bed */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="form-label">Bed</label>
              <select
                className="form-input"
                value={formData.bed_id}
                onChange={(e) =>
                  setFormData({ ...formData, bed_id: e.target.value })
                }
                required
              >
                <option value="">Select Bed</option>
                {beds.map((b) => (
                  <option key={b.bed_code} value={b.bed_code}>
                    {b.bed_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Admission Date */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="form-label">Admission Date</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.admission_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    admission_date: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Remarks */}
            <div className="space-y-1.5 md:col-span-4">
              <label className="form-label">Remarks</label>
              <textarea
                className="form-input min-h-11.25"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
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

      {/* ================= TABLE ================= */}
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
                  <th className="table-th"></th>
                  <th className="table-th">IPD No</th>
                  <th className="table-th">Patient</th>
                  <th className="table-th">Doctor</th>
                  <th className="table-th">Bed</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr
                      key={item.ipd_registeration_code}
                      onClick={() =>
                        setSelectedRow(
                          selectedRow?.ipd_registeration_code ===
                            item.ipd_registeration_code
                            ? null
                            : item
                        )
                      }
                      className={`table-row ${
                        selectedRow?.ipd_registeration_code ===
                        item.ipd_registeration_code
                          ? "table-row-active"
                          : "table-row-hover"
                      }`}
                    >
                      <td className="table-td">
                        <div
                          className={`selection-indicator ${
                            selectedRow?.ipd_registeration_code ===
                            item.ipd_registeration_code
                              ? "selection-indicator-active"
                              : "selection-indicator-inactive"
                          }`}
                        >
                          {selectedRow?.ipd_registeration_code ===
                            item.ipd_registeration_code && (
                            <div className="selection-dot" />
                          )}
                        </div>
                      </td>
                      <td className="table-td text-admin-id">
                        {item.ipd_number}
                      </td>
                     <td className="table-td text-admin-id">
                        {patientMap[item.patient_code] || item.patient_code}
                     </td>

                    <td className="table-td text-admin-id">
                        {doctorMap[item.doctor_code] || item.doctor_code}
                    </td>

                    <td className="table-td text-admin-id">
                     {bedMap[item.bed_id] || item.bed_id}
                    </td>
                      <td className="table-td text-admin-id">
                        {item.status}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaLightbulb
                          size={48}
                          className="mb-4 text-gray-400 mx-auto"
                        />
                        <p className="text-xl font-bold text-gray-500">
                          No IPD registrations found
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

export default IpdRegistration;