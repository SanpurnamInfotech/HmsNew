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

  const PATH = "settings";
  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  const [modules, setModules] = useState([]);
  const [submodules, setSubmodules] = useState([]);
  const [activities, setActivities] = useState([]);

  const [filteredSubmodules, setFilteredSubmodules] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);

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

  const {
    search, setSearch,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    paginatedData,
    effectiveItemsPerPage,
    filteredData,
    totalPages
  } = useTable(data || []);

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

    const payload = { ...formData };

    if (!isEdit) delete payload.setting_id;

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );

  return (
    <div className="app-container">

      {/* MODAL */}

      {modal.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center shadow-2xl">

            <div className="mb-4 flex justify-center">
              {modal.type === "success"
                ? <FaCheckCircle className="text-6xl text-emerald-500" />
                : <FaTimesCircle className="text-6xl text-rose-500" />
              }
            </div>

            <h3 className={`text-xl font-black mb-2 ${
              modal.type === "success" ? "text-emerald-500" : "text-rose-500"
            }`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>

            <p className="mb-6">{modal.message}</p>

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
        <h4 className="page-title">Settings Master</h4>

        {!showForm && (
          <div className="flex items-center gap-2">

            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14}/> Add New
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
                  <FaEdit size={14}/> Edit
                </button>

                <button
                  className="btn-danger"
                  onClick={handleDelete}
                >
                  <FaTrash size={14}/> Delete
                </button>

              </div>
            )}

          </div>
        )}
      </div>

      {/* FORM */}

      {showForm && (
        <div className="form-container animate-in zoom-in-95 duration-200">

          <h6 className="form-section-title">
            {isEdit ? "Update Setting" : "Create Setting"}
          </h6>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            onSubmit={handleSubmit}
          >

            <div className="space-y-1.5">
              <label className="form-label">Setting ID</label>
              <input
                className="form-input w-full opacity-50 cursor-not-allowed"
                value={formData.setting_id || "Auto Generated"}
                disabled
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Setting Name</label>
              <input
                className="form-input w-full"
                value={formData.setting_name}
                onChange={(e) =>
                  setFormData({ ...formData, setting_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Module</label>
              <select
                className="form-input w-full"
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
              <label className="form-label">Submodule</label>
              <select
                className="form-input w-full"
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
                  <option key={sm.submodule_code} value={sm.submodule_code}>
                    {sm.submodule_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Activity</label>
              <select
                className="form-input w-full"
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
              <label className="form-label">Value</label>
              <input
                className="form-input w-full"
                value={formData.setting_value}
                onChange={(e) =>
                  setFormData({ ...formData, setting_value: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Value 2</label>
              <input
                className="form-input w-full"
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
              <label className="form-label">Used For</label>
              <input
                className="form-input w-full"
                value={formData.used_for}
                onChange={(e) =>
                  setFormData({ ...formData, used_for: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 border-t pt-8 mt-4">
              <button type="submit" className="btn-primary px-12 py-3">
                {isEdit ? "Update" : "Save"}
              </button>

              <button
                type="button"
                className="btn-ghost"
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
        <div className="data-table-container">

          <TableToolbar
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            search={search}
            setSearch={setSearch}
            setCurrentPage={setCurrentPage}
          />

          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="text-admin-th w-16"></th>
                <th className="text-admin-th">ID</th>
                <th className="text-admin-th">Name</th>
                <th className="text-admin-th">Value</th>
                <th className="text-admin-th">Used For</th>
                <th className="text-admin-th">Module</th>
              </tr>
            </thead>

            <tbody>
  {paginatedData.map((row) => {
    const isSelected = selectedRow?.setting_id === row.setting_id;

    return (
      <tr
        key={row.setting_id}
        onClick={() =>
          setSelectedRow(isSelected ? null : row)
        }
        className={`cursor-pointer transition ${
          isSelected
            ? "bg-emerald-500/10"
            : "hover:bg-emerald-500/5"
        }`}
      >

        {/* GREEN INDICATOR COLUMN */}

        <td className="w-16">
          <div className="flex items-center justify-center">

            {isSelected ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border border-slate-300"></div>
            )}

          </div>
        </td>

        <td className="text-admin-td">{row.setting_id}</td>
        <td className="text-admin-td">{row.setting_name}</td>
        <td className="text-admin-td">{row.setting_value}</td>
        <td className="text-admin-td">{row.used_for}</td>
        <td className="text-admin-td">{row.module_code}</td>

      </tr>
    );
  })}
</tbody>
          </table>

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

export default SettingsMst;