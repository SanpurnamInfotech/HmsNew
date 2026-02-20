import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaUniversity } from "react-icons/fa";

const BankDetails = () => {
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud("bankdetails/");

  // dropdowns
  const { data: employeeData } = useCrud("employee_master/");
  const { data: financialyearData } = useCrud("financialyear_master/");
  const { data: companyData } = useCrud("company_master/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [formData, setFormData] = useState({
    bank_code: "",
    bank_name: "",
    employee_code: "",
    bank_address: "",
    bank_phone: "",
    bank_branch: "",
    bank_ifsc: "",
    bank_accountno: "",
    bank_ddpayableaddress: "",
    financialyear_code: "",
    company_code: "",
    status: 1,
    sort_order: 1000,
  });

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
    setSelected(null);
    setFormData({
      bank_code: "",
      bank_name: "",
      employee_code: "",
      bank_address: "",
      bank_phone: "",
      bank_branch: "",
      bank_ifsc: "",
      bank_accountno: "",
      bank_ddpayableaddress: "",
      financialyear_code: "",
      company_code: "",
      status: 1,
      sort_order: 1000,
    });
  };

  const showModalMsg = (message, type = "success") => setModal({ message, visible: true, type });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      sort_order: formData.sort_order === "" ? null : Number(formData.sort_order),
      status: Number(formData.status),
      // keep empty dropdowns as null if user didn't select
      employee_code: formData.employee_code || null,
      bank_address: formData.bank_address || null,
      bank_phone: formData.bank_phone || null,
      bank_branch: formData.bank_branch || null,
      bank_ifsc: formData.bank_ifsc || null,
      bank_accountno: formData.bank_accountno || null,
      bank_ddpayableaddress: formData.bank_ddpayableaddress || null,
      // IMPORTANT: these two may fail if DB not null
      financialyear_code: formData.financialyear_code || null,
      company_code: formData.company_code || null,
    };

    let result = isEdit
      ? await updateItem(`bankdetails/update/${formData.bank_code}/`, payload)
      : await createItem(`bankdetails/create/`, payload);

    if (result.success) {
      showModalMsg(`Bank Details ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModalMsg(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteItem(`bankdetails/delete/${selected.bank_code}/`);
    if (result.success) {
      showModalMsg("Bank deleted successfully!");
      setSelected(null);
      refresh();
    } else {
      showModalMsg(result.error || "Delete failed!", "error");
    }
  };

  const statusBadge = (s) => {
    const isActive = Number(s) === 1;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Bank Details...</p>
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
        <h4 className="text-xl font-bold text-gray-800">Bank Details</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>

            {selected && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData({ ...selected });
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

      {showForm && (
        <div className="form-container">
          <div className="mb-8 border-b border-gray-50 pb-5">
            <h6 className="text-lg font-bold text-gray-800">
              {isEdit ? "Update Bank Info" : "Add New Bank"}
            </h6>
          </div>

          <form className="grid grid-cols-1 gap-y-10" onSubmit={handleSubmit}>

            {/* Section 1 */}
            <div>
              <h6 className="text-md font-bold text-gray-700 mb-4">Basic Details</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Bank Code</label>
                  <input
                    className={`form-input ${isEdit ? "form-input-disabled" : ""}`}
                    value={formData.bank_code || ""}
                    disabled={isEdit}
                    required
                    maxLength={45}
                    onChange={(e) => setFormData({ ...formData, bank_code: e.target.value.toUpperCase() })}
                    placeholder="Eg. SBI001"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="form-label">Bank Name</label>
                  <input
                    className="form-input"
                    value={formData.bank_name || ""}
                    required
                    maxLength={100}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    placeholder="Eg. State Bank of India"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={Number(formData.status)}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h6 className="text-md font-bold text-gray-700 mb-4">Employee / Company / Financial Year</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Employee</label>
                  <select
                    className="form-input"
                    value={formData.employee_code || ""}
                    onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {(employeeData || []).map((x) => (
                      <option key={x.employee_code} value={x.employee_code}>
                        {x.employee_code} - {x.employee_firstname}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Financial Year</label>
                  <select
                    className="form-input"
                    value={formData.financialyear_code || ""}
                    onChange={(e) => setFormData({ ...formData, financialyear_code: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {(financialyearData || []).map((fy) => (
                      <option key={fy.financialyear_code} value={fy.financialyear_code}>
                        {fy.financialyear_code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Company</label>
                  <select
                    className="form-input"
                    value={formData.company_code || ""}
                    onChange={(e) => setFormData({ ...formData, company_code: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {(companyData || []).map((c) => (
                      <option key={c.company_code} value={c.company_code}>
                        {c.company_code} - {c.company_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h6 className="text-md font-bold text-gray-700 mb-4">Bank Contact Details</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Branch</label>
                  <input className="form-input" value={formData.bank_branch || ""} onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">IFSC</label>
                  <input className="form-input" value={formData.bank_ifsc || ""} onChange={(e) => setFormData({ ...formData, bank_ifsc: e.target.value.toUpperCase() })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={formData.bank_phone || ""} onChange={(e) => setFormData({ ...formData, bank_phone: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Account No</label>
                  <input className="form-input" value={formData.bank_accountno || ""} onChange={(e) => setFormData({ ...formData, bank_accountno: e.target.value })} />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="form-label">DD Payable Address</label>
                  <input className="form-input" value={formData.bank_ddpayableaddress || ""} onChange={(e) => setFormData({ ...formData, bank_ddpayableaddress: e.target.value })} />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="form-label">Bank Address</label>
                  <input className="form-input" value={formData.bank_address || ""} onChange={(e) => setFormData({ ...formData, bank_address: e.target.value })} />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Sort Order</label>
                  <input type="number" className="form-input" value={formData.sort_order ?? ""} onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
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
                  <th className="table-th w-16"></th>
                  <th className="table-th">Bank Code</th>
                  <th className="table-th">Bank Name</th>
                  <th className="table-th">IFSC</th>
                  <th className="table-th">Account No</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((x) => (
                  <tr
                    key={x.bank_code}
                    onClick={() => setSelected(selected?.bank_code === x.bank_code ? null : x)}
                    className={`table-row ${selected?.bank_code === x.bank_code ? "table-row-active" : "table-row-hover"}`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${selected?.bank_code === x.bank_code ? "selection-indicator-active" : "selection-indicator-inactive"}`}>
                        {selected?.bank_code === x.bank_code && <div className="selection-dot" />}
                      </div>
                    </td>
                    <td className="table-td text-admin-id">{x.bank_code}</td>
                    <td className="table-td text-admin-id">{x.bank_name}</td>
                    <td className="table-td">{x.bank_ifsc || "-"}</td>
                    <td className="table-td">{x.bank_accountno || "-"}</td>
                    <td className="table-td">{statusBadge(x.status)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaUniversity size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">No bank details found</p>
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

export default BankDetails;
