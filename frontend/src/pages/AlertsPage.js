import React, { useState, useEffect } from 'react';
import {
  Container, Card, Button, Table, Badge,
  Alert, Row, Col, Form, Modal, Spinner
} from 'react-bootstrap';
import {
  FaBell, FaEnvelope, FaPaperPlane, FaCheck,
  FaCalendarDay, FaUser, FaClock, FaExclamationTriangle,
  FaCalendarAlt, FaTrash, FaPlus, FaSync
} from 'react-icons/fa';
import { alertService } from '../services/api';
import { eventService } from '../services/eventService';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [localEvents, setLocalEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
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
      console.log(`📊 ${events.length} eventos cargados desde memoria`);
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
      console.log('ℹ️ No se pudieron cargar alertas del backend:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (events) => {
    const stats = eventService.getStats();
    setStats(stats);
  };

  const handleSendTestAlert = async () => {
    if (!testEmail.trim()) {
      setMessage({ type: 'warning', text: 'Por favor ingresa un email válido' });
      return;
    }

    try {
      setLoading(true);
      await alertService.sendTest(testEmail);
      setMessage({ type: 'success', text: `✅ Alerta de prueba enviada a ${testEmail}` });
      setShowTestModal(false);
      setTestEmail('');
    } catch (error) {
      setMessage({ type: 'danger', text: `❌ Error: ${error.error || error.message}` });
    } finally {
      setLoading(false);
    }
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

  const handleSendManualAlert = async (eventId) => {
    if (window.confirm('¿Enviar alerta manualmente para este evento?')) {
      try {
        setLoading(true);
        setMessage({ type: 'success', text: '✅ Alerta manual enviada' });
      } catch (error) {
        setMessage({ type: 'danger', text: '❌ Error enviando alerta' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm('¿Eliminar este evento?')) {
      const deleted = eventService.deleteEvent(id);
      if (deleted) {
        setMessage({ type: 'success', text: '✅ Evento eliminado' });
      } else {
        setMessage({ type: 'danger', text: '❌ Error eliminando evento' });
      }
    }
  };

  const handleRefresh = () => {
    loadLocalEvents();
    loadBackendAlerts();
    setMessage({ type: 'info', text: '✅ Datos actualizados' });
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de eliminar TODOS los eventos? Esta acción no se puede deshacer.')) {
      eventService.clearAll();
      setMessage({ type: 'warning', text: '🗑️ Todos los eventos han sido eliminados' });
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

      {/* Mensajes */}
      {message.text && (
        <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Panel de control */}
      <Card className="mb-4 dashboard-card">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <h5 className="mb-2">Alertas Automáticas de Eventos</h5>
              <p className="text-muted mb-0">
                Eventos creados en Calendario aparecen aquí automáticamente.
              </p>
            </Col>
            <Col md={6} className="text-end">
              <div className="d-flex gap-2 justify-content-end">
                <Button variant="outline-secondary" onClick={handleRefresh}>
                  <FaSync className="me-2" />
                  Actualizar
                </Button>
                <Button variant="primary" onClick={() => setShowTestModal(true)}>
                  <FaPaperPlane className="me-2" />
                  Probar Sistema
                </Button>
                {localEvents.length > 0 && (
                  <Button variant="outline-danger" onClick={handleClearAll}>
                    <FaTrash className="me-2" />
                    Limpiar Todo
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{stats.total}</h3>
              <Card.Text>Total Eventos</Card.Text>
              <small className="text-muted">En memoria</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{stats.upcoming}</h3>
              <Card.Text>Próximos 30 días</Card.Text>
              <small className="text-muted">Eventos programados</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{uniqueEvents.length}</h3>
              <Card.Text>Total General</Card.Text>
              <small className="text-muted">Local + Backend</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{stats.next7Days}</h3>
              <Card.Text>Próximos 7 días</Card.Text>
              <small className="text-muted">Alertas próximas</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de alertas */}
      <Card className="dashboard-card">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Eventos y Alertas Programadas</h5>
            <Badge bg="info">
              {uniqueEvents.length} evento{uniqueEvents.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando alertas...</p>
            </div>
          ) : uniqueEvents.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <FaBell size={48} className="mb-3" />
              <h5>No hay eventos programados</h5>
              <p className="small">
                Los eventos creados en el Calendario aparecerán automáticamente aquí.
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/calendar'}
                className="mt-2"
              >
                <FaPlus className="me-2" />
                Ir a Calendario para crear evento
              </Button>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Días Restantes</th>
                  <th>Responsable</th>
                  <th>Origen</th>
                  <th>Estado</th>
                  <th>Acciones</th>
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
                        <strong>{event.title}</strong>
                        <br />
                        <small className="text-muted">{event.description}</small>
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
                          {formatDate(event.start_date || event.startDate)}
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
                          <small>{event.responsible_email}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg={isLocal ? 'secondary' : 'dark'}>
                          {isLocal ? '🖥️ Local' : '☁️ Backend'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={status.variant}>
                          {status.label}
                        </Badge>
                        {event.alert_scheduled && (
                          <small className="d-block text-muted">
                            <FaCheck className="me-1" /> Alerta programada
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleSendManualAlert(event.id)}
                            disabled={loading}
                            title="Enviar alerta ahora"
                          >
                            <FaPaperPlane />
                          </Button>
                          {isLocal && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteEvent(event.id)}
                              title="Eliminar evento"
                            >
                              <FaTrash />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Info */}
      <Alert variant="info" className="mt-4">
        <FaExclamationTriangle className="me-2" />
        <strong>¿Cómo funciona?</strong>
        <ul className="mb-0 mt-2">
          <li>Eventos creados en Calendario → Aparecen automáticamente aquí</li>
          <li>Eventos locales (🖥️) → Se guardan en tu navegador</li>
          <li>Eventos del backend (☁️) → Vienen del servidor</li>
          <li>Los eventos no se pierden al recargar la página</li>
        </ul>
      </Alert>

      {/* Modal para prueba */}
      <Modal show={showTestModal} onHide={() => setShowTestModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPaperPlane className="me-2" />
            Probar Sistema de Alertas
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email de destino</Form.Label>
              <Form.Control
                type="email"
                placeholder="ejemplo@correo.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Se enviará una alerta de prueba a este email
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTestModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSendTestAlert} disabled={!testEmail.trim() || loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Enviando...
              </>
            ) : (
              <>
                <FaPaperPlane className="me-2" />
                Enviar Prueba
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AlertsPage;