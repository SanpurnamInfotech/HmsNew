import React, { useState, useMemo } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaLightbulb,
  FaSearch
} from "react-icons/fa";

const ThoughtContentMaster = () => {
  const PATH = "thought_content";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    thought_content_code: "",
    thought_content_name: "",
    status: 1,
  });

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

  /* ================= TABLE ================= */
  const {
    search, setSearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
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
    setFormData({ thought_content_code: "", thought_content_name: "", status: 1 });
  };

  const showModal = (message, type = "success") => setModal({ visible: true, message, type });

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit 
      ? `${PATH}/update/${formData.thought_content_code}/` 
      : `${PATH}/create/`;

    const payload = { 
        ...formData, 
        status: Number(formData.status) 
    };

    const result = isEdit 
      ? await updateItem(actionPath, payload) 
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Record ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Failed to save data", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedRow) return;
    const result = await deleteItem(`${PATH}/delete/${selectedRow.thought_content_code}/`);
    if (result.success) {
      showModal("Record deleted successfully!");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="app-container">
      {/* MODAL */}
      {modal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center shadow-2xl">
            {modal.type === "success" ? <FaCheckCircle className="text-6xl text-emerald-500 mx-auto mb-4" /> : <FaTimesCircle className="text-6xl text-rose-500 mx-auto mb-4" />}
            <h3 className="text-xl font-black uppercase mb-2">{modal.type === "success" ? "Success" : "Error"}</h3>
            <p className="mb-6 opacity-80">{modal.message}</p>
            <button className="btn-primary w-full py-3" onClick={() => setModal({ ...modal, visible: false })}>Continue</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="section-header">
        <h4 className="page-title">Thought Content Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus size={14} /> Add New</button>
            {selectedRow && (
              <>
                <button className="btn-warning" onClick={() => { setFormData({ ...selectedRow }); setIsEdit(true); setShowForm(true); }}>
                  <FaEdit size={14} /> Edit
                </button>
                <button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
              </>
            )}
          </div>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase">{isEdit ? "Update Profile" : "Add New Content"}</h6>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">Code</label>
              <input className="form-input w-full" value={formData.thought_content_code} disabled={isEdit} required onChange={e => setFormData({ ...formData, thought_content_code: e.target.value.toUpperCase() })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Name</label>
              <input className="form-input w-full" value={formData.thought_content_name} required onChange={e => setFormData({ ...formData, thought_content_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select className="form-input w-full" value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 border-t pt-4">
              <button type="submit" className="btn-primary px-10">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}
      {!showForm && (
        <div className="data-table-container">
          <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr><th className="text-admin-th w-16"></th><th className="text-admin-th">Code</th><th className="text-admin-th">Name</th><th className="text-admin-th">Status</th></tr>
              </thead>
              <tbody className="divide-y">
                {paginatedData.map((item) => (
                  <tr key={item.thought_content_code} onClick={() => setSelectedRow(selectedRow?.thought_content_code === item.thought_content_code ? null : item)} className={`cursor-pointer ${selectedRow?.thought_content_code === item.thought_content_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}>
                    <td className="px-6 py-4">
                       <div className={`selection-indicator ${selectedRow?.thought_content_code === item.thought_content_code ? "selection-indicator-active" : ""}`} />
                    </td>
                    <td className="text-admin-td font-bold">{item.thought_content_code}</td>
                    <td className="text-admin-td">{item.thought_content_name}</td>
                    <td className="text-admin-td"><span className={`badge ${item.status === 1 ? "badge-success" : "badge-danger"}`}>{item.status === 1 ? "Active" : "Inactive"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
};

export default ThoughtContentMaster;