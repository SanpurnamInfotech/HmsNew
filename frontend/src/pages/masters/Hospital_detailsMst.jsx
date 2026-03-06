import React, { useState } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const HospitalDetails = () => {

  // IMPORTANT: yaha api mat likho
  const PATH = "hospital";

  const { data, loading, refresh, createItem, updateItem, deleteItem } =
    useCrud(`${PATH}/`);

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    hospital_code: "",
    hospital_name: "",
    hospital_reg_number: "",
    hospital_cst_number: "",
    email: "",
    mobile: "",
    phone: "",
    landmark: "",
    address1: "",
    address2: "",
    city_code: "",
    district_code: "",
    state_code: "",
    country_code: "",
    pincode: "",
    lunch_timing: "",
    weeklyoff_day: "",
    logo_path: "",
    developed_by: "",
    status: 1
  });

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
    totalPages
  } = useTable(data || []);

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({
      hospital_code: "",
      hospital_name: "",
      hospital_reg_number: "",
      hospital_cst_number: "",
      email: "",
      mobile: "",
      phone: "",
      landmark: "",
      address1: "",
      address2: "",
      city_code: "",
      district_code: "",
      state_code: "",
      country_code: "",
      pincode: "",
      lunch_timing: "",
      weeklyoff_day: "",
      logo_path: "",
      developed_by: "",
      status: 1
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const actionPath = isEdit
      ? `${PATH}/update/${formData.hospital_code}/`
      : `${PATH}/create/`;

    const result = isEdit
      ? await updateItem(actionPath, formData)
      : await createItem(actionPath, formData);

    if (result && result.success) {

      alert(isEdit ? "Hospital Updated" : "Hospital Created");

      resetForm();
      refresh();

    } else {

      alert("Error saving hospital");

    }
  };

  const handleDelete = async () => {

    if (!selectedRow) return;

    const result = await deleteItem(
      `${PATH}/delete/${selectedRow.hospital_code}/`
    );

    if (result.success) {

      alert("Hospital Deleted");
      setSelectedRow(null);
      refresh();

    }

  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (

    <div className="app-container">

      {/* HEADER */}

      <div className="section-header">

        <h4 className="page-title">Hospital Details</h4>

        {!showForm && (

          <div className="flex gap-2">

            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FaPlus size={14}/> Add New
            </button>

            {selectedRow && (

              <>
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
              </>

            )}

          </div>

        )}

      </div>

      {/* FORM */}

      {showForm && (

        <div className="form-container">

          <h6 className="form-section-title">
            {isEdit ? "Update Hospital" : "Add Hospital"}
          </h6>

          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            onSubmit={handleSubmit}
          >

            <input className="form-input"
              placeholder="Hospital Code"
              value={formData.hospital_code}
              disabled={isEdit}
              onChange={(e)=>setFormData({...formData,hospital_code:e.target.value})}
            />

            <input className="form-input"
              placeholder="Hospital Name"
              value={formData.hospital_name}
              onChange={(e)=>setFormData({...formData,hospital_name:e.target.value})}
            />

            <input className="form-input"
              placeholder="Registration Number"
              value={formData.hospital_reg_number}
              onChange={(e)=>setFormData({...formData,hospital_reg_number:e.target.value})}
            />

            <input className="form-input"
              placeholder="CST Number"
              value={formData.hospital_cst_number}
              onChange={(e)=>setFormData({...formData,hospital_cst_number:e.target.value})}
            />

            <input className="form-input"
              placeholder="Email"
              value={formData.email}
              onChange={(e)=>setFormData({...formData,email:e.target.value})}
            />

            <input className="form-input"
              placeholder="Mobile"
              value={formData.mobile}
              onChange={(e)=>setFormData({...formData,mobile:e.target.value})}
            />

            <input className="form-input"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e)=>setFormData({...formData,phone:e.target.value})}
            />

            <input className="form-input"
              placeholder="Landmark"
              value={formData.landmark}
              onChange={(e)=>setFormData({...formData,landmark:e.target.value})}
            />

            <input className="form-input"
              placeholder="Address 1"
              value={formData.address1}
              onChange={(e)=>setFormData({...formData,address1:e.target.value})}
            />

            <input className="form-input"
              placeholder="Address 2"
              value={formData.address2}
              onChange={(e)=>setFormData({...formData,address2:e.target.value})}
            />

            <input className="form-input"
              placeholder="City Code"
              value={formData.city_code}
              onChange={(e)=>setFormData({...formData,city_code:e.target.value})}
            />

            <input className="form-input"
              placeholder="District Code"
              value={formData.district_code}
              onChange={(e)=>setFormData({...formData,district_code:e.target.value})}
            />

            <input className="form-input"
              placeholder="State Code"
              value={formData.state_code}
              onChange={(e)=>setFormData({...formData,state_code:e.target.value})}
            />

            <input className="form-input"
              placeholder="Country Code"
              value={formData.country_code}
              onChange={(e)=>setFormData({...formData,country_code:e.target.value})}
            />

            <input className="form-input"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={(e)=>setFormData({...formData,pincode:e.target.value})}
            />

            <input className="form-input"
              placeholder="Lunch Timing"
              value={formData.lunch_timing}
              onChange={(e)=>setFormData({...formData,lunch_timing:e.target.value})}
            />

            <input className="form-input"
              placeholder="Weekly Off"
              value={formData.weeklyoff_day}
              onChange={(e)=>setFormData({...formData,weeklyoff_day:e.target.value})}
            />

            <input className="form-input"
              placeholder="Logo Path"
              value={formData.logo_path}
              onChange={(e)=>setFormData({...formData,logo_path:e.target.value})}
            />

            <input className="form-input"
              placeholder="Developed By"
              value={formData.developed_by}
              onChange={(e)=>setFormData({...formData,developed_by:e.target.value})}
            />

            <select className="form-input"
              value={formData.status}
              onChange={(e)=>setFormData({...formData,status:Number(e.target.value)})}
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>

            <div className="md:col-span-3 flex justify-end gap-3">

              <button type="submit" className="btn-primary px-10 py-3">
                {isEdit ? "Update" : "Save"}
              </button>

              <button type="button" className="btn-ghost" onClick={resetForm}>
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
                <th></th>
                <th>Hospital Code</th>
                <th>Hospital Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {paginatedData.map((item)=>(

                <tr
                  key={item.hospital_code}
                  onClick={()=>setSelectedRow(
                    selectedRow?.hospital_code===item.hospital_code?null:item
                  )}
                >

                  <td></td>
                  <td>{item.hospital_code}</td>
                  <td>{item.hospital_name}</td>
                  <td>{item.email}</td>
                  <td>{item.mobile}</td>
                  <td>{item.status===1?"Active":"Inactive"}</td>

                </tr>

              ))}

            </tbody>

          </table>

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

export default HospitalDetails;