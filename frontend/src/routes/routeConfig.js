import Dashboard from "../pages/dashboard/Dashboard";
import Countries from "../pages/masters/Countries";
import ModuleMst from "../pages/masters/ModuleMst";
import SubmoduleMst from "../pages/masters/SubmoduleMst";
import Activities from "../pages/masters/Activities";
import AdviceMaster from "../pages/masters/AdviceMaster";
import Ipdregister from "../pages/IPD/Ipdregister";



export const adminRoutes = [
  { path: "dashboard", label: "Dashboard", component: Dashboard },
  { path: "countries", label: "Countries", component: Countries },
  { path: "moduleMst", label: "Module Master", component: ModuleMst },
  { path: "submoduleMst", label: "Submodule Master", component: SubmoduleMst },
  { path: "activities", label: "Activities", component: Activities },
  { path: "advice_master", label: "Advice Master", component: AdviceMaster },
  { path: "ipd_registration", label: "IPD Registration", component: Ipdregister }
 


 
  
];

