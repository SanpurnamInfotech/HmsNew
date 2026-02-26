import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaLightbulb 
} from 'react-icons/fa';

const ThoughtContentMaster = () => {
    /* ================= DATA FETCHING ================= */
    const PATH = "thought_content_master";
    const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);

    /* ================= UI STATES ================= */
    const [showForm, setShowForm] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [formData, setFormData] = useState({ 
        thought_content_code: "", 
        thought_content_name: "", 
        status: 1 
    });
    const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

    /* ================= TABLE LOGIC ================= */
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
        setSelectedRow(null);
        setFormData({ thought_content_code: "", thought_content_name: "", status: 1 });
    };

    const showModal = (message, type = "success") => setModal({ message, visible: true, type });

    /* ================= CRUD OPERATIONS ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const actionPath = isEdit ? `${PATH}/update/${formData.thought_content_code}/` : `${PATH}/create/`;
        const payload = { ...formData, status: Number(formData.status) };

        const result = isEdit
            ? await updateItem(actionPath, payload)
            : await createItem(actionPath, payload);

        if (result?.success) {
            showModal(`Record ${isEdit ? "updated" : "created"} successfully!`);
            resetForm();
            refresh();
        } else {
            showModal(result?.error || "Operation failed!", "error");
        }
    };

    const handleDelete = async () => {
        if (!selectedRow) return;
        const res = await deleteItem(`${PATH}/delete/${selectedRow.thought_content_code}/`);
        if (res?.success) {
            showModal("Record deleted successfully!");
            setSelectedRow(null);
            refresh();
        } else {
            showModal(res?.error || "Delete failed!", "error");
        }
    };

    if (loading) return (
        <div className="loading-overlay">
            <div className="loading-spinner-container text-center">
                <div className="loading-spinner mx-auto mb-4 border-t-emerald-600"></div>
                <p className="text-emerald-700 font-bold tracking-wider uppercase text-xs">Loading...</p>
            </div>
        </div>
    );

    return (
        <div className="app-container p-4">
            {/* ALERT MODAL */}
            {modal.visible && (
                <div className="modal-overlay backdrop-blur-sm">
                    <div className="modal-container text-center">
                        <div className="modal-body p-8">
                            <div className="modal-icon-container mb-4">
                                {modal.type === "success" 
                                    ? <FaCheckCircle className="text-4xl text-emerald-500 mx-auto" /> 
                                    : <FaTimesCircle className="text-4xl text-rose-500 mx-auto" />
                                }
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${modal.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>
                                {modal.type === "success" ? "Success" : "Error"}
                            </h3>
                            <p className="text-gray-600 mb-6">{modal.message}</p>
                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2.5 rounded-lg font-bold transition-all border-none outline-none shadow-none" onClick={() => setModal({ ...modal, visible: false })}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
                <h4 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Thought Content</h4>
                {!showForm && (
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all border-none outline-none shadow-none" onClick={() => setShowForm(true)}>
                            <FaPlus size={12} /> ADD NEW
                        </button>
                        {selectedRow && (
                            <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
                                <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all border-none outline-none shadow-none"
                                    onClick={() => { setFormData({ ...selectedRow }); setIsEdit(true); setShowForm(true); }}>
                                    <FaEdit size={12} /> EDIT
                                </button>
                                <button className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all border-none outline-none shadow-none" onClick={handleDelete}>
                                    <FaTrash size={12} /> DELETE
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* FORM SECTION */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 animate-in zoom-in-95 duration-200">
                    <div className="mb-8 border-b border-gray-100 pb-4">
                        <h6 className="text-lg font-bold text-gray-800 uppercase tracking-tight">
                            {isEdit ? "Update Record" : "New Record"}
                        </h6>
                    </div>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Code</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${isEdit ? "bg-gray-50 text-gray-400" : ""}`}
                                value={formData.thought_content_code}
                                disabled={isEdit}
                                required
                                placeholder="e.g. TC-001"
                                onChange={e => setFormData({ ...formData, thought_content_code: e.target.value.toUpperCase() })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                value={formData.thought_content_name}
                                required
                                placeholder="Enter content name"
                                onChange={e => setFormData({ ...formData, thought_content_name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
                            <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 outline-none bg-white transition-all" value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
                                <option value={1}>ACTIVE</option>
                                <option value={0}>INACTIVE</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-50 pt-6 mt-4">
                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-2.5 rounded-lg font-bold transition-all border-none outline-none shadow-none">
                                {isEdit ? "UPDATE" : "SAVE"}
                            </button>
                            <button type="button" className="px-6 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase" onClick={resetForm}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* TABLE SECTION */}
            {!showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
                    <TableToolbar itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} />
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <th className="px-6 py-4 w-16"></th>
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedData.length > 0 ? paginatedData.map((item) => (
                                    <tr
                                        key={item.thought_content_code}
                                        onClick={() => setSelectedRow(selectedRow?.thought_content_code === item.thought_content_code ? null : item)}
                                        className={`group cursor-pointer transition-colors ${selectedRow?.thought_content_code === item.thought_content_code ? "bg-emerald-50/40" : "hover:bg-gray-50/50"}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedRow?.thought_content_code === item.thought_content_code ? "border-emerald-500 bg-emerald-500" : "border-gray-200 group-hover:border-emerald-300"}`}>
                                                {selectedRow?.thought_content_code === item.thought_content_code && <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in-50" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-black text-gray-800 text-sm">{item.thought_content_code}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-bold">{item.thought_content_name}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 1 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                                {item.status === 1 ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <FaLightbulb size={40} className="mb-4 text-gray-200 mx-auto" />
                                            <p className="text-sm font-bold text-gray-300 uppercase">No records found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-white border-t border-gray-50 p-6">
                        <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThoughtContentMaster;