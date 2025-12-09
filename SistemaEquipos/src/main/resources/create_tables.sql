-- 2. CREAR LA BASE DE DATOS
CREATE DATABASE equipos_db;

-- 3. USAR LA BASE DE DATOS
USE equipos_db;

-- 4. CREAR LA TABLA 'equipos'
CREATE TABLE equipos (
                         id INT NOT NULL AUTO_INCREMENT,
                         codigo VARCHAR(50) NOT NULL,
                         marca VARCHAR(100) NOT NULL,
                         tipo_equipo VARCHAR(50) NOT NULL,
                         modelo VARCHAR(100) NOT NULL,
                         sistema_operativo VARCHAR(100) NOT NULL,
                         ram VARCHAR(50) NOT NULL,
                         almacenamiento VARCHAR(50) NOT NULL,
                         fecha_registro DATETIME,
                         fecha_mantenimiento DATETIME,
                         estado VARCHAR(50),

    -- Definición de Claves y Restricciones
                         PRIMARY KEY (id),
                         UNIQUE KEY uk_codigo (codigo) -- El campo 'codigo' es único (UNI)
);

-- VERIFICACIÓN (Debería mostrar la estructura y la fila de prueba)
DESCRIBE equipos;
SELECT * FROM equipos;

INSERT INTO equipos (
    codigo, marca, tipo_equipo, modelo, sistema_operativo, ram, almacenamiento, fecha_registro, fecha_mantenimiento, estado
) VALUES (
             'AT-4000', 'HP', 'Tablet', 'XPS 28', 'Windows 11 Pro', '24GB', '2TB (SSD)', NOW(), '2025-12-09', 'Activo'
         );




