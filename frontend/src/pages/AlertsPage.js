import React, { useState, useEffect } from 'react';
import { 
  Container, Card, Button, Table, Badge,
  Alert as BootstrapAlert
} from 'react-bootstrap';
import { FaBell, FaEnvelope, FaPaperPlane, FaCheck } from 'react-icons/fa';
import { alertService } from '../services/api';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertService.getUpcoming();
      setAlerts(data);
    } catch (error) {
      console.error('Error cargando alertas:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleSendTestAlert = async () => {
    try {
      await alertService.sendTestAlert();
      setMessage('✅ Alerta de prueba enviada correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const getDaysUntilEvent = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Gestión de Alertas</h2>

      {message && (
        <BootstrapAlert 
          variant={message.includes('✅') ? 'success' : 'danger'} 
          dismissible
          onClose={() => setMessage('')}
        >
          {message}
        </BootstrapAlert>
      )}

      {/* Estadísticas */}
      <div className="mb-4">
        <Card className="dashboard-card">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">
                  <FaBell className="me-2 text-warning" />
                  Sistema de Alertas
                </h5>
                <p className="text-muted mb-0">
                  Alertas automáticas para eventos próximos
                </p>
              </div>
              <Button variant="primary" onClick={handleSendTestAlert}>
                <FaPaperPlane className="me-2" />
                Enviar Alerta de Prueba
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Alertas Próximas */}
      <Card className="dashboard-card mb-4">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Alertas Próximas (7 días)</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <FaEnvelope size={48} className="mb-3" />
              <p>No hay alertas programadas para los próximos 7 días</p>
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Tipo</th>
                  <th>Fecha Inicio</th>
                  <th>Días Restantes</th>
                  <th>Estado Alerta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => {
                  const daysUntil = getDaysUntilEvent(alert.start_date);
                  const badgeColor = daysUntil <= 3 ? 'danger' : 
                                   daysUntil <= 7 ? 'warning' : 'info';
                  
                  return (
                    <tr key={alert.id}>
                      <td>
                        <strong>{alert.title}</strong>
                        <br />
                        <small className="text-muted">{alert.description}</small>
                      </td>
                      <td>
                        <Badge bg="secondary">{alert.type}</Badge>
                      </td>
                      <td>
                        {new Date(alert.start_date).toLocaleDateString('es-ES')}
                      </td>
                      <td>
                        <Badge bg={badgeColor}>
                          {daysUntil} {daysUntil === 1 ? 'día' : 'días'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="success">
                          <FaCheck className="me-1" />
                          Programada
                        </Badge>
                      </td>
                      <td>
                        <Button size="sm" variant="outline-primary">
                          <FaEnvelope className="me-1" />
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

      {/* Configuración de Alertas */}
      <Card className="dashboard-card">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Configuración de Alertas</h5>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <h6 className="mb-3">Configuración de Correo</h6>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Días de Anticipación</label>
                <select className="form-select">
                  <option value="7">7 días antes</option>
                  <option value="5">5 días antes</option>
                  <option value="3">3 días antes</option>
                  <option value="1">1 día antes</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Hora de Envío</label>
                <select className="form-select">
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">Estado del Servicio</h6>
              <p className="text-muted mb-0">
                <Badge bg="success">Activo</Badge>
                {' '}Las alertas se envían automáticamente
              </p>
            </div>
            <div>
              <Button variant="outline-success" className="me-2">
                Guardar Configuración
              </Button>
              <Button variant="outline-secondary">
                Ver Historial
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AlertsPage;
