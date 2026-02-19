import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';

const ExpensesMst = () => {
	const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud("expenses/");

	const [showForm, setShowForm] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [selected, setSelected] = useState(null);
	const [formData, setFormData] = useState({ expenses_code: "", expenses_name: "", sort_order: 0, status: 1 });
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
		setSelected(null);
		setFormData({ expenses_code: "", expenses_name: "", sort_order: 0, status: 1 });
	};

	const showModal = (message, type = "success") => setModal({ message, visible: true, type });

	const handleSubmit = async (e) => {
		e.preventDefault();

		const payload = { ...formData };

		let result = isEdit
			? await updateItem(`expenses/update/${formData.expenses_code}/`, payload)
			: await createItem(`expenses/create/`, payload);

		if (result.success) {
			showModal(`Expenses ${isEdit ? "updated" : "created"} successfully!`);
			resetForm();
			refresh();
		} else {
			showModal(result.error || "Operation failed!", "error");
		}
	};

	const handleDelete = async () => {
		if (!selected || !selected.expenses_code) {
			showModal("Please select a record from the table first.", "error");
			return;
		}

		const res = await deleteItem(`expenses/delete/${selected.expenses_code}/`);
		if (res.success) {
			showModal("Expenses deleted successfully!");
			setSelected(null);
			refresh();
		} else {
			showModal(res.error || "Delete failed!", "error");
		}
	};

	if (loading) return (
		<div className="loading-overlay">
			<div className="loading-spinner-container">
				<div className="loading-spinner"></div>
				<p className="loading-text">Loading Expenses...</p>
			</div>
		</div>
	);

	return (
		<div className="app-container">
			{modal.visible && (
				<div className="modal-overlay">
					<div className="modal-container">
						<div className="modal-body">
							<div className="modal-icon-container">
								{modal.type === "success"
									? <div className="modal-icon-success"><FaCheckCircle /></div>
									: <div className="modal-icon-error"><FaTimesCircle /></div>
								}
							</div>
							<h3 className={`modal-title ${modal.type === "success" ? "modal-title-success" : "modal-title-error"}`}>
								{modal.type === "success" ? "Success" : "Error"}
							</h3>
							<p className="modal-message mb-6">{modal.message}</p>
							<button className="btn-primary w-full" onClick={() => setModal({ ...modal, visible: false })}>OK</button>
						</div>
					</div>
				</div>
			)}

			<div className="section-header">
				<h4 className="text-xl font-bold text-gray-800">Expenses Master</h4>
				{!showForm && (
					<div className="flex items-center gap-2">
						<button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus size={14} /> Add New</button>
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
								<button className="btn-danger" onClick={handleDelete}><FaTrash size={14} /> Delete</button>
							</div>
						)}
					</div>
				)}
			</div>

			{showForm && (
				<div className="form-container">
					<div className="mb-8 border-b border-gray-50 pb-5">
						<h6 className="text-lg font-bold text-gray-800">{isEdit ? "Update Expense" : "Add New Expense"}</h6>
					</div>

					<form className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
						<div className="space-y-1.5 md:col-span-2">
							<label className="form-label">Expense Code</label>
							<input
								type="text"
								className={`form-input ${isEdit ? "form-input-disabled" : ""}`}
								value={formData.expenses_code}
								disabled={isEdit}
								required
								placeholder="e.g. EXP-001"
								onChange={e => setFormData({ ...formData, expenses_code: e.target.value })}
							/>
						</div>

						<div className="space-y-1.5 md:col-span-2">
							<label className="form-label">Expense Name</label>
							<input
								type="text"
								className="form-input"
								value={formData.expenses_name}
								required
								placeholder="Enter expense name"
								onChange={e => setFormData({ ...formData, expenses_name: e.target.value })}
							/>
						</div>

						<div className="space-y-1.5 md:col-span-1">
							<label className="form-label">Sort Order</label>
							<input
								type="number"
								className="form-input"
								value={formData.sort_order}
								onChange={e => setFormData({ ...formData, sort_order: Number(e.target.value) })}
							/>
						</div>

						<div className="space-y-1.5 md:col-span-1">
							<label className="form-label">Status</label>
							<select className="form-input" value={formData.status} onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}>
								<option value={1}>Active</option>
								<option value={0}>Inactive</option>
							</select>
						</div>

						<div className="md:col-span-4 flex justify-end gap-3 border-t border-gray-50 pt-8 mt-4">
							<button className="btn-primary px-10">{isEdit ? "Update" : "Save"}</button>
							<button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
						</div>
					</form>
				</div>
			)}

			{!showForm && (
				<div className="data-table-container">
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
									<th className="table-th"></th>
									<th className="table-th">Expense Code</th>
									<th className="table-th">Expense Name</th>
									<th className="table-th">Sort</th>
									<th className="table-th">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-50">
								{paginatedData.length > 0 ? paginatedData.map((item) => (
									<tr
										key={item.expenses_code}
										onClick={() => setSelected(selected?.expenses_code === item.expenses_code ? null : item)}
										className={`table-row ${selected?.expenses_code === item.expenses_code ? "table-row-active" : "table-row-hover"}`}
									>
										<td className="table-td">
											<div className={`selection-indicator ${selected?.expenses_code === item.expenses_code ? "selection-indicator-active" : "selection-indicator-inactive"}`}>
												{selected?.expenses_code === item.expenses_code && <div className="selection-dot" />}
											</div>
										</td>
										<td className="table-td text-admin-id">{item.expenses_code}</td>
										<td className="table-td">{item.expenses_name}</td>
										<td className="table-td">{item.sort_order}</td>
										<td className="table-td">{item.status === 1 ? 'Active' : 'Inactive'}</td>
									</tr>
								)) : (
									<tr>
										<td colSpan="5" className="table-td py-20 text-center">
											<div className="empty-state-container">
												<FaLightbulb size={48} className="mb-4 text-gray-400 mx-auto" />
												<p className="text-xl font-bold text-gray-500">No expense records found</p>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
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

export default ExpensesMst;
