import React, { useState } from "react";
import api from "../../utils/domain";
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
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

const FinancialYearMst = () => {

  /* ================= API ================= */
  const PATH = "financialyear-master";
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  /* ================= UI STATES ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    financialyear_code: "",
    start_year: "",
    end_year: "",
    status: 1
  });

  const [modal, setModal] = useState({
    message: "",
    visible: false,
    type: "success"
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
  } = useTable(data);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      financialyear_code: "",
      start_year: "",
      end_year: "",
      status: 1
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  /* ================= CRUD ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.financialyear_code}/`
      : `${PATH}/create/`;

    const result = isEdit
      ? await updateItem(actionPath, formData)
      : await createItem(actionPath, formData);

    if (result.success) {
      showModal(`Financial Year ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;

    // if (!window.confirm("Are you sure you want to delete this record?")) return;

    const result = await deleteItem(
      `${PATH}/delete/${selectedRow.financialyear_code}/`
    );

    if (result.success) {
      showModal("Financial Year deleted successfully!");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading)
    return (
      <div className="loading-overlay">
        <div className="loading-spinner-container text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-emerald-700 font-bold">
            Synchronizing Financial Years...
          </p>
        </div>
      </div>
    );

  return (
    <div className="app-container">

      {/* ================= MODAL ================= */}
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-body text-center p-6">
              <div className="mb-4">
                {modal.type === "success" ? (
                  <FaCheckCircle size={50} className="text-emerald-500 mx-auto" />
                ) : (
                  <FaTimesCircle size={50} className="text-red-500 mx-auto" />
                )}
              </div>
              <h3
                className={`text-xl font-bold mb-2 ${
                  modal.type === "success"
                    ? "text-emerald-700"
                    : "text-red-700"
                }`}
              >
                {modal.type === "success" ? "Success" : "Error"}
              </h3>
              <p className="text-gray-600 mb-6">{modal.message}</p>
              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2.5 rounded-lg font-semibold"
                onClick={() => setModal({ ...modal, visible: false })}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <div>
          <h4 className="text-xl font-bold text-gray-800">
            Financial Year Master
          </h4>
        </div>

        {!showForm && (
          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-emerald-100"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedRow && (
              <div className="flex gap-2 animate-in slide-in-from-right-5">
                <button
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md"
                  onClick={() => {
                    setFormData({ ...selectedRow });
                    setIsEdit(true);
                    setShowForm(true);
                  }}
                >
                  <FaEdit size={14} /> Edit
                </button>

                <button
                  className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md"
                  onClick={handleDelete}
                >
                  <FaTrash size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 animate-in zoom-in-95 duration-200">
          <h6 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
            {isEdit ? "Update Financial Year" : "Create Financial Year"}
          </h6>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Financial Year Code
              </label>
              <input
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${
                  isEdit ? "bg-gray-50 text-gray-400" : ""
                }`}
                value={formData.financialyear_code}
                disabled={isEdit}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    financialyear_code: e.target.value
                      .toUpperCase()
                      .replace(/\s/g, "_")
                  })
                }
                placeholder="FY_2024_25"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Start Year
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={formData.start_year}
                required
                onChange={(e) =>
                  setFormData({ ...formData, start_year: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                End Year
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={formData.end_year}
                required
                onChange={(e) =>
                  setFormData({ ...formData, end_year: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Status
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: Number(e.target.value)
                  })
                }
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-emerald-100"
              >
                {isEdit ? "Update" : "Save"}
              </button>

              <button
                type="button"
                className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-700"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TABLE ================= */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                  <th className="table-th">Start Year</th>
                  <th className="table-th">End Year</th>
                  <th className="table-th text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.map((row) => (
                  <tr
                    key={row.financialyear_code}
                    onClick={() =>
                      setSelectedRow(
                        selectedRow?.financialyear_code ===
                          row.financialyear_code
                          ? null
                          : row
                      )
                    }
                    className={`group cursor-pointer transition-colors duration-150 ${
                      selectedRow?.financialyear_code ===
                      row.financialyear_code
                        ? "bg-emerald-50/40"
                        : "hover:bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedRow?.financialyear_code ===
                          row.financialyear_code
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-gray-200 group-hover:border-emerald-300"
                        }`}
                      >
                        {selectedRow?.financialyear_code ===
                          row.financialyear_code && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </td>

                    <td className="table-td text-admin-id">
                      {row.financialyear_code}
                    </td>
                    <td className="table-td">{row.start_year}</td>
                    <td className="table-td">{row.end_year}</td>
                    <td className="table-td text-center">
                      <span
  className={`px-3 py-1 rounded-full text-xs font-bold
    ${
      row.status === 1
        ? "bg-emerald-100 text-emerald-700"
        : "bg-rose-100 text-rose-700"
    }
  `}
>
  {row.status === 1 ? "Active" : "Inactive"}
</span>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white border-t border-gray-50 p-6">
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

export default FinancialYearMst;
