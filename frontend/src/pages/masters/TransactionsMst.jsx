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

const TransactionsMst = () => {
  const PATH = "transactions";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    transaction_code: "",
    patient_code: "",
    bill_no: "",
    appointment_code: "",
    transaction_date: "",
    transaction_mode_code: "",
    transaction_type: "",
    depositor_name: "",
    mobile: "",
    bill_amount: "",
    amt_received: "",
    dues_amount: "",
    sort_order: "",
    status: 1
  });

  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

  /* ---------- Dropdown Data States ---------- */
  const [patients, setPatients] = useState([]);
  const [bills, setBills] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [modes, setModes] = useState([]);

  /* ---------- Search & UI States ---------- */
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchTerms, setSearchTerms] = useState({
    patient: "",
    bill: "",
    appointment: "",
    mode: ""
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

  /* ---------- Fetch Foreign Key Data ---------- */
  useEffect(() => {
    api.get("patient/").then(r => setPatients(r.data || []));
    api.get("opd-billing/").then(r => setBills(r.data || []));
    api.get("appointment/").then(r => setAppointments(r.data || []));
    api.get("transaction-mode-master/").then(r => setModes(r.data || []));
  }, []);

  /* ---------- Filtered Lists (useMemo) ---------- */
  const filteredPatients = useMemo(() => 
    patients.filter(p => p.patient_code?.toLowerCase().includes(searchTerms.patient.toLowerCase())), 
    [patients, searchTerms.patient]
  );

  const filteredBills = useMemo(() => 
    bills.filter(b => b.bill_no?.toLowerCase().includes(searchTerms.bill.toLowerCase())), 
    [bills, searchTerms.bill]
  );

  const filteredAppointments = useMemo(() => 
    appointments.filter(a => a.appointment_code?.toLowerCase().includes(searchTerms.appointment.toLowerCase())), 
    [appointments, searchTerms.appointment]
  );

  const filteredModes = useMemo(() => 
    modes.filter(m => m.transaction_mode_code?.toLowerCase().includes(searchTerms.mode.toLowerCase())), 
    [modes, searchTerms.mode]
  );

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setOpenDropdown(null);
    setSearchTerms({ patient: "", bill: "", appointment: "", mode: "" });
    setFormData({
      transaction_code: "", patient_code: "", bill_no: "", appointment_code: "",
      transaction_date: "", transaction_mode_code: "", transaction_type: "",
      depositor_name: "", mobile: "", bill_amount: "", amt_received: "",
      dues_amount: "", sort_order: "", status: 1
    });
  };

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionPath = isEdit ? `${PATH}/update/${formData.transaction_code}/` : `${PATH}/create/`;
    
    // Formatting payload to send only IDs for ForeignKeys
    const payload = {
      ...formData,
      patient_code: formData.patient_code || null,
      bill_no: formData.bill_no || null,
      appointment_code: formData.appointment_code || null,
      transaction_mode_code: formData.transaction_mode_code || null,
    };

    if (!payload.sort_order) delete payload.sort_order;

    const result = isEdit ? await updateItem(actionPath, payload) : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Transaction ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  /* ---------- Reusable Dropdown Component ---------- */
  const SearchableDropdown = ({ label, name, value, options, searchKey, filterList, displayKey }) => (
    <div className="space-y-1.5 relative">
      <label className="form-label">{label}</label>
      <div
        className="form-input w-full flex justify-between items-center cursor-pointer"
        onClick={() => setOpenDropdown(openDropdown === name ? null : name)}
      >
        <span className={value ? "" : "opacity-50"}>{value || `Select ${label}`}</span>
        <FaChevronDown size={12} className="opacity-50" />
      </div>

      {openDropdown === name && (
        <div className="absolute z-[60] w-full mt-2 rounded-xl shadow-2xl border overflow-hidden bg-[var(--input-bg)] border-[var(--border-color)]">
          <div className="p-3 border-b border-[var(--border-color)] flex items-center gap-2">
            <FaSearch size={14} className="opacity-40" />
            <input
              autoFocus
              className="bg-transparent outline-none text-sm w-full"
              placeholder={`Search ${label}...`}
              value={searchTerms[searchKey]}
              onChange={e => setSearchTerms({ ...searchTerms, [searchKey]: e.target.value })}
            />
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {filterList.map(item => (
              <div
                key={item[displayKey]}
                className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm"
                onClick={() => {
                  setFormData({ ...formData, [name]: item[displayKey] });
                  setOpenDropdown(null);
                  setSearchTerms({ ...searchTerms, [searchKey]: "" });
                }}
              >
                {item[displayKey]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) return (
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
              {modal.type === "success" ? <FaCheckCircle className="text-6xl text-emerald-500" /> : <FaTimesCircle className="text-6xl text-rose-500" />}
            </div>
            <h3 className={`text-xl font-black mb-2 uppercase tracking-tight ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            <p className="mb-6 font-medium opacity-80">{modal.message}</p>
            <button className="btn-primary w-full justify-center py-3" onClick={() => setModal({ ...modal, visible: false })}>Continue</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="section-header">
        <h4 className="page-title">Transactions Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus size={14}/> Add New</button>
            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="btn-warning" onClick={() => {
                   setFormData({
                    ...selectedRow,
                    patient_code: selectedRow.patient_code?.patient_code ?? selectedRow.patient_code,
                    bill_no: selectedRow.bill_no?.bill_no ?? selectedRow.bill_no,
                    appointment_code: selectedRow.appointment_code?.appointment_code ?? selectedRow.appointment_code,
                    transaction_mode_code: selectedRow.transaction_mode_code?.transaction_mode_code ?? selectedRow.transaction_mode_code,
                   });
                   setIsEdit(true);
                   setShowForm(true);
                }}>
                  <FaEdit size={14}/> Edit
                </button>
                <button className="btn-danger" onClick={() => { if(window.confirm("Delete?")) handleDelete(); }}><FaTrash size={14}/> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">{isEdit ? "Update Transaction" : "Create Transaction"}</h6>
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            
            <div className="space-y-1.5">
              <label className="form-label">Transaction Code</label>
              <input className={`form-input w-full ${isEdit ? "opacity-50 cursor-not-allowed" : ""}`} value={formData.transaction_code} disabled={isEdit} required onChange={e => setFormData({ ...formData, transaction_code: e.target.value })} />
            </div>

            {/* FOREIGN KEY DROPDOWNS */}
            <SearchableDropdown label="Patient" name="patient_code" value={formData.patient_code} options={patients} searchKey="patient" filterList={filteredPatients} displayKey="patient_code" />
            <SearchableDropdown label="Bill No" name="bill_no" value={formData.bill_no} options={bills} searchKey="bill" filterList={filteredBills} displayKey="bill_no" />
            <SearchableDropdown label="Appointment" name="appointment_code" value={formData.appointment_code} options={appointments} searchKey="appointment" filterList={filteredAppointments} displayKey="appointment_code" />
            <SearchableDropdown label="Transaction Mode" name="transaction_mode_code" value={formData.transaction_mode_code} options={modes} searchKey="mode" filterList={filteredModes} displayKey="transaction_mode_code" />

            <div className="space-y-1.5">
              <label className="form-label">Transaction Date</label>
              <input type="date" className="form-input w-full" value={formData.transaction_date} onChange={e => setFormData({ ...formData, transaction_date: e.target.value })} required />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Type (Payment/Refund)</label>
              <select className="form-input w-full" value={formData.transaction_type} onChange={e => setFormData({...formData, transaction_type: e.target.value})}>
                <option value="">Select Type</option>
                <option value="PAYMENT">PAYMENT</option>
                <option value="REFUND">REFUND</option>
                <option value="ADJUSTMENT">ADJUSTMENT</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Depositor Name</label>
              <input className="form-input w-full" value={formData.depositor_name} onChange={e => setFormData({ ...formData, depositor_name: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Mobile</label>
              <input className="form-input w-full" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Bill Amount</label>
              <input type="number" step="0.01" className="form-input w-full" value={formData.bill_amount} onChange={e => setFormData({ ...formData, bill_amount: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Amount Received</label>
              <input type="number" step="0.01" className="form-input w-full" value={formData.amt_received} onChange={e => setFormData({ ...formData, amt_received: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Dues Amount</label>
              <input type="number" step="0.01" className="form-input w-full" value={formData.dues_amount} onChange={e => setFormData({ ...formData, dues_amount: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select className="form-input w-full" value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 border-t pt-8 mt-4" style={{ borderColor: "var(--border-color)" }}>
              <button type="submit" className="btn-primary px-12 py-3">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}
      {!showForm && (
        <div className="data-table-container animate-in fade-in duration-500">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">Code</th>
                  <th className="text-admin-th">Patient</th>
                  <th className="text-admin-th">Bill</th>
                  <th className="text-admin-th">Amount</th>
                  <th className="text-admin-th text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.map(row => (
                  <tr key={row.transaction_code} onClick={() => setSelectedRow(selectedRow?.transaction_code === row.transaction_code ? null : row)} className={`group cursor-pointer transition-colors ${selectedRow?.transaction_code === row.transaction_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}>
                    <td className="px-6 py-4"><div className={`selection-indicator ${selectedRow?.transaction_code === row.transaction_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>{selectedRow?.transaction_code === row.transaction_code && <div className="selection-dot" />}</div></td>
                    <td className="text-admin-td font-black">{row.transaction_code}</td>
                    <td className="text-admin-td font-bold">{row.patient_code?.patient_code ?? row.patient_code}</td>
                    <td className="text-admin-td">{row.bill_no?.bill_no ?? row.bill_no}</td>
                    <td className="text-admin-td font-bold text-emerald-600">₹{row.amt_received}</td>
                    <td className="text-admin-td text-center"><span className={`badge ${row.status === 1 ? "badge-success" : "badge-danger"}`}>{row.status === 1 ? "Active" : "Inactive"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
};

export default TransactionsMst;