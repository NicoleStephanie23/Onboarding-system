import React from 'react';
import { Table, Button, Badge, Dropdown } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCheck, FaEllipsisV } from 'react-icons/fa';

const CollaboratorTable = ({
  collaborators,
  onEdit,
  onDelete,
  onCompleteOnboarding
}) => {
  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Pendiente', variant: 'warning' },
      in_progress: { label: 'En Progreso', variant: 'info' },
      completed: { label: 'Completado', variant: 'success' }
    };

    const { label, variant } = config[status] || { label: status, variant: 'secondary' };

    return <Badge bg={variant}>{label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch (error) {
      return '-';
    }
  };

  const handleAction = (action, ...args) => {
    if (typeof action === 'function') {
      action(...args);
    } else {
      console.error('La acción no es una función');
    }
  };

  return (
    <div className="table-responsive">
      <Table hover responsive className="bg-white shadow-sm">
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>Email</th>
            <th>Fecha Ingreso</th>
            <th>Onboarding Bienvenida</th>
            <th>Onboarding Técnico</th>
            <th>Fecha Técnico</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {collaborators.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4 text-muted">
                No hay colaboradores registrados
              </td>
            </tr>
          ) : (
            collaborators.map((collaborator) => (
              <tr key={collaborator.id}>
                <td>{collaborator.full_name}</td>
                <td>{collaborator.email}</td>
                <td>{formatDate(collaborator.hire_date)}</td>
                <td>{getStatusBadge(collaborator.welcome_onboarding_status)}</td>
                <td>{getStatusBadge(collaborator.technical_onboarding_status)}</td>
                <td>{formatDate(collaborator.technical_onboarding_date)}</td>
                <td>
                  <Dropdown>
                    <Dropdown.Toggle variant="light" size="sm" id={`dropdown-${collaborator.id}`}>
                      <FaEllipsisV />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleAction(onEdit, collaborator)}>
                        <FaEdit className="me-2 text-primary" />
                        <span className="text-primary">Editar</span>
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => handleAction(onCompleteOnboarding, collaborator.id, 'welcome')}
                        disabled={collaborator.welcome_onboarding_status === 'completed'}
                      >
                        <FaCheck className="me-2 text-success" />
                        <span className="text-success">Completar Bienvenida</span>
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => handleAction(onCompleteOnboarding, collaborator.id, 'technical')}
                        disabled={collaborator.technical_onboarding_status === 'completed'}
                      >
                        <FaCheck className="me-2 text-info" />
                        <span className="text-info">Completar Técnico</span>
                      </Dropdown.Item>

                      <Dropdown.Divider />

                      <Dropdown.Item
                        onClick={() => handleAction(onDelete, collaborator.id)}
                      >
                        <FaTrash className="me-2 text-danger" />
                        <span className="text-danger">Eliminar</span>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default CollaboratorTable;