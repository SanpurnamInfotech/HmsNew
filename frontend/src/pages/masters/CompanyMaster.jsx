import React, { useState, useMemo } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { 
  FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, 
  FaSearch, FaChevronDown, FaBuilding 
} from "react-icons/fa";


const CompanyMaster = () => {
  const PATH = "company_master";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);

  // Master Data for Dropdowns
  const { data: countries } = useCrud("countries/");
  const { data: states } = useCrud("states/");
  const { data: districts } = useCrud("districts/");
  const { data: cities } = useCrud("cities/");

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

  const [dSearch, setDSearch] = useState({ cn: "", st: "", dt: "", ct: "" });
  const [otherValues, setOtherValues] = useState({ district: "", city: "" });

  const initialForm = {
    company_code: "",
    company_name: "",
    email: "",
    phone: "",
    mobile: "",
    landmark: "",
    address1: "",
    address2: "",
    fax: "",
    contact_person: "",
    country_code: "",
    state_code: "",
    district_code: "",
    city_code: "",
    currency: "",
    reg_number: "",
    gst_number: "",
    timezone: "",
    company_logo: null,
    status: 1,
    sort_order: "",
  };

  const [formData, setFormData] = useState(initialForm);

  /* ================= AUTO GENERATE CODE ================= */
  const nextCompanyCode = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const codes = list.map((x) => (x?.company_code || "").toString()).filter((c) => c.startsWith("COMP-"));
    let maxNum = 0;
    for (const code of codes) {
      const num = parseInt(code.replace("COMP-", ""), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
    return `COMP-${String(maxNum + 1).padStart(6, "0")}`;
  }, [data]);

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const sa = (a.sort_order === null || a.sort_order === "") ? 999 : Number(a.sort_order);
      const sb = (b.sort_order === null || b.sort_order === "") ? 999 : Number(b.sort_order);
      return sa - sb;
    });
  }, [data]);

  const {
    search, setSearch, currentPage, setCurrentPage, itemsPerPage,
    setItemsPerPage, paginatedData, effectiveItemsPerPage, filteredData, totalPages,
  } = useTable(sortedData);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setOpenDropdown(null);
    setFormData(initialForm);
    setOtherValues({ district: "", city: "" });
    setDSearch({ cn: "", st: "", dt: "", ct: "" });
  };

  const showModal = (message, type = "success") => setModal({ visible: true, message, type });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, company_logo: reader.result });
      reader.readAsDataURL(file);
    }
  };

  /* ================= SEARCHABLE DROPDOWN ================= */
  const SearchDropdown = ({ label, options, valKey, dispKey, stateKey, dKey }) => {
    const isLocation = stateKey === 'district_code' || stateKey === 'city_code';
    const enhancedOptions = isLocation 
      ? [...(options || []), { [valKey]: "OTHER", [dispKey]: "Other (Add New)" }]
      : (options || []);

    const selected = enhancedOptions.find(o => o[valKey] === formData[stateKey]);
    const display = selected ? selected[dispKey] : `Select ${label}`;

    return (
      <div className="space-y-1.5 relative">
        <label className="form-label">{label}</label>
        <div className="form-input w-full flex justify-between items-center cursor-pointer" 
             onClick={() => setOpenDropdown(openDropdown === dKey ? null : dKey)}>
          <span className={formData[stateKey] ? "" : "opacity-50"}>{display}</span>
          <FaChevronDown size={12} className="opacity-40" />
        </div>
        {openDropdown === dKey && (
          <div className="absolute z-60 w-full mt-2 rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150" 
               style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
            <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-hover)" }}>
              <FaSearch className="opacity-40" size={14} />
              <input autoFocus className="bg-transparent outline-none text-sm w-full" placeholder={`Search ${label}...`} 
                     value={dSearch[dKey]} onChange={(e) => setDSearch({...dSearch, [dKey]: e.target.value})} />
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              {enhancedOptions.filter(o => (o[dispKey] || "").toLowerCase().includes(dSearch[dKey].toLowerCase())).map(opt => (
                <div key={opt[valKey]} className={`px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm transition-colors ${opt[valKey] === 'OTHER' ? 'text-emerald-500 font-bold border-t' : ''}`}
                     style={{ borderTopColor: opt[valKey] === 'OTHER' ? "var(--border-color)" : "transparent" }}
                     onClick={() => { setFormData({ ...formData, [stateKey]: opt[valKey] }); setOpenDropdown(null); }}>
                  {opt[dispKey]}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ================= SUBMIT & DELETE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare payload
    const payload = { 
        ...formData,
        // If "OTHER" is selected, store the manual name in the code field
        district_code: formData.district_code === "OTHER" ? otherValues.district : formData.district_code,
        city_code: formData.city_code === "OTHER" ? otherValues.city : formData.city_code,
        sort_order: formData.sort_order === "" ? null : Number(formData.sort_order),
        status: Number(formData.status)
    };

    const actionPath = isEdit ? `${PATH}/update/${formData.company_code}/` : `${PATH}/create/`;
    const result = isEdit ? await updateItem(actionPath, payload) : await createItem(actionPath, payload);
    
    if (result.success) {
      showModal(`Company ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Failed to save", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    const result = await deleteItem(`${PATH}/delete/${selectedRow.company_code}/`);
    if (result.success) {
      showModal("Company deleted successfully!");
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Delete failed", "error");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="app-container">
      {modal.visible && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? <FaCheckCircle className="text-6xl text-emerald-500" /> : <FaTimesCircle className="text-6xl text-rose-500" />}
            </div>
            <h3 className={`text-xl font-black mb-2 uppercase ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>{modal.type === "success" ? "Success" : "Error"}</h3>
            <p className="mb-6 font-medium opacity-80">{modal.message}</p>
            <button className="btn-primary w-full justify-center py-3" onClick={() => setModal({ ...modal, visible: false })}>Continue</button>
          </div>
        </div>
      )}

      <div className="section-header">
        <h4 className="page-title">Company Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => { setFormData({ ...initialForm, company_code: nextCompanyCode }); setShowForm(true); }}><FaPlus size={14} /> Add New</button>
            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="btn-warning" onClick={() => { setFormData({ ...selectedRow }); setIsEdit(true); setShowForm(true); }}><FaEdit size={14} /> Edit</button>
                <button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <form onSubmit={handleSubmit} className="space-y-12">
            <section>
              <h6 className="form-section-title uppercase tracking-tighter mb-6 text-emerald-500">Company Identity</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Company Name</label>
                  <input className="form-input w-full" value={formData.company_name} required onChange={e => setFormData({...formData, company_name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="form-label">Contact Person</label>
                  <input className="form-input w-full" value={formData.contact_person || ""} onChange={e => setFormData({...formData, contact_person: e.target.value})} />
                </div>
                <div className="space-y-1.5"><label className="form-label">GST Number</label><input className="form-input w-full" value={formData.gst_number || ""} onChange={e => setFormData({...formData, gst_number: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Registration No.</label><input className="form-input w-full" value={formData.reg_number || ""} onChange={e => setFormData({...formData, reg_number: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Logo</label><input type="file" className="form-input w-full text-xs" onChange={handleLogoChange} /></div>
              </div>
            </section>

            <section>
              <h6 className="form-section-title uppercase tracking-tighter mb-6 text-emerald-500">Contact Details</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5"><label className="form-label">Email</label><input type="email" className="form-input w-full" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Mobile</label><input className="form-input w-full" value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Phone</label><input className="form-input w-full" value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Fax</label><input className="form-input w-full" value={formData.fax || ""} onChange={e => setFormData({...formData, fax: e.target.value})} /></div>
              </div>
            </section>

            <section>
              <h6 className="form-section-title uppercase tracking-tighter mb-6 text-emerald-500">Location & Address</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5"><label className="form-label">Landmark</label><input className="form-input w-full" value={formData.landmark || ""} onChange={e => setFormData({...formData, landmark: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Address Line 1</label><input className="form-input w-full" value={formData.address1 || ""} onChange={e => setFormData({...formData, address1: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Address Line 2</label><input className="form-input w-full" value={formData.address2 || ""} onChange={e => setFormData({...formData, address2: e.target.value})} /></div>
                <SearchDropdown label="Country" options={countries} valKey="country_code" dispKey="country_name" stateKey="country_code" dKey="cn" />
                <SearchDropdown label="State" options={states} valKey="state_code" dispKey="state_name" stateKey="state_code" dKey="st" />
                
                <div className="space-y-1.5">
                  <SearchDropdown label="District" options={districts} valKey="district_code" dispKey="district_name" stateKey="district_code" dKey="dt" />
                  {formData.district_code === "OTHER" && (
                    <input className="form-input w-full mt-2 animate-in slide-in-from-top-2" placeholder="Enter District Name" value={otherValues.district} onChange={e => setOtherValues({...otherValues, district: e.target.value})} />
                  )}
                </div>

                <div className="space-y-1.5">
                  <SearchDropdown label="City" options={cities} valKey="city_code" dispKey="city_name" stateKey="city_code" dKey="ct" />
                  {formData.city_code === "OTHER" && (
                    <input className="form-input w-full mt-2 animate-in slide-in-from-top-2" placeholder="Enter City Name" value={otherValues.city} onChange={e => setOtherValues({...otherValues, city: e.target.value})} />
                  )}
                </div>

                <div className="space-y-1.5"><label className="form-label">Currency</label><input className="form-input w-full" value={formData.currency || ""} onChange={e => setFormData({...formData, currency: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Timezone</label><input className="form-input w-full" value={formData.timezone || ""} onChange={e => setFormData({...formData, timezone: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="form-label">Status</label>
                  <select className="form-input w-full" value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                    <option value={1}>Active</option><option value={0}>Inactive</option>
                  </select>
                </div>
                <div className="space-y-1.5"><label className="form-label">Sort Order</label><input type="number" className="form-input w-full" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: e.target.value})} /></div>
              </div>
            </section>

            <div className="flex justify-end gap-3 border-t pt-8 mt-4" style={{ borderColor: "var(--border-color)" }}>
              <button type="submit" className="btn-primary px-12 py-3">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="data-table-container animate-in fade-in duration-500">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">Code</th>
                  <th className="text-admin-th">Company Name</th>
                  <th className="text-admin-th">Contact Person</th>
                  <th className="text-admin-th">GSTIN</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? paginatedData.map((item) => (
                  <tr key={item.company_code} onClick={() => setSelectedRow(selectedRow?.company_code === item.company_code ? null : item)}
                      className={`group cursor-pointer transition-colors ${selectedRow?.company_code === item.company_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}>
                    <td className="px-6 py-4">
                      <div className={`selection-indicator ${selectedRow?.company_code === item.company_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                        {selectedRow?.company_code === item.company_code && <div className="selection-dot" />}
                      </div>
                    </td>
                    <td className="text-admin-td">{item.company_code}</td>
                    <td className="text-admin-td ">{item.company_name}</td>
                    <td className="text-admin-td">{item.contact_person || "---"}</td>
                    <td className="text-admin-td">{item.gst_number || "---"}</td>
                    <td className="text-admin-td">
                      <span className={`badge ${item.status === 1 ? "badge-success" : "badge-danger"}`}>{item.status === 1 ? "Active" : "Inactive"}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-24 text-center">
                      <FaBuilding size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No Companies Found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
};

export default CompanyMaster;