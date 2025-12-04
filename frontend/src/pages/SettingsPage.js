import React, { useState } from 'react';
import {
    Container, Card, Form, Button,
    Alert, Spinner, Row, Col, Tab, Tabs, Badge
} from 'react-bootstrap';
import { FaUser, FaKey, FaCog, FaSave, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';

const SettingsPage = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'danger', text: 'Las contraseñas no coinciden' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'danger', text: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        setLoading(true);
        try {
            const result = await authService.changePassword(currentPassword, newPassword);

            if (result.success) {
                setMessage({ type: 'success', text: 'Contraseña cambiada exitosamente' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage({ type: 'danger', text: result.error || 'Error al cambiar contraseña' });
            }
        } catch (error) {
            setMessage({ type: 'danger', text: error.message || 'Error de conexión' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    return (
        <Container fluid>
            <h2 className="mb-4">Configuración</h2>

            <Row>
                <Col lg={3}>
                    <Card className="mb-4">
                        <Card.Body>
                            <div className="text-center mb-3">
                                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center"
                                    style={{ width: '80px', height: '80px' }}>
                                    <FaUser size={40} className="text-white" />
                                </div>
                                <h5 className="mt-3 mb-0">{user?.full_name}</h5>
                                <p className="text-muted mb-0">@{user?.username}</p>
                                <Badge bg={
                                    user?.role === 'admin' ? 'danger' :
                                        user?.role === 'manager' ? 'warning' : 'info'
                                } className="mt-2">
                                    {user?.role === 'admin' ? 'Administrador' :
                                        user?.role === 'manager' ? 'Manager' : 'Visualizador'}
                                </Badge>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={9}>
                    <Card>
                        <Card.Body>
                            <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                                <Tab eventKey="profile" title={
                                    <>
                                        <FaUser className="me-2" />
                                        Perfil
                                    </>
                                }>
                                    <div className="p-3">
                                        <h5>Información del Perfil</h5>
                                        <Form>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Nombre Completo</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={user?.full_name || ''}
                                                            disabled
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Nombre de Usuario</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={user?.username || ''}
                                                            disabled
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Email</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    value={user?.email || ''}
                                                    disabled
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Rol</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={user?.role === 'admin' ? 'Administrador' :
                                                        user?.role === 'manager' ? 'Manager' : 'Visualizador'}
                                                    disabled
                                                />
                                            </Form.Group>

                                        </Form>
                                    </div>
                                </Tab>

                                <Tab eventKey="password" title={
                                    <>
                                        <FaKey className="me-2" />
                                        Contraseña
                                    </>
                                }>
                                    <div className="p-3">
                                        <h5>Cambiar Contraseña</h5>
                                        {message.text && (
                                            <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
                                                {message.text}
                                            </Alert>
                                        )}
                                        <Form onSubmit={handleChangePassword}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Contraseña Actual</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="Ingresa tu contraseña actual"
                                                    required
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Nueva Contraseña</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Mínimo 6 caracteres"
                                                    required
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Repite la nueva contraseña"
                                                    required
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                            <Button
                                                variant="primary"
                                                type="submit"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <Spinner animation="border" size="sm" className="me-2" />
                                                        Cambiando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaSave className="me-2" />
                                                        Cambiar Contraseña
                                                    </>
                                                )}
                                            </Button>
                                        </Form>
                                    </div>
                                </Tab>

                                <Tab eventKey="system" title={
                                    <>
                                        <FaCog className="me-2" />
                                        Sistema
                                    </>
                                }>
                                    <div className="p-3">
                                        <h5>Configuración del Sistema</h5>
                                        <Alert variant="warning">
                                            <strong>Nota:</strong> Esta sección está en desarrollo.
                                        </Alert>
                                        <div className="d-flex gap-2">
                                            <Button variant="outline-secondary">
                                                Exportar Datos
                                            </Button>
                                            <Button variant="outline-secondary">
                                                Importar Datos
                                            </Button>
                                            <Button variant="danger" onClick={handleLogout}>
                                                Cerrar Sesión
                                            </Button>
                                        </div>
                                    </div>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SettingsPage;