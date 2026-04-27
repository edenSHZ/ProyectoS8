CREATE DATABASE IF NOT EXISTS instituto;
USE instituto;

-- ==============================
-- CATEGORÍAS
-- ==============================
CREATE TABLE CATEGORIA_CURSO (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- ==============================
-- ADMIN
-- ==============================
CREATE TABLE ADMINISTRADOR (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL
);

-- ==============================
-- CURSOS (MEJORADO)
-- ==============================
CREATE TABLE CURSO (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    id_admin INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT, 
    imagen VARCHAR(255),
    duracion VARCHAR(100),
    horario VARCHAR(150),
    requisitos TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES CATEGORIA_CURSO(id_categoria),
    FOREIGN KEY (id_admin) REFERENCES ADMINISTRADOR(id_admin)
);

-- ==============================
-- CONTACTO
-- ==============================
CREATE TABLE CONTACTO (
    id_contacto INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    asunto VARCHAR(150),
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_admin) REFERENCES ADMINISTRADOR(id_admin)
        ON DELETE SET NULL
);

-- ==============================
-- NOTICIAS Y EVENTOS
-- ==============================
CREATE TABLE NOTICIA_EVENTO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha DATETIME NOT NULL,
    tipo ENUM('noticia','evento') NOT NULL,
    estado ENUM('publicado','borrador') DEFAULT 'borrador',
    id_curso INT NULL,
    imagen VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_curso) REFERENCES CURSO(id_curso)
        ON DELETE SET NULL
);

-- ==============================
-- PROMOCIONES
-- ==============================
CREATE TABLE PROMOCION (
    id_promocion INT AUTO_INCREMENT PRIMARY KEY,
    id_curso INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_curso) REFERENCES CURSO(id_curso)
        ON DELETE CASCADE
);

-- ==============================
-- CALENDARIO
-- ==============================
CREATE TABLE EVENTO_CALENDARIO (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    archivo VARCHAR(255),
    tipo_archivo ENUM('pdf','imagen'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- GALERÍA
-- ==============================
CREATE TABLE GALERIA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50),
    referencia_id INT NULL,
    imagen VARCHAR(255)
);