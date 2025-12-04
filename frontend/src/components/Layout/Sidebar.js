import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaBell,
  FaCog,
  FaGraduationCap,
  FaHandshake
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/collaborators', label: 'Colaboradores', icon: <FaUsers /> },
    {
      path: '/onboarding/technical',
      label: 'Onboarding Técnico',
      icon: <FaGraduationCap />,
      badge: 'Nuevo'
    },
    {
      path: '/onboarding/welcome',
      label: 'Onboarding Bienvenida',
      icon: <FaHandshake />,
      badge: 'Nuevo'
    },
    { path: '/calendar', label: 'Calendario', icon: <FaCalendarAlt /> },
    { path: '/alerts', label: 'Alertas', icon: <FaBell /> },
    { path: '/settings', label: 'Configuración', icon: <FaCog /> }
  ];

  return (
    <div className="sidebar" style={{
      width: '250px',
      backgroundColor: '#2c3e50',
      height: '100vh',
      borderRight: '1px solid #34495e',
      position: 'fixed',
      left: 0,
      top: 0,
      paddingTop: '70px',
      overflowY: 'auto',
      color: 'white'
    }}>
      <div className="p-3 d-flex flex-column" style={{ height: '100%' }}>
        <div className="mb-4 px-2">
          <h5 className="text-light mb-3">Menú Principal</h5>
          <Nav className="flex-column">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/dashboard' &&
                  location.pathname.startsWith(item.path));

              return (
                <Nav.Link
                  key={item.path}
                  as={Link}
                  to={item.path}
                  className={`d-flex align-items-center py-2 px-3 mb-1 rounded`}
                  style={{
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    position: 'relative',
                    color: isActive ? '#ffffff' : '#ecf0f1',
                    backgroundColor: isActive ? '#34495e' : 'transparent',
                  }}
                  onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = '#3d566e')}
                  onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span className="me-3" style={{ width: '20px', color: isActive ? '#1abc9c' : '#ecf0f1' }}>
                    {item.icon}
                  </span>
                  <span className="fw-medium flex-grow-1">{item.label}</span>
                  {item.badge && (
                    <span className="badge bg-info rounded-pill" style={{ fontSize: '0.6rem' }}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '4px',
                        height: '70%',
                        backgroundColor: '#1abc9c',
                        borderRadius: '0 4px 4px 0'
                      }}
                    />
                  )}
                </Nav.Link>
              )
            })}
          </Nav>
        </div>

        <div className="mt-auto px-2 pt-3 border-top" style={{ borderColor: '#34495e' }}>
          <div className="text-center">
            <small className="text-muted d-block">Versión 1.0.0</small>
            <small className="text-muted">© 2025 Onboarding System Stephanie</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;