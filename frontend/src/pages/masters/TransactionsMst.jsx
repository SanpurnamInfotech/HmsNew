import React, { useState } from "react";
import api from "../../utils/domain";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const TransactionsMst = () => {

  /* ================= DATA FETCHING ================= */
  const PATH = "transactions";
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  /* ================= UI STATES ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    transaction_code: "",
    patient_code: "",
    bill_no: "",
    appointment_code: "",
    transaction_date: "",
    transaction_mode_code: "",
    transaction_type: "",
    depositor_name: "",
    mobile: "",
    bill_amount: "",
    amt_received: "",
    dues_amount: "",
    sort_order: "",
    status: 1
  });

  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

  /* ================= TABLE LOGIC ================= */
  const {
    search, setSearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    paginatedData, effectiveItemsPerPage,
    filteredData, totalPages
  } = useTable(data || []);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      transaction_code: "",
      patient_code: "",
      bill_no: "",
      appointment_code: "",
      transaction_date: "",
      transaction_mode_code: "",
      transaction_type: "",
      depositor_name: "",
      mobile: "",
      bill_amount: "",
      amt_received: "",
      dues_amount: "",
      sort_order: "",
      status: 1
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  /* ================= CRUD ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.transaction_code}/`
      : `${PATH}/create/`;

    const payload = { ...formData };

    // empty optional fields remove
    Object.keys(payload).forEach(k => {
      if (payload[k] === "") delete payload[k];
    });

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Transaction ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;

    const result = await deleteItem(
      `${PATH}/delete/${selectedRow.transaction_code}/`
    );

    if (result.success) {
      showModal("Transaction deleted successfully!");
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
          <p className="text-emerald-700 font-bold">Loading Transactions...</p>
        </div>
      </div>
    );

  return (
    <div className="app-container">

      {/* MODAL */}
      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-body text-center">
              <div className="modal-icon-container mb-4">
                {modal.type === "success" ? (
                  <FaCheckCircle className="text-4xl text-emerald-500 mx-auto" />
                ) : (
                  <FaTimesCircle className="text-4xl text-red-500 mx-auto" />
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

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <h4 className="text-2xl font-black text-gray-800 tracking-tight">
          Transactions
        </h4>

        {!showForm && (
          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selectedRow && (
              <>
                <button
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold"
                  onClick={() => {
                    setFormData({
                      ...selectedRow,
                      patient_code: selectedRow.patient_code,
                      bill_no: selectedRow.bill_no,
                      appointment_code: selectedRow.appointment_code,
                      transaction_mode_code: selectedRow.transaction_mode_code
                    });
                    setIsEdit(true);
                    setShowForm(true);
                  }}
                >
                  <FaEdit size={14} /> Edit
                </button>

                <button
                  className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold"
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
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100">
          <h6 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
            {isEdit ? "Update Transaction" : "Create Transaction"}
          </h6>

          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            onSubmit={handleSubmit}
          >
            <input
              placeholder="Transaction Code"
              className={`w-full px-4 py-3 rounded-lg border ${
                isEdit ? "bg-gray-50 text-gray-400" : ""
              }`}
              value={formData.transaction_code}
              disabled={isEdit}
              required
              onChange={e =>
                setFormData({ ...formData, transaction_code: e.target.value })
              }
            />

            <input
              placeholder="Patient Code"
              className="w-full px-4 py-3 rounded-lg border"
              value={formData.patient_code}
              required
              onChange={e =>
                setFormData({ ...formData, patient_code: e.target.value })
              }
            />

            <input
              placeholder="Bill No"
              className="w-full px-4 py-3 rounded-lg border"
              value={formData.bill_no || ""}
              onChange={e =>
                setFormData({ ...formData, bill_no: e.target.value })
              }
            />

            <input
              placeholder="Appointment Code"
              className="w-full px-4 py-3 rounded-lg border"
              value={formData.appointment_code || ""}
              onChange={e =>
                setFormData({ ...formData, appointment_code: e.target.value })
              }
            />

            <input
              type="date"
              className="w-full px-4 py-3 rounded-lg border"
              value={formData.transaction_date}
              required
              onChange={e =>
                setFormData({ ...formData, transaction_date: e.target.value })
              }
            />

            <input
              placeholder="Transaction Mode Code"
              className="w-full px-4 py-3 rounded-lg border"
              value={formData.transaction_mode_code}
              required
              onChange={e =>
                setFormData({
                  ...formData,
                  transaction_mode_code: e.target.value
                })
              }
            />

            <select
              className="w-full px-4 py-3 rounded-lg border"
              value={formData.transaction_type || ""}
              onChange={e =>
                setFormData({
                  ...formData,
                  transaction_type: e.target.value
                })
              }
            >
              <option value="">Select Type</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="REFUND">REFUND</option>
              <option value="ADJUSTMENT">ADJUSTMENT</option>
            </select>

            <input
              placeholder="Depositor Name"
              className="w-full px-4 py-3 rounded-lg border"
              value={formData.depositor_name || ""}
              onChange={e =>
                setFormData({
                  ...formData,
                  depositor_name: e.target.value
                })
              }
            />

            <input
              placeholder="Mobile"
              className="w-full px-4 py-3 rounded-lg border"
              value={formData.mobile || ""}
              onChange={e =>
                setFormData({ ...formData, mobile: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Bill Amount"
              className="w-full px-4 py-3 rounded-lg border"
              value={formData.bill_amount || ""}
              onChange={e =>
                setFormData({ ...formData, bill_amount: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Amount Received"
              className="w-full px-4 py-3 rounded-lg border"
              value={formData.amt_received || ""}
              onChange={e =>
                setFormData({ ...formData, amt_received: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Dues Amount"
              className="w-full px-4 py-3 rounded-lg border"
              value={formData.dues_amount || ""}
              onChange={e =>
                setFormData({ ...formData, dues_amount: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Sort Order"
              className="w-full px-4 py-3 rounded-lg border"
              value={formData.sort_order || ""}
              onChange={e =>
                setFormData({ ...formData, sort_order: e.target.value })
              }
            />

            <select
              className="w-full px-4 py-3 rounded-lg border"
              value={formData.status}
              onChange={e =>
                setFormData({ ...formData, status: Number(e.target.value) })
              }
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>

            <div className="md:col-span-3 flex justify-end gap-3 pt-4">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-2.5 rounded-lg font-bold">
                {isEdit ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className="px-6 py-2.5 text-sm font-bold text-gray-400"
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
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 w-16"></th>
                  <th className="px-6 py-4 text-xs">Code</th>
                  <th className="px-6 py-4 text-xs">Patient</th>
                  <th className="px-6 py-4 text-xs">Date</th>
                  <th className="px-6 py-4 text-xs text-center">Amount</th>
                  <th className="px-6 py-4 text-xs text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {[...(paginatedData || [])].map(row => (
                  <tr
                    key={row.transaction_code}
                    onClick={() =>
                      setSelectedRow(
                        selectedRow?.transaction_code === row.transaction_code
                          ? null
                          : row
                      )
                    }
                    className={`cursor-pointer ${
                      selectedRow?.transaction_code === row.transaction_code
                        ? "bg-emerald-50/40"
                        : "hover:bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="w-4 h-4 rounded-full border"></div>
                    </td>

                    <td className="px-6 py-4 font-bold">
                      {row.transaction_code}
                    </td>

                    <td className="px-6 py-4">
                      {row.patient_code}
                    </td>

                    <td className="px-6 py-4">
                      {row.transaction_date}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {row.amt_received}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          row.status === 1
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
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

export default TransactionsMst;