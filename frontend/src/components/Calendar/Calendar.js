import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button,
  Badge, Alert, Modal, Form
} from 'react-bootstrap';
import {
  FaChevronLeft, FaChevronRight,
  FaCalendarAlt, FaInfoCircle,
  FaPlus, FaMapMarkerAlt, FaUsers,
  FaCalendarDay, FaTag, FaBook
} from 'react-icons/fa';
import '../../styles/calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'chapter_technical',
    location: '',
    participants: 0,
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

  useEffect(() => {
    const savedEvents = localStorage.getItem('technical_onboardings');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      setEvents(predefinedEvents);
      localStorage.setItem('technical_onboardings', JSON.stringify(predefinedEvents));
    }
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('technical_onboardings', JSON.stringify(events));
    }
  }, [events]);

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
    const { title, startDate, endDate, type, participants } = formData;

    if (!title.trim()) {
      alert('El título es obligatorio');
      return false;
    }

    if (!startDate || !endDate) {
      alert('Las fechas son obligatorias');
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

    if (participants < 0) {
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

    const duration = calculateDuration(formData.startDate, formData.endDate);
    const status = new Date(formData.startDate) <= new Date() ? 'active' : 'upcoming';

    const newEvent = {
      id: Date.now(),
      ...formData,
      participants: parseInt(formData.participants) || 0,
      duration: duration,
      status: status,
      color: formData.type === 'journey_to_cloud' ? '#3498db' :
        formData.type === 'chapter_technical' ? '#2ecc71' : '#9b59b6'
    };

    try {
      console.log('Guardando en BD:', newEvent);
      setEvents([...events, newEvent]);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        type: 'chapter_technical',
        location: '',
        participants: 0,
        color: '#3498db'
      });

      setShowModal(false);

      alert('✅ Evento creado exitosamente');
    } catch (error) {
      console.error('Error al guardar evento:', error);
      alert('❌ Error al crear el evento');
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
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
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
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const isActive = today >= eventStart && today <= eventEnd;
    const hasValidDuration = event.duration >= 5 && event.duration <= 7;
    return isActive && hasValidDuration;
  });

  const upcomingEvents = events
    .filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
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
      'completed': 'secondary'
    };

    const labels = {
      'active': 'En Curso',
      'upcoming': 'Próximo',
      'completed': 'Completado'
    };

    return <Badge bg={variants[status]}>{labels[status]}</Badge>;
  };

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
                          {day.events.slice(0, 2).map((event, idx) => (
                            <div
                              key={idx}
                              className="calendar-event-badge"
                              style={{ backgroundColor: event.color }}
                              title={`${event.title} (${event.duration} días)`}
                            >
                              <small>{event.title}</small>
                            </div>
                          ))}
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
                  {activeEvents.map(event => (
                    <div key={event.id} className="active-session p-3 border rounded mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1">{event.title}</h6>
                          <p className="text-muted small mb-2">{event.description}</p>
                        </div>
                        <div className="d-flex gap-2">
                          <Badge bg="light" text="dark">
                            {event.duration} días
                          </Badge>
                          {getStatusBadge(event.status)}
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-3">
                        <small className="text-muted">
                          <FaCalendarAlt className="me-1" />
                          {new Date(event.startDate).toLocaleDateString()} -
                          {new Date(event.endDate).toLocaleDateString()}
                        </small>
                        <small className="text-muted">
                          <FaMapMarkerAlt className="me-1" />
                          {event.location}
                        </small>
                        <small className="text-muted">
                          <FaUsers className="me-1" />
                          {event.participants} participantes
                        </small>
                        <small className="text-muted">
                          <FaTag className="me-1" />
                          {getEventTypeLabel(event.type)}
                        </small>
                      </div>
                    </div>
                  ))}
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
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="upcoming-event mb-3 pb-3 border-bottom">
                      <div className="d-flex align-items-start">
                        <div
                          className="event-color-indicator me-3"
                          style={{
                            backgroundColor: event.color,
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
                              {event.duration} días
                            </Badge>
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            <small className="text-muted">
                              📅 {new Date(event.startDate).toLocaleDateString()}
                            </small>
                            <small className="text-muted">
                              📍 {event.location}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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

      {/* Modal para Nuevo Evento */}
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
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Participantes Estimados</Form.Label>
                  <Form.Control
                    type="number"
                    name="participants"
                    value={formData.participants}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Ej: 15"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Color del Evento en Calendario</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  style={{ width: '60px', height: '40px' }}
                />
                <small className="ms-2 text-muted">
                  Journey to Cloud: Azul | Capítulos: Verde | Workshops: Púrpura
                </small>
              </div>
            </Form.Group>

            <Alert variant="info" className="mt-3">
              <small>
                <strong>Importante:</strong> Los onboardings técnicos deben tener una duración de 5 a 7 días.
                El sistema ajustará automáticamente la fecha de fin según el tipo seleccionado.
              </small>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              <FaPlus className="me-2" />
              Crear Onboarding
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Calendar;