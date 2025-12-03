import React, { useState, useEffect } from 'react';
import {
  Container, Button, Row, Col, Form, Modal,
  Alert, Spinner, Toast, ToastContainer
} from 'react-bootstrap';
import { FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import CollaboratorTable from '../components/Collaborators/CollaboratorTable';
import CollaboratorForm from '../components/Collaborators/CollaboratorForm';
import { collaboratorService } from '../services/api';

const CollaboratorsPage = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const loadCollaborators = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await collaboratorService.getAll({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });

      setCollaborators(data);

    } catch (err) {
      console.error('Error cargando colaboradores:', err);
      setError(err.message || 'Error al cargar colaboradores');
      setCollaborators([]);
      setToast({
        show: true,
        message: err.message || 'Error de conexión',
        variant: 'danger'
      });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollaborators();
  }, [searchTerm, statusFilter]);

  const handleSaveCollaborator = async (formData) => {
    try {
      if (editingCollaborator) {
        await collaboratorService.update(editingCollaborator.id, formData);
        setToast({
          show: true,
          message: '✅ Colaborador actualizado correctamente',
          variant: 'success'
        });
      } else {
        await collaboratorService.create(formData);
        setToast({
          show: true,
          message: '✅ Colaborador creado correctamente',
          variant: 'success'
        });
      }

      setShowModal(false);
      setEditingCollaborator(null);
      loadCollaborators();

    } catch (err) {
      console.error('Error guardando colaborador:', err);
      setToast({
        show: true,
        message: err.message || 'Error al guardar colaborador',
        variant: 'danger'
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este colaborador?')) {
      try {
        await collaboratorService.delete(id);
        setToast({
          show: true,
          message: '✅ Colaborador eliminado',
          variant: 'success'
        });
        loadCollaborators();
      } catch (err) {
        setToast({
          show: true,
          message: err.message || 'Error al eliminar',
          variant: 'danger'
        });
      }
    }
  };

  const handleCompleteOnboarding = async (id, type) => {
    try {
      await collaboratorService.completeOnboarding(id, type);
      setToast({
        show: true,
        message: `✅ Onboarding ${type} completado`,
        variant: 'success'
      });
      loadCollaborators();
    } catch (err) {
      setToast({
        show: true,
        message: err.message || 'Error al completar onboarding',
        variant: 'danger'
      });
    }
  };

  return (
    <Container fluid>
      {/* Toast para notificaciones */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={5000}
          autohide
          bg={toast.variant}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toast.variant === 'success' ? '✅ Éxito' : '❌ Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Colaboradores</h2>
        <Button variant="primary" onClick={() => {
          setEditingCollaborator(null);
          setShowModal(true);
        }}>
          <FaPlus className="me-2" />
          Nuevo Colaborador
        </Button>
      </div>

      {/* Filtros */}
      <Row className="mb-4">
        <Col md={8}>
          <Form.Group>
            <div className="input-group">
              <span className="input-group-text">
                🔍
              </span>
              <Form.Control
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="in_progress">En progreso</option>
            <option value="completed">Completados</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Mensajes de error/éxito */}
      {error && (
        <Alert variant="danger" className="mb-3">
          <FaExclamationTriangle className="me-2" />
          {error}
          <div className="mt-2">
            <Button variant="outline-danger" size="sm" onClick={loadCollaborators}>
              Reintentar
            </Button>
          </div>
        </Alert>
      )}

      {/* Contenido principal */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Cargando colaboradores...</p>
        </div>
      ) : collaborators.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No hay colaboradores registrados</p>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <FaPlus className="me-2" />
            Agregar primer colaborador
          </Button>
        </div>
      ) : (
        <CollaboratorTable
          collaborators={collaborators}
          onEdit={(collaborator) => {
            setEditingCollaborator(collaborator);
            setShowModal(true);
          }}
          onDelete={handleDelete}
          onCompleteOnboarding={handleCompleteOnboarding}
        />
      )}

      {/* Modal de formulario */}
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setEditingCollaborator(null);
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCollaborator ? 'Editar Colaborador' : 'Nuevo Colaborador'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CollaboratorForm
            initialData={editingCollaborator}
            onSubmit={handleSaveCollaborator}
            onCancel={() => {
              setShowModal(false);
              setEditingCollaborator(null);
            }}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CollaboratorsPage;
