import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const CollaboratorForm = ({ initialData, onSubmit, onCancel, saving }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    hire_date: new Date(),
    welcome_onboarding_status: 'pending',
    technical_onboarding_status: 'pending',
    technical_onboarding_date: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      console.log('📋 Datos iniciales para edición:', initialData);

      const data = {
        ...initialData,
        hire_date: initialData.hire_date ? new Date(initialData.hire_date) : new Date(),
        technical_onboarding_date: initialData.technical_onboarding_date
          ? new Date(initialData.technical_onboarding_date)
          : null
      };
      console.log('📋 Datos procesados para formulario:', data);
      setFormData(data);
    } else {
      setFormData({
        full_name: '',
        email: '',
        hire_date: new Date(),
        welcome_onboarding_status: 'pending',
        technical_onboarding_status: 'pending',
        technical_onboarding_date: null
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleDateChange = (date, field) => {
    console.log(`📅 Cambio fecha ${field}:`, date);
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'El nombre es requerido';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.hire_date) {
      newErrors.hire_date = 'La fecha de ingreso es requerida';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📤 Enviando formulario...');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      console.log('❌ Errores de validación:', validationErrors);
      setErrors(validationErrors);
      return;
    }

    const submitData = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      hire_date: formData.hire_date
        ? formData.hire_date.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      welcome_onboarding_status: formData.welcome_onboarding_status,
      technical_onboarding_status: formData.technical_onboarding_status,
      technical_onboarding_date: formData.technical_onboarding_date
        ? formData.technical_onboarding_date.toISOString().split('T')[0]
        : null
    };

    console.log('📤 Datos a enviar al backend:', submitData);
    onSubmit(submitData);
  };

  return (
    <Form onSubmit={handleSubmit} id="collaborator-form">
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre Completo *</Form.Label>
            <Form.Control
              type="text"
              name="full_name"
              value={formData.full_name || ''}
              onChange={handleChange}
              isInvalid={!!errors.full_name}
              placeholder="Ej: Juan Pérez"
              disabled={saving}
            />
            <Form.Control.Feedback type="invalid">
              {errors.full_name}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Email *</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              isInvalid={!!errors.email}
              placeholder="ejemplo@empresa.com"
              disabled={saving}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Fecha de Ingreso *</Form.Label>
            <div>
              <DatePicker
                selected={formData.hire_date}
                onChange={(date) => handleDateChange(date, 'hire_date')}
                dateFormat="dd/MM/yyyy"
                className={`form-control ${errors.hire_date ? 'is-invalid' : ''}`}
                placeholderText="Seleccionar fecha"
                disabled={saving}
              />
            </div>
            {errors.hire_date && (
              <div className="text-danger small">{errors.hire_date}</div>
            )}
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Fecha Onboarding Técnico (Opcional)</Form.Label>
            <div>
              <DatePicker
                selected={formData.technical_onboarding_date}
                onChange={(date) => handleDateChange(date, 'technical_onboarding_date')}
                dateFormat="dd/MM/yyyy"
                className="form-control"
                placeholderText="Seleccionar fecha"
                isClearable
                disabled={saving}
              />
            </div>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Estado Onboarding Bienvenida</Form.Label>
            <Form.Select
              name="welcome_onboarding_status"
              value={formData.welcome_onboarding_status || 'pending'}
              onChange={handleChange}
              disabled={saving}
            >
              <option value="pending">Pendiente</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completado</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Estado Onboarding Técnico</Form.Label>
            <Form.Select
              name="technical_onboarding_status"
              value={formData.technical_onboarding_status || 'pending'}
              onChange={handleChange}
              disabled={saving}
            >
              <option value="pending">Pendiente</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completado</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {initialData ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            <>
              {initialData ? 'Actualizar' : 'Crear'} Colaborador
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};

export default CollaboratorForm;