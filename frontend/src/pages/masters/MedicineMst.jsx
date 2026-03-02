import React, { useState, useEffect } from "react";
import api from "../../utils/domain";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const MedicineMst = () => {

  const PATH = "medicine";
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [formData, setFormData] = useState({
    medicine_code: "",
    medicine_cat_code: "",
    medicine_name: "",
    generic_name: "",
    qty: "",
    unit_price: "",
    prescription_required: 0,
    status: 1,
    sort_order: ""
  });

  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

  /* ============================
     ✅ SORT FIRST (GLOBAL SORT)
     ============================ */
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      const sa = a.sort_order ?? 999999;
      const sb = b.sort_order ?? 999999;
      return Number(sa) - Number(sb);
    });
  }, [data]);

  const {
    search, setSearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    paginatedData,
    effectiveItemsPerPage,
    filteredData,
    totalPages
  } = useTable(sortedData);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("medicine-category/");
      const d = res.data?.results || res.data || [];
      setCategories(d);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelected(null);
    setFormData({
      medicine_code: "",
      medicine_cat_code: "",
      medicine_name: "",
      generic_name: "",
      qty: "",
      unit_price: "",
      prescription_required: 0,
      status: 1,
      sort_order: ""
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isEdit
      ? `${PATH}/update/${formData.medicine_code}/`
      : `${PATH}/create/`;

    const payload = { ...formData };

    if (payload.sort_order === "" || payload.sort_order === null) {
      delete payload.sort_order;
    }

    const result = isEdit
      ? await updateItem(url, payload)
      : await createItem(url, payload);

    if (result.success) {
      showModal(`Medicine ${isEdit ? "updated" : "created"} successfully`);
      resetForm();
      refresh();
      setCurrentPage(1); 
    } else {
      showModal(result.error || "Operation failed", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;

    const result = await deleteItem(
      `${PATH}/delete/${selected.medicine_code}/`
    );

    if (result.success) {
      showModal("Medicine deleted");
      setSelected(null);
      refresh();
    } else {
      showModal(result.error || "Delete failed", "error");
    }
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner-container text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-emerald-700 font-bold">Loading medicines...</p>
      </div>
    </div>
  );

  return (
    <div className="app-container">

      {modal.visible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-body text-center p-6">
              <div className="mb-4">
                {modal.type === "success"
                  ? <FaCheckCircle size={50} className="text-emerald-500 mx-auto" />
                  : <FaTimesCircle size={50} className="text-red-500 mx-auto" />
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

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <h4 className="text-xl font-bold text-gray-800">Medicine Master</h4>

        {!showForm && (
          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-emerald-100"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14} /> Add New
            </button>

            {selected && (
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md"
                  onClick={() => {
                    setFormData({
                      ...selected,
                      medicine_cat_code:
                        selected.medicine_cat_code?.medicine_cat_code ||
                        selected.medicine_cat_code
                    });
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

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100">

          <h6 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
            {isEdit ? "Update Medicine" : "Create Medicine"}
          </h6>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Medicine Code</label>
              <input
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 ${isEdit ? "bg-gray-50 text-gray-400" : ""}`}
                disabled={isEdit}
                required
                value={formData.medicine_code}
                onChange={e => setFormData({ ...formData, medicine_code: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                required
                value={formData.medicine_cat_code}
                onChange={e => setFormData({ ...formData, medicine_cat_code: e.target.value })}
              >
                <option value="">Select</option>
                {categories.map(c => (
                  <option key={c.medicine_cat_code} value={c.medicine_cat_code}>
                    {c.medicine_cat_name || c.medicine_cat_code}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Medicine Name</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                required
                value={formData.medicine_name}
                onChange={e => setFormData({ ...formData, medicine_name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Generic Name</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.generic_name || ""}
                onChange={e => setFormData({ ...formData, generic_name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Quantity</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.qty || ""}
                onChange={e => setFormData({ ...formData, qty: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Unit Price</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.unit_price || ""}
                onChange={e => setFormData({ ...formData, unit_price: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Prescription Required</label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.prescription_required}
                onChange={e => setFormData({ ...formData, prescription_required: Number(e.target.value) })}
              >
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Sort Order</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.sort_order || ""}
                onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t pt-8 mt-4">
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-2.5 rounded-lg text-sm font-bold">
                {isEdit ? "Update" : "Save"}
              </button>
              <button type="button" className="px-6 py-2.5 text-sm font-bold text-gray-400" onClick={resetForm}>
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

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
                  <th className="table-th">Name</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Price</th>
                  <th className="table-th text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.map(m => (
                  <tr
                    key={m.medicine_code}
                    onClick={() =>
                      setSelected(
                        selected?.medicine_code === m.medicine_code ? null : m
                      )
                    }
                    className={`group cursor-pointer transition-colors
                      ${selected?.medicine_code === m.medicine_code
                        ? "bg-emerald-50/40"
                        : "hover:bg-gray-50/50"}`}
                  >
                    <td className="px-6 py-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${selected?.medicine_code === m.medicine_code
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-gray-200 group-hover:border-emerald-300"}`}>
                        {selected?.medicine_code === m.medicine_code &&
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </td>

                    <td className="table-td text-admin-id">{m.medicine_code}</td>
                    <td className="table-td font-medium text-gray-800">{m.medicine_name}</td>
                    <td className="table-td text-gray-500">
                      {m.medicine_cat_code?.medicine_cat_code || m.medicine_cat_code}
                    </td>
                    <td className="table-td text-gray-500">{m.unit_price}</td>
                    <td className="table-td text-center">
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

export default MedicineMst;