import React, { useEffect, useState } from 'react';
import { Modal, Button, ProgressBar, Alert } from 'react-bootstrap';
import { FaExclamationTriangle, FaClock, FaUserClock, FaSignOutAlt } from 'react-icons/fa';
import { useTimeout } from '../../contexts/TimeoutContext';

const TimeoutModal = ({ show, onStayLoggedIn, onLogout }) => {
    const { timeLeft } = useTimeout();
    const [localTimeLeft, setLocalTimeLeft] = useState(60);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (show) {
            console.log('⏱️ Modal mostrado, tiempo del contexto:', timeLeft);
            setLocalTimeLeft(timeLeft);
            document.body.style.overflow = 'hidden';
            const localInterval = setInterval(() => {
                setLocalTimeLeft(prev => {
                    const newTime = prev - 1;

                    if (newTime <= 0) {
                        console.log('⏰ Contador local llegó a 0');
                        clearInterval(localInterval);
                        setIsClosing(true);
                        setTimeout(() => {
                            console.log('🔄 Ejecutando logout desde contador local');
                            onLogout();
                        }, 1000);

                        return 0;
                    }

                    if (newTime % 10 === 0 || newTime < 5) {
                        console.log(`⏱️ Contador local: ${newTime}s`);
                    }

                    return newTime;
                });
            }, 1000);

            const handleClickOutside = (e) => {
                const modal = document.getElementById('timeout-modal');
                if (modal && !modal.contains(e.target)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);

            return () => {
                clearInterval(localInterval);
                document.body.style.overflow = '';
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('touchstart', handleClickOutside);
                setIsClosing(false);
            };
        }
    }, [show, timeLeft, onLogout]);

    const handleStay = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        console.log('✅ Usuario hace clic en Continuar');
        onStayLoggedIn();
    };

    const handleLogoutClick = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        console.log('🚪 Usuario hace clic en Cerrar sesión');
        setIsClosing(true);

        setTimeout(() => {
            onLogout();
        }, 800);
    };

    if (!show) return null;
    const displayTime = Math.min(timeLeft || 60, localTimeLeft);
    if (isClosing) {
        return (
            <Modal
                show={show}
                backdrop="static"
                keyboard={false}
                centered
                className="timeout-modal"
                onHide={() => { }}
            >
                <Modal.Header className="bg-danger text-white">
                    <Modal.Title className="d-flex align-items-center">
                        <FaExclamationTriangle className="me-2" />
                        <span>Cerrando sesión</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-5">
                    <div className="spinner-border text-danger mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <h5 className="mb-3">Cerrando sesión por seguridad</h5>
                    <p className="text-muted">
                        Redirigiendo al login...
                    </p>
                </Modal.Body>
            </Modal>
        );
    }

    const progressPercentage = (displayTime / 60) * 100;

    const getTimeColor = () => {
        if (displayTime > 30) return 'text-success';
        if (displayTime > 15) return 'text-warning';
        return 'text-danger animate__animated animate__pulse animate__infinite';
    };

    const getProgressVariant = () => {
        if (displayTime > 30) return "success";
        if (displayTime > 15) return "warning";
        return "danger";
    };

    return (
        <Modal
            show={show}
            backdrop="static"
            keyboard={false}
            centered
            className="timeout-modal"
            onHide={() => { }}
            onClick={(e) => e.stopPropagation()}
        >
            <div id="timeout-modal" onClick={(e) => e.stopPropagation()}>
                <Modal.Header className="bg-warning text-dark">
                    <Modal.Title className="d-flex align-items-center">
                        <FaExclamationTriangle className="me-2" />
                        <span>Sesión por expirar</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <div className="mb-4">
                        <FaUserClock size={64} className="text-warning mb-3" />
                        <h5 className="mb-3">¡ATENCIÓN! Sesión por expirar</h5>

                        <div className="mb-4">
                            <div className={`display-4 mb-2 fw-bold ${getTimeColor()}`} style={{ fontSize: '4rem', fontFamily: 'monospace' }}>
                                {displayTime}
                            </div>
                            <p className="text-muted mb-0">
                                {displayTime === 1 ? 'ÚLTIMO SEGUNDO' : 'segundos restantes'}
                            </p>
                            {displayTime < 10 && (
                                <small className="text-danger fw-bold">
                                    ⚠️ La sesión se cerrará automáticamente
                                </small>
                            )}
                        </div>

                        <Alert variant={displayTime > 15 ? "warning" : "danger"} className="border-3">
                            <div className="d-flex align-items-center">
                                <FaExclamationTriangle className="me-2 flex-shrink-0" />
                                <div>
                                    <strong>POR SEGURIDAD</strong>
                                    <p className="mb-0 small">
                                        {displayTime > 30
                                            ? "La sesión se cerrará por inactividad"
                                            : displayTime > 15
                                                ? "¡Queda poco tiempo! Toma una acción"
                                                : "¡TIEMPO CRÍTICO! La sesión se cerrará en segundos"
                                        }
                                    </p>
                                </div>
                            </div>
                        </Alert>

                        {/* Barra de progreso */}
                        <div className="mt-4">
                            <ProgressBar
                                now={progressPercentage}
                                variant={getProgressVariant()}
                                animated
                                striped
                                className="mb-3"
                                style={{
                                    height: '15px',
                                    borderRadius: '8px',
                                    transition: 'width 1s linear, background-color 1s linear'
                                }}
                            />
                            <div className="d-flex justify-content-between small text-muted fw-bold">
                                <span>60s</span>
                                <span className={displayTime < 15 ? 'text-danger' : ''}>
                                    {displayTime < 10 ? '¡URGENTE!' : 'Tiempo restante'}
                                </span>
                                <span>0s</span>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-center border-top-0 pt-0">
                    <div className="d-flex gap-3">
                        <Button
                            variant={displayTime < 10 ? "danger" : "outline-danger"}
                            onClick={handleLogoutClick}
                            className="px-4 py-3 d-flex align-items-center fw-bold"
                            style={{ minWidth: '200px' }}
                        >
                            <FaSignOutAlt className="me-2" />
                            {displayTime < 10 ? '¡CERRAR AHORA!' : 'Cerrar sesión'}
                        </Button>
                        <Button
                            variant="warning"
                            onClick={handleStay}
                            className="px-4 py-3 d-flex align-items-center fw-bold"
                            style={{ minWidth: '200px' }}
                            autoFocus
                        >
                            <FaClock className="me-2" />
                            Continuar trabajando
                        </Button>
                    </div>
                </Modal.Footer>
            </div>
        </Modal>
    );
};

export default TimeoutModal;