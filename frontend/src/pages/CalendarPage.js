import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaPlus, FaCalendarAlt } from 'react-icons/fa';
import Calendar from '../components/Calendar/Calendar';
import { calendarService } from '../services/api';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadEvents = async () => {
    try {
      const data = await calendarService.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const eventTypes = {
    journey_to_cloud: { label: 'Journey to Cloud', color: 'primary' },
    chapter_technical: { label: 'Capítulo Técnico', color: 'success' },
    other: { label: 'Otro', color: 'secondary' }
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Calendario de Onboardings Técnicos</h2>
        <Button variant="primary">
          <FaPlus className="me-2" />
          Nuevo Evento
        </Button>
      </div>

      <Row>
        {/* Vista de Calendario */}
        <Col lg={8}>
          <Card className="dashboard-card">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FaCalendarAlt className="me-2" />
                Calendario Anual
              </h5>
            </Card.Header>
            <Card.Body>
              <Calendar events={events} />
            </Card.Body>
          </Card>
        </Col>

        {/* Lista de Eventos */}
        <Col lg={4}>
          <Card className="dashboard-card">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Próximos Eventos</h5>
            </Card.Header>
            <Card.Body>
              {events.slice(0, 5).map(event => (
                <div 
                  key={event.id} 
                  className="calendar-event mb-3"
                  onClick={() => setSelectedEvent(event)}
                  style={{ cursor: 'pointer' }}
                >
                  <h6>{event.title}</h6>
                  <Badge bg={eventTypes[event.type]?.color || 'secondary'} className="mb-2">
                    {eventTypes[event.type]?.label || event.type}
                  </Badge>
                  <p className="small text-muted mb-1">
                    {new Date(event.start_date).toLocaleDateString('es-ES')} - 
                    {new Date(event.end_date).toLocaleDateString('es-ES')}
                  </p>
                  <p className="small mb-0">
                    {event.current_participants || 0} / {event.max_participants} participantes
                  </p>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Detalles del Evento Seleccionado */}
          {selectedEvent && (
            <Card className="dashboard-card mt-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Detalles del Evento</h5>
              </Card.Header>
              <Card.Body>
                <h6>{selectedEvent.title}</h6>
                <p className="text-muted">{selectedEvent.description}</p>
                <div className="mb-2">
                  <strong>Tipo:</strong>{' '}
                  <Badge bg={eventTypes[selectedEvent.type]?.color || 'secondary'}>
                    {eventTypes[selectedEvent.type]?.label || selectedEvent.type}
                  </Badge>
                </div>
                <div className="mb-2">
                  <strong>Fecha:</strong>{' '}
                  {new Date(selectedEvent.start_date).toLocaleDateString('es-ES')} - 
                  {new Date(selectedEvent.end_date).toLocaleDateString('es-ES')}
                </div>
                <div className="mb-2">
                  <strong>Responsable:</strong>{' '}
                  {selectedEvent.responsible_email}
                </div>
                <div className="mb-3">
                  <strong>Participantes:</strong>{' '}
                  {selectedEvent.current_participants || 0} / {selectedEvent.max_participants}
                </div>
                <Button variant="outline-primary" size="sm">
                  Ver Participantes
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CalendarPage;
