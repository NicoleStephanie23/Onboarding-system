import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button,
  Badge, Alert, Modal, Form, Spinner
} from 'react-bootstrap';
import {
  FaChevronLeft, FaChevronRight,
  FaCalendarAlt, FaInfoCircle,
  FaPlus, FaMapMarkerAlt, FaUsers,
  FaCalendarDay, FaTag, FaBook
} from 'react-icons/fa';
import '../../styles/calendar.css';
import { eventService } from '../../services/eventService';
import { notificationService } from '../../services/notificationService';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'chapter_technical',
    location: '',
    responsible_email: 'nicolstephanieb.q@gmail.com',
    max_participants: 0,
    color: '#3498db'
  });

  const predefinedEvents = [
    {
      id: 1,
      title: 'Journey to Cloud',
      description: 'Capacitación completa en tecnologías cloud',
      startDate: '2024-03-15',
      endDate: '2024-03-22',
      type: 'journey_to_cloud',
      location: 'Sala de Conferencias A',
      participants: 8,
      color: '#3498db',
      status: 'active',
      duration: 7
    },
    {
      id: 2,
      title: 'Onboarding Frontend',
      description: 'Capacitación en React, TypeScript y mejores prácticas',
      startDate: '2024-03-25',
      endDate: '2024-03-29',
      type: 'chapter_technical',
      location: 'Sala de Desarrollo',
      participants: 12,
      color: '#2ecc71',
      status: 'upcoming',
      duration: 5
    },
    {
      id: 3,
      title: 'Onboarding Backend',
      description: 'Node.js, APIs REST y bases de datos',
      startDate: '2024-04-05',
      endDate: '2024-04-10',
      type: 'chapter_technical',
      location: 'Sala de Servidores',
      participants: 10,
      color: '#e74c3c',
      status: 'upcoming',
      duration: 6
    },
    {
      id: 4,
      title: 'Onboarding DevOps',
      description: 'Docker, Kubernetes y CI/CD',
      startDate: '2024-04-15',
      endDate: '2024-04-19',
      type: 'chapter_technical',
      location: 'Sala de Operaciones',
      participants: 6,
      color: '#9b59b6',
      status: 'upcoming',
      duration: 5
    }
  ];

  const loadEvents = async () => {
    try {
      setLoading(true);
      const savedEvents = localStorage.getItem('technical_onboardings');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      } else {
        setEvents(predefinedEvents);
        localStorage.setItem('technical_onboardings', JSON.stringify(predefinedEvents));
      }

      try {
        const response = await fetch('http://localhost:5000/api/calendar', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (response.ok) {
          const backendEvents = await response.json();
          const allEvents = [...events, ...backendEvents];
          setEvents(allEvents);
          localStorage.setItem('technical_onboardings', JSON.stringify(allEvents));
        }
      } catch (apiError) {
        console.log('⚠️ Backend no disponible, usando eventos locales');
      }

    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'startDate') {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 5);

      setFormData(prev => ({
        ...prev,
        startDate: value,
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const validateEvent = () => {
    const { title, startDate, endDate, responsible_email } = formData;

    if (!title.trim()) {
      alert('El título es obligatorio');
      return false;
    }

    if (!startDate || !endDate) {
      alert('Las fechas son obligatorias');
      return false;
    }

    if (!responsible_email || !responsible_email.includes('@')) {
      alert('Email responsable es obligatorio y debe ser válido');
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      alert('La fecha de fin no puede ser anterior a la fecha de inicio');
      return false;
    }

    const duration = calculateDuration(startDate, endDate);
    if (duration < 5 || duration > 7) {
      alert('La duración debe ser entre 5 y 7 días');
      return false;
    }

    if (formData.max_participants < 0) {
      alert('El número de participantes no puede ser negativo');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEvent()) {
      return;
    }

    try {
      setSaving(true);

      const duration = calculateDuration(formData.startDate, formData.endDate);
      const status = new Date(formData.startDate) <= new Date() ? 'active' : 'upcoming';
      const eventData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        start_date: formData.startDate,
        end_date: formData.endDate,
        location: formData.location,
        responsible_email: formData.responsible_email,
        max_participants: parseInt(formData.max_participants) || 0,
        color: formData.type === 'journey_to_cloud' ? '#3498db' :
          formData.type === 'chapter_technical' ? '#2ecc71' : '#9b59b6',
        status: status,
        duration: duration
      };

      const newLocalEvent = eventService.createEvent(eventData);
      notificationService.showEventCreated(newLocalEvent);

      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:5000/api/calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            start_date: formData.startDate,
            end_date: formData.endDate,
            location: formData.location,
            responsible_email: formData.responsible_email,
            max_participants: parseInt(formData.max_participants) || 0
          })
        });

        if (response.ok) {
          console.log('✅ Evento también guardado en backend');
        }
      } catch (backendError) {
        console.log('ℹ️ Evento guardado solo en memoria');
      }
      const updatedEvents = [...events, newLocalEvent];
      setEvents(updatedEvents);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        type: 'chapter_technical',
        location: '',
        responsible_email: 'nicolstephanieb.q@gmail.com',
        max_participants: 0,
        color: '#3498db'
      });

      setShowModal(false);

    } catch (error) {
      console.error('Error al crear evento:', error);
      notificationService.showNotification(
        '❌ Error',
        `No se pudo crear el evento: ${error.message}`,
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const monthName = months[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const dayEvents = events.filter(event => {
      const eventStart = new Date(event.startDate || event.start_date);
      const eventEnd = new Date(event.endDate || event.end_date);
      return dayDate >= eventStart && dayDate <= eventEnd;
    });

    days.push({
      day: i,
      date: dayDate,
      events: dayEvents
    });
  }

  const activeEvents = events.filter(event => {
    const today = new Date();
    const eventStart = new Date(event.startDate || event.start_date);
    const eventEnd = new Date(event.endDate || event.end_date);
    const isActive = today >= eventStart && today <= eventEnd;
    const duration = calculateDuration(
      event.startDate || event.start_date,
      event.endDate || event.end_date
    );
    const hasValidDuration = duration >= 5 && duration <= 7;
    return isActive && hasValidDuration;
  });

  const upcomingEvents = events
    .filter(event => {
      const eventStart = new Date(event.startDate || event.start_date);
      return eventStart > new Date();
    })
    .sort((a, b) => {
      const dateA = new Date(a.startDate || a.start_date);
      const dateB = new Date(b.startDate || b.start_date);
      return dateA - dateB;
    })
    .slice(0, 4);

  const getEventTypeLabel = (type) => {
    const types = {
      'journey_to_cloud': 'Journey to Cloud',
      'chapter_technical': 'Capítulo Técnico',
      'workshop': 'Workshop'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status) => {
    const variants = {
      'active': 'success',
      'upcoming': 'warning',
      'completed': 'secondary',
      'scheduled': 'primary'
    };

    const labels = {
      'active': 'En Curso',
      'upcoming': 'Próximo',
      'completed': 'Completado',
      'scheduled': 'Programado'
    };

    return <Badge bg={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <Container fluid className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando calendario...</p>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Header con botón Nuevo Evento */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <FaCalendarAlt className="text-primary me-2" />
            Calendario de Onboardings Técnicos
          </h2>
          <p className="text-muted mb-0">
            Visualización de sesiones activas (5-7 días por bloque)
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" />
          Nuevo Evento Técnico
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h3 className="text-primary">{events.length}</h3>
              <Card.Text>Total Onboardings</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h3 className="text-success">{activeEvents.length}</h3>
              <Card.Text>Sesiones Activas</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h3 className="text-warning">
                {events.filter(e => e.type === 'journey_to_cloud').length}
              </h3>
              <Card.Text>Journey to Cloud</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h3 className="text-info">
                {events.filter(e => e.type === 'chapter_technical').length}
              </h3>
              <Card.Text>Capítulos Técnicos</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Calendario Principal */}
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <h4 className="mb-0 me-3">{monthName} {year}</h4>
                <Button variant="outline-secondary" size="sm" onClick={goToToday}>
                  Hoy
                </Button>
              </div>
              <div>
                <Button variant="outline-secondary" className="me-2" onClick={prevMonth}>
                  <FaChevronLeft />
                </Button>
                <Button variant="outline-secondary" onClick={nextMonth}>
                  <FaChevronRight />
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="calendar-weekdays mb-2">
                {weekDays.map(day => (
                  <div key={day} className="calendar-weekday">
                    {day}
                  </div>
                ))}
              </div>

              <div className="calendar-grid">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="calendar-day empty"></div>;
                  }

                  const isToday = day.date.toDateString() === new Date().toDateString();
                  const hasEvents = day.events.length > 0;

                  return (
                    <div
                      key={index}
                      className={`calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}`}
                    >
                      <div className="calendar-day-header">
                        <span className={`calendar-day-number ${isToday ? 'today-badge' : ''}`}>
                          {day.day}
                        </span>
                        {isToday && <span className="today-label">Hoy</span>}
                      </div>

                      {hasEvents && (
                        <div className="calendar-events">
                          {day.events.slice(0, 2).map((event, idx) => {
                            const duration = calculateDuration(
                              event.startDate || event.start_date,
                              event.endDate || event.end_date
                            );
                            return (
                              <div
                                key={idx}
                                className="calendar-event-badge"
                                style={{ backgroundColor: event.color || '#3498db' }}
                                title={`${event.title} (${duration} días)`}
                              >
                                <small>{event.title}</small>
                              </div>
                            );
                          })}
                          {day.events.length > 2 && (
                            <small className="text-muted d-block">
                              +{day.events.length - 2} más
                            </small>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>

          {/* Sesiones Activas (5-7 días) */}
          <Card className="mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FaCalendarDay className="text-success me-2" />
                Sesiones Activas (5-7 días)
              </h5>
            </Card.Header>
            <Card.Body>
              {activeEvents.length === 0 ? (
                <Alert variant="info" className="mb-0">
                  No hay sesiones activas en este momento.
                </Alert>
              ) : (
                <div className="active-sessions-grid">
                  {activeEvents.map(event => {
                    const duration = calculateDuration(
                      event.startDate || event.start_date,
                      event.endDate || event.end_date
                    );
                    return (
                      <div key={event.id} className="active-session p-3 border rounded mb-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-1">{event.title}</h6>
                            <p className="text-muted small mb-2">{event.description}</p>
                          </div>
                          <div className="d-flex gap-2">
                            <Badge bg="light" text="dark">
                              {duration} días
                            </Badge>
                            {getStatusBadge(event.status)}
                          </div>
                        </div>

                        <div className="d-flex flex-wrap gap-3">
                          <small className="text-muted">
                            <FaCalendarAlt className="me-1" />
                            {new Date(event.startDate || event.start_date).toLocaleDateString()} -
                            {new Date(event.endDate || event.end_date).toLocaleDateString()}
                          </small>
                          {event.location && (
                            <small className="text-muted">
                              <FaMapMarkerAlt className="me-1" />
                              {event.location}
                            </small>
                          )}
                          <small className="text-muted">
                            <FaUsers className="me-1" />
                            {(event.participants || event.max_participants || 0)} participantes
                          </small>
                          <small className="text-muted">
                            <FaTag className="me-1" />
                            {getEventTypeLabel(event.type)}
                          </small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar - Próximos Eventos */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FaBook className="text-warning me-2" />
                Próximos Onboardings
              </h5>
            </Card.Header>
            <Card.Body>
              {upcomingEvents.length === 0 ? (
                <Alert variant="info" className="mb-0">
                  No hay onboardings programados.
                </Alert>
              ) : (
                <div className="upcoming-events-list">
                  {upcomingEvents.map(event => {
                    const duration = calculateDuration(
                      event.startDate || event.start_date,
                      event.endDate || event.end_date
                    );
                    return (
                      <div key={event.id} className="upcoming-event mb-3 pb-3 border-bottom">
                        <div className="d-flex align-items-start">
                          <div
                            className="event-color-indicator me-3"
                            style={{
                              backgroundColor: event.color || '#3498db',
                              width: '8px',
                              height: '60px',
                              borderRadius: '4px'
                            }}
                          ></div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{event.title}</h6>
                            <div className="d-flex gap-2 mb-2">
                              <Badge bg="light" text="dark">
                                {getEventTypeLabel(event.type)}
                              </Badge>
                              <Badge bg="light" text="dark">
                                {duration} días
                              </Badge>
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                              <small className="text-muted">
                                📅 {new Date(event.startDate || event.start_date).toLocaleDateString()}
                              </small>
                              {event.location && (
                                <small className="text-muted">
                                  📍 {event.location}
                                </small>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Información del sistema */}
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FaInfoCircle className="text-primary me-2" />
                Información del Sistema
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="system-info">
                <p className="small text-muted mb-2">
                  <strong>Duración de sesiones:</strong> 5-7 días por bloque
                </p>
                <p className="small text-muted mb-2">
                  <strong>Tipos de onboarding:</strong>
                </p>
                <ul className="small text-muted mb-0">
                  <li>• Journey to Cloud: Capacitación cloud (7 días)</li>
                  <li>• Capítulos Técnicos: Especialización (5-6 días)</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para Nuevo Evento - CON LOS NOMBRES ORIGINALES */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaPlus className="me-2" />
              Nuevo Onboarding Técnico
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Título del Onboarding *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ej: Journey to Cloud - Batch 2024"
                    required
                    disabled={saving}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo *</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                  >
                    <option value="chapter_technical">Capítulo Técnico</option>
                    <option value="journey_to_cloud">Journey to Cloud</option>
                    <option value="workshop">Workshop Especializado</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripción detallada del contenido..."
                disabled={saving}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Inicio *</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    disabled={saving}
                  />
                  <Form.Text className="text-muted">
                    La fecha de fin se calculará automáticamente
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Fin *</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                  />
                  <Form.Text className="text-muted">
                    Duración: {formData.startDate && formData.endDate ?
                      calculateDuration(formData.startDate, formData.endDate) + ' días' :
                      'Seleccione fechas'}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ubicación</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Sala de conferencias..."
                    disabled={saving}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Responsable *</Form.Label>
                  <Form.Control
                    type="email"
                    name="responsible_email"
                    value={formData.responsible_email}
                    onChange={handleInputChange}
                    placeholder="responsable@empresa.com"
                    required
                    disabled={saving}
                  />

                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Participantes Máximos</Form.Label>
                  <Form.Control
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Ej: 15"
                    disabled={saving}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="info" className="mt-3">
              <small>
                <strong>Importante:</strong> Al crear el evento, se enviará automáticamente una alerta
                al email del responsable y aparecerá en la página de alertas.
              </small>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creando...
                </>
              ) : (
                <>
                  <FaPlus className="me-2" />
                  Crear Onboarding
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Calendar;