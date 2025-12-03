import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Navbar, Nav, Form, Button,
  Dropdown, ListGroup, Badge
} from 'react-bootstrap';
import {
  FaSearch, FaUserCircle, FaUsers, FaCalendarAlt,
  FaBell, FaTachometerAlt, FaCog, FaArrowRight, FaUserPlus,
  FaGraduationCap, FaHandshake
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const searchOptions = [
    {
      keywords: ['colaborador', 'empleado', 'trabajador', 'persona', 'usuario', 'colaboradores'],
      icon: <FaUsers />,
      label: 'Colaboradores',
      action: () => navigate('/collaborators'),
      type: 'section'
    },
    {
      keywords: ['dashboard', 'inicio', 'principal', 'estadisticas', 'resumen', 'home'],
      icon: <FaTachometerAlt />,
      label: 'Dashboard',
      action: () => navigate('/dashboard'),
      type: 'section'
    },
    {
      keywords: ['calendario', 'evento', 'reunion', 'fecha', 'agenda', 'cita'],
      icon: <FaCalendarAlt />,
      label: 'Calendario',
      action: () => navigate('/calendar'),
      type: 'section'
    },
    {
      keywords: ['alerta', 'notificacion', 'recordatorio', 'aviso', 'mensaje', 'notificaciones'],
      icon: <FaBell />,
      label: 'Alertas',
      action: () => navigate('/alerts'),
      type: 'section'
    },
    {
      keywords: ['configuracion', 'ajustes', 'preferencias', 'opciones', 'settings'],
      icon: <FaCog />,
      label: 'Configuración',
      action: () => navigate('/settings'),
      type: 'section'
    },
    {
      keywords: ['nuevo', 'crear', 'agregar', 'añadir', 'registrar', 'nuevo colaborador', 'ingresar colaborador'],
      icon: <FaUserPlus />,
      label: 'Nuevo Colaborador',
      action: () => navigate('/collaborators?action=new'),
      type: 'action'
    },
    {
      keywords: ['tecnico', 'tecnología', 'curso', 'capacitacion', 'training', 'onboarding tecnico', 'técnico'],
      icon: <FaGraduationCap className="text-primary" />,
      label: 'Onboarding Técnico',
      action: () => navigate('/onboarding/technical'),
      type: 'section'
    },
    {
      keywords: ['bienvenida', 'induccion', 'inicio', 'welcome', 'onboarding bienvenida', 'inducción'],
      icon: <FaHandshake className="text-success" />,
      label: 'Onboarding Bienvenida',
      action: () => navigate('/onboarding/welcome'),
      type: 'section'
    },
    {
      keywords: ['completado', 'terminado', 'finalizado', 'listo', 'onboardings completados', 'completos'],
      icon: <FaUsers className="text-success" />,
      label: 'Onboardings Completados',
      action: () => navigate('/collaborators?statusFilter=completed'),
      type: 'filter'
    },
    {
      keywords: ['pendiente', 'espera', 'por hacer', 'onboardings pendientes', 'pendientes'],
      icon: <FaUsers className="text-warning" />,
      label: 'Onboardings Pendientes',
      action: () => navigate('/collaborators?statusFilter=pending'),
      type: 'filter'
    },
    {
      keywords: ['progreso', 'en curso', 'en progreso', 'en proceso'],
      icon: <FaUsers className="text-info" />,
      label: 'Onboardings en Progreso',
      action: () => navigate('/collaborators?statusFilter=in_progress'),
      type: 'filter'
    }
  ];

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const foundSuggestions = [];
    searchOptions.forEach(option => {
      const exactLabelMatch = option.label.toLowerCase() === term;
      const labelContains = option.label.toLowerCase().includes(term);
      const keywordMatch = option.keywords.some(keyword =>
        keyword.toLowerCase() === term ||
        keyword.toLowerCase().includes(term) ||
        term.includes(keyword.toLowerCase())
      );

      if (exactLabelMatch || labelContains || keywordMatch) {
        let relevance = 0;

        if (exactLabelMatch) relevance = 30;
        else if (labelContains) relevance = 20;
        else if (keywordMatch) relevance = 10;

        foundSuggestions.push({
          ...option,
          relevance,
          matchType: exactLabelMatch ? 'exact' : (labelContains ? 'partial' : 'keyword')
        });
      }
    });

    foundSuggestions.sort((a, b) => b.relevance - a.relevance);
    setSuggestions(foundSuggestions.slice(0, 6));
    setShowSuggestions(foundSuggestions.length > 0);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) return;

    const term = searchTerm.toLowerCase().trim();
    let bestMatch = null;
    let highestScore = 0;

    searchOptions.forEach(option => {
      let score = 0;

      if (option.label.toLowerCase() === term) {
        score += 30;
      }
      if (option.label.toLowerCase().includes(term)) {
        score += 15;
      }
      option.keywords.forEach(keyword => {
        if (keyword.toLowerCase() === term) score += 20;
        if (keyword.toLowerCase().includes(term) || term.includes(keyword.toLowerCase())) score += 10;
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = option;
      }
    });
    if (bestMatch && highestScore >= 10) {
      bestMatch.action();
      setSearchTerm('');
      setShowSuggestions(false);
    } else {
      navigate(`/collaborators?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setShowSuggestions(false);
    }
  };
  const handleSuggestionClick = (suggestion) => {
    suggestion.action();
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm" style={{
      position: 'relative',
      marginLeft: '250px',
      width: 'calc(100% - 250px)'
    }}>
      <Container fluid>
        <Navbar.Brand href="#" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <h5 className="mb-0">
            <span style={{ color: '#72a1cf' }}>Onboarding</span> System
          </h5>
        </Navbar.Brand>

        <div ref={searchRef} className="position-relative" style={{ width: '450px' }}>
          <Form className="d-flex" onSubmit={handleSearch}>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <FaSearch className="text-muted" />
              </span>
              <Form.Control
                type="search"
                placeholder="Buscar colaboradores, eventos, alertas..."
                className="border-start-0 border-end-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => searchTerm.trim() && setShowSuggestions(true)}
                aria-label="Buscar en el sistema"
                style={{ borderRight: 'none' }}
              />
              <Button
                variant="primary"
                type="submit"
                disabled={!searchTerm.trim()}
                className="d-flex align-items-center justify-content-center"
                style={{ width: '45px' }}
                aria-label="Buscar"
              >
                <span className="visually-hidden">Buscar</span>
              </Button>
            </div>
          </Form>

          {/* Sugerencias inteligentes */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="position-absolute top-100 start-0 end-0 mt-1 shadow-lg rounded border"
              style={{
                zIndex: 1000,
                backgroundColor: 'white',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
              <ListGroup variant="flush">
                <ListGroup.Item className="bg-light text-muted small py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-medium">Sugerencias inteligentes</span>
                    <Badge bg="info" pill>{suggestions.length}</Badge>
                  </div>
                </ListGroup.Item>

                {suggestions.map((suggestion, index) => (
                  <ListGroup.Item
                    key={index}
                    action
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="d-flex align-items-center justify-content-between py-2 px-3"
                    style={{
                      cursor: 'pointer',
                      borderLeft: 'none',
                      borderRight: 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                  >
                    <div className="d-flex align-items-center">
                      <span className="me-3" style={{ fontSize: '1.1rem' }}>
                        {suggestion.icon}
                      </span>
                      <div>
                        <div className="fw-medium">{suggestion.label}</div>
                        <small className="text-muted d-block">
                          {suggestion.type === 'section' ? 'Ir a sección' :
                            suggestion.type === 'action' ? 'Crear nuevo colaborador' :
                              'Filtrar por estado'}
                        </small>
                      </div>
                    </div>
                    <FaArrowRight className="text-muted" size={14} />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          {/* Sugerencia cuando no hay resultados */}
          {showSuggestions && suggestions.length === 0 && searchTerm.trim() && (
            <div className="position-absolute top-100 start-0 end-0 mt-1 p-3 shadow-sm rounded border bg-white"
              style={{ zIndex: 1000 }}>
              <div className="text-muted">
                <div className="mb-2 fw-medium">💡 Prueba con:</div>
                <div className="d-flex flex-wrap gap-2">
                  <Badge
                    bg="light"
                    text="dark"
                    className="cursor-pointer px-3 py-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSearchTerm('Nuevo Colaborador')}>
                    Nuevo Colaborador
                  </Badge>
                  <Badge
                    bg="light"
                    text="dark"
                    className="cursor-pointer px-3 py-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSearchTerm('Onboarding Técnico')}>
                    Onboarding Técnico
                  </Badge>
                  <Badge
                    bg="light"
                    text="dark"
                    className="cursor-pointer px-3 py-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSearchTerm('Onboarding Bienvenida')}>
                    Onboarding Bienvenida
                  </Badge>
                  <Badge
                    bg="light"
                    text="dark"
                    className="cursor-pointer px-3 py-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSearchTerm('Colaboradores')}>
                    Colaboradores
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Perfil usuario */}
        <Nav className="ms-auto">
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" className="d-flex align-items-center">
              <FaUserCircle size={24} />
              <span className="ms-2 d-none d-md-inline">Administrador</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Header>
                <div className="fw-bold">Usuario Administrador</div>
                <small className="text-muted">admin@onboarding.com</small>
              </Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => navigate('/settings')}>
                <FaCog className="me-2" />
                Configuración
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="text-danger">
                Cerrar Sesión
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;