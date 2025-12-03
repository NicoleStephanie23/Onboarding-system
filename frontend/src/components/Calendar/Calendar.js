import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button,
  Badge, Alert
} from 'react-bootstrap';
import {
  FaChevronLeft, FaChevronRight,
  FaCalendarAlt, FaInfoCircle
} from 'react-icons/fa';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const events = [
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
      status: 'active'
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
      status: 'upcoming'
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
      status: 'upcoming'
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
      status: 'upcoming'
    },
    {
      id: 5,
      title: 'Journey to Cloud - Avanzado',
      description: 'Temas avanzados de cloud computing',
      startDate: '2024-05-10',
      endDate: '2024-05-17',
      type: 'journey_to_cloud',
      location: 'Sala de Conferencias B',
      participants: 15,
      color: '#3498db',
      status: 'planned'
    }
  ];

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

  const upcomingEvents = events
    .filter(event => new Date(event.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 3);

  return (
    <Container fluid>
      {/* Header simplificado */}
      <div className="mb-4">
        <h2 className="mb-1">
          <FaCalendarAlt className="text-primary me-2" />
          Calendario de Onboardings Técnicos
        </h2>
        <p className="text-muted mb-0">
          Visualización de sesiones activas (5-7 días por bloque)
        </p>
      </div>

      <Row>
        {/* Calendario Principal - Toda la pantalla */}
        <Col lg={12}>
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
              {/* Días de la semana */}
              <div className="calendar-weekdays mb-2">
                {weekDays.map(day => (
                  <div key={day} className="calendar-weekday text-center fw-bold text-muted">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
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
                              title={`${event.title} (${event.location})`}
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

          {/* Próximos Eventos (debajo del calendario) */}
          <Card className="mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Próximos Eventos</h5>
            </Card.Header>
            <Card.Body>
              {upcomingEvents.length === 0 ? (
                <Alert variant="info" className="mb-0">
                  No hay eventos programados para las próximas semanas.
                </Alert>
              ) : (
                <div className="upcoming-events-grid">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="upcoming-event p-3 border rounded">
                      <div className="d-flex align-items-start mb-2">
                        <div
                          className="event-color-indicator me-3"
                          style={{
                            backgroundColor: event.color,
                            width: '12px',
                            height: '40px',
                            borderRadius: '4px'
                          }}
                        ></div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{event.title}</h6>
                          <p className="text-muted small mb-2">{event.description}</p>
                          <div className="d-flex flex-wrap gap-3">
                            <small className="text-muted">
                              <FaCalendarAlt className="me-1" />
                              {new Date(event.startDate).toLocaleDateString()} -
                              {new Date(event.endDate).toLocaleDateString()}
                            </small>
                            <small className="text-muted">
                              📍 {event.location}
                            </small>
                            <small className="text-muted">
                              👥 {event.participants} participantes
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

          {/* Estadísticas simplificadas */}
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FaInfoCircle className="text-primary me-2" />
                Resumen de Onboardings
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="stats-grid">
                <div className="stat-item text-center p-3">
                  <h3 className="text-primary mb-1">{events.length}</h3>
                  <small className="text-muted">Total Programados</small>
                </div>
                <div className="stat-item text-center p-3">
                  <h3 className="text-success mb-1">
                    {events.filter(e => e.type === 'journey_to_cloud').length}
                  </h3>
                  <small className="text-muted">Journey to Cloud</small>
                </div>
                <div className="stat-item text-center p-3">
                  <h3 className="text-warning mb-1">
                    {events.filter(e => e.type === 'chapter_technical').length}
                  </h3>
                  <small className="text-muted">Capítulos Técnicos</small>
                </div>
                <div className="stat-item text-center p-3">
                  <h3 className="text-info mb-1">
                    {events.filter(e => e.status === 'active' || e.status === 'upcoming').length}
                  </h3>
                  <small className="text-muted">Activos/Próximos</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estilos CSS */}
      <style jsx>{`
        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
          margin-bottom: 10px;
        }
        
        .calendar-weekday {
          padding: 10px 5px;
          background-color: #f8f9fa;
          border-radius: 6px;
          font-size: 0.9rem;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background-color: #dee2e6;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          overflow: hidden;
          min-height: 500px;
        }
        
        .calendar-day {
          background-color: white;
          min-height: 100px;
          padding: 10px;
          position: relative;
          transition: background-color 0.2s;
        }
        
        .calendar-day.empty {
          background-color: #f8f9fa;
        }
        
        .calendar-day.today {
          background-color: #e7f3ff;
          border: 2px solid #0d6efd;
        }
        
        .calendar-day.has-events {
          background-color: #f0f9ff;
        }
        
        .calendar-day:hover {
          background-color: #f8f9fa;
        }
        
        .calendar-day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .calendar-day-number {
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        .today-badge {
          background-color: #0d6efd;
          color: white;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
        }
        
        .today-label {
          font-size: 0.7rem;
          background-color: #0d6efd;
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 500;
        }
        
        .calendar-events {
          margin-top: 8px;
        }
        
        .calendar-event-badge {
          font-size: 0.75rem;
          padding: 4px 8px;
          margin-bottom: 4px;
          border-radius: 4px;
          color: white;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: default;
          font-weight: 500;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        
        .stat-item {
          background-color: #f8f9fa;
          border-radius: 10px;
          transition: all 0.2s;
          border: 1px solid #e9ecef;
        }
        
        .stat-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          background-color: white;
        }
        
        .stat-item h3 {
          margin: 0;
          font-weight: bold;
          font-size: 2rem;
        }
        
        .upcoming-events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
        }
        
        .upcoming-event {
          background-color: #f8f9fa;
          transition: all 0.2s;
        }
        
        .upcoming-event:hover {
          background-color: #e9ecef;
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .calendar-grid {
            min-height: 400px;
          }
          
          .calendar-day {
            min-height: 80px;
            padding: 5px;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .upcoming-events-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Container>
  );
};

export default CalendarPage;