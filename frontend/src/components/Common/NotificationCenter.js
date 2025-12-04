import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { notificationService } from '../../services/notificationService';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const unsubscribe = notificationService.subscribe(setNotifications);
        return unsubscribe;
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <FaCheckCircle className="text-success" />;
            case 'warning': return <FaExclamationTriangle className="text-warning" />;
            case 'error': return <FaExclamationTriangle className="text-danger" />;
            default: return <FaInfoCircle className="text-info" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'success': return 'bg-success';
            case 'warning': return 'bg-warning';
            case 'error': return 'bg-danger';
            default: return 'bg-info';
        }
    };

    if (notifications.length === 0) return null;

    return (
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
            {notifications.map((notification) => (
                <Toast
                    key={notification.id}
                    className="mb-2"
                    bg={notification.type}
                    autohide
                    delay={notification.duration}
                    onClose={() => notificationService.removeNotification(notification.id)}
                >
                    <Toast.Header className={`${getBgColor(notification.type)} text-white`}>
                        <strong className="me-auto d-flex align-items-center">
                            {getIcon(notification.type)}
                            <span className="ms-2">{notification.title}</span>
                        </strong>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={() => notificationService.removeNotification(notification.id)}
                            aria-label="Close"
                        />
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        <div style={{ whiteSpace: 'pre-line' }}>
                            {notification.message}
                        </div>
                        <small className="d-block mt-2 opacity-75">
                            {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                    </Toast.Body>
                </Toast>
            ))}
        </ToastContainer>
    );
};

export default NotificationCenter;