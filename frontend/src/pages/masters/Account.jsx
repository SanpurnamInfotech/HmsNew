import React, { useState } from "react";
import {
  useCrud,
  useTable,
  Pagination,
  TableToolbar
} from "../../components/common/BaseCRUD";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUniversity
} from "react-icons/fa";

const Account = () => {

  /* ================= ACCOUNT CRUD ================= */

  const {
    data,
    loading,
    refresh,
    createItem,
    updateItem,
    deleteItem
  } = useCrud("accounts/");

  /* 🔥 BANK FETCH FROM BANKDETAILS API */
  const { data: banks } = useCrud("bankdetails/");

  /* ================= STATE ================= */

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [formData, setFormData] = useState({
    account_code: "",
    account_name: "",
    phone: "",
    account_number: "",
    bank_code: "",
    status: "Active"
  });

  /* ================= TABLE ================= */

  const {
    search, setSearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    paginatedData,
    effectiveItemsPerPage,
    filteredData,
    totalPages
  } = useTable(data || []);

  /* ================= RESET ================= */

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedAccount(null);
    setFormData({
      account_code: "",
      account_name: "",
      phone: "",
      account_number: "",
      bank_code: "",
      status: "Active"
    });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bank_code) {
      alert("Please select Bank");
      return;
    }

    let result;

    if (isEdit) {
      result = await updateItem(
        `accounts/update/${formData.account_code}/`,
        formData
      );
    } else {
      result = await createItem(
        `accounts/create/`,
        formData
      );
    }

    if (result.success) {
      resetForm();
      refresh();
    } else {
      alert(result.error || "Operation failed!");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    if (!selectedAccount) return;

    const result = await deleteItem(
      `accounts/delete/${selectedAccount.account_code}/`
    );

    if (result.success) {
      setSelectedAccount(null);
      refresh();
    } else {
      alert(result.error || "Delete failed!");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="app-container">

      {/* HEADER */}
      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">
          Account Master
        </h4>

        {!showForm && (
          <div className="flex gap-2">
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedAccount && (
              <>
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData(selectedAccount);
                    setIsEdit(true);
                    setShowForm(true);
                  }}
                >
                  <FaEdit size={14} /> Edit
                </button>

                <button
                  className="btn-danger"
                  onClick={handleDelete}
                >
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

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >

            <div>
              <label className="form-label">Account Code</label>
              <input
                className="form-input"
                value={formData.account_code}
                disabled={isEdit}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    account_code: e.target.value.toUpperCase()
                  })
                }
              />
            </div>

            <div>
              <label className="form-label">Account Name</label>
              <input
                className="form-input"
                value={formData.account_name}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    account_name: e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="form-label">Account Number</label>
              <input
                className="form-input"
                value={formData.account_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    account_number: e.target.value
                  })
                }
              />
            </div>

            {/* 🔥 BANK DROPDOWN FROM BANKDETAILS */}
            <div>
              <label className="form-label">Bank</label>
              <select
                className="form-input"
                value={formData.bank_code}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bank_code: e.target.value
                  })
                }
              >
                <option value="">Select Bank</option>

                {banks && banks.length > 0 ? (
                  banks.map((b) => (
                    <option key={b.bank_code} value={b.bank_code}>
                      {b.bank_name}
                    </option>
                  ))
                ) : (
                  <option disabled>No banks available</option>
                )}
              </select>
            </div>

            <div>
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-6">
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
                <th>Code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Account No</th>
                <th>Bank</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((a) => {

                  const bankName =
                    banks?.find(b => b.bank_code === a.bank_code)?.bank_name
                    || a.bank_code;

                  return (
                    <tr key={a.account_code}>
                      <td></td>
                      <td>{a.account_code}</td>
                      <td>{a.account_name}</td>
                      <td>{a.phone}</td>
                      <td>{a.account_number}</td>
                      <td>{bankName}</td>
                      <td>{a.status}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-20">
                    <FaUniversity size={40} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 text-lg font-bold">
                      No accounts found
                    </p>
                  </td>
                </tr>
              )}
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

export default Account;
