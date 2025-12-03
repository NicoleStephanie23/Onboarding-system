import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { 
  FaUsers, 
  FaCalendarCheck, 
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCollaborators: 0,
    completedOnboardings: 0,
    pendingOnboardings: 0,
    upcomingEvents: 0
  });

  const [recentCollaborators, setRecentCollaborators] = useState([]);

  useEffect(() => {
    // Datos de ejemplo - luego se conectarán a la API
    setStats({
      totalCollaborators: 45,
      completedOnboardings: 28,
      pendingOnboardings: 17,
      upcomingEvents: 3
    });

    setRecentCollaborators([
      { id: 1, name: 'Ana García', email: 'ana@empresa.com', hireDate: '2024-03-01', welcomeStatus: 'completed', technicalStatus: 'in_progress' },
      { id: 2, name: 'Carlos López', email: 'carlos@empresa.com', hireDate: '2024-02-15', welcomeStatus: 'completed', technicalStatus: 'completed' },
      { id: 3, name: 'María Rodríguez', email: 'maria@empresa.com', hireDate: '2024-03-10', welcomeStatus: 'in_progress', technicalStatus: 'pending' },
      { id: 4, name: 'Juan Martínez', email: 'juan@empresa.com', hireDate: '2024-03-05', welcomeStatus: 'pending', technicalStatus: 'pending' },
      { id: 5, name: 'Laura Sánchez', email: 'laura@empresa.com', hireDate: '2024-02-28', welcomeStatus: 'completed', technicalStatus: 'in_progress' }
    ]);
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      'in_progress': 'info',
      completed: 'success'
    };
    
    const labels = {
      pending: 'Pendiente',
      'in_progress': 'En Progreso',
      completed: 'Completado'
    };
    
    return (
      <Badge bg={variants[status]} className="status-badge">
        {labels[status]}
      </Badge>
    );
  };

  const statCards = [
    {
      title: 'Total Colaboradores',
      value: stats.totalCollaborators,
      icon: <FaUsers size={30} />,
      color: 'primary',
      description: 'Colaboradores registrados'
    },
    {
      title: 'Onboardings Completados',
      value: stats.completedOnboardings,
      icon: <FaCheckCircle size={30} />,
      color: 'success',
      description: 'Onboardings finalizados'
    },
    {
      title: 'Onboardings Pendientes',
      value: stats.pendingOnboardings,
      icon: <FaClock size={30} />,
      color: 'warning',
      description: 'Onboardings por completar'
    },
    {
      title: 'Eventos Próximos',
      value: stats.upcomingEvents,
      icon: <FaCalendarCheck size={30} />,
      color: 'info',
      description: 'Próximos 7 días'
    }
  ];

  return (
    <Container fluid>
      <h2 className="mb-4">Dashboard</h2>
      
      {/* Estadísticas */}
      <Row className="mb-4">
        {statCards.map((stat, index) => (
          <Col key={index} xs={12} sm={6} md={3} className="mb-3">
            <Card className="dashboard-card h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className={`text-${stat.color}`}>
                      {stat.value}
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {stat.title}
                    </Card.Subtitle>
                    <Card.Text className="small text-muted">
                      {stat.description}
                    </Card.Text>
                  </div>
                  <div className={`text-${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      <Row>
        {/* Colaboradores Recientes */}
        <Col lg={8} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Colaboradores Recientes</h5>
            </Card.Header>
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Fecha Ingreso</th>
                    <th>Bienvenida</th>
                    <th>Técnico</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCollaborators.map((collaborator) => (
                    <tr key={collaborator.id}>
                      <td>{collaborator.name}</td>
                      <td>{collaborator.email}</td>
                      <td>{collaborator.hireDate}</td>
                      <td>{getStatusBadge(collaborator.welcomeStatus)}</td>
                      <td>{getStatusBadge(collaborator.technicalStatus)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Próximos Eventos */}
        <Col lg={4} className="mb-4">
          <Card className="dashboard-card">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Próximos Eventos</h5>
            </Card.Header>
            <Card.Body>
              <div className="calendar-event">
                <h6>Journey to Cloud</h6>
                <p className="small text-muted mb-1">15-22 Mar 2024</p>
                <Badge bg="info" className="mb-2">Cloud Training</Badge>
                <p className="small mb-0">8 participantes registrados</p>
              </div>
              
              <div className="calendar-event">
                <h6>Onboarding Frontend</h6>
                <p className="small text-muted mb-1">25-29 Mar 2024</p>
                <Badge bg="success" className="mb-2">Frontend</Badge>
                <p className="small mb-0">12 participantes registrados</p>
              </div>
              
              <div className="calendar-event">
                <h6>Onboarding Backend</h6>
                <p className="small text-muted mb-1">5-10 Abr 2024</p>
                <Badge bg="warning" className="mb-2">Backend</Badge>
                <p className="small mb-0">10 participantes registrados</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
