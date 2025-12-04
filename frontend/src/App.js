import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import 'animate.css/animate.min.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import NotificationCenter from './components/Common/NotificationCenter';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CollaboratorsPage from './pages/CollaboratorsPage';
import CalendarPage from './pages/CalendarPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import OnboardingTechnicalPage from './pages/OnboardingTechnicalPage';
import OnboardingWelcomePage from './pages/OnboardingWelcomePage';
import Layout from './components/Layout';

const Spinner = ({ message = 'Cargando...' }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      {message && <p className="mt-3 text-muted">{message}</p>}
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Spinner message="Verificando autenticación..." />;
  }

  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Spinner message="Cargando..." />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* NotificationCenter siempre visible */}
        <NotificationCenter />

        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/collaborators" element={
            <ProtectedRoute>
              <CollaboratorsPage />
            </ProtectedRoute>
          } />

          <Route path="/calendar" element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          } />

          <Route path="/alerts" element={
            <ProtectedRoute>
              <AlertsPage />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />

          <Route path="/onboarding/technical" element={
            <ProtectedRoute>
              <OnboardingTechnicalPage />
            </ProtectedRoute>
          } />

          <Route path="/onboarding/welcome" element={
            <ProtectedRoute>
              <OnboardingWelcomePage />
            </ProtectedRoute>
          } />

          <Route path="/onboarding" element={<Navigate to="/onboarding/technical" />} />

          <Route path="*" element={
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
              <div className="text-center">
                <h1 className="text-muted">404</h1>
                <p>Página no encontrada</p>
                <a href="/dashboard" className="btn btn-primary">Ir al Dashboard</a>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;