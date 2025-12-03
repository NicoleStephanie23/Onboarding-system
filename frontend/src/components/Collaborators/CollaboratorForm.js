import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const CollaboratorForm = ({ initialData, onSubmit, onCancel }) => {
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
      const data = {
        ...initialData,
        hire_date: initialData.hire_date ? new Date(initialData.hire_date) : new Date(),
        technical_onboarding_date: initialData.technical_onboarding_date
          ? new Date(initialData.technical_onboarding_date)
          : null
      };
      setFormData(data);
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
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
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

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const submitData = {
      ...formData,
      hire_date: formData.hire_date.toISOString().split('T')[0],
      technical_onboarding_date: formData.technical_onboarding_date
        ? formData.technical_onboarding_date.toISOString().split('T')[0]
        : null
    };

    onSubmit(submitData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre Completo *</Form.Label>
            <Form.Control
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              isInvalid={!!errors.full_name}
              placeholder="Ej: Juan Pérez"
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
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              placeholder="ejemplo@empresa.com"
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
                className="form-control"
                isInvalid={!!errors.hire_date}
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
              value={formData.welcome_onboarding_status}
              onChange={handleChange}
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
              value={formData.technical_onboarding_status}
              onChange={handleChange}
            >
              <option value="pending">Pendiente</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completado</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {initialData ? 'Actualizar' : 'Crear'} Colaborador
        </Button>
      </div>
    </Form>
  );
};

export default CollaboratorForm;
