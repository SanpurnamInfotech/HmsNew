import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layers/admin/AdminLayout';
import PrivateRoute from './auth/PrivateRoute';
import Login from './auth/Login';
import Register from './auth/Register';
import { adminRoutes } from './routes/routeConfig';


import ComplaintMaster from './pages/masters/ComplaintMaster.jsx';

import ExpensesMst from './pages/masters/ExpensesMst.jsx';
 import MseMaster from './pages/masters/MseMaster.jsx';

import ThoughtContentMaster from './pages/masters/thought_content_master.jsx';
import Noticeboard from './pages/masters/noticeboard.jsx';


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
        </Route>

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

      </Routes>
    </div>
  );
}

export default App;