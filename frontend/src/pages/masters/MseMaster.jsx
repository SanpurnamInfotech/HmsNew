import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaLightbulb } from "react-icons/fa";

const MseMaster = () => {
  /* ================= DATA FETCHING ================= */
  const MSE_PATH = "mse_master";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${MSE_PATH}/`);

  /* ================= UI STATES ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    mse_code: "",
    mse_name: "",
    status: 1,
  });

  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

  /* ================= TABLE LOGIC ================= */
  const { 
    search, setSearch, 
    currentPage, setCurrentPage, 
    itemsPerPage, setItemsPerPage, 
    paginatedData, 
    effectiveItemsPerPage, 
    filteredData, 
    totalPages 
  } = useTable(data || []);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({ mse_code: "", mse_name: "", status: 1 });
  };

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  /* ================= CRUD ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionPath = isEdit ? `${MSE_PATH}/update/${formData.mse_code}/` : `${MSE_PATH}/create/`;
    const payload = { ...formData, status: Number(formData.status) };

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`MSE Record ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;

    const result = await deleteItem(`${MSE_PATH}/delete/${selectedRow.mse_code}/`);
    if (result.success) {
      showModal("MSE Record deleted successfully!");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return (
    <div className="loading-overlay dark:bg-slate-900/80">
      <div className="loading-spinner-container text-center">
        <div className="loading-spinner mx-auto mb-4 border-t-emerald-600"></div>
        <p className="text-emerald-700 dark:text-emerald-500 font-bold tracking-wider">Loading MSE Master...</p>
      </div>
    </div>
  );

  return (
    <div className="app-container min-h-screen transition-colors duration-300 dark:bg-slate-950 p-4">

      {/* MODAL */}
      {modal.visible && (
        <div className="modal-overlay backdrop-blur-sm">
          <div className="modal-container dark:bg-slate-900 dark:border dark:border-slate-800 text-center">
            <div className="modal-body p-8">
              <div className="modal-icon-container mb-4">
                {modal.type === "success" ? (
                  <FaCheckCircle className="text-4xl text-emerald-500 mx-auto" />
                ) : (
                  <FaTimesCircle className="text-4xl text-rose-500 mx-auto" />
                )}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${modal.type === "success" ? "text-emerald-700 dark:text-emerald-500" : "text-rose-700 dark:text-rose-500"}`}>
                {modal.type === "success" ? "Success" : "Error"}
              </h3>
              <p className="text-gray-600 dark:text-slate-400 mb-6">{modal.message}</p>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2.5 rounded-lg font-bold transition-all border-none outline-none shadow-none" onClick={() => setModal({ ...modal, visible: false })}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <h4 className="text-2xl font-black text-gray-800 dark:text-slate-100 tracking-tight">MSE Master</h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all border-none outline-none shadow-none" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>

            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all border-none outline-none shadow-none"
                  onClick={() => { setFormData(selectedRow); setIsEdit(true); setShowForm(true); }}>
                  <FaEdit size={14} /> Edit
                </button>
                <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all border-none outline-none shadow-none"
                  onClick={handleDelete}>
                  <FaTrash size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM SECTION */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8 mb-8 border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
          <h6 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-6 border-b dark:border-slate-800 pb-4">{isEdit ? "Update MSE Record" : "Create MSE Record"}</h6>
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider ml-1">MSE Code</label>
              <input
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${isEdit ? "bg-gray-50 dark:bg-slate-850 text-gray-400 dark:text-slate-500" : ""}`}
                value={formData.mse_code} disabled={isEdit} required
                placeholder="e.g. MSE-001"
                onChange={e => setFormData({ ...formData, mse_code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider ml-1">MSE Name</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={formData.mse_name} required
                placeholder="Enter MSE name"
                onChange={e => setFormData({ ...formData, mse_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider ml-1">Status</label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 transition-all"
                value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t dark:border-slate-800 border-gray-50 pt-6 mt-4">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-2.5 rounded-lg font-bold transition-all border-none outline-none shadow-none">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE SECTION */}
      {!showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden animate-in fade-in duration-500">
          <div className="dark:text-slate-200">
            <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                  <th className="px-6 py-4 w-16"></th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">MSE Code</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">MSE Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {paginatedData.length > 0 ? paginatedData.map(row => (
                  <tr
                    key={row.mse_code}
                    onClick={() => setSelectedRow(selectedRow?.mse_code === row.mse_code ? null : row)}
                    className={`group cursor-pointer transition-colors duration-150 ${
                      selectedRow?.mse_code === row.mse_code 
                        ? "bg-emerald-50/40 dark:bg-emerald-900/10" 
                        : "hover:bg-gray-50/50 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedRow?.mse_code === row.mse_code 
                          ? "border-emerald-500 bg-emerald-500" 
                          : "border-gray-200 dark:border-slate-700 group-hover:border-emerald-300"
                      }`}>
                        {selectedRow?.mse_code === row.mse_code && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in-50" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-800 dark:text-slate-200 text-sm tracking-tight">{row.mse_code}</td>
                    <td className="px-6 py-4 font-bold text-gray-700 dark:text-slate-300">{row.mse_name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        row.status === 1 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      }`}>
                        {row.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <FaLightbulb size={48} className="mb-4 text-gray-200 dark:text-slate-800 mx-auto" />
                      <p className="text-xl font-bold text-gray-300 dark:text-slate-700 tracking-tight">No MSE records found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-white dark:bg-slate-900 border-t border-gray-50 dark:border-slate-800 p-6">
            <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MseMaster;