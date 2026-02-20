import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';

const AdviceMaster = () => {
  /* ================= DATA FETCHING ================= */
  const BASE_PATH = "advice_master";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${BASE_PATH}/`);

  /* ================= UI STATES ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAdvice, setSelectedAdvice] = useState(null);
  const [formData, setFormData] = useState({ advice_code: "", advice_name: "" });
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
  } = useTable(data);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedAdvice(null);
    setFormData({ advice_code: "", advice_name: "" });
  };

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  /* ================= CRUD OPERATIONS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionPath = isEdit 
      ? `${BASE_PATH}/update/${formData.advice_code}/` 
      : `${BASE_PATH}/create/`;

    const result = isEdit ? await updateItem(actionPath, formData) : await createItem(actionPath, formData);

    if (result.success) {
      showModal(`Advice ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedAdvice) return;
    if (!window.confirm("Are you sure you want to delete this advice?")) return;
    
    const result = await deleteItem(`${BASE_PATH}/delete/${selectedAdvice.advice_code}/`);
    if (result.success) {
      showModal("Advice deleted successfully!");
      setSelectedAdvice(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="app-container">
      {/* NOTIFICATION MODAL */}
      {modal.visible && (
        <div className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="mb-4">
              {modal.type === "success" ? (
                <FaCheckCircle size={50} className="text-emerald-500 mx-auto" />
              ) : (
                <FaTimesCircle size={50} className="text-red-500 mx-auto" />
              )}
            </div>
            <h3 className={`text-xl font-bold mb-2 ${modal.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            <p className="text-gray-600 mb-6">{modal.message}</p>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2.5 rounded-lg font-semibold" onClick={() => setModal({ ...modal, visible: false })}>OK</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <div>
          <h4 className="text-xl font-bold text-gray-800">Advice Master</h4>
        </div>
        {!showForm && (
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-emerald-100" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>
            {selectedAdvice && (
              <div className="flex gap-2 animate-in slide-in-from-right-5">
                <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md" onClick={() => { setFormData({...selectedAdvice}); setIsEdit(true); setShowForm(true); }}>
                  <FaEdit size={14} /> Edit
                </button>
                <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md" onClick={handleDelete}>
                  <FaTrash size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 animate-in zoom-in-95 duration-200">
          <h6 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">{isEdit ? "Update Advice" : "Create New Advice"}</h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Advice Code</label>
              <input 
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${isEdit ? 'bg-gray-50 text-gray-400' : ''}`} 
                value={formData.advice_code} 
                disabled={isEdit} 
                required 
                onChange={e => setFormData({ ...formData, advice_code: e.target.value.toUpperCase().replace(/\s/g, '_') })} 
                placeholder="E.G. ADV_DAILY_REST"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Advice Description</label>
              <input 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                value={formData.advice_name} 
                required 
                onChange={e => setFormData({ ...formData, advice_name: e.target.value })} 
                placeholder="E.G. Take 8 hours of sleep" 
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-emerald-100">
                {isEdit ? "Update" : "Save"}
              </button>
              <button type="button" className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-700" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE VIEW */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 w-16"></th>
                  <th className="text-admin-th">Advice Code</th>
                  <th className="text-admin-th">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((item) => (
                  <tr key={item.advice_code} onClick={() => setSelectedAdvice(selectedAdvice?.advice_code === item.advice_code ? null : item)} 
                      className={`group cursor-pointer transition-colors duration-150 ${selectedAdvice?.advice_code === item.advice_code ? "bg-emerald-50/40" : "hover:bg-gray-50/50"}`}>
                    <td className="px-6 py-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedAdvice?.advice_code === item.advice_code ? "border-emerald-500 bg-emerald-500" : "border-gray-200 group-hover:border-emerald-300"}`}>
                            {selectedAdvice?.advice_code === item.advice_code && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                    </td>
                    <td className="text-admin-td">{item.advice_code}</td>
                    <td className="text-admin-td">{item.advice_name}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-20 text-center">
                        <FaLightbulb size={48} className="mb-4 text-gray-200 mx-auto" />
                        <p className="text-lg font-medium text-gray-400">No advice records found</p>
                    </td>
                  </tr>
                )}
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

export default AdviceMaster;