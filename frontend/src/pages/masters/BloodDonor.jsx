import React, { useState, useMemo } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSearch, 
  FaChevronDown, 
  FaUserFriends 
} from "react-icons/fa";

const BloodDonor = () => {
  const DONOR_PATH = "blood_donors";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${DONOR_PATH}/`);
  
  // Fetching Related Master Data
  const { data: bloodGroups } = useCrud("blood_group_master/");

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Dropdown UI States
  const [openDropdown, setOpenDropdown] = useState(null); 
  const [bgSearch, setBgSearch] = useState("");

  const [formData, setFormData] = useState({
    blood_donor_code: "",
    donor_firstname: "",
    donor_middlename: "",
    donor_lastname: "",
    blood_group_code: "",
    gender: "",
    age: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    last_donation_date: "",
    status: 1,
    sort_order: "",
  });

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

  /* ================= SORTING LOGIC ================= */
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const sa = (a.sort_order === null || a.sort_order === "" || a.sort_order === undefined) ? 999 : Number(a.sort_order);
      const sb = (b.sort_order === null || b.sort_order === "" || b.sort_order === undefined) ? 999 : Number(b.sort_order);
      return sa - sb;
    });
  }, [data]);

  /* ================= TABLE LOGIC ================= */
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
  } = useTable(sortedData);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setOpenDropdown(null);
    setBgSearch("");
    setFormData({ 
      blood_donor_code: "", 
      donor_firstname: "", 
      donor_middlename: "", 
      donor_lastname: "", 
      blood_group_code: "", 
      gender: "", 
      age: "", 
      phone: "", 
      email: "", 
      address1: "", 
      address2: "", 
      last_donation_date: "",
      status: 1, 
      sort_order: "" 
    });
  };

  const showModal = (message, type = "success") => setModal({ visible: true, message, type });

  const filteredBloodGroups = useMemo(() => {
    if (!bloodGroups) return [];
    return bloodGroups.filter(bg =>
      bg.blood_group_name.toLowerCase().includes(bgSearch.toLowerCase())
    );
  }, [bloodGroups, bgSearch]);

  // Find the name for display based on the selected code
  const selectedBGDisplay = useMemo(() => {
    if (!formData.blood_group_code || !bloodGroups) return "Select Blood Group";
    const found = bloodGroups.find(bg => bg.blood_group_code === formData.blood_group_code);
    return found ? found.blood_group_name : "Select Blood Group";
  }, [formData.blood_group_code, bloodGroups]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.blood_group_code) {
      showModal("Please select a Blood Group", "error");
      return;
    }

    const actionPath = isEdit 
      ? `${DONOR_PATH}/update/${formData.blood_donor_code}/` 
      : `${DONOR_PATH}/create/`;

    const payload = { ...formData };
    if (!isEdit) delete payload.blood_donor_code;

    // Optional fields logic: Convert empty strings to null for backend
    payload.sort_order = (payload.sort_order === "" || payload.sort_order === null) ? null : Number(payload.sort_order);
    payload.last_donation_date = payload.last_donation_date === "" ? null : payload.last_donation_date;
    payload.address1 = payload.address1 || null;
    payload.address2 = payload.address2 || null;

    // Format age as number
    payload.age = payload.age === "" ? null : Number(payload.age);

    const result = isEdit 
      ? await updateItem(actionPath, payload) 
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Donor ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      const errorMsg = typeof result.error === 'object' 
        ? Object.entries(result.error).map(([k, v]) => `${k}: ${v}`).join(", ")
        : result.error;
      showModal(errorMsg || "Failed to save data", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedRow || !selectedRow.blood_donor_code) return;
    const result = await deleteItem(`${DONOR_PATH}/delete/${selectedRow.blood_donor_code}/`);
    if (result.success) {
      showModal("Donor deleted successfully!");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="app-container">
      {/* MODAL */}
      {modal.visible && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? <FaCheckCircle className="text-6xl text-emerald-500" /> : <FaTimesCircle className="text-6xl text-rose-500" />}
            </div>
            <h3 className={`text-xl font-black mb-2 uppercase tracking-tight ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            <p className="mb-6 font-medium opacity-80">{modal.message}</p>
            <button className="btn-primary w-full justify-center py-3" onClick={() => setModal({ ...modal, visible: false })}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="section-header">
        <h4 className="page-title">Blood Donor Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>
            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="btn-warning" onClick={() => {
                  setFormData({ ...selectedRow, sort_order: selectedRow.sort_order ?? "" });
                  setIsEdit(true);
                  setShowForm(true);
                }}>
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

      {/* FORM */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">
            {isEdit ? "Update Donor" : "Add New Donor"}
          </h6>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            
            <div className="space-y-1.5">
              <label className="form-label">First Name</label>
              <input className="form-input w-full" value={formData.donor_firstname} required onChange={e => setFormData({ ...formData, donor_firstname: e.target.value })} placeholder="John" />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Middle Name</label>
              <input className="form-input w-full" value={formData.donor_middlename || ""} required onChange={e => setFormData({ ...formData, donor_middlename: e.target.value })} placeholder="Robert" />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Last Name</label>
              <input className="form-input w-full" value={formData.donor_lastname} required onChange={e => setFormData({ ...formData, donor_lastname: e.target.value })} placeholder="Doe" />
            </div>

            {/* BLOOD GROUP DROPDOWN - Display ONLY Name, Store Code */}
            <div className="space-y-1.5 relative">
              <label className="form-label">Blood Group</label>
              <div className="form-input w-full flex justify-between items-center cursor-pointer" onClick={() => setOpenDropdown(openDropdown === 'bg' ? null : 'bg')}>
                <span className={formData.blood_group_code ? "" : "opacity-50"}>{selectedBGDisplay}</span>
                <FaChevronDown size={12} className="opacity-50" />
              </div>
              {openDropdown === 'bg' && (
                <div className="absolute z-60 w-full mt-2 rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                  <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-hover)" }}>
                    <FaSearch className="opacity-40" size={14} />
                    <input autoFocus className="bg-transparent outline-none text-sm w-full" placeholder="Search group..." value={bgSearch} onChange={(e) => setBgSearch(e.target.value)} />
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredBloodGroups.map(bg => (
                      <div key={bg.blood_group_code} className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm transition-colors font-bold" onClick={() => { setFormData({ ...formData, blood_group_code: bg.blood_group_code }); setOpenDropdown(null); }}>
                        {bg.blood_group_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Gender</label>
              <select className="form-input w-full cursor-pointer appearance-none" required style={{ colorScheme: "dark" }} value={formData.gender || ""} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Age</label>
              <input type="number" className="form-input w-full" required value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} placeholder="E.G. 25" />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Phone</label>
              <input className="form-input w-full" required value={formData.phone || ""} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="10 Digit Number" />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Email</label>
              <input type="email" className="form-input w-full" required value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Address 1 (Optional)</label>
              <textarea className="form-input w-full" value={formData.address1 || ""} onChange={e => setFormData({ ...formData, address1: e.target.value })} placeholder="Apartment, Street..." rows="1" />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Address 2 (Optional)</label>
              <textarea className="form-input w-full" value={formData.address2 || ""} onChange={e => setFormData({ ...formData, address2: e.target.value })} placeholder="Landmark, City..." rows="1" />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Last Donation Date (Optional)</label>
              <input type="date" className="form-input w-full" value={formData.last_donation_date ? formData.last_donation_date.split('T')[0] : ""} onChange={e => setFormData({ ...formData, last_donation_date: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Sort Order (Optional)</label>
              <input type="number" className="form-input w-full" value={formData.sort_order} placeholder="E.G. 1" onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select className="form-input w-full cursor-pointer appearance-none" style={{ colorScheme: "dark" }} value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t pt-8 mt-4" style={{ borderColor: "var(--border-color)" }}>
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
                  <th className="text-admin-th">Name</th>
                  <th className="text-admin-th">Blood Group</th>
                  <th className="text-admin-th">Phone</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => {
                    const bgObj = bloodGroups?.find(b => b.blood_group_code === item.blood_group_code);
                    return (
                      <tr key={item.blood_donor_code} onClick={() => setSelectedRow(selectedRow?.blood_donor_code === item.blood_donor_code ? null : item)} className={`group cursor-pointer transition-colors ${selectedRow?.blood_donor_code === item.blood_donor_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}>
                        <td className="px-6 py-4">
                          <div className={`selection-indicator ${selectedRow?.blood_donor_code === item.blood_donor_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                            {selectedRow?.blood_donor_code === item.blood_donor_code && <div className="selection-dot" />}
                          </div>
                        </td>
                        <td className="text-admin-td">{item.blood_donor_code}</td>
                        <td className="text-admin-td">{`${item.donor_firstname} ${item.donor_lastname}`}</td>
                        <td className="text-admin-td">
                         {bgObj ? bgObj.blood_group_name : item.blood_group_code}
                        </td>
                        <td className="text-admin-td">{item.phone || "N/A"}</td>
                        <td className="text-admin-td">
                          <span className={`badge ${item.status === 1 ? "badge-success" : "badge-danger"}`}>
                            {item.status === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-24 text-center">
                      <FaUserFriends size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No donors found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination-container">
            <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodDonor;