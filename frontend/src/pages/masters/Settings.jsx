import React, { useState, useEffect } from "react";
import { useCrud, useTable, BootstrapPagination, TableToolbar } from "../../components/common/BaseCRUD";
import { Button, Table, Form, Card, Row, Col, Spinner } from 'react-bootstrap';
import api from "../../utils/domain"; 

const Settings = () => {
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud("settings/");
  
  const [modules, setModules] = useState([]);
  const [submodules, setSubmodules] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filteredSubmodules, setFilteredSubmodules] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);

  const { 
    search, setSearch, 
    currentPage, setCurrentPage, 
    itemsPerPage, setItemsPerPage, 
    paginatedData, 
    effectiveItemsPerPage, 
    filteredData 
  } = useTable(data);

  const [formData, setFormData] = useState({
    setting_id: "", setting_name: "", setting_value: "",
    setting_value2: "", used_for: "", module_code: "",
    submodule_code: "", activity_code: "",
  });

  const [modal, setModal] = useState({ message: "", visible: false, type: "success" });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [modRes, subRes, actRes] = await Promise.all([
          api.get("engine-module/"),
          api.get("engine-submodule/"),
          api.get("engine-activity/")
        ]);
        setModules(modRes.data?.results || modRes.data || []);
        setSubmodules(subRes.data?.results || subRes.data || []);
        setActivities(actRes.data?.results || actRes.data || []);
      } catch (err) { console.error("Dropdown error:", err); }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (formData.module_code) {
      setFilteredSubmodules(submodules.filter(sm => String(sm.module_code) === String(formData.module_code)));
    } else { setFilteredSubmodules([]); }
  }, [formData.module_code, submodules]);

  useEffect(() => {
    if (formData.submodule_code) {
      setFilteredActivities(activities.filter(act => String(act.submodule_code) === String(formData.submodule_code)));
    } else { setFilteredActivities([]); }
  }, [formData.submodule_code, activities]);

  const showModal = (message, type = "success") => setModal({ message, visible: true, type });

  const resetForm = () => {
    setShowForm(false); setIsEdit(false); setSelectedSetting(null);
    setFormData({
      setting_id: "", setting_name: "", setting_value: "",
      setting_value2: "", used_for: "", module_code: "",
      submodule_code: "", activity_code: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = isEdit 
      ? await updateItem(`settings/update/${formData.setting_id}/`, formData)
      : await createItem(`settings/create/`, formData);

    if (result.success) {
      showModal(`Setting ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
    } else {
      showModal(result.error || "Operation failed.", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedSetting || !window.confirm("Delete this setting?")) return;
    const result = await deleteItem(`settings/delete/${selectedSetting.setting_id}/`);
    if (result.success) {
      showModal("Deleted successfully!");
      setSelectedSetting(null);
    }
  };

  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-surface">
      <Spinner animation="border" variant="success" />
    </div>
  );

  return (
    <div className="container-fluid py-4 px-4 bg-surface min-vh-100">
      {/* MODAL */}
      {modal.visible && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.8)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content shadow border-0 text-center p-4">
              <div className={`mb-3 ${modal.type === "success" ? "text-success" : "text-danger"}`}>
                <i className={`bi ${modal.type === "success" ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} style={{ fontSize: "3rem" }}></i>
              </div>
              <h5 className="fw-bold">{modal.type === "success" ? "Success" : "Error"}</h5>
              <p className="text-muted small">{modal.message}</p>
              <button className="btn btn-success w-100 rounded-pill" onClick={() => setModal({ ...modal, visible: false })}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER - Updated to navy-matched bg-surface */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-surface p-3 rounded shadow-sm border-start border-success border-4">
        <div>
          <h4 className="fw-bold mb-0 text-success">System Configuration</h4>
        </div>
        {!showForm && (
          <div className="d-flex gap-2">
            <Button variant="success" size="sm" onClick={() => setShowForm(true)}>+ Add New</Button>
            {selectedSetting && (
              <>
                <Button variant="warning" size="sm" onClick={() => { setFormData(selectedSetting); setIsEdit(true); setShowForm(true); }}>Edit</Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* FORM SECTION */}
      {showForm && (
        <Card className="border-0 shadow-sm mb-4 bg-surface">
          <Card.Body className="p-4">
            <h6 className="fw-bold mb-4 text-success">{isEdit ? "EDIT SETTING" : "ADD NEW SETTING"}</h6>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="small fw-bold text-muted">Setting Name</Form.Label>
                  <Form.Control size="sm" value={formData.setting_name} required onChange={e => setFormData({ ...formData, setting_name: e.target.value })} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-bold text-muted">Used For</Form.Label>
                  <Form.Control size="sm" value={formData.used_for} required onChange={e => setFormData({ ...formData, used_for: e.target.value })} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-bold text-muted">Setting Value</Form.Label>
                  <Form.Control size="sm" value={formData.setting_value} required onChange={e => setFormData({ ...formData, setting_value: e.target.value })} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-bold text-muted">Value 2 (Optional)</Form.Label>
                  <Form.Control size="sm" value={formData.setting_value2} onChange={e => setFormData({ ...formData, setting_value2: e.target.value })} />
                </Col>
                
                <Col md={6}>
                  <Form.Label className="small fw-bold text-muted">Module</Form.Label>
                  <Form.Select size="sm" value={formData.module_code} required onChange={e => setFormData({ ...formData, module_code: e.target.value, submodule_code: "", activity_code: "" })}>
                    <option value="">Select Module</option>
                    {modules.map(m => <option key={m.module_code} value={m.module_code}>{m.module_name}</option>)}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-bold text-muted">Submodule</Form.Label>
                  <Form.Select size="sm" value={formData.submodule_code} disabled={!formData.module_code} onChange={e => setFormData({ ...formData, submodule_code: e.target.value, activity_code: "" })}>
                    <option value="">Select Submodule</option>
                    {filteredSubmodules.map(sm => <option key={sm.submodule_code} value={sm.submodule_code}>{sm.submodule_name}</option>)}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-bold text-muted">Activity</Form.Label>
                  <Form.Select size="sm" value={formData.activity_code} disabled={!formData.submodule_code} onChange={e => setFormData({ ...formData, activity_code: e.target.value })}>
                    <option value="">Select Activity</option>
                    {filteredActivities.map(act => <option key={act.activity_code} value={act.activity_code}>{act.activity_name}</option>)}
                  </Form.Select>
                </Col>
              </Row>
              <div className="text-end mt-4 pt-3 border-top border-secondary">
                <Button variant="success" size="sm" type="submit" className="me-2 px-4">{isEdit ? "UPDATE" : "SAVE"}</Button>
                <Button variant="secondary" size="sm" onClick={resetForm}>CANCEL</Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* TABLE SECTION */}
      {!showForm && (
        <Card className="border-0 shadow-sm bg-surface">
          <TableToolbar 
            itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} 
            search={search} setSearch={setSearch} setCurrentPage={setCurrentPage} 
          />
          <div className="table-responsive">
            <Table hover align="middle" className="mb-0 text-nowrap">
              <thead className="small fw-bold text-uppercase">
                <tr>
                  <th width="50" className="ps-4"></th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Value</th>
                  <th>Used For</th>
                  <th>Module</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((s) => (
                    <tr 
                      key={s.setting_id} 
                      onClick={() => setSelectedSetting(selectedSetting?.setting_id === s.setting_id ? null : s)} 
                      className={selectedSetting?.setting_id === s.setting_id ? "table-primary-light" : ""} 
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="ps-4">
                        <Form.Check checked={selectedSetting?.setting_id === s.setting_id} readOnly />
                      </td>
                      <td>{s.setting_id}</td>
                      <td>{s.setting_name}</td>
                      <td>{s.setting_value}</td>
                      <td>{s.used_for}</td>
                      <td>{s.module_code}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">No records found.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          <BootstrapPagination 
            totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} 
            currentPage={currentPage} setCurrentPage={setCurrentPage} 
          />
        </Card>
      )}
    </div>
  );
};

export default Settings;