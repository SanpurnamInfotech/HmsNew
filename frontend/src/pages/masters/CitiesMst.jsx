import React, { useState, useMemo } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaSearch, FaChevronDown, FaCity } from "react-icons/fa";

const CitiesMst = () => {
  const CITY_PATH = "cities";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${CITY_PATH}/`);
  const { data: countries } = useCrud("countries/");
  const { data: states } = useCrud("states/");
  const { data: districts } = useCrud("districts/");

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");

  const [formData, setFormData] = useState({
    city_code: "",
    city_name: "",
    country_code: "",
    state_code: "",
    district_code: "",
    status: 1,
  });

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

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
  } = useTable(data || []);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setOpenDropdown(null);
    setCountrySearch("");
    setStateSearch("");
    setDistrictSearch("");
    setFormData({ city_code: "", city_name: "", country_code: "", state_code: "", district_code: "", status: 1 });
  };

  const showModal = (message, type = "success") => setModal({ visible: true, message, type });

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

  /* ================= ACTIONS ================= */
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

  const handleDelete = async () => {
    if (!selectedRow || !selectedRow.city_code) return;

    const result = await deleteItem(`${CITY_PATH}/delete/${selectedRow.city_code}/`);
    if (result.success) {
      showModal("City deleted successfully!");
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
      {/* GLOBAL MODAL */}
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
            <button className="btn-primary w-full justify-center py-3" onClick={() => setModal({ ...modal, visible: false })}>Continue</button>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="section-header">
        <h4 className="page-title">Cities Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus size={14} /> Add New</button>
            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="btn-warning" onClick={() => { setFormData(selectedRow); setIsEdit(true); setShowForm(true); }}><FaEdit size={14} /> Edit</button>
                <button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM SECTION */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">{isEdit ? "Update City Info" : "Register New City"}</h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            
            <div className="space-y-1.5">
              <label className="form-label">City Code</label>
              <input
                className="form-input w-full"
                value={formData.city_code} disabled={isEdit} required
                onChange={e => setFormData({ ...formData, city_code: e.target.value.toUpperCase() })}
                placeholder="E.G. MUMBAI"
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">City Name</label>
              <input
                className="form-input w-full"
                value={formData.city_name} required
                onChange={e => setFormData({ ...formData, city_name: e.target.value })}
                placeholder="E.G. New Delhi"
              />
            </div>

            {/* COUNTRY DROPDOWN */}
            <div className="space-y-1.5 relative">
              <label className="form-label">Country</label>
              <div className="form-input w-full flex justify-between items-center cursor-pointer" onClick={() => setOpenDropdown(openDropdown === 'country' ? null : 'country')}>
                <span className={formData.country_code ? "" : "opacity-50"}>{selectedCountryName}</span>
                <FaChevronDown size={12} className="opacity-50" />
              </div>
              {openDropdown === 'country' && (
                <div className="absolute z-60 w-full mt-2 rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                  <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-hover)" }}>
                    <FaSearch className="opacity-40" size={14} />
                    <input autoFocus className="bg-transparent outline-none text-sm w-full" placeholder="Search country..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} />
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredCountries.map(c => (
                      <div key={c.country_code} className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm transition-colors" onClick={() => { setFormData({...formData, country_code: c.country_code, state_code: "", district_code: ""}); setOpenDropdown(null); setCountrySearch(""); }}>
                        {c.country_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STATE DROPDOWN */}
            <div className="space-y-1.5 relative">
              <label className="form-label">State</label>
              <div className={`form-input w-full flex justify-between items-center cursor-pointer ${!formData.country_code ? "opacity-50 cursor-not-allowed" : ""}`} onClick={() => formData.country_code && setOpenDropdown(openDropdown === 'state' ? null : 'state')}>
                <span className={formData.state_code ? "" : "opacity-50"}>{selectedStateName}</span>
                <FaChevronDown size={12} className="opacity-50" />
              </div>
              {openDropdown === 'state' && (
                <div className="absolute z-60 w-full mt-2 rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                  <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-hover)" }}>
                    <FaSearch className="opacity-40" size={14} />
                    <input autoFocus className="bg-transparent outline-none text-sm w-full" placeholder="Search state..." value={stateSearch} onChange={(e) => setStateSearch(e.target.value)} />
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredStates.map(s => (
                      <div key={s.state_code} className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm transition-colors" onClick={() => { setFormData({...formData, state_code: s.state_code, district_code: ""}); setOpenDropdown(null); setStateSearch(""); }}>
                        {s.state_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DISTRICT DROPDOWN */}
            <div className="space-y-1.5 relative">
              <label className="form-label">District</label>
              <div className={`form-input w-full flex justify-between items-center cursor-pointer ${!formData.state_code ? "opacity-50 cursor-not-allowed" : ""}`} onClick={() => formData.state_code && setOpenDropdown(openDropdown === 'district' ? null : 'district')}>
                <span className={formData.district_code ? "" : "opacity-50"}>{selectedDistrictName}</span>
                <FaChevronDown size={12} className="opacity-50" />
              </div>
              {openDropdown === 'district' && (
                <div className="absolute z-60 w-full mt-2 rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                  <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-hover)" }}>
                    <FaSearch className="opacity-40" size={14} />
                    <input autoFocus className="bg-transparent outline-none text-sm w-full" placeholder="Search district..." value={districtSearch} onChange={(e) => setDistrictSearch(e.target.value)} />
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredDistricts.length > 0 ? (
                      filteredDistricts.map(d => (
                        <div key={d.district_code} className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm transition-colors" onClick={() => { setFormData({...formData, district_code: d.district_code}); setOpenDropdown(null); setDistrictSearch(""); }}>
                          {d.district_name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs italic opacity-40 text-center">No districts found for this state</div>
                    )}
                  </div>
                </div>
              )}
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

      {/* TABLE SECTION */}
      {!showForm && (
        <div className="data-table-container animate-in fade-in duration-500">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">City Code</th>
                  <th className="text-admin-th">City Name</th>
                  <th className="text-admin-th">Country</th>
                  <th className="text-admin-th">State</th>
                  <th className="text-admin-th">District</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map(row => (
                    <tr key={row.city_code} onClick={() => setSelectedRow(selectedRow?.city_code === row.city_code ? null : row)}
                        className={`group cursor-pointer transition-colors ${selectedRow?.city_code === row.city_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}>
                      <td className="px-6 py-4">
                        <div className={`selection-indicator ${selectedRow?.city_code === row.city_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                          {selectedRow?.city_code === row.city_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="text-admin-td">{row.city_code}</td>
                      <td className="text-admin-td">{row.city_name}</td>
                      <td className="text-admin-td">{row.country_code}</td>
                      <td className="text-admin-td">{row.state_code}</td>
                      <td className="text-admin-td">{row.district_code}</td>
                      <td className="text-admin-td">
                        <span className={`badge ${row.status === 1 ? "badge-success" : "badge-danger"}`}>
                          {row.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-24 text-center">
                      <FaCity size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No Cities Found</p>
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

export default CitiesMst;