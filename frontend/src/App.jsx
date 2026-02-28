import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layers/admin/AdminLayout';
import PrivateRoute from './auth/PrivateRoute';
import Login from './auth/Login';
import Register from './auth/Register';

import { adminRoutes } from './routes/routeConfig';




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
<<<<<<< HEAD
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
=======
>>>>>>> 6f14315d73976908b2ee9222ffd3454081defd56

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
        </Route>

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

      </Routes>
    </div>
  );
}

export default App;