import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

const TimeoutContext = createContext();

export const useTimeout = () => useContext(TimeoutContext);

export const TimeoutProvider = ({ children }) => {
    const [showWarning, setShowWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const logoutTimerRef = useRef(null);
    const warningTimerRef = useRef(null);
    const countdownRef = useRef(null);
    const [isActive, setIsActive] = useState(true);
    const logoutExecutedRef = useRef(false);
    const WARNING_TIME = 10 * 1000;
    const LOGOUT_AFTER_WARNING = 60 * 1000;

    const clearAllTimers = useCallback(() => {
        console.log('🧹 Limpiando todos los timers de seguridad');

        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
            warningTimerRef.current = null;
        }

        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
            logoutTimerRef.current = null;
        }

        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }

        setTimeLeft(60);
        logoutExecutedRef.current = false;
    }, []);

    const startCountdown = useCallback(() => {
        console.log('⏱️ Iniciando contador regresivo de 60 segundos');

        if (countdownRef.current) {
            clearInterval(countdownRef.current);
        }

        setTimeLeft(60);
        logoutExecutedRef.current = false;

        countdownRef.current = setInterval(() => {
            setTimeLeft(prev => {
                const newTime = prev - 1;
                console.log(`⏱️ Contador: ${prev} → ${newTime}`);

                if (newTime <= 0) {
                    console.log('⏰ Contador llegó a 0 - Deteniendo intervalo');
                    clearInterval(countdownRef.current);
                    return 0;
                }
                return newTime;
            });
        }, 1000);
    }, []);

    const executeLogout = useCallback(() => {
        if (logoutExecutedRef.current) {
            console.log('⚠️ Logout ya fue ejecutado, ignorando...');
            return;
        }

        logoutExecutedRef.current = true;
        console.log('🚪 EJECUTANDO LOGOUT AUTOMÁTICO');

        clearAllTimers();
        setShowWarning(false);

        const itemsToRemove = [
            'auth', 'user', 'token', 'selectedEvent', 'events',
            'calendarEvents', 'onboardingData', 'session', 'refreshToken'
        ];

        itemsToRemove.forEach(item => {
            localStorage.removeItem(item);
            sessionStorage.removeItem(item);
        });
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('event_') || key.startsWith('calendar_') || key.startsWith('onboarding_')) {
                localStorage.removeItem(key);
            }
        });

        document.cookie.split(";").forEach(c => {
            const cookie = c.trim();
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        });

        console.log('🔀 Redirigiendo a login en 100ms...');
        setTimeout(() => {
            window.location.href = '/login';

            setTimeout(() => {
                if (window.location.pathname !== '/login') {
                    console.log('🔄 Forzando recarga...');
                    window.location.reload();
                }
            }, 300);
        }, 100);
    }, [clearAllTimers]);

    const handleLogout = useCallback(() => {
        executeLogout();
    }, [executeLogout]);

    const resetTimers = useCallback(() => {
        console.log('🔄 Reseteando timers de inactividad');

        clearAllTimers();

        if (!showWarning) {
            warningTimerRef.current = setTimeout(() => {
                console.log('⚠️ Mostrando modal de advertencia');
                setShowWarning(true);
                startCountdown();

                logoutTimerRef.current = setTimeout(() => {
                    console.log('⏰ Timer de backup - Ejecutando logout');
                    executeLogout();
                }, LOGOUT_AFTER_WARNING);
            }, WARNING_TIME);
        }
    }, [showWarning, clearAllTimers, WARNING_TIME, LOGOUT_AFTER_WARNING, startCountdown, executeLogout]);

    const handleStayLoggedIn = useCallback(() => {
        console.log('✅ Usuario continúa trabajando - Reseteando timers');
        setShowWarning(false);
        resetTimers();
    }, [resetTimers]);

    useEffect(() => {
        console.log(`🔍 Efecto timeLeft: ${timeLeft}, showWarning: ${showWarning}`);

        if (timeLeft === 0 && showWarning && !logoutExecutedRef.current) {
            const logoutTimeout = setTimeout(() => {
                console.log('⏰ Ejecutando logout por contador agotado');
                executeLogout();
            }, 500);

            return () => clearTimeout(logoutTimeout);
        }
    }, [timeLeft, showWarning, executeLogout]);

    useEffect(() => {
        if (timeLeft < 10 && showWarning) {
            console.log(`🚨 ÚLTIMOS SEGUNDOS: ${timeLeft}`);
        }
    }, [timeLeft, showWarning]);
    useEffect(() => {
        const activityEvents = [
            'mousedown', 'mousemove', 'wheel', 'keydown',
            'keypress', 'scroll', 'touchstart', 'touchmove',
            'click', 'dblclick', 'focus', 'resize'
        ];

        const handleUserActivity = (e) => {
            if (!e || !e.target || !(e.target instanceof Node)) {
                return;
            }

            const modal = document.getElementById('timeout-modal');
            if (modal && modal.contains(e.target)) {
                console.log('🎯 Actividad dentro del modal - ignorada');
                return;
            }

            console.log('🎯 Actividad detectada fuera del modal');
            resetTimers();
        };

        activityEvents.forEach(event => {
            window.addEventListener(event, handleUserActivity, { passive: true });
        });

        resetTimers();

        return () => {
            activityEvents.forEach(event => {
                window.removeEventListener(event, handleUserActivity);
            });
            clearAllTimers();
        };
    }, [resetTimers, clearAllTimers]);
    useEffect(() => {
        console.log('📊 Estado Timeout:', {
            showWarning,
            timeLeft,
            hasCountdown: !!countdownRef.current,
            logoutExecuted: logoutExecutedRef.current
        });
    }, [showWarning, timeLeft]);

    return (
        <TimeoutContext.Provider value={{
            showWarning,
            timeLeft,
            handleStayLoggedIn,
            handleLogout,
            resetTimers,
            isActive,
            startCountdown
        }}>
            {children}
        </TimeoutContext.Provider>
    );
};