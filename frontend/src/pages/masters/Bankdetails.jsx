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

const BankDetails = () => {

  /* ================= CRUD ================= */

  const {
    data,
    loading,
    refresh,
    createItem,
    updateItem,
    deleteItem
  } = useCrud("bankdetails/");

  // Financial Year API not required for bankdetails form (backend doesn't expect it)

  /* ================= STATE ================= */

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);

  const [formData, setFormData] = useState({
    bank_code: "",
    bank_name: "",
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

  /* ================= HELPERS ================= */

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedBank(null);
    setFormData({
      bank_code: "",
      bank_name: "",
    });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;

    if (isEdit) {
      result = await updateItem(
        `bankdetails/update/${formData.bank_code}/`,
        formData
      );
    } else {
      result = await createItem(
        `bankdetails/create/`,
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
    if (!selectedBank) return;

    const result = await deleteItem(
      `bankdetails/delete/${selectedBank.bank_code}/`
    );

    if (result.success) {
      setSelectedBank(null);
      refresh();
    } else {
      alert(result.error || "Delete failed!");
    }
  };

  /* ================= LOADING ================= */

  if (loading) return <p>Loading...</p>;

  /* ================= UI ================= */

  return (
    <div className="app-container">

      {/* HEADER */}
      <div className="section-header">
        <h4 className="text-xl font-bold text-gray-800">
          Bank Details Master
        </h4>

        {!showForm && (
          <div className="flex gap-2">
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedBank && (
              <>
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData(selectedBank);
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
              <label className="form-label">Bank Code</label>
              <input
                className="form-input"
                value={formData.bank_code}
                disabled={isEdit}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bank_code: e.target.value.toUpperCase()
                  })
                }
              />
            </div>

            <div>
              <label className="form-label">Bank Name</label>
              <input
                className="form-input"
                value={formData.bank_name}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bank_name: e.target.value
                  })
                }
              />
            </div>

            {/* Only two fields are stored for Bankdetails in backend */}

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
                <th>Bank Code</th>
                <th>Bank Name</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                  paginatedData.map((b) => {
                  return (
                    <tr
                      key={b.bank_code}
                      onClick={() =>
                        setSelectedBank(
                          selectedBank?.bank_code === b.bank_code
                            ? null
                            : b
                        )
                      }
                    >
                      <td></td>
                      <td>{b.bank_code}</td>
                      <td>{b.bank_name}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="2" className="text-center py-20">
                    <FaUniversity size={40} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 text-lg font-bold">
                      No bank records found
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

export default BankDetails;
