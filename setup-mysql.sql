-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS alumnos_tec_alumnos;
USE alumnos_tec_alumnos;

-- Crear la tabla alumnos
CREATE TABLE IF NOT EXISTS alumno (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_control VARCHAR(100),
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(150),
    carrera VARCHAR(100),
    materia VARCHAR(120),
    grupo VARCHAR(60),
    horario VARCHAR(120),
    imagen_url TEXT
);
