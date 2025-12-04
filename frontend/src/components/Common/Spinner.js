import React from 'react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';

const Spinner = ({ message = 'Cargando...' }) => {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
            <BootstrapSpinner animation="border" variant="primary" />
            {message && <p className="mt-3 text-muted">{message}</p>}
        </div>
    );
};

export default Spinner;