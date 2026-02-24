import React, { useState } from "react";
import api from "../../utils/domain";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const BedMaster = () => {

  const BED_PATH = "bed";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${BED_PATH}/`);

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    bed_code: "",
    bed_name: "",
    room_type: "",
    bed_charges: "",
    status: 1,
    sort_order: ""
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
    setSelectedRow(null);
    setFormData({
      bed_code: "",
      bed_name: "",
      room_type: "",
      bed_charges: "",
      status: 1,
      sort_order: ""
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit
      ? `${BED_PATH}/update/${formData.bed_code}/`
      : `${BED_PATH}/create/`;

   const payload = { ...formData };

if (payload.sort_order === "" || payload.sort_order === null) {
  delete payload.sort_order;
}

const result = isEdit
  ? await updateItem(actionPath, payload)
  : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Bed ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    // if (!window.confirm("Are you sure you want to delete this Bed record?")) return;

    const result = await deleteItem(`${BED_PATH}/delete/${selectedRow.bed_code}/`);

    if (result.success) {
      showModal("Bed deleted successfully!");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner-container text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-emerald-700 font-bold">Loading Bed Master...</p>
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
                {modal.type === "success"
                  ? <FaCheckCircle className="text-4xl text-emerald-500 mx-auto" />
                  : <FaTimesCircle className="text-4xl text-red-500 mx-auto" />
                }
              </div>
              <h3 className={`text-xl font-bold mb-2 ${modal.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
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

      {/* HEADER – Submodule style */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <h4 className="text-2xl font-black text-gray-800 tracking-tight">
          Bed Master
        </h4>

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
                    setFormData(selectedRow);
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

      {/* FORM – Submodule animation & inputs */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 animate-in zoom-in-95 duration-200">
          <h6 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
            {isEdit ? "Update Bed" : "Create New Bed"}
          </h6>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Bed Code</label>
              <input
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${isEdit ? "bg-gray-50 text-gray-400" : ""}`}
                value={formData.bed_code}
                disabled={isEdit}
                required
                onChange={(e) =>
                  setFormData({ ...formData, bed_code: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Bed Name</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={formData.bed_name}
                required
                onChange={(e) => setFormData({ ...formData, bed_name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Room Type</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={formData.room_type}
                required
                onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Bed Charges</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={formData.bed_charges}
                required
                onChange={(e) => setFormData({ ...formData, bed_charges: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Sort Order</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Status</label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-emerald-100">
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

      {/* TABLE – Submodule look */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
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
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Bed Code</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Bed Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Room Type</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Charges</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Sort</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
               {[...paginatedData]
  .sort((a, b) => {
    const sa = a.sort_order ?? 999999;
    const sb = b.sort_order ?? 999999;
    return Number(sa) - Number(sb);
  })
  .map(m => (
    <tr
      key={m.bed_code}
      onClick={() =>
        setSelectedRow(
          selectedRow?.bed_code === m.bed_code ? null : m
        )
      }
      className={`group cursor-pointer transition-colors duration-150
        ${
          selectedRow?.bed_code === m.bed_code
            ? "bg-emerald-50/40"
            : "hover:bg-gray-50/50"
        }`}
    >
      <td className="px-6 py-4">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${
              selectedRow?.bed_code === m.bed_code
                ? "border-emerald-500 bg-emerald-500"
                : "border-gray-200 group-hover:border-emerald-300"
            }`}
        >
          {selectedRow?.bed_code === m.bed_code && (
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          )}
        </div>
      </td>

      <td className="px-6 py-4 font-black text-gray-800 text-sm">
        {m.bed_code}
      </td>
      <td className="px-6 py-4 font-bold text-gray-700">
        {m.bed_name}
      </td>
      <td className="px-6 py-4 text-gray-500 text-xs font-medium uppercase">
        {m.room_type}
      </td>
      <td className="px-6 py-4 text-center font-mono text-xs">
        {m.bed_charges}
      </td>
      <td className="px-6 py-4 text-center font-mono text-xs">
        {m.sort_order}
      </td>
      <td className="px-6 py-4 text-center">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
            ${
              m.status === 1
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
        >
          {m.status === 1 ? "Active" : "Inactive"}
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

export default BedMaster;
