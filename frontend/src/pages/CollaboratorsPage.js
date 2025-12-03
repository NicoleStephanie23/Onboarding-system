import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Button, Row, Col, Form, Modal,
  Alert, Spinner, Toast, ToastContainer, InputGroup
} from 'react-bootstrap';
import { FaPlus, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import CollaboratorTable from '../components/Collaborators/CollaboratorTable';
import CollaboratorForm from '../components/Collaborators/CollaboratorForm';
import { collaboratorService } from '../services/api';

const CollaboratorsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState(null);
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(queryParams.get('statusFilter') || 'all');

  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    const search = queryParams.get('search');
    const status = queryParams.get('statusFilter');

    if (search !== null) setSearchTerm(search);
    if (status !== null) setStatusFilter(status);

    const action = queryParams.get('action');
    if (action === 'new') {
      setShowModal(true);
      const newParams = new URLSearchParams(queryParams);
      newParams.delete('action');
      navigate({ search: newParams.toString() }, { replace: true });
    }
  }, [location.search, navigate]);

  const loadCollaborators = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const data = await collaboratorService.getAll(params);
      setCollaborators(data);
    } catch (err) {
      setError(err.message || 'Error al cargar colaboradores');
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCollaborators();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, loadCollaborators]);

  const updateURLParams = (newSearch, newStatus) => {
    const params = new URLSearchParams();

    if (newSearch) params.set('search', newSearch);
    if (newStatus && newStatus !== 'all') params.set('statusFilter', newStatus);

    navigate({ search: params.toString() });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateURLParams(value, statusFilter);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    updateURLParams(searchTerm, value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    updateURLParams('', statusFilter);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    navigate({ search: '' });
  };

  const handleSaveCollaborator = async (formData) => {
    try {
      if (editingCollaborator) {
        await collaboratorService.update(editingCollaborator.id, formData);
        setToast({ show: true, message: '✅ Actualizado', variant: 'success' });
      } else {
        await collaboratorService.create(formData);
        setToast({ show: true, message: '✅ Creado', variant: 'success' });
      }
      setShowModal(false);
      setEditingCollaborator(null);
      loadCollaborators();
    } catch (err) {
      setToast({ show: true, message: '❌ Error', variant: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este colaborador?')) {
      try {
        await collaboratorService.delete(id);
        setToast({ show: true, message: '✅ Eliminado', variant: 'success' });
        loadCollaborators();
      } catch (err) {
        setToast({ show: true, message: '❌ Error', variant: 'danger' });
      }
    }
  };

  const handleCompleteOnboarding = async (id, type) => {
    if (window.confirm(`¿Marcar onboarding ${type} como completado?`)) {
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
          message: `❌ Error al completar onboarding ${type}`,
          variant: 'danger'
        });
      }
    }
  };

  return (
    <Container fluid>
      {/* Toast */}
      <ToastContainer position="top-end">
        <Toast show={toast.show} onClose={() => setToast({ ...toast, show: false })} delay={3000} autohide>
          <Toast.Body className={`text-white bg-${toast.variant}`}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Colaboradores</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Nuevo
        </Button>
      </div>

      {/* Filtros SIMPLIFICADOS */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <Button variant="outline-secondary" onClick={clearSearch}>×</Button>
            )}
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select value={statusFilter} onChange={handleStatusChange}>
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="in_progress">En progreso</option>
            <option value="completed">Completados</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          {(searchTerm || statusFilter !== 'all') && (
            <Button variant="outline-secondary" onClick={clearAllFilters} className="w-100">
              Limpiar filtros
            </Button>
          )}
        </Col>
      </Row>

      {/* Error */}
      {error && (
        <Alert variant="danger" className="mb-3">
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Cargando...</p>
        </div>
      ) : collaborators.length === 0 ? (
        <Alert variant="info" className="text-center py-4">
          No hay colaboradores
          {searchTerm && ` para "${searchTerm}"`}
          {statusFilter !== 'all' && ` con estado "${statusFilter}"`}
        </Alert>
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

      {/* Modal */}
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setEditingCollaborator(null);
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingCollaborator ? 'Editar' : 'Nuevo'} Colaborador</Modal.Title>
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