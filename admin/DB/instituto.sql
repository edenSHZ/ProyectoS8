-- Crear la base de datos (opcional, ajusta el nombre)
CREATE DATABASE IF NOT EXISTS gestion_cursos;
USE gestion_cursos;

-- Tabla: CATEGORIA_CURSO
CREATE TABLE CATEGORIA_CURSO (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla: ADMINISTRADOR
CREATE TABLE ADMINISTRADOR (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,   -- para hash seguro
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL
);

-- Tabla: CURSO
CREATE TABLE CURSO (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    id_admin INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    imagen VARCHAR(255),
    descripcion TEXT,
    beneficios TEXT,
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES CATEGORIA_CURSO(id_categoria)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_admin) REFERENCES ADMINISTRADOR(id_admin)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabla: CONTACTO
CREATE TABLE CONTACTO (
    id_contacto INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT NULL,   -- NULL si el contacto no es gestionado aún por un admin
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_admin) REFERENCES ADMINISTRADOR(id_admin)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- Tabla: PROMOCION
CREATE TABLE PROMOCION (
    id_promocion INT AUTO_INCREMENT PRIMARY KEY,
    id_curso INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_curso) REFERENCES CURSO(id_curso)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla: EVENTO_CALENDARIO
CREATE TABLE EVENTO_CALENDARIO (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    id_curso INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_evento DATETIME NOT NULL,
    tipo_evento VARCHAR(50),
    FOREIGN KEY (id_curso) REFERENCES CURSO(id_curso)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- (Opcional) Si la tabla OFRECE era necesaria, podría ser una relación muchos a muchos
-- entre CURSO y otra entidad que no aparece. Por ahora no se incluye.