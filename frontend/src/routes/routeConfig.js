import Dashboard from "../pages/dashboard/Dashboard";
import Countries from "../pages/masters/Countries";
import ModuleMst from "../pages/masters/ModuleMst";
import SubmoduleMst from "../pages/masters/SubmoduleMst";
import Activities from "../pages/masters/Activities";
import AdviceMaster from "../pages/masters/AdviceMaster";
import IcdMasterMst from "../pages/masters/IcdMasterMst";
import RoomTypeMasterMst from "../pages/masters/RoomTypeMasterMst";
import BedMaster from "../pages/masters/BedMaster";
import HabitMaster from "../pages/masters/HabitMaster";
import HallucinationMaster from "../pages/masters/HallucinationMaster";
import HistoryMaster from "../pages/masters/HistoryMaster";
import MentalIllnessMaster from "../pages/masters/MentalIllnessMaster";
import DsmMaster from "../pages/masters/DsmMaster";
import PremorbidPersonalityMst from "../pages/masters/PremorbidPersonalityMst";
import PossessionMaster from "../pages/masters/PossessionMaster";
import PrescriptionReport from "../pages/PrescriptionReport";


export const adminRoutes = [
  { path: "dashboard", label: "Dashboard", component: Dashboard },
  { path: "countries", label: "Countries", component: Countries },
  { path: "moduleMst", label: "Module Master", component: ModuleMst },
  { path: "submoduleMst", label: "Submodule Master", component: SubmoduleMst },
  { path: "activities", label: "Activities", component: Activities },
  { path: "advice_master", label: "Advice Master", component: AdviceMaster },
  { path: "icd_master", label: "ICD Master", component: IcdMasterMst },
  { path: "room_type_master", label: "Room Type Master", component: RoomTypeMasterMst },
  { path: "bed_master", label: "Bed Master", component: BedMaster },
  { path: "habit_master", label: "Habit Master", component: HabitMaster },
  { path: "hallucination_master", label: "Hallucination Master", component: HallucinationMaster },
  { path: "history_master", label: "History Master", component: HistoryMaster },
  { path: "mental_illness_master", label: "Mental Illness Master", component: MentalIllnessMaster },
  { path: "dsm_master", label: "DSM Master", component: DsmMaster },
  { path: "premorbid_personality_master", label: "Premorbid Personality Master", component: PremorbidPersonalityMst },
  { path: "possession_master", label: "Possession Master", component: PossessionMaster },
  { path: "prescription", label: "Prescription", component: PrescriptionReport },

 
  
];

