# Sistema de incorporación

# # Arquitectura en Capas
# # # Backend (Node.js + Express)
Backend/
├── server.js                 # Punto de entrada principal
├── src/
│   ├── config/
│   │   └── database.js      # Configuración y conexión a MySQL
│   ├── models/              # Capa de modelo (MVC)
│   │   ├── Collaborator.js
│   │   └── TechnicalOnboardingCalendar.js
│   ├── routes/              # Definición de rutas API
│   │   ├── collaboratorRoutes.js
│   │   ├── calendarRoutes.js
│   │   └── alertRoutes.js
│   └── controllers/         # Lógica de negocio
│       └── collaboratorController.js


# # # Frontend (React + React Router)
Frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/          # Componentes reutilizables
│   │   ├── collaborators/   # Componentes específicos
│   │   ├── calendar/
│   │   └── layout/          # Componentes de estructura
│   ├── pages/              # Vistas/páginas principales
│   ├── services/           # Servicios API
│   ├── styles/             # Estilos CSS
│   ├── App.js              # Configuración de rutas
│   └── index.js            # Punto de entrada

# # Estructura de Base de Datos
# # # Tabla: collaborators
CREATE TABLE collaborators (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hire_date DATE NOT NULL,
    welcome_onboarding_status ENUM('pending', 'completed', 'in_progress') DEFAULT 'pending',
    technical_onboarding_status ENUM('pending', 'completed', 'in_progress') DEFAULT 'pending',
    technical_onboarding_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

# # # Tabla: technical_onboarding_calendar
CREATE TABLE technical_onboarding_calendar (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('journey_to_cloud', 'chapter_technical', 'other') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    responsible_email VARCHAR(100),
    max_participants INT DEFAULT 20,
    current_participants INT DEFAULT 0,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# # Endpoints API
# # # Colaboradores
Método	Endpoint	Descripción
GET	/api/collaborators	Listar colaboradores (con filtros)
GET	/api/collaborators/:id	Obtener colaborador por ID
POST	/api/collaborators	Crear nuevo colaborador
PUT	/api/collaborators/:id	Actualizar colaborador
DELETE	/api/collaborators/:id	Eliminar colaborador
POST	/api/collaborators/:id/complete-onboarding	Marcar onboarding como completado

# # # Calendario Técnico
Método	Endpoint	Descripción
GET	/api/calendar/technical	Listar todos los eventos
GET	/api/calendar/technical/upcoming	Eventos próximos (30 días)
GET	/api/calendar/technical/active	Eventos en curso
POST	/api/calendar/technical	Crear nuevo evento
PUT	/api/calendar/technical/:id	Actualizar evento
DELETE	/api/calendar/technical/:id	Eliminar evento

# # # Alertas
Método	Endpoint	Descripción
GET	/api/alerts	Listar todas las alertas
GET	/api/alerts/upcoming	Alertas próximas (simuladas)
POST	/api/alerts	Crear nueva alerta
POST	/api/alerts/test	Enviar alerta de prueba
PUT	/api/alerts/:id/read	Marcar alerta como leída


# # # Sistema
Método	Endpoint	Descripción
GET	/api/health	Verificar estado del sistema
GET	/	Documentación de la API


# # Tecnologías Utilizadas
# # # Backend
Node.js + Express
MySQL + mysql2
dotenv (variables de entorno)
CORS + Helmet (seguridad)


# # # Frontend
React 18
React Router 6
Bootstrap 5 + React-Bootstrap
Git (control de versiones)
MySQL Workbench / CLI
