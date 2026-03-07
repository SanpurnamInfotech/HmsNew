import React, { useState, useMemo } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaCheckCircle, FaTimesCircle, FaChevronDown, FaFileAlt, FaEdit, FaTrash } from "react-icons/fa";

const DischargeSummary = () => {
  const STATE_PATH = "discharge-summary"; 
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${STATE_PATH}/`);
  
  // Dependency Data - Ensure the path matches your backend
  const { data: patientsData } = useCrud("patients/");
  const { data: doctorsData } = useCrud("doctors/");

  // Extract arrays safely
  const patients = Array.isArray(patientsData) ? patientsData : patientsData?.results || [];
  const doctors = Array.isArray(doctorsData) ? doctorsData : doctorsData?.results || [];

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    discharge_summary_code: "",
    patient_code: "",
    doctor_code: "",
    summary_date: new Date().toISOString().split('T')[0],
    visit_type: "OPD",
    complaints: "",
    diagnosis: "",
    treatment_given: "",
    advice_on_discharge: "",
    next_visit_date: "",
    status: 1,
  });

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

  /* ================= TABLE LOGIC ================= */
  const {
    search, setSearch, currentPage, setCurrentPage, itemsPerPage,
    setItemsPerPage, paginatedData, effectiveItemsPerPage, filteredData, totalPages,
  } = useTable(data || []);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setOpenDropdown(null);
    setFormData({
      discharge_summary_code: "", patient_code: "", doctor_code: "",
      summary_date: new Date().toISOString().split('T')[0],
      visit_type: "OPD", complaints: "", diagnosis: "",
      treatment_given: "", advice_on_discharge: "", next_visit_date: "", status: 1,
    });
  };

  const handleDropdownSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setOpenDropdown(null);
    setSearchTerm("");
  };

  const showModal = (message, type = "success") => setModal({ visible: true, message, type });

  /* ================= ACTIONS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Path correction for 404 issues
    const actionPath = isEdit 
      ? `${STATE_PATH}/update/${formData.discharge_summary_code}/` 
      : `${STATE_PATH}/create/`;

    const result = isEdit ? await updateItem(actionPath, formData) : await createItem(actionPath, formData);

    if (result.success) {
      showModal(`Summary ${isEdit ? "Updated" : "Created"} Successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Failed to save summary", "error");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-emerald-600 font-bold animate-pulse">Loading Records...</div>;

  return (
    <div className="app-container p-6">
      {/* MODAL (STAY CONSISTENT WITH MASTER STYLE) */}
      {modal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-sm w-full p-8 text-center rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? <FaCheckCircle className="text-6xl text-emerald-500" /> : <FaTimesCircle className="text-6xl text-rose-500" />}
            </div>
            <h3 className={`text-xl font-black mb-2 uppercase tracking-tight ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            <p className="mb-6 font-medium opacity-80 text-gray-600">{modal.message}</p>
            <button className="bg-gray-900 text-white w-full py-3 rounded-xl font-bold" onClick={() => setModal({ ...modal, visible: false })}>Continue</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h4 className="text-2xl font-black text-gray-800 tracking-tight">Discharge Summary</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Create New
            </button>
            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="bg-amber-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold" onClick={() => { setFormData(selectedRow); setIsEdit(true); setShowForm(true); }}>
                  <FaEdit size={14} /> Edit
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM SECTION */}
      {showForm && (
        <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-sm animate-in zoom-in-95 duration-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase ml-1">Summary Code</label>
              <input className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white p-3 rounded-xl font-bold outline-none" value={formData.discharge_summary_code} disabled={isEdit} required onChange={(e) => setFormData({...formData, discharge_summary_code: e.target.value.toUpperCase()})} placeholder="DS-001" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase ml-1">Summary Date</label>
              <input type="date" className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 p-3 rounded-xl font-bold outline-none text-gray-600" value={formData.summary_date} onChange={(e) => setFormData({...formData, summary_date: e.target.value})} />
            </div>

            <div className="space-y-1 text-gray-700">
              <label className="text-xs font-black text-gray-400 uppercase ml-1">Visit Type</label>
              <select className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 p-3 rounded-xl font-bold outline-none appearance-none cursor-pointer" value={formData.visit_type} onChange={(e) => setFormData({...formData, visit_type: e.target.value})}>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
              </select>
            </div>

            {/* Patient Dropdown Fix */}
            <div className="space-y-1 relative text-gray-700">
              <label className="text-xs font-black text-gray-400 uppercase ml-1">Patient</label>
              <div className="w-full bg-gray-50 border-2 border-transparent p-3 rounded-xl font-bold flex justify-between cursor-pointer" onClick={() => setOpenDropdown(openDropdown === 'patient' ? null : 'patient')}>
                <span>{patients.find(p => p.patient_code === formData.patient_code)?.patient_first_name || "Select Patient"}</span>
                <FaChevronDown className="mt-1 text-gray-400" />
              </div>
              {openDropdown === 'patient' && (
                <div className="absolute z-50 w-full bg-white border-2 shadow-2xl rounded-xl mt-2 overflow-hidden">
                  <input className="w-full p-3 border-b outline-none text-sm" placeholder="Search Patient..." onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
                  <div className="max-h-48 overflow-y-auto">
                    {patients.filter(p => p.patient_first_name?.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                      <div key={p.patient_code} className="p-3 hover:bg-emerald-50 cursor-pointer text-sm font-bold border-b last:border-0" onClick={() => handleDropdownSelect('patient_code', p.patient_code)}>
                        {p.patient_first_name} <span className="text-gray-400 text-xs ml-2">({p.patient_code})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Dropdown Fix */}
            <div className="space-y-1 relative text-gray-700">
              <label className="text-xs font-black text-gray-400 uppercase ml-1">Consultant Doctor</label>
              <div className="w-full bg-gray-50 border-2 border-transparent p-3 rounded-xl font-bold flex justify-between cursor-pointer" onClick={() => setOpenDropdown(openDropdown === 'doctor' ? null : 'doctor')}>
                <span>{doctors.find(d => d.doctor_code === formData.doctor_code)?.doctor_name || "Select Doctor"}</span>
                <FaChevronDown className="mt-1 text-gray-400" />
              </div>
              {openDropdown === 'doctor' && (
                <div className="absolute z-50 w-full bg-white border-2 shadow-2xl rounded-xl mt-2 overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    {doctors.map(d => (
                      <div key={d.doctor_code} className="p-3 hover:bg-emerald-50 cursor-pointer text-sm font-bold border-b last:border-0" onClick={() => handleDropdownSelect('doctor_code', d.doctor_code)}>
                        {d.doctor_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase ml-1">Next Visit Date</label>
              <input type="date" className="w-full bg-gray-50 p-3 rounded-xl font-bold outline-none text-gray-600" value={formData.next_visit_date} onChange={(e) => setFormData({...formData, next_visit_date: e.target.value})} />
            </div>

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase ml-1">Complaints & History</label>
                <textarea className="w-full bg-gray-50 p-4 rounded-xl h-28 outline-none focus:bg-white border-2 border-transparent focus:border-emerald-500 font-medium" value={formData.complaints} onChange={(e) => setFormData({...formData, complaints: e.target.value})} placeholder="Patient history..." />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase ml-1">Diagnosis</label>
                <textarea className="w-full bg-gray-50 p-4 rounded-xl h-28 outline-none focus:bg-white border-2 border-transparent focus:border-emerald-500 font-medium" value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} placeholder="Final diagnosis..." />
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 mt-6 pt-6 border-t border-gray-50">
              <button type="button" className="px-8 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all" onClick={resetForm}>Discard</button>
              <button type="submit" className="px-12 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-all shadow-lg">
                {isEdit ? "Update Summary" : "Save Summary"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DATA TABLE */}
      {!showForm && (
        <div className="bg-white border-2 border-gray-100 rounded-3xl shadow-sm overflow-hidden animate-in fade-in duration-500">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 w-16"></th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Code</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Patient</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {paginatedData.length > 0 ? paginatedData.map((row) => (
                  <tr key={row.discharge_summary_code} 
                      onClick={() => setSelectedRow(selectedRow?.discharge_summary_code === row.discharge_summary_code ? null : row)}
                      className={`group cursor-pointer transition-colors ${selectedRow?.discharge_summary_code === row.discharge_summary_code ? "bg-emerald-50/50" : "hover:bg-gray-50/30"}`}>
                    <td className="px-6 py-5">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedRow?.discharge_summary_code === row.discharge_summary_code ? "border-emerald-500 bg-emerald-500" : "border-gray-200"}`}>
                          {selectedRow?.discharge_summary_code === row.discharge_summary_code && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-emerald-700">{row.discharge_summary_code}</td>
                    <td className="px-6 py-5 font-bold text-gray-500">{row.patient_code}</td>
                    <td className="px-6 py-5 text-gray-400 font-medium">{row.summary_date}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Active</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                      <FaFileAlt size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No summaries found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-gray-50">
            <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DischargeSummary;