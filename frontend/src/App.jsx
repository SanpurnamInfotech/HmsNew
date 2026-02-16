import './App.css'
import './styles/sidebar.css';
import Countries from './pages/masters/Countries';
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
          
        </Route>

        {/* Redirect root to login or dashboard */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </div>
  )
}

export default App;