import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';

const AdviceMaster = () => {
  // 1. Base endpoint matching your backend route
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud("advice_master/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAdvice, setSelectedAdvice] = useState(null);
  const [formData, setFormData] = useState({ advice_code: "", advice_name: "" });
  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

  const { 
    search, setSearch, 
    currentPage, setCurrentPage, 
    itemsPerPage, setItemsPerPage, 
    paginatedData, 
    effectiveItemsPerPage, 
    filteredData,
    totalPages 
  } = useTable(data);

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedAdvice(null);
    setFormData({ advice_code: "", advice_name: "" });
  };

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Following your Countries.jsx pattern: using advice_code for the update URL
    let result = isEdit 
      ? await updateItem(`advice_master/update/${formData.advice_code}/`, formData)
      : await createItem(`advice_master/create/`, formData);

    if (result.success) {
      showModal(`Advice ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedAdvice || !selectedAdvice.advice_code) {
      showModal("Please select a record from the table first.", "error");
      return;
    }
    
    const result = await deleteItem(`advice_master/delete/${selectedAdvice.advice_code}/`);
    
    if (result.success) {
      showModal("Advice deleted successfully!");
      setSelectedAdvice(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Advice Data...</p>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-body">
              <div className="modal-icon-container">
                {modal.type === "success" 
                  ? <div className="modal-icon-success"><FaCheckCircle /></div> 
                  : <div className="modal-icon-error"><FaTimesCircle /></div>
                }
              </div>
              <h3 className={`modal-title ${modal.type === "success" ? "modal-title-success" : "modal-title-error"}`}>
                {modal.type === "success" ? "Success" : "Error"}
              </h3>
              <p className="modal-message mb-6">{modal.message}</p>
              <button className="btn-primary w-full" onClick={() => setModal({ ...modal, visible: false })}>OK</button>
            </div>
          </div>
        </div>
      )}

      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">Advice Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus size={14} /> Add New</button>
            {selectedAdvice && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button 
                  className="btn-warning" 
                  onClick={() => { 
                    setFormData({ ...selectedAdvice }); 
                    setIsEdit(true); 
                    setShowForm(true); 
                  }}
                >
                  <FaEdit size={14} /> Edit
                </button>
                <button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="form-container">
          <div className="mb-8 border-b border-gray-50 pb-5">
            <h6 className="text-lg font-bold text-gray-800">
              {isEdit ? "Update Advice" : "Add New Advice"}
            </h6>
          </div>
          
          <form className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            
            {/* Column 1: Advice Code (Takes half row on desktop) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="form-label">Advice Code</label>
              <input 
                type="text"
                className={`form-input ${isEdit ? "form-input-disabled" : ""}`} 
                value={formData.advice_code} 
                disabled={isEdit} 
                required 
                placeholder="e.g. ADV-001"
                onChange={e => setFormData({ ...formData, advice_code: e.target.value })} 
              />
            </div>

            {/* Column 2: Advice Description (Takes half row on desktop) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="form-label">Advice Description</label>
              <textarea 
                className="form-input min-h-[45px]" 
                value={formData.advice_name} 
                required 
                placeholder="Enter advice text here..."
                onChange={e => setFormData({ ...formData, advice_name: e.target.value })} 
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
              <button className="btn-primary px-10">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="data-table-container">
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
                <tr className="table-header-row">
                  <th className="table-th"></th>
                  <th className="table-th">Advice Code</th>
                  <th className="table-th">Advice Name / Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((item) => (
                  <tr 
                    key={item.advice_code} 
                    onClick={() => setSelectedAdvice(selectedAdvice?.advice_code === item.advice_code ? null : item)} 
                    className={`table-row ${selectedAdvice?.advice_code === item.advice_code ? "table-row-active" : "table-row-hover"}`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${selectedAdvice?.advice_code === item.advice_code ? "selection-indicator-active" : "selection-indicator-inactive"}`}>
                        {selectedAdvice?.advice_code === item.advice_code && <div className="selection-dot" />}
                      </div>
                    </td>
                    <td className="table-td text-admin-id">{item.advice_code}</td>
                    <td className="table-td text-admin-id">{item.advice_name}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaLightbulb size={48} className="mb-4 text-gray-400 mx-auto" />
                        <p className="text-xl font-bold text-gray-500">No advice records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            totalEntries={filteredData.length} 
            itemsPerPage={effectiveItemsPerPage} 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            totalPages={totalPages} 
          />
        </div>
      )}
    </div>
  );
};

export default AdviceMaster;