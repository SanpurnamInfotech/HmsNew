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
  FaBuilding 
} from "react-icons/fa";

const Departments = () => {
  const DEPT_PATH = "departments";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${DEPT_PATH}/`);
  
  // Fetching Related Master Data
  const { data: companies } = useCrud("company_master/");
  const { data: financialYears } = useCrud("financialyear-master/");

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Dropdown UI States
  const [openDropdown, setOpenDropdown] = useState(null); 
  const [companySearch, setCompanySearch] = useState("");
  const [fySearch, setFySearch] = useState("");

  const [formData, setFormData] = useState({
    department_code: "",
    department_name: "",
    financialyear_code: "",
    company_code: "",
    sort_order: "",
    status: 1,
  });

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

  /* ================= SORTING LOGIC ================= */
  // Sort data by sort_order ascending before passing it to the table hook
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
    setCompanySearch("");
    setFySearch("");
    setFormData({ 
      department_code: "", 
      department_name: "", 
      financialyear_code: "", 
      company_code: "", 
      sort_order: "", 
      status: 1 
    });
  };

  const showModal = (message, type = "success") => setModal({ visible: true, message, type });

  // Helper to format the display of FY (e.g., 2024 - 2025)
  const getFYDisplayName = (f) => f ? `${f.start_year} - ${f.end_year}` : "Select Financial Year";

  /* ================= FILTER & DISPLAY LOGIC ================= */
  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    return companies.filter(c =>
      c.company_name.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.company_code.toLowerCase().includes(companySearch.toLowerCase())
    );
  }, [companies, companySearch]);

  const filteredFY = useMemo(() => {
    if (!financialYears) return [];
    return financialYears.filter(f =>
      f.financialyear_code.toLowerCase().includes(fySearch.toLowerCase()) ||
      `${f.start_year}-${f.end_year}`.includes(fySearch)
    );
  }, [financialYears, fySearch]);

  const selectedCompanyName = companies?.find(c => c.company_code === formData.company_code)?.company_name || "Select Company";
  
  const selectedFYObj = financialYears?.find(f => f.financialyear_code === formData.financialyear_code);
  const selectedFYName = selectedFYObj ? getFYDisplayName(selectedFYObj) : "Select Financial Year";

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.company_code || !formData.financialyear_code) {
      showModal("Please select both Company and Financial Year", "error");
      return;
    }

    const actionPath = isEdit 
      ? `${DEPT_PATH}/update/${formData.department_code}/` 
      : `${DEPT_PATH}/create/`;

    const payload = { ...formData };
    
    if (!isEdit) {
      delete payload.department_code;
    }

    // Process sort_order for DB
    payload.sort_order = (payload.sort_order === "" || payload.sort_order === null) ? null : Number(payload.sort_order);

    const result = isEdit 
      ? await updateItem(actionPath, payload) 
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Department ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Failed to save data", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedRow || !selectedRow.department_code) return;
    const result = await deleteItem(`${DEPT_PATH}/delete/${selectedRow.department_code}/`);
    if (result.success) {
      showModal("Department deleted successfully!");
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
        <h4 className="page-title">Department Master</h4>
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
            {isEdit ? "Update Department" : "Add New Department"}
          </h6>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>

            <div className="space-y-1.5">
              <label className="form-label">Department Name</label>
              <input
                className="form-input w-full"
                value={formData.department_name}
                required
                onChange={e => setFormData({ ...formData, department_name: e.target.value })}
                placeholder="E.G. Human Resources"
              />
            </div>

            {/* COMPANY DROPDOWN */}
            <div className="space-y-1.5 relative">
              <label className="form-label">Company</label>
              <div className="form-input w-full flex justify-between items-center cursor-pointer" onClick={() => setOpenDropdown(openDropdown === 'company' ? null : 'company')}>
                <span className={formData.company_code ? "" : "opacity-50"}>{selectedCompanyName}</span>
                <FaChevronDown size={12} className="opacity-50" />
              </div>
              {openDropdown === 'company' && (
                <div className="absolute z-60 w-full mt-2 rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                  <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-hover)" }}>
                    <FaSearch className="opacity-40" size={14} />
                    <input autoFocus className="bg-transparent outline-none text-sm w-full" placeholder="Search company..." value={companySearch} onChange={(e) => setCompanySearch(e.target.value)} />
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredCompanies.map(c => (
                      <div key={c.company_code} className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm transition-colors" onClick={() => { setFormData({ ...formData, company_code: c.company_code }); setOpenDropdown(null); }}>
                        {c.company_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FINANCIAL YEAR DROPDOWN */}
            <div className="space-y-1.5 relative">
              <label className="form-label">Financial Year</label>
              <div className="form-input w-full flex justify-between items-center cursor-pointer" onClick={() => setOpenDropdown(openDropdown === 'fy' ? null : 'fy')}>
                <span className={formData.financialyear_code ? "" : "opacity-50"}>{selectedFYName}</span>
                <FaChevronDown size={12} className="opacity-50" />
              </div>
              {openDropdown === 'fy' && (
                <div className="absolute z-60 w-full mt-2 rounded-xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                  <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-hover)" }}>
                    <FaSearch className="opacity-40" size={14} />
                    <input autoFocus className="bg-transparent outline-none text-sm w-full" placeholder="Search FY..." value={fySearch} onChange={(e) => setFySearch(e.target.value)} />
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredFY.map(f => (
                      <div key={f.financialyear_code} className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm transition-colors" onClick={() => { setFormData({ ...formData, financialyear_code: f.financialyear_code }); setOpenDropdown(null); }}>
                        {getFYDisplayName(f)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Sort Order</label>
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
                  <th className="text-admin-th">Dept Code</th>
                  <th className="text-admin-th">Dept Name</th>
                  <th className="text-admin-th">Company</th>
                  <th className="text-admin-th">Financial Year</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
            {paginatedData.length > 0 ? (
                paginatedData.map((item) => {
                const displayCompanyName = companies?.find(
                    (c) => c.company_code === item.company_code
                )?.company_name || item.company_code;

                const fyObj = financialYears?.find(
                    (f) => f.financialyear_code === item.financialyear_code
                );
                const displayFYName = fyObj ? `${fyObj.start_year} - ${fyObj.end_year}` : item.financialyear_code;

                return (
                    <tr
                    key={item.department_code}
                    onClick={() => setSelectedRow(selectedRow?.department_code === item.department_code ? null : item)}
                    className={`group cursor-pointer transition-colors ${
                        selectedRow?.department_code === item.department_code
                        ? "bg-emerald-500/10"
                        : "hover:bg-emerald-500/5"
                    }`}
                    >
                    <td className="px-6 py-4">
                        <div
                        className={`selection-indicator ${
                            selectedRow?.department_code === item.department_code
                            ? "selection-indicator-active"
                            : "group-hover:border-emerald-500/50"
                        }`}
                        >
                        {selectedRow?.department_code === item.department_code && (
                            <div className="selection-dot" />
                        )}
                        </div>
                    </td>
                    <td className="text-admin-td">{item.department_code}</td>
                    <td className="text-admin-td">{item.department_name}</td>
                    <td className="text-admin-td">{displayCompanyName}</td>
                    <td className="text-admin-td">{displayFYName}</td>
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
                    <FaBuilding size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                    <p className="text-xl font-black opacity-30 uppercase tracking-widest">
                    No departments found
                    </p>
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

export default Departments;