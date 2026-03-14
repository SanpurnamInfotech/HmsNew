import React, { useState, useEffect } from "react";
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import SearchableSelect from "../../components/common/SearchableSelect";

const OpdCaseSheet = () => {

const OPD_PATH = "opd-casesheet";

/* -------- API -------- */

const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${OPD_PATH}/`);
const { data: patients } = useCrud("patient/");

const patientList = patients?.results || patients || [];

/* -------- STATE -------- */

const [showForm,setShowForm] = useState(false);
const [isEdit,setIsEdit] = useState(false);
const [selectedRow,setSelectedRow] = useState(null);

const [modal,setModal] = useState({
visible:false,
message:"",
type:"success"
});

const initialForm = {

opd_casesheet_code:"",
patient_code:"",
case_title:"",
chief_complaint:"",
symptoms:"",
diagnosis:"",
vital_signs:"",
weight_kg:"",
height_cm:"",
bp_sys:"",
bp_dia:"",
status:1

};

const [formData,setFormData] = useState(initialForm);

/* -------- AUTO GENERATE CASE CODE -------- */

useEffect(()=>{

if(!isEdit && data){

const list = data?.results || data || [];

if(list.length>0){

const last = list[list.length-1].opd_casesheet_code;
const number = parseInt(last.replace("OPD",""))+1;
const newCode = "OPD"+String(number).padStart(4,"0");

setFormData(prev=>({...prev,opd_casesheet_code:newCode}));

}else{

setFormData(prev=>({...prev,opd_casesheet_code:"OPD0001"}));

}

}

},[data,isEdit]);

/* -------- TABLE -------- */

const {
search,
setSearch,
currentPage,
setCurrentPage,
itemsPerPage,
setItemsPerPage,
paginatedData,
filteredData,
totalPages
} = useTable(data || []);

/* -------- RESET -------- */

const resetForm = () => {
setShowForm(false);
setIsEdit(false);
setSelectedRow(null);
setFormData(initialForm);
};

/* -------- MODAL -------- */

const showModal = (message,type="success") => {
setModal({
visible:true,
message,
type
});
};

/* -------- SUBMIT (UPDATE THIS) -------- */
const handleSubmit = async (e) => {
  e.preventDefault();

  // FIX: NaN ko 0 mein convert karein taki backend crash na ho
  const payload = {
    ...formData,
    weight_kg: parseFloat(formData.weight_kg) || 0,
    height_cm: parseFloat(formData.height_cm) || 0,
    bp_sys: parseInt(formData.bp_sys) || 0,
    bp_dia: parseInt(formData.bp_dia) || 0,
  };

  try {
    const actionPath = isEdit
      ? `${OPD_PATH}/update/${formData.opd_casesheet_code}/`
      : `${OPD_PATH}/create/`;

    const result = isEdit
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result && result.success) {
      showModal(`OPD Case ${isEdit ? "updated" : "created"} successfully!`);
      resetForm();
      refresh();
    } else {
      // FIX: Agar error ho to modal dikhayein, page blank na hone dein
      showModal(result?.error || "Failed to save data. Check fields.", "error");
    }
  } catch (err) {
    console.error("Submission Error:", err);
    showModal("An unexpected error occurred.", "error");
  }
};

/* -------- DELETE -------- */

const handleDelete = async () => {

if(!selectedRow) return showModal("Select record","error");

if(window.confirm("Delete this OPD case?")){

const result = await deleteItem(`${OPD_PATH}/delete/${selectedRow.opd_casesheet_code}/`);

if(result.success){

showModal("Deleted!");
refresh();
setSelectedRow(null);

}

}

};

if(loading) return <div className="p-10 text-center font-bold text-emerald-600">Loading...</div>;

return (

<div className="app-container">

{/* MODAL */}

{modal.visible && (

<div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

<div className="form-container max-w-sm w-full p-8 text-center shadow-2xl">

<div className="mb-4 flex justify-center">

{modal.type==="success"
? <FaCheckCircle className="text-6xl text-emerald-500"/>
: <FaTimesCircle className="text-6xl text-rose-500"/>}

</div>

<h3 className={`text-xl font-black mb-2 ${modal.type==="success"?"text-emerald-500":"text-rose-500"}`}>
{modal.type==="success"?"Success":"Error"}
</h3>

<p className="mb-6">{modal.message}</p>

<button
className="btn-primary w-full"
onClick={()=>setModal({...modal,visible:false})}
>
Continue
</button>

</div>

</div>

)}

{/* HEADER */}

<div className="flex justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">

<h4 className="text-2xl font-black text-gray-800">OPD Case Sheet</h4>

<div className="flex gap-2">

{!showForm ? (

<>

<button
className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
onClick={()=>setShowForm(true)}
>

<FaPlus size={12}/> Add Case

</button>

{selectedRow && (

<>

<button
className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
onClick={()=>{

setFormData(selectedRow);
setIsEdit(true);
setShowForm(true);

}}
>

<FaEdit size={12}/> Edit

</button>

<button
className="bg-rose-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
onClick={handleDelete}
>

<FaTrash size={12}/> Delete

</button>

</>

)}

</>

) : (

<button
className="text-gray-500 font-bold"
onClick={resetForm}
>

Back to List

</button>

)}

</div>

</div>

{/* FORM */}

{showForm && (

<div className="bg-white rounded-xl shadow-md p-8 mb-8 border">

<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">

<div>
<label className="text-[10px] font-bold text-gray-400 uppercase">Case Code *</label>

<input
className="w-full px-3 py-2 rounded border bg-gray-100"
value={formData.opd_casesheet_code}
readOnly
/>

</div>

<div>
<label className="text-[10px] font-bold text-gray-400 uppercase">Patient *</label>

<SearchableSelect
placeholder="Select Patient"
required
value={formData.patient_code}
onChange={v=>setFormData({...formData,patient_code:v})}
options={patientList.map(p=>({
value:p.patient_code,
label:`${p.patient_first_name} ${p.patient_last_name} (${p.patient_code})`
}))}
/>

</div>

<div>
<label className="text-[10px] font-bold text-gray-400 uppercase">Case Type</label>

<select
className="w-full px-3 py-2 rounded border"
value={formData.case_title}
onChange={e=>setFormData({...formData,case_title:e.target.value})}
>

<option value="">Select</option>
<option value="General Checkup">General Checkup</option>
<option value="Follow Up">Follow Up</option>
<option value="Emergency">Emergency</option>

</select>

</div>

<textarea
placeholder="Chief Complaint"
className="col-span-3 px-3 py-2 border rounded"
value={formData.chief_complaint}
onChange={e=>setFormData({...formData,chief_complaint:e.target.value})}
/>

<textarea
placeholder="Symptoms"
className="col-span-3 px-3 py-2 border rounded"
value={formData.symptoms}
onChange={e=>setFormData({...formData,symptoms:e.target.value})}
/>

<textarea
placeholder="Diagnosis"
className="col-span-3 px-3 py-2 border rounded"
value={formData.diagnosis}
onChange={e=>setFormData({...formData,diagnosis:e.target.value})}
/>

<input
type="number"
placeholder="Weight (kg)"
className="px-3 py-2 border rounded"
value={formData.weight_kg}
onChange={e=>setFormData({...formData,weight_kg:e.target.value})}
/>

<input
type="number"
placeholder="Height (cm)"
className="px-3 py-2 border rounded"
value={formData.height_cm}
onChange={e=>setFormData({...formData,height_cm:e.target.value})}
/>

<input
type="number"
placeholder="BP Sys"
className="px-3 py-2 border rounded"
value={formData.bp_sys}
onChange={e=>setFormData({...formData,bp_sys:e.target.value})}
/>

<input
type="number"
placeholder="BP Dia"
className="px-3 py-2 border rounded"
value={formData.bp_dia}
onChange={e=>setFormData({...formData,bp_dia:e.target.value})}
/>

<div>
<label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>

<select
className="w-full px-3 py-2 border rounded"
value={formData.status}
onChange={e=>setFormData({...formData,status:Number(e.target.value)})}
>

<option value={1}>Active</option>
<option value={0}>Inactive</option>

</select>

</div>

<div className="col-span-3 flex justify-end gap-3 pt-4 border-t">

<button
type="submit"
className="bg-emerald-600 text-white px-10 py-2.5 rounded-lg font-bold"
>

Save Case

</button>

<button
type="button"
className="text-gray-400 font-bold px-4"
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

<div className="bg-white rounded-xl shadow-sm border overflow-hidden">

<TableToolbar
itemsPerPage={itemsPerPage}
setItemsPerPage={setItemsPerPage}
search={search}
setSearch={setSearch}
setCurrentPage={setCurrentPage}
/>

<div className="overflow-x-auto">

<table className="w-full text-left border-collapse">

<thead>

<tr className="bg-gray-50 border-b">

<th className="p-4 w-12"></th>
<th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Case Code</th>
<th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Patient</th>
<th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Case Type</th>
<th className="p-4 text-[10px] font-bold text-gray-400 uppercase">Diagnosis</th>
<th className="p-4 text-[10px] font-bold text-gray-400 uppercase text-center">Status</th>

</tr>

</thead>

<tbody className="divide-y">

{paginatedData.map(row=>(

<tr
key={row.opd_casesheet_code}
onClick={()=>setSelectedRow(selectedRow?.opd_casesheet_code===row.opd_casesheet_code?null:row)}
className={`cursor-pointer ${selectedRow?.opd_casesheet_code===row.opd_casesheet_code?"bg-emerald-50":"hover:bg-gray-50"}`}
>

<td className="p-4 text-center">

<div className={`w-4 h-4 rounded-full border-2 ${selectedRow?.opd_casesheet_code===row.opd_casesheet_code?"border-emerald-500 bg-emerald-500":"border-gray-200"}`}/>

</td>

<td className="p-4 text-sm font-bold">{row.opd_casesheet_code}</td>
<td className="p-4 text-sm text-gray-500">{row.patient_code}</td>
<td className="p-4 text-sm text-gray-500">{row.case_title}</td>
<td className="p-4 text-sm text-gray-500">{row.diagnosis}</td>

<td className="p-4 text-center">

<span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${row.status===1?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-700"}`}>
{row.status===1?"Active":"Inactive"}
</span>

</td>

</tr>

))}

</tbody>

</table>

</div>

<div className="p-4 border-t">

<Pagination
totalEntries={filteredData.length}
itemsPerPage={itemsPerPage}
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

export default OpdCaseSheet;