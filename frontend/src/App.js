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
import { TimeoutProvider, useTimeout } from './contexts/TimeoutContext';
import { useForceLogout } from './hooks/useForceLogout';
import TimeoutModal from './components/Common/TimeoutModal';
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

const AuthenticatedTimeoutWrapper = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showWarning, handleStayLoggedIn } = useTimeout();
  const forceLogout = useForceLogout();

  const handleLogoutFromModal = async () => {
    console.log('🔄 Iniciando cierre de sesión desde modal...');
    await forceLogout();
  };

  if (!isAuthenticated) {
    return children;
  }

  return (
    <>
      {children}
      <TimeoutModal
        show={showWarning}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogoutFromModal}
      />
    </>
  );
};

const ConditionalTimeoutProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return children;
  }

  return (
    <TimeoutProvider>
      <AuthenticatedTimeoutWrapper>
        {children}
      </AuthenticatedTimeoutWrapper>
    </TimeoutProvider>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Spinner message="Verificando autenticación..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <ConditionalTimeoutProvider>
      <Layout>{children}</Layout>
    </ConditionalTimeoutProvider>
  );
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
          {/* Ruta de login - NO tiene TimeoutProvider */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />

          {/* Redirección raíz */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Dashboard principal - TIENE TimeoutProvider */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Gestión de colaboradores - TIENE TimeoutProvider */}
          <Route path="/collaborators" element={
            <ProtectedRoute>
              <CollaboratorsPage />
            </ProtectedRoute>
          } />

          {/* Calendario de eventos - TIENE TimeoutProvider */}
          <Route path="/calendar" element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          } />

          {/* Sistema de alertas - TIENE TimeoutProvider */}
          <Route path="/alerts" element={
            <ProtectedRoute>
              <AlertsPage />
            </ProtectedRoute>
          } />

          {/* Configuración del sistema - TIENE TimeoutProvider */}
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />

          {/* Onboarding técnico - TIENE TimeoutProvider */}
          <Route path="/onboarding/technical" element={
            <ProtectedRoute>
              <OnboardingTechnicalPage />
            </ProtectedRoute>
          } />

          {/* Onboarding de bienvenida - TIENE TimeoutProvider */}
          <Route path="/onboarding/welcome" element={
            <ProtectedRoute>
              <OnboardingWelcomePage />
            </ProtectedRoute>
          } />

          {/* Redirección para onboarding */}
          <Route path="/onboarding" element={<Navigate to="/onboarding/technical" />} />

          {/* Ruta 404 - página no encontrada */}
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