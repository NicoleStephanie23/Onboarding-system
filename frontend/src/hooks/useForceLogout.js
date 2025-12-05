import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useForceLogout = () => {
    const { logout } = useAuth();

    const forceLogout = useCallback(async () => {
        console.log('🔓 EJECUTANDO CIERRE DE SESIÓN FORZADO');

        try {
            if (logout && typeof logout === 'function') {
                await logout();
                console.log('✅ Logout normal ejecutado');
            } else {
                console.warn('⚠️ Función logout no disponible, usando limpieza manual');
            }
        } catch (error) {
            console.warn('⚠️ Error en logout normal:', error);
        }
        console.log('🧹 Paso 1: Limpiando localStorage...');
        localStorage.removeItem('auth');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('selectedEvent');
        localStorage.removeItem('events');
        localStorage.removeItem('calendarEvents');
        localStorage.removeItem('onboardingData');

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('event_') || key.startsWith('calendar_') || key.startsWith('onboarding_')) {
                localStorage.removeItem(key);
            }
        });

        console.log('🧹 Paso 2: Limpiando sessionStorage...');
        sessionStorage.clear();
        console.log('🧹 Paso 3: Limpiando cookies...');
        document.cookie.split(";").forEach(function (c) {
            const cookie = c.trim();
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        });

        console.log('🧭 Redirigiendo a login...');
        setTimeout(() => {
            window.location.href = '/login';
            setTimeout(() => {
                console.log('🔄 Forzando recarga de página...');
                window.location.reload(true);
            }, 300);
        }, 100);

    }, [logout]);

    return forceLogout;
};