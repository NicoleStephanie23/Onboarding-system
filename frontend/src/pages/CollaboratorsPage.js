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
  const [saving, setSaving] = useState(false);
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

      console.log('🔍 Cargando colaboradores con filtros:', params);
      const data = await collaboratorService.getAll(params);
      console.log(`✅ ${data.length} colaboradores cargados`);
      setCollaborators(data);
    } catch (err) {
      console.error('❌ Error al cargar colaboradores:', err);
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
      setSaving(true);
      console.log('📝 Guardando colaborador...', formData);

      let savedCollaborator;

      if (editingCollaborator) {
        console.log('✏️ Actualizando colaborador existente:', editingCollaborator.id);
        await collaboratorService.update(editingCollaborator.id, formData);
        setToast({ show: true, message: '✅ Colaborador actualizado exitosamente', variant: 'success' });
      } else {
        console.log('➕ Creando nuevo colaborador');
        savedCollaborator = await collaboratorService.create(formData);
        console.log('✅ Colaborador creado:', savedCollaborator);
        setToast({ show: true, message: '✅ Colaborador creado exitosamente', variant: 'success' });
      }

      setShowModal(false);
      setEditingCollaborator(null);
      setTimeout(() => {
        loadCollaborators();
      }, 500);

    } catch (err) {
      console.error('❌ Error al guardar colaborador:', err);

      let errorMessage = '❌ Error al guardar el colaborador';

      if (err.error) {
        if (err.error.includes('email') || err.error.includes('Email')) {
          errorMessage = '❌ El email ya está registrado';
        } else if (err.error.includes('requeridos')) {
          errorMessage = `❌ ${err.error}`;
        } else {
          errorMessage = `❌ ${err.error}`;
        }
      } else if (err.message) {
        errorMessage = `❌ ${err.message}`;
      }

      setToast({
        show: true,
        message: errorMessage,
        variant: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este colaborador?')) {
      try {
        await collaboratorService.delete(id);
        setToast({ show: true, message: '✅ Colaborador eliminado', variant: 'success' });
        setTimeout(() => {
          loadCollaborators();
        }, 500);

      } catch (err) {
        console.error('❌ Error eliminando colaborador:', err);
        setToast({
          show: true,
          message: err.error || '❌ Error al eliminar colaborador',
          variant: 'danger'
        });
      }
    }
  };

  const handleCompleteOnboarding = async (id, type) => {
    const typeName = type === 'welcome' ? 'bienvenida' : 'técnico';

    if (window.confirm(`¿Marcar onboarding de ${typeName} como completado?`)) {
      try {
        await collaboratorService.completeOnboarding(id, type);
        setToast({
          show: true,
          message: `✅ Onboarding de ${typeName} completado`,
          variant: 'success'
        });

        setTimeout(() => {
          loadCollaborators();
        }, 500);

      } catch (err) {
        console.error(`❌ Error completando onboarding ${type}:`, err);
        setToast({
          show: true,
          message: err.error || `❌ Error al completar onboarding de ${typeName}`,
          variant: 'danger'
        });
      }
    }
  };

  return (
    <Container fluid>
      {/* Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={5000}
          autohide
          bg={toast.variant}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Sistema de Onboarding</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Colaboradores</h2>
          <p className="text-muted mb-0">
            Total: {collaborators.length} colaborador{collaborators.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Nuevo Colaborador
        </Button>
      </div>

      {/* Filtros */}
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

      {/* Mensaje de error */}
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
          <p className="mt-2">Cargando colaboradores...</p>
        </div>
      ) : collaborators.length === 0 ? (
        <Alert variant="info" className="text-center py-4">
          <h5>No hay colaboradores</h5>
          <p className="mb-0">
            {searchTerm && `No se encontraron resultados para "${searchTerm}"`}
            {statusFilter !== 'all' && ` con estado "${statusFilter}"`}
            {!searchTerm && statusFilter === 'all' && 'Comienza agregando un nuevo colaborador'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button
              variant="primary"
              className="mt-3"
              onClick={() => setShowModal(true)}
            >
              <FaPlus className="me-2" /> Agregar Primer Colaborador
            </Button>
          )}
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

      {/* Modal para crear/editar colaborador - SIN FOOTER DUPLICADO */}
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
            saving={saving}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CollaboratorsPage;