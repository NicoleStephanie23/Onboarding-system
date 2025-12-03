import React from 'react';
import { Spinner, Alert, Button, Card } from 'react-bootstrap';
import { FaExclamationTriangle, FaSync } from 'react-icons/fa';

const LoadingError = ({ loading, error, onRetry, children }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger">
        <Card.Body className="text-center">
          <FaExclamationTriangle size={48} className="text-danger mb-3" />
          <Card.Title>Error al cargar datos</Card.Title>
          <Card.Text className="text-muted">
            {error}
          </Card.Text>
          {onRetry && (
            <Button variant="outline-danger" onClick={onRetry}>
              <FaSync className="me-2" />
              Reintentar
            </Button>
          )}
        </Card.Body>
      </Card>
    );
  }

  return children;
};

export default LoadingError;
