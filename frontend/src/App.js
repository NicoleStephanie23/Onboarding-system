import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CollaboratorsPage from './pages/CollaboratorsPage';
import CalendarPage from './pages/CalendarPage';
import AlertsPage from './pages/AlertsPage';
import OnboardingTechnicalPage from './pages/OnboardingTechnicalPage';
import OnboardingWelcomePage from './pages/OnboardingWelcomePage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/collaborators" element={<CollaboratorsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/onboarding/technical" element={<OnboardingTechnicalPage />} />
          <Route path="/onboarding/welcome" element={<OnboardingWelcomePage />} />
          <Route path="/settings" element={<div>Configuración (en construcción)</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;