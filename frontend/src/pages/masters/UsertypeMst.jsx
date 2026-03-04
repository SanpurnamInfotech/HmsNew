import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaUsers } from "react-icons/fa";

const UsertypeMaster = () => {

  const PATH = "usertype";

  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    usertype_code: "",
    usertype_name: "",
    financialyear_code: "",
    company_code: "",
    status: 1
  });

  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

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
  } = useTable(data || []);

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      usertype_code: "",
      usertype_name: "",
      financialyear_code: "",
      company_code: "",
      status: 1
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ visible: true, message, type });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.usertype_code}/`
      : `${PATH}/create/`;

    const result = isEdit
      ? await updateItem(actionPath, formData)
      : await createItem(actionPath, formData);

    if (result.success) {
      showModal(`User Type ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Failed to save data", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;

    const result = await deleteItem(`${PATH}/delete/${selectedRow.usertype_code}/`);

    if (result.success) {
      showModal("User Type deleted successfully!");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="app-container">

      {/* HEADER */}
      <div className="section-header">
        <h4 className="page-title">User Type Master</h4>

        {!showForm && (
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>

            {selectedRow && (
              <>
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData(selectedRow);
                    setIsEdit(true);
                    setShowForm(true);
                  }}
                >
                  <FaEdit size={14} /> Edit
                </button>

                <button className="btn-danger" onClick={handleDelete}>
                  <FaTrash size={14} /> Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="form-container">

          <h6 className="form-section-title">
            {isEdit ? "Update User Type" : "Add User Type"}
          </h6>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>

            <div>
              <label className="form-label">User Type Code</label>
              <input
                className="form-input w-full"
                value={formData.usertype_code}
                disabled={isEdit}
                onChange={(e) =>
                  setFormData({ ...formData, usertype_code: e.target.value })
                }
              />
            </div>

            <div>
              <label className="form-label">User Type Name</label>
              <input
                className="form-input w-full"
                value={formData.usertype_name}
                onChange={(e) =>
                  setFormData({ ...formData, usertype_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="form-label">Financial Year Code</label>
              <input
                className="form-input w-full"
                value={formData.financialyear_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    financialyear_code: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="form-label">Company Code</label>
              <input
                className="form-input w-full"
                value={formData.company_code}
                onChange={(e) =>
                  setFormData({ ...formData, company_code: e.target.value })
                }
              />
            </div>

            <div>
              <label className="form-label">Status</label>
              <select
                className="form-input w-full"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: Number(e.target.value),
                  })
                }
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="submit" className="btn-primary px-12 py-3">
                {isEdit ? "Update" : "Save"}
              </button>

              <button type="button" className="btn-ghost" onClick={resetForm}>
                Cancel
              </button>
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

          <table className="w-full text-left">

            <thead>
              <tr>
                <th></th>
                <th>User Type Code</th>
                <th>User Type Name</th>
                <th>Financial Year</th>
                <th>Company</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((item) => (

                <tr
                  key={item.usertype_code}
                  onClick={() =>
                    setSelectedRow(
                      selectedRow?.usertype_code === item.usertype_code
                        ? null
                        : item
                    )
                  }
                >
                  <td></td>
                  <td>{item.usertype_code}</td>
                  <td>{item.usertype_name}</td>
                  <td>{item.financialyear_code}</td>
                  <td>{item.company_code}</td>

                  <td>
                    <span
                      className={`badge ${
                        item.status === 1 ? "badge-success" : "badge-danger"
                      }`}
                    >
                      {item.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>

                </tr>

              ))}
            </tbody>

          </table>

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