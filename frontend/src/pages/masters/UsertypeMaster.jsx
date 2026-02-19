import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaUserTag
} from "react-icons/fa";

const UsertypeMaster = () => {

  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud("usertype/");
  const { data: financialYears } = useCrud("financialyear/");
  const { data: companies } = useCrud("company/");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUsertype, setSelectedUsertype] = useState(null);

  const [formData, setFormData] = useState({
    usertype_code: "",
    usertype_name: "",
    financialyear_code: "",
    company_code: "",
    status: 1
  });

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success"
  });

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
    setSelectedUsertype(null);
    setFormData({
      usertype_code: "",
      usertype_name: "",
      financialyear_code: "",
      company_code: "",
      status: 1
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result = isEdit
      ? await updateItem(`usertype/update/${formData.usertype_code}/`, formData)
      : await createItem(`usertype/create/`, formData);

    if (result.success) {
      showModal(`Usertype ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedUsertype) return;

    const result = await deleteItem(`usertype/delete/${selectedUsertype.usertype_code}/`);

    if (result.success) {
      showModal("Usertype deleted successfully!");
      setSelectedUsertype(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading)
    return (
      <div className="loading-overlay">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading Usertype Data...</p>
        </div>
      </div>
    );

  return (
    <div className="app-container">

      {/* Modal */}
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

              <h3 className={`modal-title ${
                modal.type === "success"
                  ? "modal-title-success"
                  : "modal-title-error"
              }`}>
                {modal.type === "success" ? "Success" : "Error"}
              </h3>

              <p className="modal-message mb-6">{modal.message}</p>

              <button
                className="btn-primary w-full"
                onClick={() => setModal({ ...modal, visible: false })}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">Usertype Master</h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>

            {selectedUsertype && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData({ ...selectedUsertype });
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

      {/* Form */}
      {showForm && (
        <div className="form-container">

          <div className="mb-8 border-b border-gray-50 pb-5">
            <h6 className="text-lg font-bold text-gray-800">
              {isEdit ? "Update Usertype Info" : "Add New Usertype"}
            </h6>
          </div>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            onSubmit={handleSubmit}
          >

            <div className="space-y-1.5">
              <label className="form-label">Usertype Code</label>
              <input
                className={`form-input ${isEdit ? "form-input-disabled" : ""}`}
                value={formData.usertype_code}
                disabled={isEdit}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usertype_code: e.target.value.toUpperCase()
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Usertype Name</label>
              <input
                className="form-input"
                value={formData.usertype_name}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usertype_name: e.target.value
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Financial Year</label>
              <select
                className="form-input"
                value={formData.financialyear_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    financialyear_code: e.target.value
                  })
                }
              >
                <option value="">Select Financial Year</option>
                {financialYears.map((fy) => (
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
                value={formData.company_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    company_code: e.target.value
                  })
                }
              >
                <option value="">Select Company</option>
                {companies.map((c) => (
                  <option key={c.company_code} value={c.company_code}>
                    {c.company_code}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value
                  })
                }
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
              <button className="btn-primary px-10">
                {isEdit ? "Update" : "Save"}
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Table */}
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
                  <th className="table-th">Code</th>
                  <th className="table-th">Name</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? paginatedData.map((u) => (
                  <tr
                    key={u.usertype_code}
                    onClick={() =>
                      setSelectedUsertype(
                        selectedUsertype?.usertype_code === u.usertype_code
                          ? null
                          : u
                      )
                    }
                    className={`table-row ${
                      selectedUsertype?.usertype_code === u.usertype_code
                        ? "table-row-active"
                        : "table-row-hover"
                    }`}
                  >
                    <td className="table-td">
                      <div className={`selection-indicator ${
                        selectedUsertype?.usertype_code === u.usertype_code
                          ? "selection-indicator-active"
                          : "selection-indicator-inactive"
                      }`}>
                        {selectedUsertype?.usertype_code === u.usertype_code && (
                          <div className="selection-dot" />
                        )}
                      </div>
                    </td>

                    <td className="table-td text-admin-id">{u.usertype_code}</td>
                    <td className="table-td">{u.usertype_name}</td>
                    <td className="table-td">
                      {u.status === 1 ? "Active" : "Inactive"}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="table-td py-20 text-center">
                      <div className="empty-state-container">
                        <FaUserTag size={48} className="mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-500">
                          No usertypes found
                        </p>
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

export default UsertypeMaster;
