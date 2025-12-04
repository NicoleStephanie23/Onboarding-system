import React, { useState, useEffect } from 'react';
import {
  Container, Card, Table, Badge,
  Alert, Row, Col, Spinner
} from 'react-bootstrap';
import {
  FaBell, FaCalendarDay, FaUser, FaClock,
  FaCalendarAlt, FaTrash, FaSync, FaArrowRight
} from 'react-icons/fa';
import { alertService } from '../services/api';
import { eventService } from '../services/eventService';
import { notificationService } from '../services/notificationService';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [localEvents, setLocalEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    today: 0,
    next7Days: 0
  });

  useEffect(() => {
    loadLocalEvents();
    const unsubscribe = eventService.subscribe((events) => {
      setLocalEvents(events);
      updateStats(events);
    });

    loadBackendAlerts();

    return () => unsubscribe();
  }, []);

  const loadLocalEvents = () => {
    try {
      const events = eventService.getAllEvents();
      setLocalEvents(events);
      updateStats(events);
    } catch (error) {
      console.error('Error cargando eventos locales:', error);
    }
  };

  const loadBackendAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertService.getUpcoming();
      setAlerts(data);
    } catch (error) {
      console.log('No se pudieron cargar alertas del backend');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (events) => {
    const stats = eventService.getStats();
    setStats(stats);
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getAlertStatus = (event) => {
    const daysUntil = getDaysUntil(event.start_date || event.startDate);

    if (daysUntil < 0) return { label: 'Completado', variant: 'secondary' };
    if (daysUntil === 0) return { label: 'Hoy', variant: 'danger' };
    if (daysUntil <= 3) return { label: 'Próximo', variant: 'warning' };
    if (daysUntil <= 7) return { label: 'Próxima semana', variant: 'info' };
    return { label: 'Programado', variant: 'success' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm('¿Eliminar este evento?')) {
      const deleted = eventService.deleteEvent(id);
      if (deleted) {
        notificationService.showNotification(
          '✅ Evento Eliminado',
          'El evento ha sido eliminado correctamente',
          'success'
        );
      }
    }
  };

  const handleRefresh = () => {
    loadLocalEvents();
    loadBackendAlerts();
    notificationService.showNotification(
      '🔄 Datos Actualizados',
      'La lista de eventos ha sido actualizada',
      'info'
    );
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de eliminar TODOS los eventos locales?')) {
      eventService.clearAll();
      notificationService.showNotification(
        '🗑️ Todos los eventos eliminados',
        'Todos los eventos locales han sido eliminados',
        'warning'
      );
    }
  };

  const allEvents = [...localEvents, ...alerts];
  const uniqueEvents = allEvents.filter((event, index, self) =>
    index === self.findIndex((e) => e.id === event.id)
  );

  return (
    <Container fluid>
      <h2 className="mb-4">
        <FaBell className="me-2 text-warning" />
        Sistema de Alertas
      </h2>

      {/* Estadísticas - MODIFICADO: Solo 2 tarjetas */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{uniqueEvents.length}</h3>
              <Card.Text>Total General</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">
                {uniqueEvents.filter(e => getDaysUntil(e.start_date || e.startDate) <= 3).length}
              </h3>
              <Card.Text>Próximos 3 días</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de alertas */}
      <Card className="dashboard-card">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Eventos y Alertas Programadas</h5>
            <div className="d-flex align-items-center gap-2">
              <Badge bg="primary" className="px-3 py-2">
                {uniqueEvents.length} evento{uniqueEvents.length !== 1 ? 's' : ''}
              </Badge>
              {uniqueEvents.length > 0 && (
                <>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleRefresh}
                    title="Actualizar lista"
                  >
                    <FaSync />
                  </button>
                  {localEvents.length > 0 && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleClearAll}
                      title="Eliminar todos los eventos locales"
                    >
                      <FaTrash />
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => window.location.href = '/calendar'}
                  >
                    <FaArrowRight className="me-1" />
                    Crear nuevo evento
                  </button>
                </>
              )}
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando alertas...</p>
            </div>
          ) : uniqueEvents.length === 0 ? (
            <div className="text-center py-4">
              <div className="mb-3">
                <FaBell size={64} className="text-muted" />
              </div>
              <h5 className="text-muted mb-3">No hay eventos programados</h5>
              <p className="text-muted mb-4">
                Los eventos que crees en el Calendario aparecerán automáticamente aquí.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = '/calendar'}
              >
                <FaCalendarAlt className="me-2" />
                Ir a Calendario para crear tu primer evento
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Días Restantes</th>
                    <th>Responsable</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueEvents.map((event) => {
                    const daysUntil = getDaysUntil(event.start_date || event.startDate);
                    const status = getAlertStatus(event);
                    const isLocal = event.id > 1000000000000;

                    return (
                      <tr key={event.id}>
                        <td>
                          <div className="d-flex align-items-start">
                            <div
                              className="me-3"
                              style={{
                                width: '8px',
                                height: '40px',
                                backgroundColor: event.color || '#3498db',
                                borderRadius: '4px'
                              }}
                            />
                            <div>
                              <strong className="d-block">{event.title}</strong>
                              <small className="text-muted d-block">{event.description}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={event.type === 'journey_to_cloud' ? 'primary' : 'success'}>
                            {event.type === 'journey_to_cloud' ? 'Journey to Cloud' :
                              event.type === 'chapter_technical' ? 'Capítulo' : 'General'}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaCalendarAlt className="me-2 text-muted" />
                            <span className="text-nowrap">
                              {new Date(event.start_date || event.startDate).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaClock className="me-2 text-muted" />
                            <Badge bg={daysUntil <= 3 ? 'danger' : daysUntil <= 7 ? 'warning' : 'info'}>
                              {daysUntil} {daysUntil === 1 ? 'día' : 'días'}
                            </Badge>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaUser className="me-2 text-muted" />
                            <small className="text-truncate" style={{ maxWidth: '150px' }}>
                              {event.responsible_email}
                            </small>
                          </div>
                        </td>
                        <td>
                          <Badge bg={status.variant} className="px-3 py-1">
                            {status.label}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            {isLocal && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteEvent(event.id)}
                                title="Eliminar evento"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Info simplificada */}
      {uniqueEvents.length === 0 && (
        <Alert variant="light" className="mt-4 border">
          <div className="text-center">
            <FaCalendarDay className="text-primary mb-2" size={24} />
            <h6 className="mb-2">¿Cómo empezar?</h6>
            <p className="mb-0 small text-muted">
              1. Ve a la página de Calendario<br />
              2. Crea un nuevo evento de onboarding<br />
              3. El evento aparecerá automáticamente aquí
            </p>
          </div>
        </Alert>
      )}
    </Container>
  );
};

export default AlertsPage;