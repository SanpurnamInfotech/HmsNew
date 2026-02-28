import Dashboard from "../pages/dashboard/Dashboard";
import Countries from "../pages/masters/Countries";
import ModuleMst from "../pages/masters/ModuleMst";
import SubmoduleMst from "../pages/masters/SubmoduleMst";
import Activities from "../pages/masters/Activities";
import AdviceMaster from "../pages/masters/AdviceMaster";
import Ipdregister from "../pages/IPD/Ipdregister";

import ComplaintMaster from '../pages/masters/ComplaintMaster.jsx';
import ExpensesMst from '../pages/masters/ExpensesMst.jsx';
import MseMaster from '../pages/masters/MseMaster.jsx';
import ThoughtContentMaster from '../pages/masters/thought_content_master.jsx';
import Noticeboard from '../pages/masters/noticeboard.jsx';
import MoodHistoryMst from '../pages/masters/MoodHistoryMst.jsx';
import StatesMst from '../pages/masters/StatesMst.jsx';
import DistrictsMst from '../pages/masters/DistrictsMst.jsx';
import CitiesMst from '../pages/masters/CitiesMst.jsx';
import CompanyMaster from '../pages/masters/CompanyMaster';
import EmployeeMaster from '../pages/masters/EmployeeMaster';
import MaritalStatusMaster from '../pages/masters/MaritalStatusMaster';
import RelationMaster from '../pages/masters/RelationMaster';
import Departments from '../pages/masters/Departments';
import BloodGroupMaster from '../pages/masters/BloodGroupMaster';
import BloodDonor from '../pages/masters/BloodDonor';
import BankDetails from "../pages/masters/BankDetails";
import BedAllotment from "../pages/masters/BedAllotment";
import Patient from "../pages/masters/Patient";
import PrescriptionReport from "../pages/PrescriptionReport.jsx";




export const adminRoutes = [
  { path: "dashboard", label: "Dashboard", component: Dashboard },
  { path: "countries", label: "Countries", component: Countries },
  { path: "moduleMst", label: "Module Master", component: ModuleMst },
  { path: "submoduleMst", label: "Submodule Master", component: SubmoduleMst },
  { path: "activities", label: "Activities", component: Activities },
  { path: "advice_master", label: "Advice Master", component: AdviceMaster },
  { path: "ipd_registration", label: "IPD Registration", component: Ipdregister },
  { path: "company_master", label: "Company Master", component: CompanyMaster },
  { path: "employee_master", label: "Employee Master", component: EmployeeMaster },
  { path: "marital_status_master", label: "Marital Status Master", component: MaritalStatusMaster },
  { path: "relation_master", label: "Relation Master", component: RelationMaster },
  { path: "departments", label: "Departments", component: Departments },
  { path: "blood_group_master", label: "Blood Group Master", component: BloodGroupMaster },
  { path: "blood_donor", label: "Blood Donor", component: BloodDonor },
  { path: "bank_details", label: "Bank Details", component: BankDetails },
  { path: "bed_allotment", label: "Bed Allotment", component: BedAllotment },
  { path: "patient", label: "Patient", component: Patient },
  { path: "complaints", label: "Complaint Master", component: ComplaintMaster },
  { path: "expenses", label: "Expenses Master", component: ExpensesMst },
  { path: "mse", label: "MSE Master", component: MseMaster },
  { path: "thought_content_master", label: "Thought Content Master", component: ThoughtContentMaster },
  { path: "districts" , label: "Districts Master", component: DistrictsMst },
  { path: "states" , label: "States Master", component: StatesMst },
  { path: "cities", label: "Cities Master", component: CitiesMst },
  { path: "noticeboard", label: "Noticeboard", component: Noticeboard },
  { path: "mood_history", label: "Mood History Master", component: MoodHistoryMst },
  { path: "prescription_report", label: "Prescription Report", component: PrescriptionReport}

 


 
  
];

