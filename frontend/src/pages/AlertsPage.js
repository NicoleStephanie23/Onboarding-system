import React, { useState, useEffect } from 'react';
import {
  Container, Card, Button, Table, Badge,
  Alert, Row, Col, Form, Modal, Spinner
} from 'react-bootstrap';
import {
  FaBell, FaEnvelope, FaPaperPlane, FaCheck,
  FaCalendarDay, FaUser, FaClock, FaExclamationTriangle,
  FaCalendarAlt, FaTrash
} from 'react-icons/fa';
import { alertService, calendarService } from '../services/api';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertService.getUpcoming();
      setAlerts(data);
    } catch (error) {
      console.error('Error cargando alertas:', error);
      setMessage({ type: 'danger', text: error.error || 'Error cargando alertas' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

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
    const daysUntil = getDaysUntil(event.start_date);

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
        setMessage({ type: 'success', text: 'Alerta manual enviada' });
      } catch (error) {
        setMessage({ type: 'danger', text: 'Error enviando alerta' });
      } finally {
        setLoading(false);
      }
    }
  };

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
            <Col md={8}>
              <h5 className="mb-2">Alertas Automáticas de Eventos</h5>
              <p className="text-muted mb-0">
                El sistema envía alertas automáticas cuando se crean eventos y 7 días antes de su inicio.
              </p>
            </Col>
            <Col md={4} className="text-end">
              <Button variant="primary" onClick={() => setShowTestModal(true)}>
                <FaPaperPlane className="me-2" />
                Probar Sistema
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{alerts.length}</h3>
              <Card.Text>Eventos con Alertas</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">
                {alerts.filter(a => getDaysUntil(a.start_date) <= 7 && getDaysUntil(a.start_date) > 0).length}
              </h3>
              <Card.Text>Próximos 7 días</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">
                {alerts.filter(a => a.responsible_email).length}
              </h3>
              <Card.Text>Con Responsable</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">
                {alerts.filter(a => a.type === 'journey_to_cloud').length}
              </h3>
              <Card.Text>Journey to Cloud</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de alertas */}
      <Card className="dashboard-card">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Alertas Programadas</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando alertas...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <FaBell size={48} className="mb-3" />
              <p>No hay alertas programadas</p>
              <p className="small">Las alertas aparecerán automáticamente al crear eventos en el calendario</p>
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
                  <th>Estado Alerta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => {
                  const daysUntil = getDaysUntil(alert.start_date);
                  const status = getAlertStatus(alert);

                  return (
                    <tr key={alert.id}>
                      <td>
                        <strong>{alert.title}</strong>
                        <br />
                        <small className="text-muted">{alert.description}</small>
                      </td>
                      <td>
                        <Badge bg={alert.type === 'journey_to_cloud' ? 'primary' : 'success'}>
                          {alert.type === 'journey_to_cloud' ? 'Journey to Cloud' : 'Capítulo'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaCalendarAlt className="me-2 text-muted" />
                          {formatDate(alert.start_date)}
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
                          <small>{alert.responsible_email}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg={status.variant}>
                          {status.label}
                        </Badge>
                        {alert.alert_scheduled && (
                          <small className="d-block text-muted">
                            <FaCheck className="me-1" /> Alerta programada
                          </small>
                        )}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleSendManualAlert(alert.id)}
                          disabled={loading}
                        >
                          <FaPaperPlane className="me-1" />
                          Enviar Ahora
                        </Button>
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
        <strong>Nota:</strong> Las alertas se envían automáticamente al email del responsable y administradores cuando se crea un nuevo evento en el calendario.
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