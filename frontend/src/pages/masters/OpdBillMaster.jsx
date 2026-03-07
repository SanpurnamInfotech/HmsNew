import React, { useState, useMemo } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaFileInvoiceDollar 
} from "react-icons/fa";

const OpdBillMaster = () => {
  const PATH = "opd_bill_master";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    opd_bill_code: "",
    opd_bill_name: "",
    opd_bill_charge: "",
    sort_order: "",
    status: 1,
  });

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

  /* ================= SORTING LOGIC ================= */
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const sa = (a.sort_order === null || a.sort_order === "" || a.sort_order === undefined) ? 999 : Number(a.sort_order);
      const sb = (b.sort_order === null || b.sort_order === "" || b.sort_order === undefined) ? 999 : Number(b.sort_order);
      return sa - sb;
    });
  }, [data]);

  /* ================= TABLE HOOK ================= */
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
    setFormData({ 
      opd_bill_code: "", 
      opd_bill_name: "", 
      opd_bill_charge: "", 
      sort_order: "", 
      status: 1 
    });
  };

  const showModal = (message, type = "success") => setModal({ visible: true, message, type });

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const actionPath = isEdit 
      ? `${PATH}/update/${formData.opd_bill_code}/` 
      : `${PATH}/create/`;

    const payload = { ...formData };
    
    // Remove read-only code for creation
    if (!isEdit) delete payload.opd_bill_code;

    // Convert strings to Numbers for Django IntegerFields
    payload.opd_bill_charge = Number(payload.opd_bill_charge);
    payload.sort_order = payload.sort_order === "" ? null : Number(payload.sort_order);

    const result = isEdit 
      ? await updateItem(actionPath, payload) 
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Billing item ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      // Handle Django error objects
      const errorMsg = typeof result.error === 'object' 
        ? Object.entries(result.error).map(([k, v]) => `${k}: ${v}`).join(", ")
        : result.error;
      showModal(errorMsg || "Failed to save data", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedRow || !selectedRow.opd_bill_code) return;
    const result = await deleteItem(`${PATH}/delete/${selectedRow.opd_bill_code}/`);
    if (result.success) {
      showModal("Billing item deleted successfully!");
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
      {/* SUCCESS/ERROR MODAL */}
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

      {/* PAGE HEADER */}
      <div className="section-header">
        <h4 className="page-title">OPD Billing Master</h4>
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

      {/* INPUT FORM */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">
            {isEdit ? "Update Billing Item" : "Add New Billing Item"}
          </h6>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">Service Name / Charge Head</label>
              <input
                className="form-input w-full"
                value={formData.opd_bill_name}
                required
                onChange={e => setFormData({ ...formData, opd_bill_name: e.target.value })}
                placeholder="E.G. Consultation Fees, X-Ray, Lab Test"
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Charge Amount (₹)</label>
              <input
                type="number"
                className="form-input w-full"
                value={formData.opd_bill_charge}
                required
                onChange={e => setFormData({ ...formData, opd_bill_charge: e.target.value })}
                placeholder="500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Sort Order</label>
              <input 
                type="number" 
                className="form-input w-full" 
                value={formData.sort_order} 
                placeholder="E.G. 1" 
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })} 
              />
            </div>

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
              <button type="submit" className="btn-primary px-12 py-3">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* DATA TABLE */}
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
                  <th className="text-admin-th">Code</th>
                  <th className="text-admin-th">Service Name</th>
                  <th className="text-admin-th">Charge (₹)</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr
                      key={item.opd_bill_code}
                      onClick={() => setSelectedRow(selectedRow?.opd_bill_code === item.opd_bill_code ? null : item)}
                      className={`group cursor-pointer transition-colors ${
                        selectedRow?.opd_bill_code === item.opd_bill_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className={`selection-indicator ${selectedRow?.opd_bill_code === item.opd_bill_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                          {selectedRow?.opd_bill_code === item.opd_bill_code && <div className="selection-dot" />}
                        </div>
                      </td>
                      <td className="text-admin-td">{item.opd_bill_code}</td>
                      <td className="text-admin-td">{item.opd_bill_name}</td>
                      <td className="text-admin-td">₹{item.opd_bill_charge}</td>
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
                      <FaFileInvoiceDollar size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No billing items found</p>
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

export default OpdBillMaster;