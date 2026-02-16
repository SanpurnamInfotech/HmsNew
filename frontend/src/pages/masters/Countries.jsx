import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaGlobeAmericas } from 'react-icons/fa';

const Countries = () => {
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud("countries/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [formData, setFormData] = useState({ country_code: "", country_name: "" });
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
    setSelectedCountry(null);
    setFormData({ country_code: "", country_name: "" });
  };

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result = isEdit 
      ? await updateItem(`countries/update/${formData.country_code}/`, formData)
      : await createItem(`countries/create/`, formData);

    if (result.success) {
      showModal(`Country ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedCountry) return;
    const result = await deleteItem(`countries/delete/${selectedCountry.country_code}/`);
    if (result.success) {
      showModal("Country deleted successfully!");
      setSelectedCountry(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Country Data...</p>
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
        <h4 className="text-xl font-bold text-gray-800">Country Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus size={14} /> Add New</button>
            {selectedCountry && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button className="btn-warning" onClick={() => { setFormData({...selectedCountry}); setIsEdit(true); setShowForm(true); }}>
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
            <h6 className="text-lg font-bold text-gray-800">{isEdit ? "Update Country Info" : "Add New Country"}</h6>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">Country Code</label>
              <input 
                className={`form-input ${isEdit ? "form-input-disabled" : ""}`} 
                value={formData.country_code} 
                disabled={isEdit} 
                required 
                maxLength={5}
                onChange={e => setFormData({ ...formData, country_code: e.target.value.toUpperCase() })} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Country Name</label>
              <input className="form-input" value={formData.country_name} required onChange={e => setFormData({ ...formData, country_name: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
              <button className="btn-primary px-10">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="data-table-container">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header-row">
                  <th className="table-th w-16"></th>
                  <th className="table-th">Country Code</th>
                  <th className="table-th">Country Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((c) => (
                  <tr 
                    key={c.country_code} 
                    onClick={() => setSelectedCountry(selectedCountry?.country_code === c.country_code ? null : c)} 
                    className={`table-row ${selectedCountry?.country_code === c.country_code ? "table-row-active" : "table-row-hover"}`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${selectedCountry?.country_code === c.country_code ? "selection-indicator-active" : "selection-indicator-inactive"}`}>
                        {selectedCountry?.country_code === c.country_code && <div className="selection-dot" />}
                      </div>
                    </td>
                    <td className="table-td text-admin-id">{c.country_code}</td>
                    <td className="table-td text-admin-id">{c.country_name}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaGlobeAmericas size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">No countries found</p>
                      </div>
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

export default Countries;