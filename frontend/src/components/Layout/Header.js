import React from 'react';
import { Container, Navbar, Nav, Form, FormControl, Button } from 'react-bootstrap';
import { FaSearch, FaUserCircle } from 'react-icons/fa';

const Header = () => {
  return (
    <Navbar bg="white" expand="lg" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand href="#">
          <h5 className="mb-0">Sistema de Gestión de Onboarding</h5>
        </Navbar.Brand>
        
        <Form className="d-flex mx-auto" style={{ width: '400px' }}>
          <FormControl
            type="search"
            placeholder="Buscar colaboradores, eventos..."
            className="me-2"
          />
          <Button variant="outline-primary">
            <FaSearch />
          </Button>
        </Form>
        
        <Nav className="ms-auto">
          <Nav.Link href="#">
            <FaUserCircle size={24} />
            <span className="ms-2">Administrador</span>
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
