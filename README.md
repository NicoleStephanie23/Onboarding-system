# SISTEMA DE GESTIÓN DE ONBOARDING

El **Sistema de Gestión de Onboarding** es una solución completa que automatiza y optimiza el proceso de incorporación de nuevos colaboradores, combina:

1.  **Gestión de colaboradores** con seguimiento de onboarding
    
2.  **Calendario inteligente** para eventos técnicos (5-7 días)
    
3.  **Sistema de alertas** simulados en la interfaz
    
4.  **Dashboard** con métricas de onboarding y próximos eventos
    
5.  **Seguridad robusta** con autenticación, roles y timeout
    

Es una solución **escalable, segura y fácil de usar** que reduce el trabajo manual, mejora la experiencia del colaborador y proporciona visibilidad completa del proceso de onboarding.


# 1. ARQUITECTURA EN CAPAS

El sistema está estructurado en **tres capas principales**:
## Capa Frontend (Interfaz de Usuario)

-   **Tecnología**: React.js con Bootstrap
    
-   **Estructura**: Componentes modulares y reutilizables
    
-   **Estado**: Context API para manejo global de autenticación y timeout
    
-   **Estilos**: CSS personalizado con Bootstrap como base

## Capa Backend (Servidor/API)

-   **Tecnología**: Node.js con Express
    
-   **Estructura**:
    
    -   **Controladores**: Lógica de negocio
        
    -   **Modelos**: Interacción con base de datos
        
    -   **Servicios**: Funcionalidades específicas (alertas)
        
    -   **Rutas**: Endpoints de la API
        
    -   **Middlewares**: Autenticación y validaciones

## Capa de Base de Datos

-   **Tecnología**: MySQL
    
-   **Estructura**:
    
    -   **Tabla usuarios**: Gestión de acceso
        
    -   **Tabla colaboradores**: Información de empleados
        
    -   **Tabla calendario**: Eventos de onboarding
        
    -   **Tabla alertas**: Registro de notificaciones

# 2. ESTRUCTURA DE BASE DE DATOS

## Tablas Principales:

1.  **`users`** - Gestión de acceso al sistema
    
    -   id, username, email, password_hash
        
    -   full_name, role (admin/manager/viewer)
        
    -   is_active, last_login, created_at
        
2.  **`collaborators`** - Información de colaboradores
    
    -   Datos personales: full_name, email, hire_date
        
    -   Estados de onboarding: welcome_onboarding_status, technical_onboarding_status
        
    -   Fechas: technical_onboarding_date, created_at
        
3.  **`technical_onboarding_calendar`** - Calendario de eventos
    
    -   Eventos: title, description, type
        
    -   Fechas: start_date, end_date
        
    -   Información: location, responsible_email, participants
        
    -   Estado: status (scheduled/in_progress/completed)
        
4.  **`alert_logs`** - Registro de alertas
    
    -   type, event_id, details
        
    -   status, scheduled_for, sent_at


# COMPONENTES DEL SISTEMA

## Dashboard Principal

-   **Resumen estadístico**: Total colaboradores, eventos, onboardings
    
-   **Vista rápida**: Colaboradores recientes, próximos eventos
    
-   **Accesos directos**: Crear colaborador, ver calendario

## Gestión de Colaboradores

-   **Listado completo**: Tabla con filtros y búsqueda
    
-   **Creación/Edición**: Formulario con validaciones
    
-   **Estados**: Control de onboarding (pendiente/en progreso/completado)
    
-   **Acciones**: Eliminar, completar onboarding, editar, filtrar, buscar

## Calendario de Onboarding Técnico


-   **Vista mensual**: Visualización de eventos por mes
    
-   **Creación eventos**: Formulario con validación de fechas (5-7 días)
    
-   **Tipos**: Journey to Cloud (7 días) o Capítulos Técnicos (5-6 días)
    
-   **Alertas automáticas**: Envío de alerta simulado en la interfaz, alerta de notificación

## Sistema de Alertas

-   **Notificaciones**: Eventos próximos en 3, 7 días
    
-   **Registro**: Historial de alertas enviadas

## Configuración del Sistema (Placeholder)

-  **Login/Registro**: Validación de credenciales
    
-   **Roles**: Administrador, Visualizador
    
-   **Timeout automático**: Cierre de sesión por inactividad (60 segundos)
   



## ENDPOINTS


**POST**  `/auth/login` Iniciar sesión

  

**POST**  `/auth/register` Registrar usuario

  

**POST**  `/auth/verify` Verificar token

  

**POST**  `/auth/change-password` Cambiar contraseña

  

**POST**  `/auth/logout` Cerrar sesión

  

**GET**  `/collaborators` Listar colaboradores

  

**GET**  `/collaborators/:id` Obtener colaborador

  

**POST**  `/collaborators` Crear colaborador

  

**PUT**  `/collaborators/:id` Actualizar colaborador

  

**DELETE**  `/collaborators/:id` Eliminar colaborador

  

**POST**  `/collaborators/:id/complete-onboarding` Completar onboarding

  

**GET**  `/calendar` Listar eventos

  

**POST**  `/calendar` Crear evento

  

**GET**  `/calendar/upcoming` Eventos próximos

  

**GET**  `/alerts/upcoming` Alertas próximas

  

**POST**  `/alerts/test` Enviar alerta de prueba

  

**GET**  `/health` Estado del sistema

  

**GET**  `/debug/users` Debug usuarios

---------------------------------------------------------------------------------------




