import React, { useState, useMemo } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaChevronDown,
  FaUniversity,
} from "react-icons/fa";

const AccountMst = () => {
  const ACCOUNT_PATH = "account";

  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${ACCOUNT_PATH}/`);

 const { data: banks } = useCrud("bankdetails/");

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [bankSearch, setBankSearch] = useState("");

  const [formData, setFormData] = useState({
    account_code: "",
    account_name: "",
    phone: "",
    account_number: "",
    bank_code: "",
    status: 1,
  });

  const [modal, setModal] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  /* ================= TABLE ================= */
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

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setOpenDropdown(null);
    setBankSearch("");
    setFormData({
      account_code: "",
      account_name: "",
      phone: "",
      account_number: "",
      bank_code: "",
      status: 1,
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ visible: true, message, type });

  /* ================= FILTER BANK ================= */
  const filteredBanks = useMemo(() => {
    if (!banks) return [];
    return banks.filter((b) =>
      b.bank_code.toLowerCase().includes(bankSearch.toLowerCase())
    );
  }, [banks, bankSearch]);

  const selectedBankCode =
    banks.find((b) => b.bank_code === formData.bank_code)?.bank_code ||
    "Select Bank Code";

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bank_code) {
      showModal("Please select Bank Code", "error");
      return;
    }

    const actionPath = isEdit
      ? `${ACCOUNT_PATH}/update/${formData.account_code}/`
      : `${ACCOUNT_PATH}/create/`;

    const result = isEdit
      ? await updateItem(actionPath, formData)
      : await createItem(actionPath, formData);

    if (result.success) {
      showModal(`Account ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      if (
        result.error?.toLowerCase().includes("duplicate") ||
        result.error?.toLowerCase().includes("already")
      ) {
        showModal("Account Code already exists!", "error");
      } else {
        showModal(result.error || "Failed to save data", "error");
      }
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedRow) return;

    const result = await deleteItem(
      `${ACCOUNT_PATH}/delete/${selectedRow.account_code}/`
    );

    if (result.success) {
      showModal("Account deleted successfully!");
      setSelectedRow(null);
      refresh();
    } else {
      showModal("Delete failed!", "error");
    }
  };

  if (loading) return null;

  return (
    <div className="app-container">

      {/* MODAL */}
      {modal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center shadow-2xl">
            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? (
                <FaCheckCircle className="text-6xl text-emerald-500" />
              ) : (
                <FaTimesCircle className="text-6xl text-rose-500" />
              )}
            </div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            <p className="mb-6 opacity-80">{modal.message}</p>
            <button
              className="btn-primary w-full justify-center py-3"
              onClick={() => setModal({ ...modal, visible: false })}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="section-header">
        <h4 className="page-title">Account Master</h4>

        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>

            {selectedRow && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-1.5">
              <label className="form-label">Account Code</label>
              <input
                className="form-input w-full"
                value={formData.account_code || ""}
                disabled={isEdit}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    account_code: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Account Name</label>
              <input
                className="form-input w-full"
                value={formData.account_name}
                required
                onChange={(e) =>
                  setFormData({ ...formData, account_name: e.target.value })
                }
              />
            </div>

                <div className="space-y-1.5">
              <label className="form-label">Account Number</label>
              <input
                className="form-input w-full"
                value={formData.account_number}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    account_number: e.target.value,
                  })
                }
              />
            </div>
            {/* BANK CODE DROPDOWN */}
            <div className="space-y-1.5 relative">
              <label className="form-label">Bank Code</label>

              <div
                className="form-input w-full flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setOpenDropdown(openDropdown === "bank" ? null : "bank")
                }
              >
                <span className={formData.bank_code ? "" : "opacity-50"}>
                  {selectedBankCode}
                </span>
                <FaChevronDown size={12} className="opacity-50" />
              </div>

              {openDropdown === "bank" && (
                <div className="absolute z-[60] w-full mt-2 rounded-xl shadow-2xl border overflow-hidden bg-white">
                  <div className="p-3 border-b flex items-center gap-2">
                    <FaSearch className="opacity-40" size={14} />
                    <input
                      autoFocus
                      className="bg-transparent outline-none text-sm w-full"
                      placeholder="Search bank code..."
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {filteredBanks.map((b) => (
                      <div
                        key={b.bank_code}
                        className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            bank_code: b.bank_code,
                          });
                          setOpenDropdown(null);
                        }}
                      >
                        {b.bank_code}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Phone</label>
              <input
                className="form-input w-full"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            

            <div className="space-y-1.5">
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

            <div className="md:col-span-2 flex justify-end gap-3 border-t pt-8 mt-4">
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
                  <th className="text-admin-th">Name</th>
                  <th className="text-admin-th">Phone</th>
                  <th className="text-admin-th">Account No</th>
                  <th className="text-admin-th">Bank Code</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((item) => (
                  <tr
                    key={item.account_code}
                    onClick={() =>
                      setSelectedRow(
                        selectedRow?.account_code === item.account_code
                          ? null
                          : item
                      )
                    }
                    className={`group cursor-pointer transition-colors ${
                      selectedRow?.account_code === item.account_code
                        ? "bg-emerald-500/10"
                        : "hover:bg-emerald-500/5"
                    }`}
                  >
                    <td>
                        <td className="px-6 py-4">
  <div
    className={`selection-indicator ${
      selectedRow?.account_code === item.account_code
        ? "selection-indicator-active"
        : "group-hover:border-emerald-500/50"
    }`}
  >
    {selectedRow?.account_code === item.account_code && (
      <div className="selection-dot" />
    )}
  </div>
</td>
                    </td>
                    <td className="text-admin-td">{item.account_code}</td>
                    <td className="text-admin-td">{item.account_name}</td>
                    <td className="text-admin-td">{item.phone}</td>
                    <td className="text-admin-td">{item.account_number}</td>
                    <td className="text-admin-td">{item.bank_code}</td>
                    <td className="text-admin-td">
                      <span
                        className={`badge ${
                          item.status === 1
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {item.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
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

export default AccountMst;