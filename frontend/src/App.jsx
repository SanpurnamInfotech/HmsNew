import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layers/admin/AdminLayout';
import PrivateRoute from './auth/PrivateRoute';
import Login from './auth/Login';
import Register from './auth/Register';

import { adminRoutes } from './routes/routeConfig';
import { ThemeProvider } from './theme/ThemeContext.jsx'; 


function App() {
  return (
    // Wrap the entire application or just the routes in the Provider
    <ThemeProvider>
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
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />

        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;