import React, { useMemo, useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaRing } from "react-icons/fa";

const MaritalStatusMaster = () => {
  /* ================= API ================= */
  const PATH = "marital_status_master";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);

  /* ================= UI STATE ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [formData, setFormData] = useState({
    marital_status_code: "",
    marital_status_name: "",
    status: 1,
    sort_order: "",
  });

  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

  /* ================= SORTING LOGIC ================= */
  const sortedMaritalStatuses = useMemo(() => {
    const list = Array.isArray(data) ? [...data] : [];
    const getOrder = (row) => {
      const n = Number(row?.sort_order);
      return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
    };

    list.sort((a, b) => {
      const ao = getOrder(a);
      const bo = getOrder(b);
      if (ao !== bo) return ao - bo;
      return (a?.marital_status_code || "").toString().localeCompare((b?.marital_status_code || "").toString());
    });

    return list;
  }, [data]);

  /* ================= TABLE ================= */
  const {
    search, setSearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    paginatedData,
    effectiveItemsPerPage,
    filteredData,
    totalPages
  } = useTable(sortedMaritalStatuses);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelected(null);
    setFormData({
      marital_status_code: "",
      marital_status_name: "",
      status: 1,
      sort_order: "",
    });
  };

  const showModalMsg = (message, type = "success") => setModal({ message, visible: true, type });

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      status: Number(formData.status),
      sort_order: formData.sort_order === "" ? null : Number(formData.sort_order),
    };

    const actionPath = isEdit
      ? `${PATH}/update/${formData.marital_status_code}/`
      : `${PATH}/create/`;

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      showModalMsg(`Marital Status ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModalMsg(result.error || "Operation failed!", "error");
    }
  };

  /* ================= DELETE (Confirm Msg Removed) ================= */
  const handleDelete = async () => {
    if (!selected) return;
    const result = await deleteItem(`${PATH}/delete/${selected.marital_status_code}/`);
    if (result.success) {
      showModalMsg("Marital Status deleted successfully!");
      setSelected(null);
      refresh();
    } else {
      showModalMsg(result.error || "Delete failed!", "error");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="app-container">
      {/* GLOBAL MODAL */}
      {modal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? (
                <FaCheckCircle className="text-6xl text-emerald-500" />
              ) : (
                <FaTimesCircle className="text-6xl text-rose-500" />
              )}
            </div>
            <h3 className={`text-xl font-black mb-2 uppercase tracking-tight ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            <p className="mb-6 font-medium opacity-80">{modal.message}</p>
            <button className="btn-primary w-full justify-center py-3" onClick={() => setModal({ ...modal, visible: false })}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="section-header">
        <h4 className="page-title">Marital Status Master</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Add New
            </button>

            {selected && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                <button
                  className="btn-warning"
                  onClick={() => {
                    setFormData({ ...selected });
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

      {/* FORM SECTION (2 COLUMNS) */}
      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">
          <h6 className="form-section-title uppercase tracking-tighter">
            {isEdit ? "Update Marital Status" : "Add New Marital Status"}
          </h6>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="form-label">Marital Status Code</label>
              <input
                className="form-input w-full"
                value={formData.marital_status_code}
                disabled={isEdit}
                required
                maxLength={45}
                onChange={(e) => setFormData({ ...formData, marital_status_code: e.target.value.toUpperCase() })}
                placeholder="Eg. DIV"
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Marital Status Name</label>
              <input
                className="form-input w-full"
                value={formData.marital_status_name}
                required
                maxLength={100}
                onChange={(e) => setFormData({ ...formData, marital_status_name: e.target.value })}
                placeholder="Eg. Divorced"
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Sort Order</label>
              <input
                className="form-input w-full"
                type="number"
                value={formData.sort_order ?? ""}
                placeholder="Eg. 1"
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Status</label>
              <select
                className="form-input w-full cursor-pointer appearance-none"
                style={{ colorScheme: "dark" }}
                value={Number(formData.status)}
                onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t pt-8 mt-4" style={{ borderColor: "var(--border-color)" }}>
              <button className="btn-primary px-12 py-3">{isEdit ? "Update" : "Save"}</button>
              <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE SECTION */}
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
                  <th className="text-admin-th">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.length > 0 ? paginatedData.map((m) => (
                  <tr
                    key={m.marital_status_code}
                    onClick={() => setSelected(selected?.marital_status_code === m.marital_status_code ? null : m)}
                    className={`group cursor-pointer transition-colors ${selected?.marital_status_code === m.marital_status_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"}`}
                  >
                    <td className="px-6 py-4">
                      <div className={`selection-indicator ${selected?.marital_status_code === m.marital_status_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                        {selected?.marital_status_code === m.marital_status_code && <div className="selection-dot" />}
                      </div>
                    </td>
                    <td className="text-admin-td">{m.marital_status_code}</td>
                    <td className="text-admin-td">{m.marital_status_name}</td>
                    <td className="text-admin-td">
                      <span className={`badge ${Number(m.status) === 1 ? "badge-success" : "badge-danger"}`}>
                        {Number(m.status) === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-24 text-center">
                      <FaRing size={64} className="mb-6 mx-auto opacity-10 text-emerald-500 animate-pulse" />
                      <p className="text-xl font-black opacity-30 uppercase tracking-widest">No status found</p>
                    </td>
                  </tr>
                )}
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

export default MaritalStatusMaster;