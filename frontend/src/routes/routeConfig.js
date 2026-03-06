import Dashboard from "../pages/dashboard/Dashboard";
import Countries from "../pages/masters/Countries";
import ModuleMst from "../pages/masters/ModuleMst";
import SubmoduleMst from "../pages/masters/SubmoduleMst";
import Activities from "../pages/masters/Activities";
import AdviceMaster from "../pages/masters/AdviceMaster";
import Ipdregister from "../pages/IPD/Ipdregister";


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
// import PatientMst from "../pages/masters/PatientMst.";
import PrescriptionReport from "../pages/PrescriptionReport.jsx";
import IcdMasterMst from "../pages/masters/IcdMasterMst.jsx";
import DsmMaster from "../pages/masters/DsmMaster.jsx";
import RoomTypeMasterMst from "../pages/masters/RoomTypeMasterMst.jsx";
import HabitMaster from "../pages/masters/HabitMaster.jsx";
import HallucinationMaster from "../pages/masters/HallucinationMaster.jsx";
import HistoryMaster from "../pages/masters/HistoryMaster.jsx";
import MentalIllnessMaster from "../pages/masters/MentalIllnessMaster.jsx";
import MedicineCategory from "../pages/masters/MedicineCategory.jsx";
import MedicineMst from "../pages/masters/MedicineMst.jsx";
import Possation from "../pages/masters/PossessionMaster.jsx";
import FinancialYearMst from "../pages/masters/FinancialYearMst.jsx";
import SettingsMst from "../pages/masters/SettingsMst.jsx";
import AccountMst from "../pages/masters/AccountMst.jsx";
import UsertypeMst from "../pages/masters/UsertypeMst.jsx";
import Hospital_detailsMst from "../pages/masters/Hospital_detailsMst.jsx";
import ComplaintMaster from "../pages/masters/ComplaintMaster.jsx";
import MseMaster from "../pages/masters/MseMaster.jsx";
import ExpensesMst from "../pages/masters/ExpensesMst.jsx";
import ThoughtContentMaster from "../pages/masters/thought_content_master.jsx";
import Noticeboard from "../pages/masters/noticeboard.jsx";
import AppointmentTypeMasterMst from "../pages/masters/AppointmentTypeMasterMst.jsx";
import AppointmentMst from "../pages/masters/AppointmentMst.jsx";
import EctMst from "../pages/masters/EctMst.jsx";
import FollowUpMst from "../pages/masters/FollowUpMst.jsx";
import TransactionsMst from "../pages/masters/TransactionsMst.jsx";
import BedMaster from "../pages/masters/BedMaster.jsx";





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
  // { path: "patient", label: "PatientMst", component: PatientMst },
  { path: "complaints", label: "Complaint Master", component: ComplaintMaster },
  { path: "expenses", label: "Expenses Master", component: ExpensesMst },
  { path: "mse_master", label: "MSE Master", component: MseMaster },
  { path: "thought_content_master", label: "Thought Content Master", component: ThoughtContentMaster },
  { path: "districts" , label: "Districts Master", component: DistrictsMst },
  { path: "states" , label: "States Master", component: StatesMst },
  { path: "cities", label: "Cities Master", component: CitiesMst },
  { path: "mood_history", label: "Mood History Master", component: MoodHistoryMst },
  { path: "prescription_report", label: "Prescription Report", component: PrescriptionReport},
  { path: "icd_master", label:"ICD Master", component:IcdMasterMst},
  { path: "dsm_master", label:"DSM Master", component:DsmMaster},
  { path: "room_type", label: "Room Type Master", component:RoomTypeMasterMst},
  { path: "habit", label: "Habit Master", component:HabitMaster}, 
  { path: "hallucination", label:"Hallucination Master", component:HallucinationMaster},
  { path :"history", label:"History Master", component:HistoryMaster}, 
  { path :" mental_illness", label: "Mental Illness Master", component:MentalIllnessMaster},
  { path: "medicine-category", label: "Medicine_category", component: MedicineCategory },
  { path: "medicine", label: "Medicine" , component: MedicineMst },
  { path: "posssation", label: "Possation", component: Possation },
  { path: "financialyear-master", label: "financial year", component: FinancialYearMst },
  { path: "settings", label: "Settings", component: SettingsMst },
  { path: "accounts", label: "Accounts Master", component: AccountMst },
  { path: "usertype", label: "Usertype Master", component: UsertypeMst },
  { path: "hospital", label: "Hospital Master", component: Hospital_detailsMst },
  // { path: "doctor", label: "Doctor", component: DoctorMst },
  { path: "appointment", label: "Appointment", component: AppointmentMst},
  { path: "appointment-type-master", label: "Appointment Type Master", component: AppointmentTypeMasterMst },
  { path: "ect", label: "ECT", component: EctMst },
  { path: "follow-up", label: "Follow Up", component: FollowUpMst },
  { path: "transaction-modes", label: "Transaction Modes", component: TransactionmodesMst },
  { path: "noticeboard", label: "Noticeboard", component: Noticeboard },
  { path: "Doctors", label: "Doctors", component: DoctorMst },
  { path: "Opd_casesheet", label: "OPD case sheet", component: Opd },
  { path: "discharge", label: "Discharge Summary", component: Discharge_summaryMst },
  
  { path: "transactions", label: "Transactions", component: TransactionsMst },
  { path: "bed", label: "Bed", component: BedMaster },
  
];

