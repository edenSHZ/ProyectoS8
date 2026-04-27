CREATE DATABASE instituto;
USE instituto;

-- ==============================
-- CATEGORÍAS
-- ==============================
CREATE TABLE CATEGORIA_CURSO (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- ==============================
-- ADMINISTRADOR
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
-- CURSOS
-- ==============================
CREATE TABLE CURSO (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    id_admin INT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(255),
    duracion VARCHAR(100),
    horario VARCHAR(150),
    requisitos TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES CATEGORIA_CURSO(id_categoria),
    FOREIGN KEY (id_admin) REFERENCES ADMINISTRADOR(id_admin)
        ON DELETE SET NULL                      -- ✅ El curso permanece
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
    leido BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_admin) REFERENCES ADMINISTRADOR(id_admin)
        ON DELETE SET NULL                      -- ✅ El mensaje permanece
);

-- ==============================
-- NOTICIAS Y EVENTOS
-- ==============================
CREATE TABLE NOTICIA_EVENTO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha DATETIME NOT NULL,
    tipo ENUM('noticia','evento') NOT NULL,
    estado ENUM('publicado','borrador') NOT NULL DEFAULT 'borrador',
    imagen VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_admin) REFERENCES ADMINISTRADOR(id_admin)
        ON DELETE SET NULL                      -- ✅ La noticia/evento permanece
);

-- ==============================
-- CALENDARIO
-- ==============================
CREATE TABLE EVENTO_CALENDARIO (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT NULL,
    archivo VARCHAR(255) NOT NULL,
    tipo_archivo ENUM('pdf') NOT NULL DEFAULT 'pdf',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_admin) REFERENCES ADMINISTRADOR(id_admin)
        ON DELETE CASCADE                       -- ✅ Se borra con el admin
);

-- ==============================
-- PROMOCIÓN Y CARRUSEL
-- ==============================
CREATE TABLE PROMOCION_GALERIA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT NULL,
    tipo ENUM('promocion','carrusel') NOT NULL,
    imagen VARCHAR(255) NOT NULL,
    orden TINYINT NOT NULL DEFAULT 1,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_admin) REFERENCES ADMINISTRADOR(id_admin)
        ON DELETE CASCADE        
);