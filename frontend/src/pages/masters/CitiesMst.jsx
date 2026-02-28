import React, { useState, useMemo } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaSearch, FaChevronDown } from "react-icons/fa";

const CitiesMst = () => {
  const CITY_PATH = "cities";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${CITY_PATH}/`);
  const { data: countries } = useCrud("countries/"); 
  const { data: states } = useCrud("states/"); 
  const { data: districts } = useCrud("districts/"); // Districts API fetch

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  
  // Dropdown UI States
  const [openDropdown, setOpenDropdown] = useState(null); // 'country', 'state', or 'district'
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState(""); // District search state

  const [formData, setFormData] = useState({
    city_code: "",
    city_name: "",
    country_code: "",
    state_code: "",
    district_code: "", // Added district_code
    status: 1,
  });

  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setOpenDropdown(null);
    setFormData({ city_code: "", city_name: "", country_code: "", state_code: "", district_code: "", status: 1 });
  };

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  /* ================= DELETE LOGIC ================= */
  const handleDelete = async () => {
    if (!selectedRow || !selectedRow.city_code) {
      showModal("Please select a city to delete", "error");
      return;
    }

    if (window.confirm(`Are you sure you want to delete city: ${selectedRow.city_name}?`)) {
      try {
        const result = await deleteItem(`${CITY_PATH}/delete/${selectedRow.city_code}/`);
        if (result.success) {
          showModal("City deleted successfully!", "success");
          setSelectedRow(null);
          refresh();
        } else {
          showModal(result.error || "Delete failed! Check dependencies.", "error");
        }
      } catch (err) {
        showModal("An unexpected error occurred.", "error");
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

  // District filter based on selected State
  const filteredDistricts = useMemo(() => {
    if (!districts) return [];
    return districts.filter(d => 
      d.state_code === formData.state_code && 
      (d.district_name.toLowerCase().includes(districtSearch.toLowerCase()) ||
       d.district_code.toLowerCase().includes(districtSearch.toLowerCase()))
    );
  }, [districts, formData.state_code, districtSearch]);

  const selectedCountryName = countries?.find(c => c.country_code === formData.country_code)?.country_name || "Select Country";
  const selectedStateName = states?.find(s => s.state_code === formData.state_code)?.state_name || "Select State";
  const selectedDistrictName = districts?.find(d => d.district_code === formData.district_code)?.district_name || "Select District";

  /* ================= TABLE LOGIC ================= */
  const { search, setSearch, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage, paginatedData, effectiveItemsPerPage, filteredData, totalPages } = useTable(data || []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.country_code || !formData.state_code || !formData.district_code) {
      showModal("Please select Country, State, and District", "error");
      return;
    }
    const actionPath = isEdit ? `${CITY_PATH}/update/${formData.city_code}/` : `${CITY_PATH}/create/`;
    const result = isEdit ? await updateItem(actionPath, formData) : await createItem(actionPath, formData);

    if (result.success) {
      showModal(`City ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Failed to save data", "error");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-emerald-600 italic">Loading Cities...</div>;

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
        <h4 className="text-2xl font-black text-gray-800 tracking-tight">Cities Master</h4>
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
          <h6 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">{isEdit ? "Update City" : "Create City"}</h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">City Code</label>
              <input
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${isEdit ? "bg-gray-50 text-gray-400" : ""}`}
                value={formData.city_code} disabled={isEdit} required
                onChange={e => setFormData({ ...formData, city_code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">City Name</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={formData.city_name} required
                onChange={e => setFormData({ ...formData, city_name: e.target.value })}
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
                      <div key={c.country_code} className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-sm" onClick={() => { setFormData({...formData, country_code: c.country_code, state_code: "", district_code: ""}); setOpenDropdown(null); setCountrySearch(""); }}>
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
                      <div key={s.state_code} className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-sm" onClick={() => { setFormData({...formData, state_code: s.state_code, district_code: ""}); setOpenDropdown(null); setStateSearch(""); }}>
                        {s.state_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* District Dropdown - Added */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">District</label>
              <div className={`w-full px-4 py-3 rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer ${!formData.state_code ? "bg-gray-50" : "bg-white"}`} onClick={() => formData.state_code && setOpenDropdown(openDropdown === 'district' ? null : 'district')}>
                <span className={formData.district_code ? "text-gray-800" : "text-gray-400"}>{selectedDistrictName}</span>
                <FaChevronDown className="text-gray-400" size={12} />
              </div>
              {openDropdown === 'district' && (
                <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col">
                  <div className="p-2 border-b bg-gray-50 flex items-center gap-2">
                    <FaSearch className="text-gray-400" size={14} />
                    <input autoFocus className="bg-transparent outline-none text-sm w-full" placeholder="Search district..." value={districtSearch} onChange={(e) => setDistrictSearch(e.target.value)} />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredDistricts.map(d => (
                      <div key={d.district_code} className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-sm" onClick={() => { setFormData({...formData, district_code: d.district_code}); setOpenDropdown(null); setDistrictSearch(""); }}>
                        {d.district_name}
                      </div>
                    ))}
                    {filteredDistricts.length === 0 && <div className="px-4 py-2 text-xs text-gray-400 italic text-center">No districts for this state</div>}
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
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">City Code</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">City Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Country</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">State</th>
                  {/* Added District column header */}
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">District</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.map(row => (
                  <tr key={row.city_code} onClick={() => setSelectedRow(selectedRow?.city_code === row.city_code ? null : row)}
                    className={`group cursor-pointer ${selectedRow?.city_code === row.city_code ? "bg-emerald-50/40" : "hover:bg-gray-50/50"}`}>
                    <td className="px-6 py-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRow?.city_code === row.city_code ? "border-emerald-500 bg-emerald-500" : "border-gray-200"}`}>
                        {selectedRow?.city_code === row.city_code && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-800 text-sm">{row.city_code}</td>
                    <td className="px-6 py-4 font-bold text-gray-700">{row.city_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{row.country_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{row.state_code}</td>
                    {/* Added District column data */}
                    <td className="px-6 py-4 text-sm text-gray-500">{row.district_code}</td>
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

export default CitiesMst;