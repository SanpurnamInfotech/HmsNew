import React, { useState, useMemo, useRef, useEffect } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaSearch, FaChevronDown, FaUserMd, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
 
const SearchableSelect = ({ options = [], value, onChange, placeholder = "Select", required, className = "" }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const searchRef = useRef(null);
 
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
 
  useEffect(() => { if (open && searchRef.current) searchRef.current.focus(); }, [open]);
 
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selectedLabel = options.find(o => String(o.value) === String(value))?.label;
 
  return (
    <div ref={ref} className={"relative " + className}>
      <button type="button" className="w-full px-3 py-2 rounded border text-left flex items-center justify-between bg-white" onClick={() => { setOpen(!open); setSearch(""); }}>
        <span className={selectedLabel ? "text-gray-800" : "text-gray-400"}>{selectedLabel || placeholder}</span>
        <FaChevronDown className={"text-gray-400 text-[10px] transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      {required && !value && <input className="absolute opacity-0 w-0 h-0" tabIndex={-1} required value="" onChange={() => {}} />}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-52 flex flex-col">
          <div className="p-1.5 border-b">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50 border">
              <FaSearch className="text-gray-400 text-[10px]" />
              <input ref={searchRef} className="w-full text-sm outline-none bg-transparent" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 && <div className="p-2 text-sm text-gray-400 text-center">No results</div>}
            {filtered.map(o => (
              <div key={o.value} className={"px-3 py-2 text-sm cursor-pointer hover:bg-emerald-50 " + (String(o.value) === String(value) ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-700")} onClick={() => { onChange(o.value); setOpen(false); setSearch(""); }}>
                {o.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
 
const DoctorMst = () => {
  const DOCTOR_PATH = "doctors";
 
  // --- FETCHING DATA ---
  // Main Doctor Data
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${DOCTOR_PATH}/`);
 
  // Dropdown Data (Inhe fetch karna zaroori hai dropdown dikhane ke liye)
  const { data: departments } = useCrud("departments/");
  const { data: countries } = useCrud("countries/");
  const { data: states } = useCrud("states/");
  const { data: districts } = useCrud("districts/");
  const { data: cities } = useCrud("cities/");
 
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });
 
  const [formData, setFormData] = useState({
    doctor_code: "",
    doctor_name: "",
    department_code: "",
    qualification: "",
    total_experience: "",
    dob: "",
    gender: "",
    marital_status_code: "",
    email: "",
    mobile: "",
    phone: "",
    landmark: "",
    address1: "",
    address2: "",
    city_code: "",
    district_code: "",
    state_code: "",
    country_code: "",
    pincode: "",
    status: 1
  });
 
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      doctor_code: "", doctor_name: "", department_code: "", qualification: "",
      total_experience: "", dob: "", gender: "", marital_status_code: "",
      email: "", mobile: "", phone: "", landmark: "", address1: "", address2: "",
      city_code: "", district_code: "", state_code: "", country_code: "",
      pincode: "", status: 1
    });
  };
 
  const showModal = (message, type = "success") => setModal({ message, visible: true, type });
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    // Convert empty date to null to avoid DRF validation issues
    const cleanedData = { ...formData };
    if (!cleanedData.dob) cleanedData.dob = null;
 
    const actionPath = isEdit ? `${DOCTOR_PATH}/update/${formData.doctor_code}/` : `${DOCTOR_PATH}/create/`;
    const result = isEdit ? await updateItem(actionPath, cleanedData) : await createItem(actionPath, cleanedData);
 
    if (result.success) {
      showModal(`Doctor ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Failed to save data", "error");
    }
  };
 
  const handleDelete = async () => {
    if (!selectedRow) return showModal("Please select a record", "error");
    if (window.confirm(`Delete Dr. ${selectedRow.doctor_name}?`)) {
      const result = await deleteItem(`${DOCTOR_PATH}/delete/${selectedRow.doctor_code}/`);
      if (result.success) { showModal("Deleted!"); refresh(); setSelectedRow(null); }
    }
  };
 
  const { search, setSearch, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage, paginatedData, filteredData, totalPages } = useTable(data || []);
 
  if (loading) return <div className="p-10 text-center font-bold text-emerald-600 italic">Loading...</div>;
 
  return (
    <div className="app-container">
      {/* MODAL */}
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container p-6 text-center">
            {modal.type === "success" ? <FaCheckCircle className="text-emerald-500 text-4xl mx-auto mb-4" /> : <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-4" />}
            <h3 className="font-bold text-lg mb-2">{modal.type === "success" ? "Success" : "Error"}</h3>
            <p className="text-gray-600 mb-6">{modal.message}</p>
            <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg w-full" onClick={() => setModal({ ...modal, visible: false })}>OK</button>
          </div>
        </div>
      )}
 
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <h4 className="text-2xl font-black text-gray-800">Doctor Master</h4>
        <div className="flex gap-2">
          {!showForm ? (
            <>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2" onClick={() => setShowForm(true)}><FaPlus size={12} /> Add Doctor</button>
              {selectedRow && (
                <>
                  <button className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2" onClick={() => { setFormData(selectedRow); setIsEdit(true); setShowForm(true); }}><FaEdit size={12} /> Edit</button>
                  <button className="bg-rose-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2" onClick={handleDelete}><FaTrash size={12} /> Delete</button>
                </>
              )}
            </>
          ) : (
            <button className="text-gray-500 font-bold" onClick={resetForm}>Back to List</button>
          )}
        </div>
      </div>
 
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-8 mb-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
 
            {/* --- SECTION: Professional Info --- */}
            <div>
              <h5 className="flex items-center gap-2 text-emerald-700 font-bold mb-4 border-b pb-2"><FaUserMd /> Professional Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Doctor Code *</label>
                  <input className="w-full px-3 py-2 rounded border focus:ring-1 focus:ring-emerald-500 outline-none" value={formData.doctor_code} disabled={isEdit} required onChange={e => setFormData({ ...formData, doctor_code: e.target.value.toUpperCase() })} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Doctor Name *</label>
                  <input className="w-full px-3 py-2 rounded border" value={formData.doctor_name} required onChange={e => setFormData({ ...formData, doctor_name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Department *</label>
                  <SearchableSelect placeholder="Select Dept" required value={formData.department_code} onChange={v => setFormData({ ...formData, department_code: v })} options={(departments || []).map(d => ({ value: d.department_code, label: d.department_name }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Qualification</label>
                  <input className="w-full px-3 py-2 rounded border" value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Experience</label>
                  <input className="w-full px-3 py-2 rounded border" value={formData.total_experience} onChange={e => setFormData({ ...formData, total_experience: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">DOB</label>
                  <input type="date" className="w-full px-3 py-2 rounded border" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Gender</label>
                  <SearchableSelect placeholder="Select" value={formData.gender} onChange={v => setFormData({ ...formData, gender: v })} options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]} />
                </div>
              </div>
            </div>
 
            {/* --- SECTION: Contact Info --- */}
            <div>
              <h5 className="flex items-center gap-2 text-emerald-700 font-bold mb-4 border-b pb-2"><FaPhoneAlt /> Contact Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Email</label>
                  <input type="email" className="w-full px-3 py-2 rounded border" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Mobile</label>
                  <input className="w-full px-3 py-2 rounded border" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label>
                  <input className="w-full px-3 py-2 rounded border" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Marital Status</label>
                  <input className="w-full px-3 py-2 rounded border" value={formData.marital_status_code} onChange={e => setFormData({ ...formData, marital_status_code: e.target.value })} />
                </div>
              </div>
            </div>
 
            {/* --- SECTION: Address Info --- */}
            <div>
              <h5 className="flex items-center gap-2 text-emerald-700 font-bold mb-4 border-b pb-2"><FaMapMarkerAlt /> Address Details</h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Address Line 1</label>
                  <input className="w-full px-3 py-2 rounded border" value={formData.address1} onChange={e => setFormData({ ...formData, address1: e.target.value })} />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Address Line 2</label>
                  <input className="w-full px-3 py-2 rounded border" value={formData.address2} onChange={e => setFormData({ ...formData, address2: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Landmark</label>
                  <input className="w-full px-3 py-2 rounded border" value={formData.landmark} onChange={e => setFormData({ ...formData, landmark: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Pincode</label>
                  <input className="w-full px-3 py-2 rounded border" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Country</label>
                  <SearchableSelect placeholder="Select" value={formData.country_code} onChange={v => setFormData({ ...formData, country_code: v })} options={(countries || []).map(c => ({ value: c.country_code, label: c.country_name }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">State</label>
                  <SearchableSelect placeholder="Select" value={formData.state_code} onChange={v => setFormData({ ...formData, state_code: v })} options={(states || []).map(s => ({ value: s.state_code, label: s.state_name }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">District</label>
                  <SearchableSelect placeholder="Select" value={formData.district_code} onChange={v => setFormData({ ...formData, district_code: v })} options={(districts || []).map(d => ({ value: d.district_code, label: d.district_name }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">City</label>
                  <SearchableSelect placeholder="Select" value={formData.city_code} onChange={v => setFormData({ ...formData, city_code: v })} options={(cities || []).map(c => ({ value: c.city_code, label: c.city_name }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
                  <SearchableSelect placeholder="Select" value={formData.status} onChange={v => setFormData({ ...formData, status: Number(v) })} options={[{ value: 1, label: "Active" }, { value: 0, label: "Inactive" }]} />
                </div>
              </div>
            </div>
 
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button type="submit" className="bg-emerald-600 text-white px-10 py-2.5 rounded-lg font-bold">Save Record</button>
              <button type="button" className="text-gray-400 font-bold px-4" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}
 
      {/* TABLE */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 w-12"></th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Code</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Doctor Name</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Department</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Mobile</th>
                  <th className="p-4 text-[10px] font-bold text-gray-400 uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedData.map(row => (
                  <tr key={row.doctor_code} onClick={() => setSelectedRow(selectedRow?.doctor_code === row.doctor_code ? null : row)}
                    className={`cursor-pointer ${selectedRow?.doctor_code === row.doctor_code ? "bg-emerald-50" : "hover:bg-gray-50"}`}>
                    <td className="p-4 text-center">
                      <div className={`w-4 h-4 rounded-full border-2 ${selectedRow?.doctor_code === row.doctor_code ? "border-emerald-500 bg-emerald-500" : "border-gray-200"}`} />
                    </td>
                    <td className="p-4 text-sm font-bold">{row.doctor_code}</td>
                    <td className="p-4 text-sm font-bold text-gray-700">{row.doctor_name}</td>
                    <td className="p-4 text-sm text-gray-500">{row.department_code}</td>
                    <td className="p-4 text-sm text-gray-500">{row.mobile}</td>
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
            <Pagination totalEntries={filteredData.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
          </div>
        </div>
      )}
    </div>
  );
};
 
export default DoctorMst;
