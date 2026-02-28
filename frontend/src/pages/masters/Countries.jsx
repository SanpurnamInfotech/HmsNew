import React, { useState } from "react";
import {
  useCrud,
  useTable,
  Pagination,
  TableToolbar,
} from "../../components/common/BaseCRUD";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaGlobeAmericas,
} from "react-icons/fa";

const Countries = () => {
  /* ================= API ================= */
  const PATH = "countries";

  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    country_code: "",
    country_name: "",
    sort_order: "",
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
  } = useTable(data);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      country_code: "",
      country_name: "",
      sort_order: "",
      status: 1,
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ visible: true, message, type });

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.country_code}/`
      : `${PATH}/create/`;

    const payload = { ...formData };

    // Remove sort_order if empty to prevent backend type errors
    if (payload.sort_order === "" || payload.sort_order === null) {
      delete payload.sort_order;
    }

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      showModal(`Country ${isEdit ? "updated" : "created"} successfully`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedRow) return;
    // if (!window.confirm("Are you sure you want to delete this country?")) return;

    const result = await deleteItem(
      `${PATH}/delete/${selectedRow.country_code}/`
    );

    if (result.success) {
      showModal("Record deleted successfully");
      setSelectedRow(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed", "error");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner-container text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-emerald-700 font-bold">
            Loading Country Master...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* ================= MODAL ================= */}
      {modal.visible && (
        <div className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="mb-4">{modal.type === "success" ? <FaCheckCircle size={50} className="text-emerald-500 mx-auto" /> : <FaTimesCircle size={50} className="text-red-500 mx-auto" />}</div>
            <h3 className={`text-xl font-bold mb-2 ${modal.type === "success" ? "text-emerald-700" : "text-red-700"}`}>{modal.type === "success" ? "Success" : "Error"}</h3>
            <p className="text-gray-600 mb-6">{modal.message}</p>
            <button className="bg-emerald-600 text-white w-full py-2.5 rounded-lg font-semibold" onClick={() => setModal({ ...modal, visible: false })}>OK</button>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <div>
          <h4 className="text-xl font-bold text-gray-800">Country Master</h4>
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

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 animate-in zoom-in-95 duration-200">
          <h6 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
            {isEdit ? "Update Country" : "Create Country"}
          </h6>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >
            {/* CODE */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Country Code
              </label>
              <input
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 
                focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 
                outline-none transition-all ${
                  isEdit ? "bg-gray-50 text-gray-400" : ""
                }`}
                value={formData.country_code}
                disabled={isEdit}
                required
                maxLength={5}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    country_code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="E.G. IND"
              />
            </div>

            {/* NAME */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Country Name
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200 
                focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 
                outline-none transition-all"
                value={formData.country_name}
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    country_name: e.target.value,
                  })
                }
                placeholder="E.G. India"
              />
            </div>

            {/* SORT */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Sort Order
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 
                focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 
                outline-none transition-all"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sort_order: e.target.value,
                  })
                }
              />
            </div>

            {/* STATUS */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Status</label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-200 appearance-none" value={formData.status} onChange={e => setFormData({...formData, status: parseInt(e.target.value)})}>
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

      {/* ================= TABLE ================= */}
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
                  <th className="text-admin-th">Country Code</th>
                  <th className="text-admin-th">Country Name</th>
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.length > 0 ? (
                  [...paginatedData]
                    .sort((a, b) => {
                      const sa = a.sort_order ?? 999999;
                      const sb = b.sort_order ?? 999999;
                      return Number(sa) - Number(sb);
                    })
                    .map((item) => (
                      <tr
                        key={item.country_code}
                        onClick={() =>
                          setSelectedRow(
                            selectedRow?.country_code === item.country_code
                              ? null
                              : item
                          )
                        }
                        className={`group cursor-pointer transition-colors duration-150 ${
                          selectedRow?.country_code === item.country_code
                            ? "bg-emerald-50/40"
                            : "hover:bg-gray-50/50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedRow?.country_code === item.country_code
                                ? "border-emerald-500 bg-emerald-500"
                                : "border-gray-200 group-hover:border-emerald-300"
                            }`}
                          >
                            {selectedRow?.country_code === item.country_code && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                        </td>

                        <td className="text-admin-td">{item.country_code}</td>
                        <td className="text-admin-td">{item.country_name}</td>
                        <td className="text-admin-td">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.status === 1
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {item.status === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <FaGlobeAmericas
                        size={48}
                        className="mb-4 text-gray-200 mx-auto"
                      />
                      <p className="text-lg font-medium text-gray-400">
                        No countries found
                      </p>
                    </td>
                  </tr>
                )}
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

export default Countries;