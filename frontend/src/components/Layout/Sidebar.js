import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaCalendarAlt, 
  FaBell,
  FaCog 
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/collaborators', label: 'Colaboradores', icon: <FaUsers /> },
    { path: '/calendar', label: 'Calendario', icon: <FaCalendarAlt /> },
    { path: '/alerts', label: 'Alertas', icon: <FaBell /> },
    { path: '/settings', label: 'Configuración', icon: <FaCog /> }
  ];
  
  return (
    <div className="sidebar" style={{ width: '250px' }}>
      <div className="p-4">
        <h4 className="text-center mb-4">
          <span className="text-primary">Onboarding</span> System
        </h4>
        <Nav className="flex-column">
          {navItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={`d-flex align-items-center ${
                location.pathname === item.path ? 'active' : ''
              }`}
            >
              <span className="me-3">{item.icon}</span>
              {item.label}
            </Nav.Link>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;
