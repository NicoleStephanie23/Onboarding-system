import React, { useState } from 'react';
import { Card, Table } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Calendar = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = months[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];
  const startingDay = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    days.push({
      day: i,
      date: dayDate,
      events: events.filter(event => {
        const eventDate = new Date(event.start_date);
        return eventDate.getDate() === i &&
          eventDate.getMonth() === currentDate.getMonth() &&
          eventDate.getFullYear() === currentDate.getFullYear();
      })
    });
  }

  return (
    <div className="calendar-container">
      {/* Header del calendario */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">
          {monthName} {year}
        </h4>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={prevMonth}>
            <FaChevronLeft />
          </button>
          <button className="btn btn-outline-secondary" onClick={nextMonth}>
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Tabla del calendario */}
      <Table bordered className="calendar-table">
        <thead>
          <tr>
            {weekDays.map(day => (
              <th key={day} className="text-center bg-light">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
            <tr key={weekIndex}>
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const dayData = days[weekIndex * 7 + dayIndex];

                if (!dayData) {
                  return <td key={dayIndex} className="calendar-day empty"></td>;
                }

                const isToday = dayData.date.toDateString() === new Date().toDateString();
                const hasEvents = dayData.events.length > 0;

                return (
                  <td
                    key={dayIndex}
                    className={`calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}`}
                  >
                    <div className="calendar-day-header">
                      <span className={`calendar-day-number ${isToday ? 'bg-primary text-white' : ''}`}>
                        {dayData.day}
                      </span>
                    </div>

                    {hasEvents && (
                      <div className="calendar-events">
                        {dayData.events.slice(0, 2).map((event, idx) => (
                          <div
                            key={idx}
                            className={`calendar-event-badge ${event.type}`}
                            title={event.title}
                          >
                            {event.title.length > 10 ? event.title.substring(0, 10) + '...' : event.title}
                          </div>
                        ))}
                        {dayData.events.length > 2 && (
                          <div className="calendar-more-events">
                            +{dayData.events.length - 2} más
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Table>

      <style jsx>{`
        .calendar-table {
          min-height: 400px;
        }
        .calendar-day {
          height: 100px;
          vertical-align: top;
          padding: 5px;
        }
        .calendar-day.empty {
          background-color: #f8f9fa;
        }
        .calendar-day.today {
          background-color: #e7f3ff;
        }
        .calendar-day.has-events {
          background-color: #f0f9ff;
        }
        .calendar-day-number {
          display: inline-block;
          width: 30px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          border-radius: 50%;
          font-weight: bold;
        }
        .calendar-events {
          margin-top: 5px;
        }
        .calendar-event-badge {
          font-size: 0.7rem;
          padding: 2px 5px;
          margin-bottom: 2px;
          border-radius: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
        }
        .calendar-event-badge.journey_to_cloud {
          background-color: #3498db;
          color: white;
        }
        .calendar-event-badge.chapter_technical {
          background-color: #2ecc71;
          color: white;
        }
        .calendar-event-badge.other {
          background-color: #95a5a6;
          color: white;
        }
        .calendar-more-events {
          font-size: 0.7rem;
          color: #7f8c8d;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Calendar;
