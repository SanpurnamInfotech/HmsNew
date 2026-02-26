import './App.css'
import './styles/sidebar.css';
import Countries from './pages/masters/Countries';
// import CitiesMst from './pages/masters/CitiesMst.jsx';
// import DistrictsMst from './pages/masters/DistrictsMst.jsx';
// import StatesMst from './pages/masters/StatesMst.jsx';
// import UsertypeMaster from './pages/masters/UsertypeMaster.jsx';
import Account from './pages/masters/Account.jsx';
import ComplaintMaster from './pages/masters/ComplaintMaster.jsx';
// import DoctorMst from './pages/masters/DoctorMst.jsx';
import ExpensesMst from './pages/masters/ExpensesMst.jsx';
 import MseMaster from './pages/masters/MseMaster.jsx';
// import Bankdetails from './pages/masters/Bankdetails.jsx';
import ThoughtContentMaster from './pages/masters/thought_content_master.jsx';
import Noticeboard from './pages/masters/noticeboard.jsx';

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
          {/* <Route path="cities" element={<CitiesMst />} />
          <Route path="districts" element={<DistrictsMst />} />
          <Route path="states" element={<StatesMst />} />
          <Route path="usertype" element={<UsertypeMaster />} /> */}
          <Route path="account" element={<Account />} />
          <Route path="mse" element={<MseMaster />} />
          {/* /<Route path="bankdetails" element={<Bankdetails />} /> */}
          <Route path="thought_content_master" element={<ThoughtContentMaster />} />
          <Route path="noticeboard" element={<Noticeboard />} />
          <Route path="complaints" element={<ComplaintMaster />} />
          {/* <Route path="doctor" element={<DoctorMst />} /> */}
          <Route path="expenses" element={<ExpensesMst />} />
            
        </Route>

        {/* Redirect root to login or dashboard */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </div>
  )
}

export default App;