import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from './components/layers/admin/AdminLayout';
import PrivateRoute from './auth/PrivateRoute';
import Login from './auth/Login';
import Register from './auth/Register';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboard/Dashboard';
import ModuleMst from './pages/masters/ModuleMst';
import SubmoduleMst from './pages/masters/SubmoduleMst';
import Activities from './pages/masters/Activities';
import AdviceMaster from './pages/masters/AdviceMaster';
import CompanyMaster from './pages/masters/CompanyMaster';
import EmployeeMaster from './pages/masters/EmployeeMaster';
import MaritalStatusMaster from './pages/masters/MaritalStatusMaster';
import RelationMaster from './pages/masters/RelationMaster';
import Departments from './pages/masters/Departments';
import BloodGroupMaster from './pages/masters/BloodGroupMaster';
import BloodDonor from './pages/masters/BloodDonor';
import BankDetails from "./pages/masters/BankDetails";
import BedAllotment from "./pages/masters/BedAllotment";
import Patient from "./pages/masters/Patient";
import OpdBillMaster from "./pages/masters/OpdBillMaster";
import OpdBillingDetails from "./pages/masters/OpdBillingDetails";
import OpdBilling from "./pages/masters/OpdBilling";

import { ThemeProvider } from './theme/ThemeContext.jsx';
import { adminRoutes } from './routes/routeConfig';

// Masters
import IcdMasterMst from "./pages/masters/IcdMasterMst.jsx";
import RoomTypeMasterMst from "./pages/masters/RoomTypeMasterMst";
import BedMaster from "./pages/masters/BedMaster"; 
import HabitMaster from "./pages/masters/HabitMaster";
import HallucinationMaster from "./pages/masters/HallucinationMaster";
import HistoryMaster from "./pages/masters/HistoryMaster";
import MentalIllnessMaster from "./pages/masters/MentalIllnessMaster";
import DsmMaster from "./pages/masters/DsmMaster";
import PremorbidPersonalityMst from "./pages/masters/PremorbidPersonalityMst";
import PossessionMaster from "./pages/masters/PossessionMaster";
import FinancialYearMst from "./pages/masters/FinancialYearMst";
import SettingsMst from "./pages/masters/SettingsMst";
import MedicineCategory from './pages/masters/MedicineCategory';
import MedicineMst from './pages/masters/MedicineMst';
import AppointmentTypeMasterMst from './pages/masters/AppointmentTypeMasterMst';
import AppointmentMst from './pages/masters/AppointmentMst';
// import TransactionsMst from './pages/masters/TransactionsMst';
import { ThemeProvider } from './theme/ThemeContext.jsx'; 

import ComplaintMaster from './pages/masters/ComplaintMaster.jsx';
import ExpensesMst from './pages/masters/ExpensesMst.jsx';
import MseMaster from './pages/masters/MseMaster.jsx';
import ThoughtContentMaster from './pages/masters/thought_content_master.jsx';
import Noticeboard from './pages/masters/noticeboard.jsx';
import MoodHistoryMst from './pages/masters/MoodHistoryMst.jsx';
import StatesMst from './pages/masters/StatesMst.jsx';
import DistrictsMst from './pages/masters/DistrictsMst.jsx';
import CitiesMst from './pages/masters/CitiesMst.jsx';
import DoctorMst from './pages/masters/DoctorMst.jsx';
import { ThemeProvider } from './theme/ThemeContext.jsx'; 
import DoctorMst from './pages/masters/DoctorMst.jsx'
import EctMst from './pages/masters/EctMst.jsx'
import FollowUpMst from './pages/masters/FollowUpMst.jsx'




function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* Auth Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/register" element={<Register />} />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          {/* Example of nested dynamic routes inside AdminLayout */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="countries" element={<Countries />} />
          <Route path='moduleMst' element={<ModuleMst />} />
          <Route path='submoduleMst' element={<SubmoduleMst />} />
          <Route path='activities' element={<Activities />} />
          <Route path='advice_master' element={<AdviceMaster />} />
          <Route path="company_master" element={<CompanyMaster />} />
          <Route path="employee_master" element={<EmployeeMaster />} />
          <Route path='marital_status_master' element={<MaritalStatusMaster />} />
          <Route path='relation_master' element={<RelationMaster />} />
          <Route path="departments" element={<Departments />} />
          <Route path="blood_group_master" element={<BloodGroupMaster />} />
          <Route path="blood_donor" element={<BloodDonor />} />
          <Route path="bankdetails" element={<BankDetails />} />
          <Route path="bed_allotment" element={<BedAllotment />} />
          <Route path="patient" element={<Patient />} />
          <Route path="opd-bill-master" element={<OpdBillMaster />} />
          <Route path="opd-billing-details" element={<OpdBillingDetails />} />
          <Route path="opd-billing" element={<OpdBilling />} />
            {/* Masters (all under /admin) */}
            <Route path="icd-master" element={<IcdMasterMst />} />
            <Route path="room-type-master" element={<RoomTypeMasterMst />} />
            <Route path="bed" element={<BedMaster />} />
            <Route path="habit-master" element={<HabitMaster />} />
            <Route path="hallucination-master" element={<HallucinationMaster />} />
            <Route path="history-master" element={<HistoryMaster />} />
            <Route path="mental-illness-master" element={<MentalIllnessMaster />} />
            <Route path="dsm-master" element={<DsmMaster />} />
            <Route path="premorbid-personality-master" element={<PremorbidPersonalityMst />} />
            <Route path="possession-master" element={<PossessionMaster />} />
            <Route path="financialyear-master" element={<FinancialYearMst />} />
            <Route path="settings" element={<SettingsMst />} />
            <Route path="medicine-category" element={<MedicineCategory />} />
            <Route path="medicine" element={<MedicineMst />} />
            <Route path="appointment-type-master" element={<AppointmentTypeMasterMst />} />
            <Route path="appointment" element={<AppointmentMst />} />

            <Route path="complaints" element={<ComplaintMaster />} />
            <Route path="expenses" element={<ExpensesMst />} />
            <Route path="mood_history" element={<MoodHistoryMst />} />
            <Route path="states" element={<StatesMst />} />
            <Route path="districts" element={<DistrictsMst />} />
            <Route path="cities" element={<CitiesMst />} />
            <Route path="doctors" element={<DoctorMst />} />
            <Route path="mse" element={<MseMaster />} />
            <Route path="thought_content_master" element={<ThoughtContentMaster />} />
            <Route path="noticeboard" element={<Noticeboard />} />
            <Route path="ect" element={<EctMst/>} />
            <Route path="follow-up" element={<FollowUpMst/>} />
            

          </Route>

          {/* Root Redirect */}
          {/* Root */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />

        </Routes>
      </div>
    </ThemeProvider>
  );
}
}

export default App;