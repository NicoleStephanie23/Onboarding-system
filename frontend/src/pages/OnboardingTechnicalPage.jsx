import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaGraduationCap, FaPlay, FaBook, FaDownload, FaUsers } from 'react-icons/fa';

const OnboardingTechnicalPage = () => {
    const technicalPresentations = [
        {
            id: 1,
            title: 'Introducción a React',
            description: 'Aprende los fundamentos de React para el desarrollo frontend',
            duration: '2 horas',
            level: 'Principiante',
            category: 'Frontend',
            progress: 100,
            completed: true
        },
        {
            id: 2,
            title: 'Node.js Backend Development',
            description: 'Desarrollo de APIs REST con Node.js y Express',
            duration: '3 horas',
            level: 'Intermedio',
            category: 'Backend',
            progress: 65,
            completed: false
        },
        {
            id: 3,
            title: 'Docker para Desarrolladores',
            description: 'Containerización de aplicaciones con Docker',
            duration: '1.5 horas',
            level: 'Intermedio',
            category: 'DevOps',
            progress: 30,
            completed: false
        },
        {
            id: 4,
            title: 'Testing con Jest',
            description: 'Pruebas unitarias y de integración',
            duration: '2 horas',
            level: 'Intermedio',
            category: 'Calidad',
            progress: 0,
            completed: false
        },
        {
            id: 5,
            title: 'Git Avanzado',
            description: 'Flujos de trabajo y mejores prácticas',
            duration: '1.5 horas',
            level: 'Principiante',
            category: 'Herramientas',
            progress: 100,
            completed: true
        },
        {
            id: 6,
            title: 'Microservicios',
            description: 'Arquitectura de microservicios con Node.js',
            duration: '3.5 horas',
            level: 'Avanzado',
            category: 'Arquitectura',
            progress: 10,
            completed: false
        }
    ];

    const categories = ['Frontend', 'Backend', 'DevOps', 'Calidad', 'Herramientas', 'Arquitectura'];

    return (
        <Container fluid>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-1">
                        <FaGraduationCap className="text-primary me-2" />
                        Onboarding Técnico
                    </h1>
                    <p className="text-muted mb-0">
                        Capacitaciones técnicas para el equipo de desarrollo
                    </p>
                </div>
                <div>
                    <Button variant="outline-primary" className="me-2">
                        <FaDownload className="me-2" />
                        Descargar Programa
                    </Button>
                    <Button variant="primary">
                        <FaPlay className="me-2" />
                        Comenzar Curso
                    </Button>
                </div>
            </div>

            {/* Estadísticas */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-primary">{technicalPresentations.length}</h3>
                            <Card.Text>Cursos Disponibles</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-success">
                                {technicalPresentations.filter(p => p.completed).length}
                            </h3>
                            <Card.Text>Cursos Completados</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-warning">
                                {technicalPresentations.filter(p => p.progress > 0 && p.progress < 100).length}
                            </h3>
                            <Card.Text>En Progreso</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-info">
                                {technicalPresentations.filter(p => p.progress === 0).length}
                            </h3>
                            <Card.Text>Por Comenzar</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filtros de categoría */}
            <div className="mb-4">
                <h5 className="mb-3">Filtrar por categoría:</h5>
                <div className="d-flex flex-wrap gap-2">
                    <Badge bg="primary" className="px-3 py-2" style={{ cursor: 'pointer' }}>
                        Todas
                    </Badge>
                    {categories.map(category => (
                        <Badge bg="secondary" className="px-3 py-2" style={{ cursor: 'pointer' }} key={category}>
                            {category}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Lista de presentaciones */}
            <Row>
                {technicalPresentations.map(presentation => (
                    <Col md={6} lg={4} key={presentation.id} className="mb-4">
                        <Card className="h-100">
                            <Card.Header className="bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <Badge bg={
                                        presentation.completed ? 'success' :
                                            presentation.progress > 0 ? 'warning' : 'secondary'
                                    }>
                                        {presentation.completed ? 'Completado' :
                                            presentation.progress > 0 ? 'En Progreso' : 'Pendiente'}
                                    </Badge>
                                    <small className="text-muted">{presentation.duration}</small>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Card.Title>{presentation.title}</Card.Title>
                                <Card.Text className="text-muted">{presentation.description}</Card.Text>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <small>Progreso</small>
                                        <small>{presentation.progress}%</small>
                                    </div>
                                    <div className="progress" style={{ height: '6px' }}>
                                        <div
                                            className={`progress-bar ${presentation.completed ? 'bg-success' : 'bg-primary'
                                                }`}
                                            style={{ width: `${presentation.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <Badge bg="light" text="dark">
                                        <FaBook className="me-1" />
                                        {presentation.category}
                                    </Badge>
                                    <Badge bg="light" text="dark">
                                        {presentation.level}
                                    </Badge>
                                </div>
                            </Card.Body>
                            <Card.Footer className="bg-white">
                                <div className="d-flex justify-content-between">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        disabled={presentation.completed}
                                    >
                                        {presentation.progress === 0 ? 'Comenzar' : 'Continuar'}
                                    </Button>
                                    <Button variant="outline-secondary" size="sm">
                                        <FaDownload />
                                    </Button>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default OnboardingTechnicalPage;