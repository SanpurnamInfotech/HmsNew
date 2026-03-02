import React, { useState, useMemo } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaSearch, FaChevronDown, FaMapMarkerAlt } from "react-icons/fa";

const StatesMst = () => {
  const STATE_PATH = "states";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${STATE_PATH}/`);
  const { data: countries } = useCrud("countries/");

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Dropdown UI States
  const [openDropdown, setOpenDropdown] = useState(null); // 'country'
  const [countrySearch, setCountrySearch] = useState("");

  const [formData, setFormData] = useState({
    state_code: "",
    state_name: "",
    country_code: "",
    status: 1,
  });

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

  /* ================= TABLE ================= */
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
    setFormData({ state_code: "", state_name: "", country_code: "", status: 1 });
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

  const selectedCountryName = countries?.find(c => c.country_code === formData.country_code)?.country_name || "Select Country";

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.country_code) {
      showModal("Please select a Country", "error");
      return;
    }

    const actionPath = isEdit ? `${STATE_PATH}/update/${formData.state_code}/` : `${STATE_PATH}/create/`;
    const result = isEdit ? await updateItem(actionPath, formData) : await createItem(actionPath, formData);

    if (result.success) {
      showModal(`State ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Failed to save data", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedRow || !selectedRow.state_code) return;

    const result = await deleteItem(`${STATE_PATH}/delete/${selectedRow.state_code}/`);
    if (result.success) {
      showModal("State deleted successfully!");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  /* ================= LOADING ================= */
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="app-container">
      {/* SUCCESS/ERROR MODAL */}
      {modal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? (
                <FaCheckCircle className="text-6xl text-emerald-500" />
              ) : (
                <FaTimesCircle className="text-6xl text-rose-500" />
              )}
            </div>
            <h3 className={`text-xl font-black mb-2 uppercase tracking-tight ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
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

      {/* ================= HEADER ================= */}
      <div className="section-header">
        <h4 className="page-title">States Master</h4>
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
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">
            {isEdit ? "Update State Profile" : "Add New State"}
          </h6>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            {/* STATE CODE */}
            <div className="space-y-1.5">
              <label className="form-label">State Code</label>
              <input
                className="form-input w-full"
                value={formData.state_code}
                disabled={isEdit}
                required
                onChange={e => setFormData({ ...formData, state_code: e.target.value.toUpperCase() })}
                placeholder="E.G. KA"
              />
            </div>

            {/* STATE NAME */}
            <div className="space-y-1.5">
              <label className="form-label">State Name</label>
              <input
                className="form-input w-full"
                value={formData.state_name}
                required
                onChange={e => setFormData({ ...formData, state_name: e.target.value })}
                placeholder="E.G. Karnataka"
              />
            </div>

            {/* COUNTRY DROPDOWN */}
            <div className="space-y-1.5 relative">
              <label className="form-label">Country</label>
              <div
                className="form-input w-full flex justify-between items-center cursor-pointer"
                onClick={() => setOpenDropdown(openDropdown === 'country' ? null : 'country')}
              >
                <span className={formData.country_code ? "" : "opacity-50"}>{selectedCountryName}</span>
                <FaChevronDown size={12} className="opacity-50" />
              </div>
              
              {openDropdown === 'country' && (
                <div className="absolute z-[60] w-full mt-2 rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150" 
                     style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                  <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-hover)" }}>
                    <FaSearch className="opacity-40" size={14} />
                    <input
                      autoFocus
                      className="bg-transparent outline-none text-sm w-full"
                      placeholder="Search country..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map(c => (
                        <div
                          key={c.country_code}
                          className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm transition-colors"
                          onClick={() => {
                            setFormData({ ...formData, country_code: c.country_code });
                            setOpenDropdown(null);
                            setCountrySearch("");
                          }}
                        >
                          {c.country_name} <span className="text-[10px] opacity-40 ml-2">({c.country_code})</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs opacity-50">No results found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* STATUS */}
            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select
                className="form-input w-full cursor-pointer appearance-none"
                style={{ colorScheme: "dark" }}
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t pt-8 mt-4" style={{ borderColor: "var(--border-color)" }}>
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

      {/* ================= TABLE ================= */}
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
                  <th className="text-admin-th">State Code</th>
                  <th className="text-admin-th">State Name</th>
                  <th className="text-admin-th">Country</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr
                      key={item.state_code}
                      onClick={() => setSelectedRow(selectedRow?.state_code === item.state_code ? null : item)}
                      className={`group cursor-pointer transition-colors ${
                        selectedRow?.state_code === item.state_code
                          ? "bg-emerald-500/10"
                          : "hover:bg-emerald-500/5"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div
                          className={`selection-indicator ${
                            selectedRow?.state_code === item.state_code
                              ? "selection-indicator-active"
                              : "group-hover:border-emerald-500/50"
                          }`}
                        >
                          {selectedRow?.state_code === item.state_code && (
                            <div className="selection-dot" />
                          )}
                        </div>
                      </td>
                      <td className="text-admin-td">{item.state_code}</td>
                      <td className="text-admin-td">{item.state_name}</td>
                      <td className="text-admin-td">{item.country_code}</td>
                      <td className="text-admin-td">
                        <span className={`badge ${item.status === 1 ? "badge-success" : "badge-danger"}`}>
                          {item.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                      <FaMapMarkerAlt
                        size={64}
                        className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse"
                      />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">
                        No states found
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

export default StatesMst;