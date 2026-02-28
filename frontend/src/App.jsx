import './App.css'
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



import { adminRoutes } from './routes/routeConfig';


import ComplaintMaster from './pages/masters/ComplaintMaster.jsx';
import ExpensesMst from './pages/masters/ExpensesMst.jsx';
import MseMaster from './pages/masters/MseMaster.jsx';
import ThoughtContentMaster from './pages/masters/thought_content_master.jsx';
import Noticeboard from './pages/masters/noticeboard.jsx';
import MoodHistoryMst from './pages/masters/MoodHistoryMst.jsx';

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

          {/* Default Page */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Dynamic Routes */}
          {adminRoutes.map((route, index) => {
            const Component = route.component;
            return (
              <Route
                key={index}
                path={route.path}
                element={<Component />}
              />
            );
          })}

          {/* Static Admin Pages */}
          <Route path="mse" element={<MseMaster />} />
          <Route path="thought_content_master" element={<ThoughtContentMaster />} />
          <Route path="noticeboard" element={<Noticeboard />} />
          <Route path="complaints" element={<ComplaintMaster />} />
          <Route path="expenses" element={<ExpensesMst />} />
          <Route path="mood_history" element={<MoodHistoryMst />} />
        </Route>

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

      </Routes>
    </div>
  );
}

export default App;