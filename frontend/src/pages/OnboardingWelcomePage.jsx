import React from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup } from 'react-bootstrap';
import { FaHandshake, FaPlay, FaDownload, FaUsers, FaBuilding, FaFileAlt } from 'react-icons/fa';

const OnboardingWelcomePage = () => {
    const welcomePresentations = [
        {
            id: 1,
            title: 'Bienvenida a la Empresa',
            description: 'Introducción a la cultura y valores de la organización',
            duration: '1 hora',
            presenter: 'CEO',
            mandatory: true,
            completed: true
        },
        {
            id: 2,
            title: 'Políticas y Normativas',
            description: 'Manual de políticas internas y código de conducta',
            duration: '45 min',
            presenter: 'Recursos Humanos',
            mandatory: true,
            completed: false
        },
        {
            id: 3,
            title: 'Beneficios y Compensaciones',
            description: 'Información sobre beneficios, vacaciones y seguro médico',
            duration: '30 min',
            presenter: 'Recursos Humanos',
            mandatory: true,
            completed: false
        },
        {
            id: 4,
            title: 'Tour Virtual de la Oficina',
            description: 'Recorrido por las instalaciones y áreas comunes',
            duration: '20 min',
            presenter: 'Facilities',
            mandatory: false,
            completed: false
        },
        {
            id: 5,
            title: 'Presentación del Equipo',
            description: 'Conoce a tus compañeros y líderes de equipo',
            duration: '1 hora',
            presenter: 'Líderes de Equipo',
            mandatory: true,
            completed: false
        },
        {
            id: 6,
            title: 'Herramientas Internas',
            description: 'Introducción a las herramientas y sistemas de la empresa',
            duration: '2 horas',
            presenter: 'IT Department',
            mandatory: true,
            completed: false
        }
    ];

    const onboardingChecklist = [
        { id: 1, task: 'Firmar contrato', completed: true },
        { id: 2, task: 'Configurar email corporativo', completed: true },
        { id: 3, task: 'Acceso a sistemas internos', completed: false },
        { id: 4, task: 'Reunión con manager', completed: false },
        { id: 5, task: 'Configurar equipo de trabajo', completed: false },
        { id: 6, task: 'Primer proyecto asignado', completed: false }
    ];

    return (
        <Container fluid>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-1">
                        <FaHandshake className="text-success me-2" />
                        Onboarding de Bienvenida
                    </h1>
                    <p className="text-muted mb-0">
                        Todo lo que necesitas para unirte exitosamente a nuestra empresa
                    </p>
                </div>
                <div>
                    <Button variant="outline-success" className="me-2">
                        <FaDownload className="me-2" />
                        Descargar Guía
                    </Button>
                    <Button variant="success">
                        <FaPlay className="me-2" />
                        Iniciar Onboarding
                    </Button>
                </div>
            </div>

            <Row>
                {/* Presentaciones */}
                <Col md={8}>
                    <div className="mb-4">
                        <h4 className="mb-3">Sesiones de Bienvenida</h4>
                        <Row>
                            {welcomePresentations.map(presentation => (
                                <Col md={6} key={presentation.id} className="mb-3">
                                    <Card>
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <Card.Title className="mb-0">{presentation.title}</Card.Title>
                                                <Badge bg={presentation.mandatory ? 'warning' : 'secondary'}>
                                                    {presentation.mandatory ? 'Obligatorio' : 'Opcional'}
                                                </Badge>
                                            </div>
                                            <Card.Text className="text-muted small mb-2">
                                                {presentation.description}
                                            </Card.Text>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <small className="text-muted">
                                                        <FaUsers className="me-1" />
                                                        {presentation.presenter}
                                                    </small>
                                                    <small className="text-muted ms-3">
                                                        <FaFileAlt className="me-1" />
                                                        {presentation.duration}
                                                    </small>
                                                </div>
                                                <Button
                                                    variant={presentation.completed ? 'outline-success' : 'primary'}
                                                    size="sm"
                                                >
                                                    {presentation.completed ? 'Completado ✓' : 'Ver Presentación'}
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </Col>

                {/* Sidebar - Checklist y recursos */}
                <Col md={4}>
                    {/* Checklist */}
                    <Card className="mb-4">
                        <Card.Header className="bg-success text-white">
                            <h5 className="mb-0">Checklist de Onboarding</h5>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                {onboardingChecklist.map(item => (
                                    <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                                        <span className={item.completed ? 'text-decoration-line-through' : ''}>
                                            {item.task}
                                        </span>
                                        {item.completed ? (
                                            <Badge bg="success">✓</Badge>
                                        ) : (
                                            <Badge bg="secondary">Pendiente</Badge>
                                        )}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                            <div className="mt-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <small>Progreso</small>
                                    <small>
                                        {onboardingChecklist.filter(i => i.completed).length}/
                                        {onboardingChecklist.length} tareas
                                    </small>
                                </div>
                                <div className="progress" style={{ height: '6px' }}>
                                    <div
                                        className="progress-bar bg-success"
                                        style={{
                                            width: `${(onboardingChecklist.filter(i => i.completed).length / onboardingChecklist.length) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Recursos adicionales */}
                    <Card>
                        <Card.Header className="bg-light">
                            <h5 className="mb-0">Recursos Adicionales</h5>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex align-items-center">
                                    <FaBuilding className="text-primary me-3" />
                                    <div>
                                        <strong>Manual del Empleado</strong>
                                        <div className="text-muted small">PDF - 2.5 MB</div>
                                    </div>
                                    <Button variant="link" className="ms-auto">
                                        <FaDownload />
                                    </Button>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex align-items-center">
                                    <FaFileAlt className="text-success me-3" />
                                    <div>
                                        <strong>Formularios de Ingreso</strong>
                                        <div className="text-muted small">Documentos requeridos</div>
                                    </div>
                                    <Button variant="link" className="ms-auto">
                                        <FaDownload />
                                    </Button>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex align-items-center">
                                    <FaUsers className="text-info me-3" />
                                    <div>
                                        <strong>Directorio de Contactos</strong>
                                        <div className="text-muted small">Equipos y responsables</div>
                                    </div>
                                    <Button variant="link" className="ms-auto">
                                        <FaDownload />
                                    </Button>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OnboardingWelcomePage;