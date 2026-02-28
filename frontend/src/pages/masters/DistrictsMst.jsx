import React, { useState, useMemo } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaSearch, FaChevronDown } from "react-icons/fa";

const DistrictsMst = () => {
  const DISTRICT_PATH = "districts";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${DISTRICT_PATH}/`);
  const { data: countries } = useCrud("countries/"); 
  const { data: states } = useCrud("states/"); 

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  
  const [openDropdown, setOpenDropdown] = useState(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");

  const [formData, setFormData] = useState({
    district_code: "",
    district_name: "",
    country_code: "",
    state_code: "",
    status: 1,
  });

  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setOpenDropdown(null);
    setFormData({ district_code: "", district_name: "", country_code: "", state_code: "", status: 1 });
  };

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  /* ================= DELETE LOGIC (FIXED) ================= */
  const handleDelete = async () => {
    if (!selectedRow || !selectedRow.district_code) {
      showModal("Please select a row to delete", "error");
      return;
    }

    if (window.confirm(`Are you sure you want to delete district: ${selectedRow.district_name}?`)) {
      try {
        // API path ensure karein ki backend ke format se match ho raha hai
        const result = await deleteItem(`${DISTRICT_PATH}/delete/${selectedRow.district_code}/`);
        
        if (result.success) {
          showModal("District deleted successfully!", "success");
          setSelectedRow(null); // Selection saaf karein
          refresh(); // Table refresh karein
        } else {
          showModal(result.error || "Delete failed! This record might be in use.", "error");
        }
      } catch (err) {
        showModal("An unexpected error occurred during delete.", "error");
      }
    }
  };

  /* ================= FILTER LOGIC ================= */
  const filteredCountries = useMemo(() => {
    if (!countries) return [];
    return countries.filter(c => 
      c.country_name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.country_code.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countries, countrySearch]);

  const filteredStates = useMemo(() => {
    if (!states) return [];
    return states.filter(s => 
      s.country_code === formData.country_code && 
      (s.state_name.toLowerCase().includes(stateSearch.toLowerCase()) ||
       s.state_code.toLowerCase().includes(stateSearch.toLowerCase()))
    );
  }, [states, formData.country_code, stateSearch]);

  const selectedCountryName = countries?.find(c => c.country_code === formData.country_code)?.country_name || "Select Country";
  const selectedStateName = states?.find(s => s.state_code === formData.state_code)?.state_name || "Select State";

  /* ================= TABLE LOGIC ================= */
  const { search, setSearch, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage, paginatedData, effectiveItemsPerPage, filteredData, totalPages } = useTable(data || []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.country_code || !formData.state_code) {
      showModal("Please select both Country and State", "error");
      return;
    }
    const actionPath = isEdit ? `${DISTRICT_PATH}/update/${formData.district_code}/` : `${DISTRICT_PATH}/create/`;
    const result = isEdit ? await updateItem(actionPath, formData) : await createItem(actionPath, formData);

    if (result.success) {
      showModal(`District ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Failed to save data", "error");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-emerald-600">Loading...</div>;

  return (
    <div className="app-container">
      {/* MODAL */}
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-body text-center">
              <div className="modal-icon-container mb-4">
                {modal.type === "success" ? <FaCheckCircle className="text-4xl text-emerald-500 mx-auto" /> : <FaTimesCircle className="text-4xl text-red-500 mx-auto" />}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${modal.type === "success" ? "text-emerald-700" : "text-red-700"}`}>{modal.type === "success" ? "Success" : "Error"}</h3>
              <p className="text-gray-600 mb-6">{modal.message}</p>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2.5 rounded-lg font-semibold" onClick={() => setModal({ ...modal, visible: false })}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <h4 className="text-2xl font-black text-gray-800 tracking-tight">Districts Master</h4>
        {!showForm && (
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold" onClick={() => setShowForm(true)}><FaPlus size={14} /> Add New</button>
            {selectedRow && (
              <>
                <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold" onClick={() => { setFormData(selectedRow); setIsEdit(true); setShowForm(true); }}><FaEdit size={14} /> Edit</button>
                <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 animate-in zoom-in-95 duration-200">
          <h6 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">{isEdit ? "Update District" : "Create District"}</h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">District Code</label>
              <input
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${isEdit ? "bg-gray-50 text-gray-400" : ""}`}
                value={formData.district_code} disabled={isEdit} required
                onChange={e => setFormData({ ...formData, district_code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">District Name</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={formData.district_name} required
                onChange={e => setFormData({ ...formData, district_name: e.target.value })}
              />
            </div>

            {/* Country Dropdown */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Country</label>
              <div className="w-full px-4 py-3 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer bg-white" onClick={() => setOpenDropdown(openDropdown === 'country' ? null : 'country')}>
                <span className={formData.country_code ? "text-gray-800" : "text-gray-400"}>{selectedCountryName}</span>
                <FaChevronDown className="text-gray-400" size={12} />
              </div>
              {openDropdown === 'country' && (
                <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col">
                  <div className="p-2 border-b bg-gray-50 flex items-center gap-2">
                    <FaSearch className="text-gray-400" size={14} />
                    <input autoFocus className="bg-transparent outline-none text-sm w-full" placeholder="Search country..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCountries.map(c => (
                      <div key={c.country_code} className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-sm" onClick={() => { setFormData({...formData, country_code: c.country_code, state_code: ""}); setOpenDropdown(null); setCountrySearch(""); }}>
                        {c.country_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* State Dropdown */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">State</label>
              <div className={`w-full px-4 py-3 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer ${!formData.country_code ? "bg-gray-50" : "bg-white"}`} onClick={() => formData.country_code && setOpenDropdown(openDropdown === 'state' ? null : 'state')}>
                <span className={formData.state_code ? "text-gray-800" : "text-gray-400"}>{selectedStateName}</span>
                <FaChevronDown className="text-gray-400" size={12} />
              </div>
              {openDropdown === 'state' && (
                <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col">
                  <div className="p-2 border-b bg-gray-50 flex items-center gap-2">
                    <FaSearch className="text-gray-400" size={14} />
                    <input autoFocus className="bg-transparent outline-none text-sm w-full" placeholder="Search state..." value={stateSearch} onChange={(e) => setStateSearch(e.target.value)} />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredStates.map(s => (
                      <div key={s.state_code} className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-sm" onClick={() => { setFormData({...formData, state_code: s.state_code}); setOpenDropdown(null); setStateSearch(""); }}>
                        {s.state_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Status</label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-6">
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-2.5 rounded-lg font-bold">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="px-6 py-2.5 text-sm font-bold text-gray-400" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 w-16"></th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Dist Code</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Dist Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Country</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">State</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.map(row => (
                  <tr key={row.district_code} onClick={() => setSelectedRow(selectedRow?.district_code === row.district_code ? null : row)}
                    className={`group cursor-pointer ${selectedRow?.district_code === row.district_code ? "bg-emerald-50/40" : "hover:bg-gray-50/50"}`}>
                    <td className="px-6 py-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRow?.district_code === row.district_code ? "border-emerald-500 bg-emerald-500" : "border-gray-200"}`}>
                        {selectedRow?.district_code === row.district_code && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-800 text-sm">{row.district_code}</td>
                    <td className="px-6 py-4 font-bold text-gray-700">{row.district_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{row.country_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{row.state_code}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${row.status === 1 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {row.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white border-t border-gray-50 p-6">
            <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictsMst;