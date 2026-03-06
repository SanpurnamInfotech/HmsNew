import React, { useState, useMemo } from "react";
import { useCrud } from "../../components/common/BaseCRUD";
import { FaChevronDown, FaPlus } from "react-icons/fa";

const OpdCaseSheet = () => {

const OPD_PATH = "opd_cases";

const { createItem } = useCrud(`${OPD_PATH}/`);
const { data: patients } = useCrud("patients/");

const [showForm,setShowForm] = useState(false);
const [patientSearch,setPatientSearch] = useState("");
const [openPatient,setOpenPatient] = useState(false);

const [formData,setFormData] = useState({

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

});


/* ---------------- PATIENT FILTER ---------------- */

const filteredPatients = useMemo(()=>{

if(!patients) return [];

return patients.filter(p =>
p.patient_first_name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
p.patient_code?.toLowerCase().includes(patientSearch.toLowerCase())
);

},[patients,patientSearch]);


/* ---------------- SUBMIT ---------------- */

const handleSubmit = async(e)=>{

e.preventDefault();

const payload = {

...formData,
weight_kg:parseFloat(formData.weight_kg) || 0,
height_cm:parseFloat(formData.height_cm) || 0,
bp_sys:parseInt(formData.bp_sys) || 0,
bp_dia:parseInt(formData.bp_dia) || 0

};

await createItem(`${OPD_PATH}/create/`,payload);

alert("Saved");

setShowForm(false);

};


return(

<div className="p-6">

<div className="flex justify-between mb-4">

<h2 className="text-xl font-bold">OPD Case Sheet</h2>

<button
className="bg-emerald-600 text-white px-4 py-2 rounded flex gap-2 items-center"
onClick={()=>setShowForm(true)}
>
<FaPlus/> New Case
</button>

</div>


{showForm && (

<form
onSubmit={handleSubmit}
className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 border rounded"
>


{/* CASE CODE */}

<input
className="border p-2 rounded"
placeholder="Case Code"
required
onChange={(e)=>setFormData({...formData,opd_casesheet_code:e.target.value})}
/>


{/* PATIENT DROPDOWN */}

<div className="relative">

<div
className="border p-2 rounded bg-white flex justify-between cursor-pointer"
onClick={()=>setOpenPatient(!openPatient)}
>

<span>

{formData.patient_code
? formData.patient_code
: "Select Patient"}

</span>

<FaChevronDown/>

</div>

{openPatient && (

<div className="absolute z-50 w-full bg-white border mt-1 shadow max-h-40 overflow-auto">

<input
className="w-full p-2 border-b"
placeholder="Search Patient"
onChange={(e)=>setPatientSearch(e.target.value)}
/>

{filteredPatients.map(p => (

<div
key={p.patient_code}
className="p-2 hover:bg-emerald-50 cursor-pointer"
onClick={()=>{

setFormData({
...formData,
patient_code:p.patient_code
});

setOpenPatient(false);

}}
>

{p.patient_first_name} {p.patient_last_name}
({p.patient_code})

</div>

))}

</div>

)}

</div>


{/* CASE TITLE DROPDOWN */}

<select
className="border p-2 rounded"
onChange={(e)=>setFormData({...formData,case_title:e.target.value})}
>

<option value="">Select Case</option>
<option value="General Checkup">General Checkup</option>
<option value="Follow Up">Follow Up</option>
<option value="Emergency">Emergency</option>

</select>


{/* CHIEF COMPLAINT */}

<textarea
className="border p-2 rounded"
placeholder="Chief Complaint"
onChange={(e)=>setFormData({...formData,chief_complaint:e.target.value})}
/>


{/* SYMPTOMS */}

<textarea
className="border p-2 rounded"
placeholder="Symptoms"
onChange={(e)=>setFormData({...formData,symptoms:e.target.value})}
/>


{/* DIAGNOSIS */}

<textarea
className="border p-2 rounded"
placeholder="Diagnosis"
onChange={(e)=>setFormData({...formData,diagnosis:e.target.value})}
/>


{/* VITAL SIGNS */}

<textarea
className="border p-2 rounded"
placeholder="Vital Signs"
onChange={(e)=>setFormData({...formData,vital_signs:e.target.value})}
/>


{/* WEIGHT */}

<input
type="number"
className="border p-2 rounded"
placeholder="Weight (kg)"
onChange={(e)=>setFormData({...formData,weight_kg:e.target.value})}
/>


{/* HEIGHT */}

<input
type="number"
className="border p-2 rounded"
placeholder="Height (cm)"
onChange={(e)=>setFormData({...formData,height_cm:e.target.value})}
/>


{/* BP */}

<div className="grid grid-cols-2 gap-2">

<input
type="number"
className="border p-2 rounded"
placeholder="BP Sys"
onChange={(e)=>setFormData({...formData,bp_sys:e.target.value})}
/>

<input
type="number"
className="border p-2 rounded"
placeholder="BP Dia"
onChange={(e)=>setFormData({...formData,bp_dia:e.target.value})}
/>

</div>


{/* STATUS DROPDOWN */}

<select
className="border p-2 rounded"
onChange={(e)=>setFormData({...formData,status:e.target.value})}
>

<option value="1">Active</option>
<option value="0">Inactive</option>

</select>


<div className="md:col-span-2 flex justify-end gap-2">

<button
type="button"
className="bg-gray-400 text-white px-4 py-2 rounded"
onClick={()=>setShowForm(false)}
>
Cancel
</button>

<button
type="submit"
className="bg-emerald-600 text-white px-4 py-2 rounded"
>
Save
</button>

</div>

</form>

)}

</div>

);

};

export default OpdCaseSheet;