import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Button, Row, Col, Form, Modal,
  Alert, Spinner, Toast, ToastContainer, InputGroup
} from 'react-bootstrap';
import { FaPlus, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import CollaboratorTable from '../components/Collaborators/CollaboratorTable';
import CollaboratorForm from '../components/Collaborators/CollaboratorForm';
import { collaboratorService } from '../services/api';

const CollaboratorsPage = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const loadCollaborators = useCallback(async () => {
    console.log('🔍 Cargando colaboradores...');
    console.log('   Search:', searchTerm);
    console.log('   Status:', statusFilter);

    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      console.log('📤 Parámetros:', params);
      const data = await collaboratorService.getAll(params);
      console.log('✅ Recibidos:', data.length, 'colaboradores');

      setCollaborators(data);
    } catch (err) {
      console.error('❌ Error:', err);
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

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const clearSearch = () => setSearchTerm('');

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

      {/* Filtros */}
      <Row className="mb-4">
        <Col md={8}>
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
        />
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingCollaborator ? 'Editar' : 'Nuevo'} Colaborador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CollaboratorForm
            initialData={editingCollaborator}
            onSubmit={handleSaveCollaborator}
            onCancel={() => setShowModal(false)}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CollaboratorsPage;