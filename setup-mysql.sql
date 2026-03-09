-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS alumnos_tec_alumnos;
USE alumnos_tec_alumnos;

-- Crear la tabla alumnos
CREATE TABLE IF NOT EXISTS alumno (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    telefono VARCHAR(20),
    carrera VARCHAR(100),
    imagen_url TEXT
);
