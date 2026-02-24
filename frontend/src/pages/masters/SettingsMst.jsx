import React, { useEffect, useState } from "react";
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

const SettingsMst = () => {

  /* ================= API ================= */
  const PATH = "settings";
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  /* ================= DROPDOWNS ================= */
  const [modules, setModules] = useState([]);
  const [submodules, setSubmodules] = useState([]);
  const [activities, setActivities] = useState([]);

  const [filteredSubmodules, setFilteredSubmodules] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);

  /* ================= UI STATES ================= */
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    setting_id: "",
    setting_name: "",
    module_code: "",
    submodule_code: "",
    activity_code: "",
    setting_value: "",
    setting_value2: "",
    used_for: ""
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

  /* ================= LOAD DROPDOWNS ================= */
  useEffect(() => {
    const load = async () => {
      const [m, sm, a] = await Promise.all([
        api.get("engine-module/"),
        api.get("engine-submodule/"),
        api.get("engine-activity/")
      ]);

      setModules(m.data?.results || m.data || []);
      setSubmodules(sm.data?.results || sm.data || []);
      setActivities(a.data?.results || a.data || []);
    };

    load();
  }, []);

  /* ================= FILTER SUBMODULE ================= */
  useEffect(() => {
    if (!formData.module_code) {
      setFilteredSubmodules([]);
      return;
    }

    setFilteredSubmodules(
      submodules.filter(
        sm => String(sm.module_code) === String(formData.module_code)
      )
    );
  }, [formData.module_code, submodules]);

  /* ================= FILTER ACTIVITY ================= */
  useEffect(() => {
    if (!formData.submodule_code) {
      setFilteredActivities([]);
      return;
    }

    setFilteredActivities(
      activities.filter(
        a => String(a.submodule_code) === String(formData.submodule_code)
      )
    );
  }, [formData.submodule_code, activities]);

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      setting_id: "",
      setting_name: "",
      module_code: "",
      submodule_code: "",
      activity_code: "",
      setting_value: "",
      setting_value2: "",
      used_for: ""
    });
  };

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

  /* ================= CRUD ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.setting_id}/`
      : `${PATH}/create/`;

    const result = isEdit
      ? await updateItem(actionPath, formData)
      : await createItem(actionPath, formData);

    if (result.success) {
      showModal(`Setting ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      showModal(result.error || "Operation failed!", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;

    const result = await deleteItem(
      `${PATH}/delete/${selectedRow.setting_id}/`
    );

    if (result.success) {
      showModal("Setting deleted successfully!");
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
            Synchronizing Settings...
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
            Settings Master
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
                    setFormData({
                      setting_id: selectedRow.setting_id,
                      setting_name: selectedRow.setting_name || "",
                      module_code: selectedRow.module_code || "",
                      submodule_code: selectedRow.submodule_code || "",
                      activity_code: selectedRow.activity_code || "",
                      setting_value: selectedRow.setting_value || "",
                      setting_value2: selectedRow.setting_value2 || "",
                      used_for: selectedRow.used_for || ""
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

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 animate-in zoom-in-95 duration-200">

          <h6 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
            {isEdit ? "Update Setting" : "Create Setting"}
          </h6>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Setting ID
              </label>
              <input
                type="number"
                disabled={isEdit}
                required
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 ${
                  isEdit ? "bg-gray-50 text-gray-400" : ""
                }`}
                value={formData.setting_id}
                onChange={(e) =>
                  setFormData({ ...formData, setting_id: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Setting Name
              </label>
              <input
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.setting_name}
                onChange={(e) =>
                  setFormData({ ...formData, setting_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Module
              </label>
              <select
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.module_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    module_code: e.target.value,
                    submodule_code: "",
                    activity_code: ""
                  })
                }
              >
                <option value="">Select</option>
                {modules.map(m => (
                  <option key={m.module_code} value={m.module_code}>
                    {m.module_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Submodule
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                disabled={!formData.module_code}
                value={formData.submodule_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    submodule_code: e.target.value,
                    activity_code: ""
                  })
                }
              >
                <option value="">Select</option>
                {filteredSubmodules.map(sm => (
                  <option
                    key={sm.submodule_code}
                    value={sm.submodule_code}
                  >
                    {sm.submodule_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Activity
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                disabled={!formData.submodule_code}
                value={formData.activity_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activity_code: e.target.value
                  })
                }
              >
                <option value="">Select</option>
                {filteredActivities.map(a => (
                  <option key={a.activity_code} value={a.activity_code}>
                    {a.activity_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Value
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.setting_value}
                onChange={(e) =>
                  setFormData({ ...formData, setting_value: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Value 2
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.setting_value2}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    setting_value2: e.target.value
                  })
                }
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Used For
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={formData.used_for}
                onChange={(e) =>
                  setFormData({ ...formData, used_for: e.target.value })
                }
              />
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
                  <th className="table-th">ID</th>
                  <th className="table-th">Name</th>
                  <th className="table-th">Value</th>
                  <th className="table-th">Used For</th>
                  <th className="table-th">Module</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginatedData.map((row) => (
                  <tr
                    key={row.setting_id}
                    onClick={() =>
                      setSelectedRow(
                        selectedRow?.setting_id === row.setting_id
                          ? null
                          : row
                      )
                    }
                    className={`group cursor-pointer transition-colors duration-150 ${
                      selectedRow?.setting_id === row.setting_id
                        ? "bg-emerald-50/40"
                        : "hover:bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedRow?.setting_id === row.setting_id
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-gray-200 group-hover:border-emerald-300"
                        }`}
                      >
                        {selectedRow?.setting_id === row.setting_id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </td>

                    <td className="table-td">{row.setting_id}</td>
                    <td className="table-td">{row.setting_name}</td>
                    <td className="table-td">{row.setting_value}</td>
                    <td className="table-td">{row.used_for}</td>
                    <td className="table-td">{row.module_code}</td>
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

export default SettingsMst;
