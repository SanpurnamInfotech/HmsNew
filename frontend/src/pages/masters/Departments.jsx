import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaBuilding } from "react-icons/fa";

const Departments = () => {
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud("departments/");

  // dropdown masters
  const { data: financialYearsData } = useCrud("financialyear_master/");
  const { data: companiesData } = useCrud("company_master/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [formData, setFormData] = useState({
    department_code: "",
    department_name: "",
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

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelected(null);
    setFormData({
      department_code: "",
      department_name: "",
      financialyear_code: "",
      company_code: "",
      status: 1,
      sort_order: 1000,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      status: Number(formData.status),
      sort_order: formData.sort_order === "" ? null : Number(formData.sort_order),
    };

    let result = isEdit
      ? await updateItem(`departments/update/${formData.department_code}/`, payload)
      : await createItem(`departments/create/`, payload);

    if (result.success) {
      showModal(`Department ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteItem(`departments/delete/${selected.department_code}/`);
    if (result.success) {
      showModal("Department deleted successfully!");
      setSelected(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
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
        <p className="loading-text">Loading Departments Data...</p>
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
        <h4 className="text-xl font-bold text-gray-800">Departments</h4>

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

      {/* FORM */}
      {showForm && (
        <div className="form-container">
          <div className="mb-8 border-b border-gray-50 pb-5">
            <h6 className="text-lg font-bold text-gray-800">{isEdit ? "Update Department" : "Add New Department"}</h6>
          </div>

          <form className="grid grid-cols-1 gap-y-10" onSubmit={handleSubmit}>

            {/* Section 1 */}
            <div>
              <h6 className="text-md font-bold text-gray-700 mb-4">Department Details</h6>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="form-label">Department Code</label>
                  <input
                    className={`form-input ${isEdit ? "form-input-disabled" : ""}`}
                    value={formData.department_code}
                    disabled={isEdit}
                    required
                    maxLength={25}
                    onChange={(e) => setFormData({ ...formData, department_code: e.target.value })}
                    placeholder="Eg. DEP00001"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="form-label">Department Name</label>
                  <input
                    className="form-input"
                    value={formData.department_name}
                    required
                    maxLength={100}
                    onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Financial Year</label>
                  <select
                    className="form-input"
                    value={formData.financialyear_code || ""}
                    onChange={(e) => setFormData({ ...formData, financialyear_code: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {(financialYearsData || []).map((fy) => (
                      <option key={fy.financialyear_code} value={fy.financialyear_code}>
                        {fy.financialyear_name || fy.financialyear_code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Company</label>
                  <select
                    className="form-input"
                    value={formData.company_code || ""}
                    required
                    onChange={(e) => setFormData({ ...formData, company_code: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {(companiesData || []).map((c) => (
                      <option key={c.company_code} value={c.company_code}>
                        {c.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="form-label">Sort Order</label>
                  <input
                    className="form-input"
                    type="number"
                    value={formData.sort_order ?? ""}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
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

            <div className="flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
              <button className="btn-primary px-10">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}
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
                  <th className="table-th">Department Code</th>
                  <th className="table-th">Department Name</th>
                  <th className="table-th">Company</th>
                  <th className="table-th">FY</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((d) => (
                  <tr
                    key={d.department_code}
                    onClick={() => setSelected(selected?.department_code === d.department_code ? null : d)}
                    className={`table-row ${selected?.department_code === d.department_code ? "table-row-active" : "table-row-hover"}`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${selected?.department_code === d.department_code ? "selection-indicator-active" : "selection-indicator-inactive"}`}>
                        {selected?.department_code === d.department_code && <div className="selection-dot" />}
                      </div>
                    </td>
                    <td className="table-td text-admin-id">{d.department_code}</td>
                    <td className="table-td">{d.department_name}</td>
                    <td className="table-td">{d.company_code || "-"}</td>
                    <td className="table-td">{d.financialyear_code || "-"}</td>
                    <td className="table-td">{statusBadge(d.status)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaBuilding size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">No departments found</p>
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

export default Departments;
