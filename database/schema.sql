CREATE DATABASE IF NOT EXISTS onboarding_db;
USE onboarding_db;

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

INSERT INTO collaborators (full_name, email, hire_date, welcome_onboarding_status, technical_onboarding_status) VALUES
('Ana García', 'ana.garcia@empresa.com', '2024-01-10', 'completed', 'pending'),
('Carlos Rodríguez', 'carlos.rodriguez@empresa.com', '2024-02-15', 'completed', 'completed'),
('María López', 'maria.lopez@empresa.com', '2024-03-01', 'in_progress', 'pending'),
('Juan Martínez', 'juan.martinez@empresa.com', '2024-03-15', 'pending', 'pending'),
('Laura Sánchez', 'laura.sanchez@empresa.com', '2024-04-01', 'completed', 'in_progress');

INSERT INTO technical_onboarding_calendar (title, description, type, start_date, end_date, responsible_email) VALUES
('Journey to Cloud - Marzo 2024', 'Curso introductorio a tecnologías cloud', 'journey_to_cloud', '2024-03-15', '2024-03-22', 'cloud.trainer@empresa.com'),
('Onboarding Frontend Chapter', 'Capacitación para desarrolladores frontend', 'chapter_technical', '2024-03-25', '2024-03-29', 'frontend.lead@empresa.com'),
('Onboarding Backend Chapter', 'Capacitación para desarrolladores backend', 'chapter_technical', '2024-04-05', '2024-04-10', 'backend.lead@empresa.com'),
('Journey to Cloud - Abril 2024', 'Curso introductorio a tecnologías cloud', 'journey_to_cloud', '2024-04-20', '2024-04-27', 'cloud.trainer@empresa.com');

SELECT '✅ Tabla de colaboradores:' as message;
SELECT * FROM collaborators;

SELECT '✅ Tabla de calendario:' as message;
SELECT * FROM technical_onboarding_calendar;
