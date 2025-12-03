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
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
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
                  <Dropdown.Toggle variant="light" size="sm" id="dropdown-basic">
                    <FaEllipsisV />
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => onEdit(collaborator)}>
                      <FaEdit className="me-2" />
                      Editar
                    </Dropdown.Item>
                    
                    <Dropdown.Item 
                      onClick={() => onCompleteOnboarding(collaborator.id, 'welcome')}
                      disabled={collaborator.welcome_onboarding_status === 'completed'}
                    >
                      <FaCheck className="me-2" />
                      Completar Bienvenida
                    </Dropdown.Item>
                    
                    <Dropdown.Item 
                      onClick={() => onCompleteOnboarding(collaborator.id, 'technical')}
                      disabled={collaborator.technical_onboarding_status === 'completed'}
                    >
                      <FaCheck className="me-2" />
                      Completar Técnico
                    </Dropdown.Item>
                    
                    <Dropdown.Divider />
                    
                    <Dropdown.Item 
                      onClick={() => onDelete(collaborator.id)}
                      className="text-danger"
                    >
                      <FaTrash className="me-2" />
                      Eliminar
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
};

export default CollaboratorTable;
