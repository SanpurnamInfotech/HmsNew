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
  FaTimesCircle,
  FaLightbulb
} from "react-icons/fa";

const SettingsMst = () => {

  const PATH = "settings";

  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  /* ================= DROPDOWN DATA ================= */

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
  } = useTable(data || []);

  /* ================= LOAD DROPDOWNS ================= */

  useEffect(() => {

    const load = async () => {

      const [m, sm, a] = await Promise.all([
        api.get("engine-module/"),
        api.get("engine-submodule/"),
        api.get("engine-activity/")
      ]);

      setModules(m.data || []);
      setSubmodules(sm.data || []);
      setActivities(a.data || []);

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

  const showModal = (message, type = "success") =>
    setModal({ message, visible: true, type });

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

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.setting_id}/`
      : `${PATH}/create/`;

    const result = isEdit
      ? await updateItem(actionPath, formData)
      : await createItem(actionPath, formData);

    if (result.success) {

      showModal(`Setting ${isEdit ? "updated" : "created"} successfully`);

      resetForm();
      refresh();

    } else {

      showModal(result.error || "Operation failed", "error");

    }

  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {

    if (!selectedRow) return;

    const result = await deleteItem(
      `${PATH}/delete/${selectedRow.setting_id}/`
    );

    if (result.success) {

      showModal("Setting deleted successfully");
      setSelectedRow(null);
      refresh();

    } else {

      showModal(result.error || "Delete failed", "error");

    }

  };

  /* ================= LOADING ================= */

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );

  return (
    <div className="app-container">

      {/* ================= MODAL ================= */}

      {modal.visible && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

          <div className="form-container max-w-sm w-full p-8 text-center shadow-2xl">

            <div className="mb-4 flex justify-center">

              {modal.type === "success"
                ? <FaCheckCircle className="text-6xl text-emerald-500" />
                : <FaTimesCircle className="text-6xl text-rose-500" />
              }

            </div>

            <h3 className="text-xl font-black mb-2 uppercase">
              {modal.type === "success" ? "Success" : "Error"}
            </h3>

            <p className="mb-6">{modal.message}</p>

            <button
              className="btn-primary w-full"
              onClick={() => setModal({ ...modal, visible: false })}
            >
              Continue
            </button>

          </div>

        </div>

      )}

      {/* ================= HEADER ================= */}

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

              <div className="flex gap-2">

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

      {/* ================= FORM ================= */}

      {showForm && (

        <div className="form-container">

          <h6 className="form-section-title">
            {isEdit ? "Update Setting" : "Create Setting"}
          </h6>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >

            <div>
              <label className="form-label">Setting ID</label>
              <input
                className="form-input w-full"
                value={formData.setting_id}
                disabled={isEdit}
                required
                onChange={e =>
                  setFormData({
                    ...formData,
                    setting_id: e.target.value
                  })
                }
              />
            </div>
{/* 
            <div>
              <label className="form-label">Setting Name</label>
              <input
                className="form-input w-full"
                value={formData.setting_name}
                onChange={e =>
                  setFormData({
                    ...formData,
                    setting_name: e.target.value
                  })
                }
              />
            </div> */}

            {/* MODULE */}

            <div>
              <label className="form-label">Module</label>

              <select
                className="form-input w-full"
                value={formData.module_code}
                onChange={e =>
                  setFormData({
                    ...formData,
                    module_code: e.target.value
                  })
                }
              >
                <option value="">Select Module</option>

                {modules.map(m => (
                  <option key={m.module_code} value={m.module_code}>
                    {m.module_name}
                  </option>
                ))}

              </select>
            </div>

            {/* SUBMODULE */}

            <div>
              <label className="form-label">Submodule</label>

              <select
                className="form-input w-full"
                value={formData.submodule_code}
                onChange={e =>
                  setFormData({
                    ...formData,
                    submodule_code: e.target.value
                  })
                }
              >
                <option value="">Select Submodule</option>

                {filteredSubmodules.map(sm => (
                  <option key={sm.submodule_code} value={sm.submodule_code}>
                    {sm.submodule_name}
                  </option>
                ))}

              </select>
            </div>

            {/* ACTIVITY */}

            <div>
              <label className="form-label">Activity</label>

              <select
                className="form-input w-full"
                value={formData.activity_code}
                onChange={e =>
                  setFormData({
                    ...formData,
                    activity_code: e.target.value
                  })
                }
              >
                <option value="">Select Activity</option>

                {filteredActivities.map(a => (
                  <option key={a.activity_code} value={a.activity_code}>
                    {a.activity_name}
                  </option>
                ))}

              </select>
            </div>

            <div>
              <label className="form-label">Setting Value</label>
              <input
                className="form-input w-full"
                value={formData.setting_value}
                onChange={e =>
                  setFormData({
                    ...formData,
                    setting_value: e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="form-label">Setting Value 2</label>
              <input
                className="form-input w-full"
                value={formData.setting_value2}
                onChange={e =>
                  setFormData({
                    ...formData,
                    setting_value2: e.target.value
                  })
                }
              />
            </div>

            <div>
              <label className="form-label">Used For</label>
              <input
                className="form-input w-full"
                value={formData.used_for}
                onChange={e =>
                  setFormData({
                    ...formData,
                    used_for: e.target.value
                  })
                }
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">

              <button
                type="submit"
                className="btn-primary px-12"
              >
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

      {/* ================= TABLE ================= */}

      {!showForm && (

        <div className="data-table-container">

          <TableToolbar
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            search={search}
            setSearch={setSearch}
            setCurrentPage={setCurrentPage}
          />

          <table className="w-full">

            <thead>

              <tr>
                <th className="text-admin-th w-16"></th>
                <th className="text-admin-th">ID</th>
                <th className="text-admin-th">Name</th>
                <th className="text-admin-th">Module</th>
                <th className="text-admin-th">Submodule</th>
              </tr>

            </thead>

            <tbody>

              {paginatedData.length > 0 ? (

                paginatedData.map(row => (

                  <tr
                    key={row.setting_id}
                    onClick={() =>
                      setSelectedRow(
                        selectedRow?.setting_id === row.setting_id
                          ? null
                          : row
                      )
                    }
                    className="cursor-pointer hover:bg-emerald-500/5"
                  >

                    <td className="px-6 py-4"></td>

                    <td className="text-admin-td font-bold">
                      {row.setting_id}
                    </td>

                    <td className="text-admin-td">
                      {row.setting_name}
                    </td>

                    <td className="text-admin-td">
                      {row.module_code}
                    </td>

                    <td className="text-admin-td">
                      {row.submodule_code}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td colSpan="5" className="text-center py-20">

                    <FaLightbulb
                      size={60}
                      className="mx-auto opacity-10"
                    />

                    <p className="opacity-40 font-bold mt-4">
                      No Settings Found
                    </p>

                  </td>

                </tr>

              )}

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