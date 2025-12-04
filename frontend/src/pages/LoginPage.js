import React, { useState, useEffect } from 'react';
import {
    Container, Card, Form, Button,
    Alert, Spinner, Row, Col, Tabs, Tab,
    InputGroup
} from 'react-bootstrap';
import {
    FaUser, FaLock, FaSignInAlt, FaShieldAlt,
    FaExclamationTriangle, FaUserPlus, FaEnvelope, FaIdCard,
    FaEye, FaEyeSlash, FaInfoCircle
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, isAuthenticated, loading } = useAuth();
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginRemember, setLoginRemember] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [registerFullName, setRegisterFullName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
    const [passwordValidations, setPasswordValidations] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('login');
    const [showCredentialsInfo, setShowCredentialsInfo] = useState(false);
    const [inputErrors, setInputErrors] = useState({
        username: false,
        password: false
    });

    useEffect(() => {
        if (isAuthenticated && !loading) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, loading, navigate, location]);

    useEffect(() => {
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            setLoginUsername(savedUsername);
            setLoginRemember(true);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'register') {
            const validations = {
                length: registerPassword.length >= 6,
                uppercase: /[A-Z]/.test(registerPassword),
                lowercase: /[a-z]/.test(registerPassword),
                number: /\d/.test(registerPassword),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(registerPassword)
            };
            setPasswordValidations(validations);
        }
    }, [registerPassword, activeTab]);

    useEffect(() => {
        if (loginError || registerError || success) {
            const timer = setTimeout(() => {
                setLoginError('');
                setRegisterError('');
                setSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [loginError, registerError, success]);

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log('🎯 Iniciando proceso de login...');
        setIsSubmitting(true);
        setLoginError('');
        setRegisterError('');
        setSuccess('');
        setInputErrors({ username: false, password: false });

        const cleanUsername = loginUsername.trim();
        const cleanPassword = loginPassword.trim();

        if (!cleanUsername) {
            setLoginError('Por favor ingresa tu usuario o email');
            setInputErrors(prev => ({ ...prev, username: true }));
            setIsSubmitting(false);
            setTimeout(() => {
                const usernameInput = document.querySelector('input[name="loginUsername"]');
                if (usernameInput) {
                    usernameInput.focus();
                }
            }, 100);
            return;
        }

        if (!cleanPassword) {
            setLoginError('Por favor ingresa tu contraseña');
            setInputErrors(prev => ({ ...prev, password: true }));
            setIsSubmitting(false);
            setTimeout(() => {
                const passwordInput = document.querySelector('input[name="loginPassword"]');
                if (passwordInput) {
                    passwordInput.focus();
                }
            }, 100);
            return;
        }

        if (/^\s+$/.test(loginUsername) || /^\s+$/.test(loginPassword)) {
            setLoginError('Los campos no pueden contener solo espacios en blanco');
            setInputErrors({ username: true, password: true });
            setIsSubmitting(false);
            return;
        }

        try {
            console.log('🔐 Enviando credenciales...');
            const result = await login(cleanUsername, cleanPassword);

            console.log('📊 Resultado del login:', result);

            if (result.success) {
                console.log('✅ Login exitoso!');

                if (loginRemember) {
                    localStorage.setItem('rememberedUsername', cleanUsername);
                } else {
                    localStorage.removeItem('rememberedUsername');
                }

                const from = location.state?.from?.pathname || '/dashboard';
                console.log('🔄 Redirigiendo a:', from);
                navigate(from, { replace: true });

            } else {
                console.log('❌ Login fallido, error recibido:', result.error);
                let errorMsg = 'Usuario no encontrado o contraseña incorrecta';
                let usernameError = false;
                let passwordError = false;

                if (result.error) {
                    const lowerError = result.error.toLowerCase();
                    if (lowerError.includes('usuario') || lowerError.includes('user') || lowerError.includes('encontrado')) {
                        errorMsg = 'Usuario no encontrado';
                        usernameError = true;
                    } else if (lowerError.includes('contraseña') || lowerError.includes('password') || lowerError.includes('incorrecta')) {
                        errorMsg = 'Contraseña incorrecta';
                        passwordError = true;
                    }
                }

                setLoginError(errorMsg);
                setInputErrors({
                    username: usernameError,
                    password: passwordError
                });
                setTimeout(() => {
                    if (usernameError) {
                        const usernameInput = document.querySelector('input[name="loginUsername"]');
                        if (usernameInput) {
                            usernameInput.focus();
                            usernameInput.select();
                        }
                    } else if (passwordError) {
                        const passwordInput = document.querySelector('input[name="loginPassword"]');
                        if (passwordInput) {
                            passwordInput.focus();
                            passwordInput.select();
                        }
                    }
                }, 100);
            }

        } catch (err) {
            console.error('💥 Error capturado en handleLogin:', err);

            let errorMsg = 'Usuario no encontrado o contraseña incorrecta';

            if (err.response) {
                const serverError = err.response.data?.error || err.response.data?.message || '';
                const status = err.response.status;

                if (status === 401 || serverError.toLowerCase().includes('password') || serverError.toLowerCase().includes('contraseña')) {
                    errorMsg = 'Contraseña incorrecta';
                    setInputErrors({ username: false, password: true });
                } else if (status === 404 || serverError.toLowerCase().includes('not found') || serverError.toLowerCase().includes('usuario')) {
                    errorMsg = 'Usuario no encontrado';
                    setInputErrors({ username: true, password: false });
                } else {
                    errorMsg = serverError || `Error del servidor (${status})`;
                }
            } else if (err.request) {
                errorMsg = 'Error de conexión con el servidor. Verifica que el backend esté corriendo.';
            }

            setLoginError(errorMsg);

        } finally {
            console.log('🏁 Finalizando handleLogin');
            setIsSubmitting(false);
        }
    };
    const handleRegister = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setLoginError('');
        setRegisterError('');
        setSuccess('');

        const cleanFullName = registerFullName.trim();
        const cleanEmail = registerEmail.trim();
        const cleanUsername = registerUsername.trim();
        const cleanPassword = registerPassword.trim();
        const cleanConfirmPassword = registerConfirmPassword.trim();

        if (!cleanFullName || !cleanEmail || !cleanUsername || !cleanPassword || !cleanConfirmPassword) {
            setRegisterError('Todos los campos son requeridos');
            setIsSubmitting(false);
            return;
        }

        if (cleanUsername.length < 3) {
            setRegisterError('El nombre de usuario debe tener al menos 3 caracteres');
            setIsSubmitting(false);
            return;
        }

        const passwordValidation = validatePassword(cleanPassword);
        if (!passwordValidation.isValid) {
            setRegisterError(passwordValidation.message);
            setIsSubmitting(false);
            return;
        }

        if (cleanPassword !== cleanConfirmPassword) {
            setRegisterError('Las contraseñas no coinciden');
            setIsSubmitting(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            setRegisterError('Por favor ingresa un email válido');
            setIsSubmitting(false);
            return;
        }

        try {
            console.log('📝 Intentando registro...');

            const result = await register({
                full_name: cleanFullName,
                email: cleanEmail,
                username: cleanUsername,
                password: cleanPassword
            });

            console.log('📊 Resultado registro:', result);

            if (result.success) {
                setSuccess('✅ Cuenta creada exitosamente! Iniciando sesión...');
                setTimeout(() => {
                    const from = location.state?.from?.pathname || '/dashboard';
                    navigate(from, { replace: true });
                }, 2000);

            } else {
                console.log('❌ Registro fallido:', result.error);
                setRegisterError(result.error || 'Error al crear la cuenta');
            }

        } catch (err) {
            console.error('💥 Error en registro:', err);
            setRegisterError('Error de conexión con el servidor');

        } finally {
            setIsSubmitting(false);
        }
    };

    const validatePassword = (password) => {
        const validations = {
            length: password.length >= 6,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        if (!validations.length) {
            return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
        }
        if (!validations.uppercase) {
            return { isValid: false, message: 'La contraseña debe contener al menos una letra mayúscula' };
        }
        if (!validations.lowercase) {
            return { isValid: false, message: 'La contraseña debe contener al menos una letra minúscula' };
        }
        if (!validations.number) {
            return { isValid: false, message: 'La contraseña debe contener al menos un número' };
        }
        if (!validations.special) {
            return { isValid: false, message: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?":{}|<>)' };
        }

        return { isValid: true, message: '' };
    };

    const testBackendConnection = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/health');
            const data = await response.json();

            if (response.ok) {
                alert(`✅ Backend funcionando\nMySQL: ${data.mysql}\nStatus: ${data.status}\nURL: ${response.url}`);
            } else {
                alert(`⚠️ Backend tiene problemas:\n${JSON.stringify(data, null, 2)}`);
            }
        } catch (err) {
            alert('❌ No se puede conectar al backend en http://localhost:5000\n\n' + err.message);
        }
    };

    const testRegisterEndpoint = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'OPTIONS',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                alert('✅ Endpoint /api/auth/register está disponible');
            } else {
                alert(`❌ Endpoint no disponible: ${response.status} ${response.statusText}`);
            }
        } catch (err) {
            alert(`❌ Error probando endpoint: ${err.message}`);
        }
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setLoginError('');
        setRegisterError('');
        setSuccess('');
        setInputErrors({ username: false, password: false });
        setShowCredentialsInfo(false);

        if (key === 'login') {
            setRegisterFullName('');
            setRegisterEmail('');
            setRegisterUsername('');
            setRegisterPassword('');
            setRegisterConfirmPassword('');
        } else {
            setLoginPassword('');
        }

        setTimeout(() => {
            const inputs = document.querySelectorAll('.is-invalid');
            inputs.forEach(input => input.classList.remove('is-invalid'));
        }, 100);
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <div className="login-page" style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
        }}>
            {/* Botones de debug */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                zIndex: 1000
            }}>
                <button
                    onClick={testBackendConnection}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        backdropFilter: 'blur(10px)'
                    }}
                    title="Probar conexión al backend"
                >
                    🔧 Test Backend
                </button>

                <button
                    onClick={testRegisterEndpoint}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: 'rgba(255,165,0,0.3)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        backdropFilter: 'blur(10px)'
                    }}
                    title="Probar endpoint de registro"
                >
                    🔍 Test Register Endpoint
                </button>
            </div>

            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={5}>
                        {/* Mostrar mensajes globales de éxito */}
                        {success && (
                            <Alert
                                variant="success"
                                dismissible
                                onClose={() => setSuccess('')}
                                className="mb-3 animate__animated animate__fadeInDown"
                            >
                                {success}
                            </Alert>
                        )}

                        <Card className="shadow-lg border-0">
                            <Card.Body className="p-4">
                                {/* Logo y título */}
                                <div className="text-center mb-4">
                                    <div className="mb-3">
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            backgroundColor: '#3498db',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto',
                                            color: 'white',
                                            fontSize: '2rem'
                                        }}>
                                            <FaShieldAlt />
                                        </div>
                                    </div>
                                    <h3 className="mb-1">Onboarding System</h3>
                                    <p className="text-muted">Sistema de Gestión de Colaboradores</p>
                                </div>

                                {/* Tabs de Login/Registro */}
                                <Tabs
                                    activeKey={activeTab}
                                    onSelect={handleTabChange}
                                    className="mb-4"
                                    fill
                                    id="login-register-tabs"
                                >
                                    {/* TAB DE LOGIN */}
                                    <Tab eventKey="login" title={
                                        <div className="d-flex align-items-center justify-content-center">
                                            <FaSignInAlt className="me-2" />
                                            <span>Iniciar Sesión</span>
                                        </div>
                                    }>
                                        <div className="pt-3">
                                            <Form onSubmit={handleLogin} id="login-form">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <FaUser className="me-2" />
                                                        Usuario o Email
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="loginUsername"
                                                        placeholder="Ingresa tu usuario o email"
                                                        value={loginUsername}
                                                        onChange={(e) => {
                                                            setLoginUsername(e.target.value);
                                                            setInputErrors(prev => ({ ...prev, username: false }));
                                                            setLoginError('');
                                                        }}
                                                        onBlur={(e) => {
                                                            const value = e.target.value.trim();
                                                            if (value !== loginUsername) {
                                                                setLoginUsername(value);
                                                            }
                                                        }}
                                                        disabled={isSubmitting}
                                                        required
                                                        autoFocus
                                                        className={inputErrors.username ? 'is-invalid border-danger' : ''}
                                                        style={{
                                                            borderWidth: inputErrors.username ? '2px' : '1px'
                                                        }}
                                                    />
                                                    {inputErrors.username && (
                                                        <Form.Text className="text-danger">
                                                            <small>Verifica tu usuario o email</small>
                                                        </Form.Text>
                                                    )}
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <FaLock className="me-2" />
                                                        Contraseña
                                                    </Form.Label>
                                                    <InputGroup>
                                                        <Form.Control
                                                            type={showLoginPassword ? "text" : "password"}
                                                            name="loginPassword"
                                                            placeholder="Ingresa tu contraseña"
                                                            value={loginPassword}
                                                            onChange={(e) => {
                                                                setLoginPassword(e.target.value);
                                                                setInputErrors(prev => ({ ...prev, password: false }));
                                                                setLoginError('');
                                                            }}
                                                            onBlur={(e) => {
                                                                const value = e.target.value.trim();
                                                                if (value !== loginPassword) {
                                                                    setLoginPassword(value);
                                                                }
                                                            }}
                                                            disabled={isSubmitting}
                                                            required
                                                            className={inputErrors.password ? 'is-invalid border-danger' : ''}
                                                            style={{
                                                                borderWidth: inputErrors.password ? '2px' : '1px'
                                                            }}
                                                        />
                                                        <Button
                                                            variant="outline-secondary"
                                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                            disabled={isSubmitting}
                                                            className={inputErrors.password ? 'border-danger' : ''}
                                                            style={{
                                                                borderWidth: inputErrors.password ? '2px' : '1px'
                                                            }}
                                                        >
                                                            {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                                                        </Button>
                                                    </InputGroup>
                                                    {inputErrors.password && (
                                                        <Form.Text className="text-danger">
                                                            <small>Verifica tu contraseña</small>
                                                        </Form.Text>
                                                    )}
                                                </Form.Group>

                                                <Form.Group className="mb-4">
                                                    <Form.Check
                                                        type="checkbox"
                                                        label="Recuérdame"
                                                        checked={loginRemember}
                                                        onChange={(e) => setLoginRemember(e.target.checked)}
                                                        disabled={isSubmitting}
                                                    />
                                                </Form.Group>

                                                {/* MOSTRAR ERRORES DE LOGIN */}
                                                {loginError && (
                                                    <div className="mb-3">
                                                        <Alert
                                                            variant="danger"
                                                            className="py-2 border-danger"
                                                            style={{
                                                                animation: 'shake 0.5s ease-in-out',
                                                                borderLeft: '4px solid #dc3545',
                                                                backgroundColor: 'rgba(220, 53, 69, 0.1)'
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <FaExclamationTriangle className="me-2 text-danger" />
                                                                <div>
                                                                    <strong className="text-danger">Error de autenticación:</strong> {loginError}
                                                                </div>
                                                            </div>
                                                        </Alert>
                                                    </div>
                                                )}

                                                <Button
                                                    variant="primary"
                                                    type="submit"
                                                    className="w-100 mb-3"
                                                    disabled={isSubmitting}
                                                    style={{
                                                        height: '48px',
                                                        marginTop: loginError ? '5px' : '0'
                                                    }}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <Spinner animation="border" size="sm" className="me-2" />
                                                            Iniciando sesión...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaSignInAlt className="me-2" />
                                                            Iniciar Sesión
                                                        </>
                                                    )}
                                                </Button>

                                                {/* Información de ayuda */}
                                                <div className="text-center mt-3">
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="text-decoration-none p-0"
                                                        onClick={() => setShowCredentialsInfo(!showCredentialsInfo)}
                                                    >
                                                        <FaInfoCircle className="me-1" />
                                                        <small>{showCredentialsInfo ? 'Ocultar información' : '¿Problemas para iniciar sesión?'}</small>
                                                    </Button>

                                                    {showCredentialsInfo && (
                                                        <Alert variant="light" className="mt-2 py-2 border">
                                                            <small className="text-muted">
                                                                <strong>⚠️ Recomendaciones:</strong><br />
                                                                • Verifica que no haya espacios al inicio o final<br />
                                                                • Usuario y contraseña son sensibles a mayúsculas/minúsculas<br />
                                                                • Si olvidaste tus credenciales, contacta al administrador
                                                            </small>
                                                        </Alert>
                                                    )}
                                                </div>
                                            </Form>
                                        </div>
                                    </Tab>

                                    {/* TAB DE REGISTRO */}
                                    <Tab eventKey="register" title={
                                        <div className="d-flex align-items-center justify-content-center">
                                            <FaUserPlus className="me-2" />
                                            <span>Crear Cuenta</span>
                                        </div>
                                    }>
                                        <div className="pt-3">
                                            <Form onSubmit={handleRegister}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <FaIdCard className="me-2" />
                                                        Nombre Completo
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Ingresa tu nombre completo"
                                                        value={registerFullName}
                                                        onChange={(e) => setRegisterFullName(e.target.value)}
                                                        onBlur={(e) => {
                                                            const value = e.target.value.trim();
                                                            if (value !== registerFullName) {
                                                                setRegisterFullName(value);
                                                            }
                                                        }}
                                                        disabled={isSubmitting}
                                                        required
                                                        autoFocus
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <FaEnvelope className="me-2" />
                                                        Email
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="ejemplo@correo.com"
                                                        value={registerEmail}
                                                        onChange={(e) => setRegisterEmail(e.target.value)}
                                                        onBlur={(e) => {
                                                            const value = e.target.value.trim();
                                                            if (value !== registerEmail) {
                                                                setRegisterEmail(value);
                                                            }
                                                        }}
                                                        disabled={isSubmitting}
                                                        required
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <FaUser className="me-2" />
                                                        Nombre de Usuario
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Elige un nombre de usuario (mín. 3 caracteres)"
                                                        value={registerUsername}
                                                        onChange={(e) => setRegisterUsername(e.target.value)}
                                                        onBlur={(e) => {
                                                            const value = e.target.value.trim();
                                                            if (value !== registerUsername) {
                                                                setRegisterUsername(value);
                                                            }
                                                        }}
                                                        disabled={isSubmitting}
                                                        required
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <FaLock className="me-2" />
                                                        Contraseña
                                                    </Form.Label>
                                                    <InputGroup>
                                                        <Form.Control
                                                            type={showRegisterPassword ? "text" : "password"}
                                                            placeholder="Mínimo 6 caracteres con mayúscula, minúscula, número y especial"
                                                            value={registerPassword}
                                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                                            disabled={isSubmitting}
                                                            required
                                                        />
                                                        <Button
                                                            variant="outline-secondary"
                                                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                                            disabled={isSubmitting}
                                                        >
                                                            {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                                                        </Button>
                                                    </InputGroup>

                                                    {/* Validaciones de contraseña */}
                                                    <div className="mt-2">
                                                        <small className="d-block mb-1">La contraseña debe contener:</small>
                                                        <div className="d-flex flex-wrap gap-2">
                                                            <span className={`badge ${passwordValidations.length ? 'bg-success' : 'bg-secondary'}`}>
                                                                ✓ 6+ caracteres
                                                            </span>
                                                            <span className={`badge ${passwordValidations.uppercase ? 'bg-success' : 'bg-secondary'}`}>
                                                                ✓ Mayúscula
                                                            </span>
                                                            <span className={`badge ${passwordValidations.lowercase ? 'bg-success' : 'bg-secondary'}`}>
                                                                ✓ Minúscula
                                                            </span>
                                                            <span className={`badge ${passwordValidations.number ? 'bg-success' : 'bg-secondary'}`}>
                                                                ✓ Número
                                                            </span>
                                                            <span className={`badge ${passwordValidations.special ? 'bg-success' : 'bg-secondary'}`}>
                                                                ✓ Carácter especial
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Form.Group>

                                                <Form.Group className="mb-4">
                                                    <Form.Label>
                                                        <FaLock className="me-2" />
                                                        Confirmar Contraseña
                                                    </Form.Label>
                                                    <InputGroup>
                                                        <Form.Control
                                                            type={showRegisterConfirmPassword ? "text" : "password"}
                                                            placeholder="Repite tu contraseña"
                                                            value={registerConfirmPassword}
                                                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                                            onBlur={(e) => {
                                                                const value = e.target.value.trim();
                                                                if (value !== registerConfirmPassword) {
                                                                    setRegisterConfirmPassword(value);
                                                                }
                                                            }}
                                                            disabled={isSubmitting}
                                                            required
                                                        />
                                                        <Button
                                                            variant="outline-secondary"
                                                            onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                                                            disabled={isSubmitting}
                                                        >
                                                            {showRegisterConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                                        </Button>
                                                    </InputGroup>

                                                    {/* Mostrar si las contraseñas coinciden */}
                                                    {registerConfirmPassword && (
                                                        <small className={`mt-1 d-block ${registerPassword === registerConfirmPassword ? 'text-success' : 'text-danger'}`}>
                                                            {registerPassword === registerConfirmPassword
                                                                ? '✓ Las contraseñas coinciden'
                                                                : '✗ Las contraseñas no coinciden'}
                                                        </small>
                                                    )}
                                                </Form.Group>

                                                {/* MOSTRAR ERRORES DE REGISTRO */}
                                                {registerError && (
                                                    <div className="mb-3">
                                                        <Alert
                                                            variant="danger"
                                                            className="py-2 border-danger"
                                                            style={{
                                                                animation: 'shake 0.5s ease-in-out',
                                                                borderLeft: '4px solid #dc3545',
                                                                backgroundColor: 'rgba(220, 53, 69, 0.1)'
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <FaExclamationTriangle className="me-2 text-danger" />
                                                                <div>
                                                                    <strong className="text-danger">Error:</strong> {registerError}
                                                                </div>
                                                            </div>
                                                        </Alert>
                                                    </div>
                                                )}

                                                <Button
                                                    variant="success"
                                                    type="submit"
                                                    className="w-100 mb-3"
                                                    disabled={isSubmitting}
                                                    style={{
                                                        height: '48px',
                                                        marginTop: registerError ? '5px' : '0'
                                                    }}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <Spinner animation="border" size="sm" className="me-2" />
                                                            Creando cuenta...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaUserPlus className="me-2" />
                                                            Crear Cuenta
                                                        </>
                                                    )}
                                                </Button>
                                            </Form>
                                        </div>
                                    </Tab>
                                </Tabs>

                                {/* Mensaje informativo */}
                                <div className="text-center mt-4">
                                    <Alert variant="light" className="py-2 mb-0 border">
                                        <small className="text-muted">
                                            <strong>💡 Nota importante:</strong> Asegúrate de no incluir espacios al inicio o final al ingresar tus credenciales.
                                        </small>
                                    </Alert>
                                </div>

                                {/* Información adicional */}
                                <div className="text-center mt-4">
                                    <p className="small text-muted mb-0">
                                        © 2025 Onboarding System v1.0.0
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Estilos CSS para animación */}
            <style jsx>{`
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                
                .animate__fadeInDown {
                    animation: fadeInDown 0.3s ease-out;
                }
                
                .nav-tabs .nav-link {
                    border: none;
                    color: #6c757d;
                    font-weight: 500;
                    padding: 12px 0;
                    margin: 0 10px;
                }
                
                .nav-tabs .nav-link.active {
                    color: #3498db;
                    border-bottom: 3px solid #3498db;
                    background-color: transparent;
                }
                
                .nav-tabs .nav-link:hover {
                    color: #3498db;
                    border-color: transparent;
                }
                
                .is-invalid {
                    border-color: #dc3545 !important;
                }
                
                .is-invalid:focus {
                    box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25) !important;
                }
                
                .border-danger {
                    border-color: #dc3545 !important;
                }
            `}</style>
        </div>
    );
};

export default LoginPage;