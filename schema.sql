-- ========================================
-- SCHEMA DE BASE DE DATOS WAWALU
-- Versión: 2.2 - Octubre 2025 (Actualizado - Con Mis Pedidos)
-- Descripción: Schema completo para el sistema de gestión educativa
-- Incluye: Sistema de pedidos, carrito, autenticación mejorada
-- Autor: Sistema de Gestión Wawalu
-- ========================================

-- Crear la base de datos con configuración optimizada
CREATE DATABASE IF NOT EXISTS wawalu_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE wawalu_db;

-- Configurar el motor de base de datos
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET AUTOCOMMIT = 0;
START TRANSACTION;

-- ========================================
-- TABLA DE USUARIOS (BASE)
-- ========================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('padre', 'madre', 'tutor', 'staff', 'admin') NOT NULL DEFAULT 'padre',
    is_admin BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    last_login TIMESTAMP NULL,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- ========================================
-- TABLA DE PROGRAMAS EDUCATIVOS
-- ========================================
CREATE TABLE IF NOT EXISTS programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    age_range VARCHAR(50),
    capacity INT DEFAULT 20,
    price DECIMAL(10,2) DEFAULT 0.00,
    duration_months INT DEFAULT 12,
    schedule VARCHAR(100),
    requirements TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (active),
    INDEX idx_age_range (age_range)
);

-- ========================================
-- TABLA DE INFORMACIÓN ADICIONAL DE PADRES
-- ========================================
CREATE TABLE IF NOT EXISTS parent_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    dni VARCHAR(8) NOT NULL,
    occupation VARCHAR(100),
    workplace VARCHAR(200),
    relationship ENUM('padre', 'madre', 'tutor', 'abuelo', 'abuela', 'otro') NOT NULL,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_dni (user_id, dni),
    INDEX idx_dni (dni)
);

-- ========================================
-- TABLA DE ESTUDIANTES
-- ========================================

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    guardian_id INT,
    program_id INT,
    student_code VARCHAR(20) UNIQUE,
    blood_type VARCHAR(5),
    quantity INT NOT NULL DEFAULT 1,
    selected_size VARCHAR(10),
    selected_color VARCHAR(30),
    price_at_add DECIMAL(10,2) DEFAULT 0.00,
    emergency_phone VARCHAR(20),
    photo VARCHAR(255),
    birth_certificate VARCHAR(255),
    medical_certificate VARCHAR(255),
    status ENUM('active', 'inactive', 'graduated', 'transferred') DEFAULT 'active',
    enrollment_date DATE,
    graduation_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guardian_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
    INDEX idx_guardian (guardian_id),
    INDEX idx_program (program_id),
    INDEX idx_status (status),
    INDEX idx_code (student_code)
);

-- ========================================
-- TABLA DE CONTACTOS/MENSAJES
-- ========================================
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    type ENUM('consulta', 'matricula', 'queja', 'sugerencia', 'otro') DEFAULT 'consulta',
    priority ENUM('baja', 'media', 'alta', 'urgente') DEFAULT 'media',
    status ENUM('pending', 'in_progress', 'contacted', 'resolved', 'closed') DEFAULT 'pending',
    assigned_to INT NULL,
    response TEXT,
    responded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_type (type)
);

-- ========================================
-- TABLA DE MATRÍCULAS
-- ========================================
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    program_id INT NOT NULL,
    academic_year YEAR NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    enrollment_date DATE,
    approval_date DATE NULL,
    rejection_reason TEXT NULL,
    monthly_fee DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_enrollment (student_id, program_id, academic_year),
    INDEX idx_status (status),
    INDEX idx_year (academic_year)
);

-- ========================================
-- TABLA DE NOTICIAS
-- ========================================
CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url VARCHAR(255),
    author_id INT,
    category ENUM('anuncios', 'eventos', 'actividades', 'academico', 'general') DEFAULT 'general',
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    slug VARCHAR(200) UNIQUE,
    meta_description VARCHAR(255),
    meta_keywords VARCHAR(255),
    view_count INT DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_published (is_published, published_at),
    INDEX idx_category (category),
    INDEX idx_featured (is_featured),
    FULLTEXT INDEX idx_search (title, content, excerpt)
);

-- ========================================
-- TABLA DE PRODUCTOS DE TIENDA
-- ========================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT DEFAULT 5,
    category ENUM('uniformes', 'utiles', 'accesorios', 'libros', 'materiales') NOT NULL,
    subcategory VARCHAR(50),
    talla VARCHAR(10),
    color VARCHAR(30),
    brand VARCHAR(50),
    sku VARCHAR(50) UNIQUE,
    image_url VARCHAR(255),
    gallery_images JSON,
    weight DECIMAL(8,2),
    dimensions VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_active (active),
    INDEX idx_featured (featured),
    INDEX idx_talla (talla),
    INDEX idx_stock (stock),
    INDEX idx_sku (sku),
    FULLTEXT INDEX idx_search (name, description)
);

-- ========================================
-- TABLA DE CARRITO DE COMPRAS
-- ========================================

CREATE TABLE IF NOT EXISTS shopping_cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    selected_size VARCHAR(10),
    selected_color VARCHAR(30),
    price_at_add DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_product (product_id)
);

-- ========================================
-- TABLA DE ADMISIONES
-- ========================================
CREATE TABLE IF NOT EXISTS admissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    programa VARCHAR(100),
    mensaje TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- TABLA DE ÓRDENES DE COMPRA
-- ========================================
-- TABLA DE ÓRDENES/PEDIDOS
-- Sistema completo de gestión de pedidos para la tienda
-- Incluye: Estados, pagos, envíos y tracking
-- ========================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    shipping_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_method ENUM('efectivo', 'tarjeta', 'transferencia', 'yape', 'plin') NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    shipping_address TEXT,
    billing_address TEXT,
    tracking_number VARCHAR(100),
    delivery_date DATE NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_order_number (order_number),
    INDEX idx_created_at (created_at)
);

-- ========================================
-- TABLA DE DETALLES DE ORDEN
-- Items específicos de cada pedido con precios y cantidades
-- Optimizada para consultas de "Mis Pedidos"
-- ========================================
CREATE TABLE IF NOT EXISTS order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    selected_size VARCHAR(10),
    selected_color VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- ========================================
-- TABLA DE GALERÍA DE IMÁGENES
-- ========================================
CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    category ENUM('actividades', 'instalaciones', 'eventos', 'estudiantes', 'general') DEFAULT 'general',
    tags JSON,
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_featured (is_featured),
    INDEX idx_public (is_public),
    INDEX idx_sort (sort_order)
);

-- ========================================
-- TABLA DE EVENTOS DEL CALENDARIO
-- ========================================
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    location VARCHAR(200),
    type ENUM('academico', 'social', 'feriado', 'reunion', 'evento', 'otro') NOT NULL DEFAULT 'academico',
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_public BOOLEAN DEFAULT TRUE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule VARCHAR(255),
    max_attendees INT,
    registration_required BOOLEAN DEFAULT FALSE,
    registration_deadline DATETIME NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_dates (start_date, end_date),
    INDEX idx_type (type),
    INDEX idx_public (is_public)
);

-- ========================================
-- TABLA DE ASISTENCIA DE ESTUDIANTES
-- ========================================
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused', 'sick') NOT NULL,
    arrival_time TIME NULL,
    departure_time TIME NULL,
    notes TEXT,
    recorded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (student_id, date),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- ========================================
-- TABLA DE PAGOS DE MATRÍCULA
-- ========================================
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    payment_number VARCHAR(20) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type ENUM('matricula', 'mensualidad', 'material', 'otro') NOT NULL,
    payment_date DATE NOT NULL,
    due_date DATE,
    payment_method ENUM('efectivo', 'tarjeta', 'transferencia', 'yape', 'plin') NOT NULL,
    transaction_id VARCHAR(100),
    reference_number VARCHAR(100),
    status ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    receipt_url VARCHAR(255),
    notes TEXT,
    processed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE RESTRICT,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_payment_type (payment_type),
    INDEX idx_due_date (due_date)
);

-- ========================================
-- TABLA DE PAGOS DE ÓRDENES DE TIENDA
-- ========================================
CREATE TABLE IF NOT EXISTS order_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    payment_number VARCHAR(20) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('efectivo', 'tarjeta', 'transferencia', 'yape', 'plin') NOT NULL,
    transaction_id VARCHAR(100),
    reference_number VARCHAR(100),
    status ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    receipt_image VARCHAR(255),
    receipt_url VARCHAR(255),
    notes TEXT,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_payment_method (payment_method),
    INDEX idx_order (order_id)
);

-- ========================================
-- TABLA DE ACTIVIDADES DE ADMINISTRADORES
-- ========================================
CREATE TABLE IF NOT EXISTS admin_activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_description TEXT NOT NULL,
    target_table VARCHAR(50),
    target_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin (admin_id),
    INDEX idx_action (action_type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_target (target_table, target_id)
);

-- ========================================
-- TABLA DE SESIONES ACTIVAS
-- ========================================
CREATE TABLE IF NOT EXISTS active_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info VARCHAR(255),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    logout_time TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_session (user_id, session_id),
    INDEX idx_last_activity (last_activity),
    INDEX idx_active (is_active)
);

-- ========================================
-- TABLA DE CONFIGURACIONES DEL SITIO
-- ========================================
CREATE TABLE IF NOT EXISTS site_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    `key` VARCHAR(100) UNIQUE NOT NULL,
    `value` TEXT,
    type ENUM('string', 'number', 'boolean', 'json', 'file') DEFAULT 'string',
    category VARCHAR(50) DEFAULT 'general',
    description VARCHAR(255),
    is_public BOOLEAN DEFAULT FALSE,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_key (`key`),
    INDEX idx_category (category),
    INDEX idx_public (is_public)
);

-- ========================================
-- TABLA DE LIBRO DE RECLAMACIONES
-- ========================================
CREATE TABLE IF NOT EXISTS reclamaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_reclamacion VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    tipo_documento ENUM('DNI', 'CE', 'PASAPORTE', 'RUC') NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    tipo_bien ENUM('PRODUCTO', 'SERVICIO') NOT NULL,
    monto_reclamado DECIMAL(10,2) NOT NULL,
    descripcion_bien TEXT NOT NULL,
    tipo_reclamacion ENUM('RECLAMO', 'QUEJA') NOT NULL,
    detalle_reclamacion TEXT NOT NULL,
    pedido_consumidor TEXT NOT NULL,
    estado ENUM('PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'CERRADO') DEFAULT 'PENDIENTE',
    fecha_reclamacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP NULL,
    respuesta_empresa TEXT NULL,
    acciones_adoptadas TEXT NULL,
    observaciones TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_numero (numero_reclamacion),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_reclamacion),
    INDEX idx_tipo_reclamacion (tipo_reclamacion),
    INDEX idx_tipo_documento (tipo_documento),
    INDEX idx_email (email),
    FULLTEXT INDEX idx_search_reclamaciones (nombres, apellidos, detalle_reclamacion, descripcion_bien)
);

-- ========================================
-- SISTEMA DE INFORMES Y NOTIFICACIONES
-- ========================================

-- Tabla principal de informes de profesores a estudiantes
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL COMMENT 'Materia o asunto del informe',
    title VARCHAR(200) NOT NULL COMMENT 'Título del informe',
    content TEXT NOT NULL COMMENT 'Contenido del informe',
    report_type ENUM('academic', 'behavioral', 'medical', 'general') DEFAULT 'general',
    status ENUM('draft', 'sent', 'read') DEFAULT 'sent',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    is_private BOOLEAN DEFAULT FALSE COMMENT 'Si es confidencial solo para padres',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL COMMENT 'Fecha cuando el padre leyó el informe',
    teacher_notes TEXT NULL COMMENT 'Notas adicionales del profesor',
    parent_response TEXT NULL COMMENT 'Respuesta del padre al informe',
    response_at TIMESTAMP NULL COMMENT 'Fecha de respuesta del padre',
    INDEX idx_student_id (student_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_report_type (report_type),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tabla principal para informes de profesores a estudiantes';

-- Tabla para adjuntos de informes
CREATE TABLE IF NOT EXISTS report_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo en el servidor',
    original_filename VARCHAR(255) NOT NULL COMMENT 'Nombre original del archivo',
    file_path VARCHAR(500) NOT NULL COMMENT 'Ruta completa del archivo',
    file_type VARCHAR(50) NOT NULL COMMENT 'Tipo MIME del archivo',
    file_size INT NOT NULL COMMENT 'Tamaño en bytes',
    file_category ENUM('image', 'document', 'audio', 'video', 'other') DEFAULT 'other',
    description TEXT NULL COMMENT 'Descripción del adjunto',
    uploaded_by INT NOT NULL COMMENT 'ID del usuario que subió el archivo',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    download_count INT DEFAULT 0 COMMENT 'Contador de descargas',
    INDEX idx_report_id (report_id),
    INDEX idx_file_type (file_type),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_file_category (file_category),
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla para adjuntos de informes (fotos, documentos, etc.)';

-- Tabla para notificaciones de informes
CREATE TABLE IF NOT EXISTS report_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    recipient_id INT NOT NULL COMMENT 'ID del padre/tutor que recibe la notificación',
    notification_type ENUM('email', 'sms', 'push', 'in_app') DEFAULT 'email',
    notification_method ENUM('immediate', 'daily_digest', 'weekly_digest') DEFAULT 'immediate',
    status ENUM('pending', 'sent', 'delivered', 'failed', 'bounced') DEFAULT 'pending',
    priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
    subject VARCHAR(200) NOT NULL COMMENT 'Asunto de la notificación',
    message TEXT NOT NULL COMMENT 'Contenido de la notificación',
    recipient_email VARCHAR(255) NULL COMMENT 'Email del destinatario',
    recipient_phone VARCHAR(20) NULL COMMENT 'Teléfono del destinatario',
    sent_at TIMESTAMP NULL COMMENT 'Fecha de envío',
    delivered_at TIMESTAMP NULL COMMENT 'Fecha de entrega confirmada',
    read_at TIMESTAMP NULL COMMENT 'Fecha de lectura (para notificaciones in-app)',
    error_message TEXT NULL COMMENT 'Mensaje de error si falló',
    retry_count INT DEFAULT 0 COMMENT 'Número de reintentos',
    max_retries INT DEFAULT 3 COMMENT 'Máximo número de reintentos',
    next_retry_at TIMESTAMP NULL COMMENT 'Próximo intento programado',
    metadata JSON NULL COMMENT 'Datos adicionales de la notificación',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_report_id (report_id),
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_status (status),
    INDEX idx_notification_type (notification_type),
    INDEX idx_priority (priority),
    INDEX idx_sent_at (sent_at),
    INDEX idx_next_retry_at (next_retry_at),
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla para notificaciones de informes (email, SMS, push, etc.)';

-- Tabla para preferencias de notificación
CREATE TABLE IF NOT EXISTS notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type ENUM('email', 'sms', 'push', 'in_app') NOT NULL,
    report_type ENUM('academic', 'behavioral', 'medical', 'general', 'all') DEFAULT 'all',
    is_enabled BOOLEAN DEFAULT TRUE,
    frequency ENUM('immediate', 'daily_digest', 'weekly_digest', 'monthly_digest') DEFAULT 'immediate',
    quiet_hours_start TIME NULL COMMENT 'Hora de inicio del período silencioso',
    quiet_hours_end TIME NULL COMMENT 'Hora de fin del período silencioso',
    weekend_notifications BOOLEAN DEFAULT TRUE,
    priority_filter ENUM('all', 'normal_and_high', 'high_only', 'urgent_only') DEFAULT 'all',
    language_code VARCHAR(5) DEFAULT 'es' COMMENT 'Idioma preferido para notificaciones',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_type_report (user_id, notification_type, report_type),
    INDEX idx_user_id (user_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_is_enabled (is_enabled),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Preferencias de notificación por usuario';

-- ========================================
-- DATOS INICIALES Y CONFIGURACIÓN
-- ========================================

-- Limpiar datos existentes si es necesario (comentar si no se quiere reiniciar)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE admin_activities;
-- TRUNCATE TABLE order_payments;
-- TRUNCATE TABLE order_details;
-- TRUNCATE TABLE orders;
-- TRUNCATE TABLE shopping_cart;
-- TRUNCATE TABLE products;
-- TRUNCATE TABLE payments;
-- TRUNCATE TABLE attendance;
-- TRUNCATE TABLE enrollments;
-- TRUNCATE TABLE students;
-- TRUNCATE TABLE parent_info;
-- TRUNCATE TABLE contacts;
-- TRUNCATE TABLE active_sessions;
-- TRUNCATE TABLE gallery;
-- TRUNCATE TABLE events;
-- TRUNCATE TABLE news;
-- TRUNCATE TABLE site_settings;
-- TRUNCATE TABLE programs;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO gallery (title, description, category, image_url) VALUES
('Niños jugando', 'Momento de juego y aprendizaje', 'actividades', 'imagen1.jpg'),
('Actividades creativas', 'Desarrollo de la creatividad en el aula', 'actividades', 'imagen2.jpg'),
('Espacios educativos', 'Ambientes modernos y seguros', 'espacios', 'imagen3.jpg'),
('Área de Juegos', 'Zona de recreación y desarrollo motriz', 'espacios', 'imagen4.jpg'),
('Programa Bebés', 'Estimulación temprana para los más pequeños', 'programas', 'imagen5.jpg'),
('Programa Inicial', 'Primeros pasos en la educación', 'programas', 'imagen6.jpg'),
('Taller de música', 'Aprendizaje musical en grupo', 'actividades', 'imagen7.jpg'),
('Arte y expresión', 'Niños explorando el arte', 'actividades', 'imagen8.jpg'),
('Exploración sensorial', 'Descubriendo el mundo a través de los sentidos', 'actividades', 'imagen9.jpg'),
('Ambiente seguro', 'Instalaciones pensadas para el bienestar', 'espacios', 'imagen10.jpg'),
('Momento Wawalu 1', 'Recuerdos inolvidables', 'eventos', 'imagen11.jpg'),
('Momento Wawalu 2', 'Diversión y aprendizaje', 'eventos', 'imagen12.jpg'),
('Momento Wawalu 3', 'Juegos en grupo', 'eventos', 'imagen13.jpg');

-- Actualizar usuarios existentes para marcar staff como admins
UPDATE users SET is_admin = TRUE WHERE role IN ('staff', 'admin');

-- ========================================
-- INSERCIÓN DE DATOS DE EJEMPLO
-- ========================================

-- Programas educativos
INSERT IGNORE INTO programs (id, name, description, age_range, capacity, price, duration_months, schedule, active) VALUES
(1, 'Programa Bebés', 'Programa especializado para bebés y niños pequeños con estimulación temprana y desarrollo sensorial', '6 meses - 2 años', 8, 500.00, 12, 'Lunes a Viernes 8:00-12:00', TRUE),
(2, 'Programa Inicial', 'Programa de desarrollo temprano con actividades lúdicas y educativas', '2 - 3 años', 12, 600.00, 12, 'Lunes a Viernes 8:00-13:00', TRUE),
(3, 'Programa Preescolar', 'Programa completo de educación preescolar con preparación para primaria', '3 - 5 años', 15, 700.00, 12, 'Lunes a Viernes 8:00-15:00', TRUE),
(4, 'Programa Vacacional', 'Programa especial para vacaciones con actividades recreativas', '3 - 6 años', 20, 300.00, 2, 'Lunes a Viernes 9:00-16:00', TRUE);

-- Usuarios administradores y de ejemplo (contraseñas hasheadas)
INSERT IGNORE INTO users (id, name, email, password, role, is_admin, phone, email_verified, created_at) VALUES 
(1, 'Administrador Principal', 'admin@wawalu.edu.pe', 'scrypt:32768:8:1$NNn24Eg4T1e0jJ0L$895a609bea50f49b0792bd7f872ae5b07f734a1b354f1d0fa4270ad886fb82b84aa3d62aef5f499b1d7cb2e39098cb17cdd79e32332fbd1d54814a685b6a1574', 'admin', TRUE, '999888777', TRUE, NOW()),
(2, 'Diego Centeno', 'diego.centeno@vallegrande.edu.pe', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE, '999888778', TRUE, NOW()),
(3, 'María García', 'maria.garcia@example.com', '$2b$12$K4vGzaHCh8Hw1fHcPmC1vuZtHv.VgsP8rLPkJqZoThHKUhQm8bUNW', 'madre', FALSE, '987654321', TRUE, NOW()),
(4, 'Juan Pérez', 'juan.perez@example.com', '$2b$12$K4vGzaHCh8Hw1fHcPmC1vuZtHv.VgsP8rLPkJqZoThHKUhQm8bUNW', 'padre', FALSE, '987654322', TRUE, NOW()),
(5, 'Ana López', 'ana.lopez@example.com', '$2b$12$K4vGzaHCh8Hw1fHcPmC1vuZtHv.VgsP8rLPkJqZoThHKUhQm8bUNW', 'tutor', FALSE, '987654323', TRUE, NOW());

-- Productos de la tienda con información más completa
INSERT IGNORE INTO products (id, name, description, price, cost_price, stock, category, talla, sku, image_url, active, featured) VALUES
-- UNIFORMES
(1, 'Uniforme Diario', 'Uniforme escolar diario completo con camisa y pantalón/falda de alta calidad', 89.90, 45.00, 20, 'uniformes', '6', 'UNI-001-T6', 'uniform1.jpg', TRUE, TRUE),
(2, 'Uniforme Deportivo', 'Conjunto deportivo completo con polo y short transpirable', 79.90, 40.00, 15, 'uniformes', '8', 'UNI-002-T8', 'uniform2.jpg', TRUE, TRUE),
(3, 'Polo Institucional', 'Polo con logo institucional bordado en algodón 100%', 29.90, 15.00, 50, 'uniformes', '4', 'POL-001-T4', 'polo.jpg', TRUE, FALSE),
(4, 'Short Deportivo', 'Short deportivo con logo institucional y tela absorbente', 35.90, 18.00, 30, 'uniformes', '6', 'SHO-001-T6', 'short.jpg', TRUE, FALSE),
(5, 'Medias Escolares', 'Par de medias escolares color blanco, material suave', 12.90, 6.00, 100, 'uniformes', NULL, 'MED-001', 'socks.jpg', TRUE, FALSE),
(6, 'Casaca Institucional', 'Casaca con logo bordado y cierre frontal resistente', 89.90, 45.00, 25, 'uniformes', '10', 'CAS-001-T10', 'jacket.jpg', TRUE, TRUE),
(9, 'Set de Lápices de Colores', 'Set de lápices de colores de 24 unidades, no tóxicos', 15.90, 8.00, 80, 'utiles', NULL, 'LAP-001', 'pencils.jpg', TRUE, FALSE),
(10, 'Plastilina Educativa', 'Set de plastilina no tóxica de 6 colores brillantes', 12.90, 6.50, 60, 'utiles', NULL, 'PLA-001', 'clay.jpg', TRUE, FALSE),
(11, 'Tijeras de Seguridad', 'Tijeras punta roma de seguridad para niños, ergonómicas', 5.90, 3.00, 150, 'utiles', NULL, 'TIJ-001', 'scissors.jpg', TRUE, FALSE),
(12, 'Folder Institucional', 'Folder con logo institucional tamaño A4, material resistente', 7.90, 4.00, 120, 'utiles', NULL, 'FOL-001', 'folder.jpg', TRUE, FALSE),
(13, 'Témperas Escolares', 'Set de témperas de 12 colores no tóxicas, lavables', 18.90, 10.00, 75, 'utiles', NULL, 'TEM-001', 'paint.jpg', TRUE, FALSE),

-- ACCESORIOS
(14, 'Mochila Escolar Premium', 'Mochila escolar con logo institucional y múltiples compartimentos', 79.90, 40.00, 35, 'accesorios', NULL, 'MOC-001', 'backpack.jpg', TRUE, TRUE),
(15, 'Lonchera Térmica', 'Lonchera térmica con logo institucional y aislamiento', 45.90, 23.00, 45, 'accesorios', NULL, 'LON-001', 'lunchbox.jpg', TRUE, FALSE),
(16, 'Gorro con Protección UV', 'Gorro con protección UV y logo bordado, ajustable', 25.90, 13.00, 55, 'accesorios', NULL, 'GOR-001', 'hat.jpg', TRUE, FALSE),
(17, 'Botella de Agua Ecológica', 'Botella de agua reutilizable con logo, libre de BPA', 19.90, 10.00, 90, 'accesorios', NULL, 'BOT-001', 'bottle.jpg', TRUE, FALSE),
(18, 'Set de Toallas', 'Set de 2 toallas con logo institucional, suaves y absorbentes', 29.90, 15.00, 40, 'accesorios', NULL, 'TOA-001', 'towels.jpg', TRUE, FALSE),
(19, 'Mandil de Arte', 'Mandil impermeable para actividades artísticas con bolsillos', 35.90, 18.00, 30, 'accesorios', NULL, 'MAN-001', 'apron.jpg', TRUE, FALSE),
(20, 'Porta Útiles Organizado', 'Estuche para útiles escolares con compartimentos organizados', 22.90, 12.00, 70, 'accesorios', NULL, 'POR-001', 'case.jpg', TRUE, FALSE);

-- Más variantes de uniformes por tallas
INSERT IGNORE INTO products (name, description, price, cost_price, stock, category, talla, sku, image_url, active, featured) VALUES
-- Uniformes Diarios por tallas
('Uniforme Diario Talla 2', 'Uniforme escolar diario completo - Talla 2', 89.90, 45.00, 15, 'uniformes', '2', 'UNI-001-T2', 'uniform1.jpg', TRUE, FALSE),
('Uniforme Diario Talla 4', 'Uniforme escolar diario completo - Talla 4', 89.90, 45.00, 18, 'uniformes', '4', 'UNI-001-T4', 'uniform1.jpg', TRUE, FALSE),
('Uniforme Diario Talla 8', 'Uniforme escolar diario completo - Talla 8', 89.90, 45.00, 22, 'uniformes', '8', 'UNI-001-T8', 'uniform1.jpg', TRUE, FALSE),
('Uniforme Diario Talla 10', 'Uniforme escolar diario completo - Talla 10', 89.90, 45.00, 20, 'uniformes', '10', 'UNI-001-T10', 'uniform1.jpg', TRUE, FALSE),
('Uniforme Diario Talla 12', 'Uniforme escolar diario completo - Talla 12', 89.90, 45.00, 16, 'uniformes', '12', 'UNI-001-T12', 'uniform1.jpg', TRUE, FALSE),

-- Uniformes Deportivos por tallas
('Uniforme Deportivo Talla 2', 'Conjunto deportivo completo - Talla 2', 79.90, 40.00, 12, 'uniformes', '2', 'UNI-002-T2', 'uniform2.jpg', TRUE, FALSE),
('Uniforme Deportivo Talla 4', 'Conjunto deportivo completo - Talla 4', 79.90, 40.00, 16, 'uniformes', '4', 'UNI-002-T4', 'uniform2.jpg', TRUE, FALSE),
('Uniforme Deportivo Talla 6', 'Conjunto deportivo completo - Talla 6', 79.90, 40.00, 18, 'uniformes', '6', 'UNI-002-T6', 'uniform2.jpg', TRUE, FALSE),
('Uniforme Deportivo Talla 10', 'Conjunto deportivo completo - Talla 10', 79.90, 40.00, 14, 'uniformes', '10', 'UNI-002-T10', 'uniform2.jpg', TRUE, FALSE),
('Uniforme Deportivo Talla 12', 'Conjunto deportivo completo - Talla 12', 79.90, 40.00, 13, 'uniformes', '12', 'UNI-002-T12', 'uniform2.jpg', TRUE, FALSE),

-- Polos por tallas
('Polo Institucional Talla 2', 'Polo con logo institucional - Talla 2', 29.90, 15.00, 25, 'uniformes', '2', 'POL-001-T2', 'polo.jpg', TRUE, FALSE),
('Polo Institucional Talla 6', 'Polo con logo institucional - Talla 6', 29.90, 15.00, 30, 'uniformes', '6', 'POL-001-T6', 'polo.jpg', TRUE, FALSE),
('Polo Institucional Talla 8', 'Polo con logo institucional - Talla 8', 29.90, 15.00, 28, 'uniformes', '8', 'POL-001-T8', 'polo.jpg', TRUE, FALSE),
('Polo Institucional Talla 10', 'Polo con logo institucional - Talla 10', 29.90, 15.00, 32, 'uniformes', '10', 'POL-001-T10', 'polo.jpg', TRUE, FALSE),
('Polo Institucional Talla 12', 'Polo con logo institucional - Talla 12', 29.90, 15.00, 27, 'uniformes', '12', 'POL-001-T12', 'polo.jpg', TRUE, FALSE),

-- Casacas por tallas
('Casaca Institucional Talla 2', 'Casaca con logo bordado - Talla 2', 89.90, 45.00, 10, 'uniformes', '2', 'CAS-001-T2', 'jacket.jpg', TRUE, FALSE),
('Casaca Institucional Talla 4', 'Casaca con logo bordado - Talla 4', 89.90, 45.00, 12, 'uniformes', '4', 'CAS-001-T4', 'jacket.jpg', TRUE, FALSE),
('Casaca Institucional Talla 6', 'Casaca con logo bordado - Talla 6', 89.90, 45.00, 14, 'uniformes', '6', 'CAS-001-T6', 'jacket.jpg', TRUE, FALSE),
('Casaca Institucional Talla 8', 'Casaca con logo bordado - Talla 8', 89.90, 45.00, 13, 'uniformes', '8', 'CAS-001-T8', 'jacket.jpg', TRUE, FALSE),
('Casaca Institucional Talla 12', 'Casaca con logo bordado - Talla 12', 89.90, 45.00, 11, 'uniformes', '12', 'CAS-001-T12', 'jacket.jpg', TRUE, FALSE);

-- Noticias de ejemplo
INSERT IGNORE INTO news (title, content, excerpt, category, image_url, is_featured, is_published, author_id, published_at, created_at) VALUES
('Bienvenidos al nuevo año escolar 2025', 
 'Estamos emocionados de dar la bienvenida a todos nuestros estudiantes y familias al nuevo año escolar 2025. Este año trae consigo nuevas oportunidades de aprendizaje, crecimiento y desarrollo integral para nuestros pequeños. Hemos preparado un programa educativo renovado con actividades innovadoras que fomentarán la creatividad, el pensamiento crítico y las habilidades sociales de nuestros estudiantes.',
 'Iniciamos un nuevo año lleno de oportunidades de aprendizaje y crecimiento para toda nuestra comunidad educativa.',
 'anuncios', 'news1.jpg', TRUE, TRUE, 1, NOW(), NOW()),

('Inauguración del nuevo espacio de arte y creatividad', 
 'Con gran alegría anunciamos la inauguración de nuestro nuevo espacio dedicado al arte y la creatividad. Este ambiente especialmente diseñado cuenta con materiales de última generación, espacios amplios e iluminación natural que permitirá a nuestros estudiantes explorar y desarrollar su potencial artístico. El espacio incluye áreas para pintura, escultura, música y expresión corporal.',
 'Un espacio especialmente diseñado para fomentar la creatividad y el desarrollo artístico de nuestros niños.',
 'eventos', 'news2.jpg', TRUE, TRUE, 1, NOW(), NOW()),

('Taller de música y movimiento para padres e hijos', 
 'Invitamos a todas las familias a participar en nuestro taller especial de música y movimiento. Esta actividad fortalecerá los vínculos familiares mientras desarrollamos habilidades musicales y motoras en los niños. Los talleres se realizarán los sábados de 10:00 a 11:30 AM en nuestro auditorio principal.',
 'Una oportunidad única para compartir, aprender y crear recuerdos especiales en familia.',
 'actividades', 'news3.jpg', FALSE, TRUE, 1, NOW(), NOW()),

('Nuevo programa de alimentación saludable', 
 'Implementamos nuestro nuevo programa de alimentación saludable diseñado por nutricionistas especializados en nutrición infantil. Este programa incluye menús balanceados, huertos escolares donde los niños aprenderán sobre el origen de los alimentos, y talleres de cocina saludable para toda la familia.',
 'Promovemos hábitos alimenticios saludables desde la primera infancia con nuestro nuevo programa nutricional.',
 'academico', 'news4.jpg', FALSE, TRUE, 2, NOW(), NOW());

-- Configuraciones del sitio
INSERT IGNORE INTO site_settings (`key`, `value`, type, category, description, is_public, updated_by) VALUES
('site_name', 'Centro Educativo Wawalu', 'string', 'general', 'Nombre oficial del sitio web', TRUE, 2),
('site_description', 'Centro de desarrollo educativo temprano especializado en el crecimiento integral de los niños', 'string', 'general', 'Descripción del sitio web', TRUE, 2),
('site_logo', '/static/img/logo.png', 'file', 'general', 'Logo principal del sitio', TRUE, 2),
('contact_email', 'diego.centeno@vallegrande.edu.pe', 'string', 'contact', 'Email de contacto principal', TRUE, 2),
('contact_phone', '+51 999 888 777', 'string', 'contact', 'Teléfono de contacto principal', TRUE, 2),
('contact_whatsapp', '+51999888777', 'string', 'contact', 'Número de WhatsApp para contacto', TRUE, 2),
('contact_address', 'Av. Educación 123, Lima, Perú', 'string', 'contact', 'Dirección física del centro educativo', TRUE, 2),
('social_facebook', 'https://facebook.com/wawalu', 'string', 'social', 'URL de la página de Facebook', TRUE, 2),
('social_instagram', 'https://instagram.com/wawalu', 'string', 'social', 'URL de la página de Instagram', TRUE, 2),
('enrollment_open', 'true', 'boolean', 'enrollment', 'Estado de las matrículas (abierto/cerrado)', TRUE, 2),
('enrollment_deadline', '2025-12-15', 'string', 'enrollment', 'Fecha límite para matrículas', TRUE, 2),
('max_students_per_program', '20', 'number', 'enrollment', 'Máximo de estudiantes por programa', FALSE, 2),
('school_hours', '8:00 AM - 5:00 PM', 'string', 'general', 'Horario de atención del centro', TRUE, 2),
('academic_year', '2025', 'string', 'academic', 'Año académico actual', TRUE, 2);

-- Galería de imágenes
INSERT IGNORE INTO gallery (title, description, image_url, category, is_featured, alt_text, sort_order) VALUES
('Actividades de Arte', 'Niños desarrollando su creatividad en el taller de arte', 'imagen1.jpg', 'actividades', TRUE, 'Niños pintando en el taller de arte', 1),
('Momento de Lectura', 'Estudiantes disfrutando de la hora del cuento', 'imagen2.jpg', 'actividades', TRUE, 'Niños leyendo cuentos en círculo', 2),
('Juegos al Aire Libre', 'Recreo y actividades físicas en nuestro patio', 'imagen3.jpg', 'actividades', FALSE, 'Niños jugando en el patio del colegio', 3),
('Aula de Música', 'Aprendiendo música y ritmo de forma divertida', 'imagen4.jpg', 'actividades', FALSE, 'Clase de música con instrumentos', 4),
('Laboratorio de Ciencias', 'Primeros experimentos científicos', 'imagen5.jpg', 'actividades', FALSE, 'Niños experimentando en laboratorio', 5),
('Comedor Escolar', 'Hora del almuerzo con alimentos nutritivos', 'imagen6.jpg', 'instalaciones', FALSE, 'Niños almorzando en el comedor', 6),
('Biblioteca Infantil', 'Espacio de lectura y aprendizaje', 'imagen7.jpg', 'instalaciones', TRUE, 'Biblioteca con libros infantiles', 7),
('Aula Preescolar', 'Ambiente preparado para el aprendizaje', 'imagen8.jpg', 'instalaciones', FALSE, 'Aula equipada para preescolar', 8),
('Actividad de Grupo', 'Trabajo colaborativo y socialización', 'imagen9.jpg', 'actividades', FALSE, 'Niños trabajando en equipo', 9),
('Evento Familiar', 'Celebraciones con participación de familias', 'imagen10.jpg', 'eventos', TRUE, 'Evento familiar en el centro educativo', 10),
('Graduación 2024', 'Ceremonia de graduación de nuestros estudiantes', 'imagen11.jpg', 'eventos', FALSE, 'Ceremonia de graduación', 11),
('Taller de Padres', 'Actividades educativas para toda la familia', 'imagen12.jpg', 'eventos', FALSE, 'Taller educativo para padres e hijos', 12),
('Nuevas Instalaciones', 'Modernos espacios para el aprendizaje', 'imagen13.jpg', 'instalaciones', FALSE, 'Vista de las nuevas instalaciones', 13);

-- ========================================
-- EVENTOS DEL CALENDARIO 2025
-- ========================================
INSERT IGNORE INTO events (title, description, start_date, end_date, type, location, is_public, created_by) VALUES
('Inicio del Año Escolar 2025', 'Ceremonia de bienvenida para estudiantes y familias', '2025-03-01 09:00:00', '2025-03-01 11:00:00', 'academico', 'Auditorio Principal', TRUE, 1),
('Reunión de Padres de Familia', 'Primera reunión informativa del año', '2025-03-10 18:00:00', '2025-03-10 20:00:00', 'reunion', 'Aula Magna', TRUE, 1),
('Día de la Madre', 'Celebración especial del Día de la Madre', '2025-05-12 15:00:00', '2025-05-12 17:00:00', 'evento', 'Patio Principal', TRUE, 2),
('Feria de Ciencias Infantil', 'Exposición de proyectos científicos de los estudiantes', '2025-06-15 09:00:00', '2025-06-15 16:00:00', 'academico', 'Todo el Centro', TRUE, 1),
('Vacaciones de Invierno', 'Período de vacaciones de medio año', '2025-07-15 00:00:00', '2025-07-31 23:59:59', 'feriado', '', TRUE, 1),
('Festival de Talentos', 'Muestra de habilidades artísticas de los estudiantes', '2025-08-25 15:00:00', '2025-08-25 18:00:00', 'evento', 'Auditorio Principal', TRUE, 2),
('Día del Niño', 'Celebración especial para nuestros estudiantes', '2025-08-20 09:00:00', '2025-08-20 16:00:00', 'evento', 'Todo el Centro', TRUE, 1),
('Ceremonia de Graduación', 'Graduación de estudiantes del programa preescolar', '2025-12-10 16:00:00', '2025-12-10 19:00:00', 'academico', 'Auditorio Principal', TRUE, 1);

-- ========================================
-- DATOS DE PRUEBA PARA PEDIDOS
-- Pedidos de ejemplo para demonstrar funcionalidad "Mis Pedidos"
-- ========================================

-- Insertar pedidos de prueba para el usuario admin (ID: 1)
INSERT IGNORE INTO orders (id, order_number, user_id, subtotal, total_amount, status, payment_method, payment_status, shipping_address, notes, created_at) VALUES
(1, 'ORD-0001', 1, 84.50, 84.50, 'shipped', 'yape', 'paid', 'Av. Universitaria 1801, San Miguel, Lima', 'Pedido de prueba #1', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'ORD-0002', 1, 359.40, 359.40, 'delivered', 'transferencia', 'paid', 'Jr. Lampa 1069, Cercado de Lima', 'Pedido de prueba #2', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(3, 'ORD-0003', 1, 61.70, 61.70, 'pending', 'yape', 'pending', 'Av. Javier Prado Este 4200, Surco', 'Pedido de prueba #3', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 'ORD-0004', 1, 125.80, 125.80, 'confirmed', 'transferencia', 'paid', 'Av. Brasil 2950, Magdalena del Mar', 'Pedido de prueba #4', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(5, 'ORD-0005', 1, 358.50, 358.50, 'delivered', 'yape', 'paid', 'Calle Los Olivos 789, San Isidro', 'Pedido de prueba #5', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(6, 'ORD-0006', 1, 161.70, 161.70, 'confirmed', 'transferencia', 'pending', 'Av. Universitaria 1801, San Miguel, Lima', 'Pedido de prueba #6', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(7, 'ORD-0007', 1, 515.00, 515.00, 'processing', 'yape', 'paid', 'Jr. Lampa 1069, Cercado de Lima', 'Pedido de prueba #7', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 'ORD-0008', 1, 269.70, 269.70, 'confirmed', 'transferencia', 'paid', 'Av. Javier Prado Este 4200, Surco', 'Pedido de prueba #8', DATE_SUB(NOW(), INTERVAL 4 DAY));

-- Insertar detalles de pedidos de prueba
INSERT IGNORE INTO order_details (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES
-- Pedido 1
(1, 1, 'Casaca Escolar', 2, 42.25, 84.50),
-- Pedido 2  
(2, 2, 'Medias Escolares', 3, 12.80, 38.40),
(2, 3, 'Polo Escolar', 4, 28.50, 114.00),
(2, 15, 'Gorro Escolar', 5, 41.40, 207.00),
-- Pedido 3
(3, 4, 'Short Deportivo', 1, 35.70, 35.70),
(3, 6, 'Cuaderno Universitario', 2, 13.00, 26.00),
-- Pedido 4
(4, 7, 'Folder Manila', 3, 8.90, 26.70),
(4, 8, 'Kit de Arte', 1, 99.10, 99.10),
-- Pedido 5
(5, 9, 'Lápices de Colores', 2, 15.60, 31.20),
(5, 10, 'Arcilla Modelado', 4, 22.30, 89.20),
(5, 11, 'Pintura Tempera', 6, 39.85, 239.10),
-- Pedido 6
(6, 12, 'Tijeras Escolares', 2, 18.40, 36.80),
(6, 13, 'Botella de Agua', 3, 41.63, 124.90),
-- Pedido 7
(7, 14, 'Lonchera Térmica', 1, 55.20, 55.20),
(7, 16, 'Mochila Escolar', 2, 89.60, 179.20),
(7, 17, 'Estuche Escolar', 4, 70.15, 280.60),
-- Pedido 8
(8, 18, 'Toallas Húmedas', 3, 28.90, 86.70),
(8, 19, 'Delantal Arte', 2, 46.50, 93.00),
(8, 20, 'Uniforme Completo', 1, 90.00, 90.00);

-- ========================================
-- DATOS DE EJEMPLO PARA RECLAMACIONES
-- ========================================
INSERT IGNORE INTO reclamaciones (
    numero_reclamacion, nombres, apellidos, tipo_documento, numero_documento,
    telefono, email, direccion, tipo_bien, monto_reclamado, descripcion_bien,
    tipo_reclamacion, detalle_reclamacion, pedido_consumidor, estado,
    fecha_reclamacion, respuesta_empresa, acciones_adoptadas
) VALUES
('REC-20251001-001', 'María Elena', 'García López', 'DNI', '12345678', 
 '+51 987 654 321', 'maria.garcia@example.com', 'Av. Los Olivos 123, San Isidro, Lima',
 'PRODUCTO', 89.90, 'Uniforme escolar diario completo talla 6 - Camisa blanca y pantalón azul',
 'RECLAMO', 'El uniforme que compré para mi hijo presenta defectos en la costura de la camisa. Después de un solo uso, se descosió la manga derecha y el bolsillo frontal. Además, el color del pantalón no coincide exactamente con la muestra que me mostraron en la tienda.',
 'Solicito el cambio inmediato del uniforme defectuoso por uno nuevo en perfectas condiciones, o en su defecto, la devolución completa del dinero pagado.',
 'RESUELTO', DATE_SUB(NOW(), INTERVAL 15 DAY),
 'Estimada Sra. García, lamentamos los inconvenientes ocasionados. Hemos procedido al cambio inmediato del uniforme y hemos reforzado nuestros controles de calidad.',
 'Se realizó el cambio del producto defectuoso. Se implementó revisión adicional de calidad en uniformes antes de la venta.'),

('REC-20251002-002', 'Carlos Alberto', 'Mendoza Ruiz', 'DNI', '87654321',
 '+51 998 765 432', 'carlos.mendoza@example.com', 'Jr. Las Flores 456, Miraflores, Lima',
 'SERVICIO', 0.00, 'Servicio de matrícula y proceso de inscripción para el programa preescolar',
 'QUEJA', 'El proceso de matrícula fue extremadamente lento y desorganizado. Tuve que hacer tres visitas al centro educativo para completar un trámite que me dijeron que se resolvería en una sola cita. El personal no tenía información clara sobre los documentos necesarios y me pidieron documentos adicionales que no estaban especificados inicialmente.',
 'Solicito una mejora en el proceso de matrícula con información clara y precisa desde el inicio, así como capacitación al personal para brindar un mejor servicio.',
 'EN_PROCESO', DATE_SUB(NOW(), INTERVAL 8 DAY),
 'Sr. Mendoza, agradecemos su feedback. Estamos implementando mejoras en nuestro proceso de matrícula para brindar un mejor servicio.',
 'Se está reorganizando el proceso de matrícula. Se creó una lista de verificación clara de documentos y se capacitó al personal administrativo.'),

('REC-20251003-003', 'Ana Sofía', 'Vargas Torres', 'CE', '001234567',
 '+51 976 543 210', 'ana.vargas@example.com', 'Calle San Martín 789, Barranco, Lima',
 'PRODUCTO', 45.90, 'Kit de arte completo con pinceles, témperas y papel',
 'RECLAMO', 'Compré un kit de arte para mi hija y al abrirlo en casa descubrí que faltaban varios elementos: 3 pinceles de diferentes tamaños, 2 colores de témpera (rojo y amarillo) y las hojas de papel estaban húmedas y arrugadas, probablemente por mal almacenamiento.',
 'Solicito la entrega de los elementos faltantes del kit de arte o la devolución parcial del dinero correspondiente a los items que no se incluyeron.',
 'PENDIENTE', DATE_SUB(NOW(), INTERVAL 3 DAY),
 NULL, NULL),

('REC-20251004-004', 'Roberto José', 'Fuentes Castro', 'DNI', '45678912',
 '+51 965 432 109', 'roberto.fuentes@example.com', 'Av. Brasil 234, Magdalena del Mar, Lima',
 'SERVICIO', 500.00, 'Servicio educativo del programa de bebés - Modalidad completa',
 'RECLAMO', 'Mi bebé de 8 meses ha estado asistiendo al programa durante 2 meses, pero he notado que no se están cumpliendo las actividades prometidas en el programa. Las sesiones de estimulación temprana son muy cortas y no incluyen todos los ejercicios mencionados en el prospecto. Además, el ratio de niños por educadora es mayor al prometido inicialmente.',
 'Exijo el cumplimiento completo del programa educativo según lo contratado, con las horas y actividades prometidas, o una reducción proporcional en la mensualidad.',
 'PENDIENTE', DATE_SUB(NOW(), INTERVAL 1 DAY),
 NULL, NULL),

('REC-20251005-005', 'Lucía Carmen', 'Herrera Palma', 'DNI', '78912345',
 '+51 954 321 098', 'lucia.herrera@example.com', 'Urb. San Felipe 567, Jesús María, Lima',
 'PRODUCTO', 25.90, 'Gorro institucional con protección UV y logo bordado',
 'QUEJA', 'El proceso de compra en la tienda fue muy deficiente. La vendedora no conocía bien los productos, me dio información incorrecta sobre las tallas disponibles y tuve que esperar más de 30 minutos para ser atendida a pesar de que no había otros clientes. La atención al cliente fue muy poco profesional.',
 'Solicito una mejora en la capacitación del personal de ventas y un mejor sistema de atención al cliente para evitar estas experiencias negativas.',
 'PENDIENTE', DATE_SUB(NOW(), INTERVAL 5 DAY),
 NULL, NULL);



-- Asegurar que existan los registros necesarios para claves foráneas
INSERT IGNORE INTO students (id, first_name, last_name, birth_date) VALUES (1, 'Alumno', 'Ejemplo', '2018-01-01');
INSERT IGNORE INTO users (id, name, email, password, role) VALUES (1, 'Profesor Ejemplo', 'profesor@wawalu.edu.pe', 'hash', 'staff');

-- Datos de ejemplo para el sistema de informes
INSERT INTO reports (student_id, teacher_id, subject, title, content, report_type, priority, status) VALUES
(1, 1, 'Matemáticas', 'Progreso Académico - Octubre 2025', 'El estudiante ha mostrado una mejora significativa en su comprensión de operaciones básicas.\n\nSe observa:\n- Mayor participación en clase\n- Resolución correcta de ejercicios\n- Trabajo colaborativo efectivo\n\nSe recomienda continuar con la práctica en casa para reforzar lo aprendido.', 'academic', 'normal', 'sent'),
(1, 1, 'Comportamiento', 'Observación Conductual Semanal', 'El alumno demuestra excelente comportamiento en clase y colabora activamente con sus compañeros.\n\nAspectos positivos:\n- Respeta las normas de convivencia\n- Ayuda a sus compañeros\n- Participa ordenadamente\n\nSe destaca su liderazgo positivo en actividades grupales.', 'behavioral', 'normal', 'sent'),
(1, 1, 'General', 'Informe Mensual de Progreso', 'Resumen general del progreso del estudiante durante el mes de octubre.\n\nLogros destacados:\n- Adaptación positiva al programa educativo\n- Cumplimiento de tareas y responsabilidades\n- Desarrollo de habilidades sociales\n\nÁreas de mejora:\n- Puntualidad en entrega de trabajos\n- Mayor participación en actividades extracurriculares', 'general', 'normal', 'sent'),
(1, 1, 'Ciencias Naturales', 'Proyecto de Investigación', 'El estudiante ha completado exitosamente el proyecto sobre el sistema solar.\n\nCalificación: Excelente (18/20)\n\nFortalezas observadas:\n- Investigación detallada y bien documentada\n- Presentación creativa y organizada\n- Dominio del tema\n\nSugerencias:\n- Incluir más fuentes bibliográficas\n- Practicar exposición oral', 'academic', 'normal', 'read');

-- Preferencias de notificación por defecto para usuarios
INSERT INTO notification_preferences (user_id, notification_type, report_type, is_enabled, frequency) VALUES
(1, 'email', 'all', TRUE, 'immediate'),
(1, 'sms', 'urgent', TRUE, 'immediate'),
(1, 'in_app', 'all', TRUE, 'immediate'),
(1, 'push', 'high', FALSE, 'immediate');

-- ========================================
-- VERIFICACIÓN Y MENSAJES FINALES
-- ========================================

-- Generar números únicos para órdenes y pagos
UPDATE orders SET order_number = CONCAT('ORD-', YEAR(created_at), '-', LPAD(id, 6, '0')) WHERE order_number IS NULL OR order_number = '';
UPDATE payments SET payment_number = CONCAT('PAY-', YEAR(created_at), '-', LPAD(id, 6, '0')) WHERE payment_number IS NULL OR payment_number = '';
UPDATE order_payments SET payment_number = CONCAT('OPY-', YEAR(created_at), '-', LPAD(id, 6, '0')) WHERE payment_number IS NULL OR payment_number = '';

-- Generar códigos únicos para estudiantes
UPDATE students SET student_code = CONCAT('EST-', YEAR(created_at), '-', LPAD(id, 4, '0')) WHERE student_code IS NULL OR student_code = '';

-- Finalizar transacción
COMMIT;

-- Verificación de datos creados
SELECT 'RESUMEN DE DATOS CREADOS:' as info;
SELECT 'Usuarios creados:' as tipo, COUNT(*) as cantidad FROM users;
SELECT 'Programas creados:' as tipo, COUNT(*) as cantidad FROM programs;
SELECT 'Productos creados:' as tipo, COUNT(*) as cantidad FROM products;
SELECT 'Pedidos creados:' as tipo, COUNT(*) as cantidad FROM orders;
SELECT 'Items de pedidos:' as tipo, COUNT(*) as cantidad FROM order_details;
SELECT 'Noticias creadas:' as tipo, COUNT(*) as cantidad FROM news;
SELECT 'Configuraciones creadas:' as tipo, COUNT(*) as cantidad FROM site_settings;
SELECT 'Imágenes en galería:' as tipo, COUNT(*) as cantidad FROM gallery;
SELECT 'Eventos programados:' as tipo, COUNT(*) as cantidad FROM events;
SELECT 'Informes creados:' as tipo, COUNT(*) as cantidad FROM reports;
SELECT 'Adjuntos de informes:' as tipo, COUNT(*) as cantidad FROM report_attachments;
SELECT 'Notificaciones:' as tipo, COUNT(*) as cantidad FROM report_notifications;
SELECT 'Preferencias de notificación:' as tipo, COUNT(*) as cantidad FROM notification_preferences;

SELECT 'PRODUCTOS POR CATEGORÍA:' as info;
SELECT category as categoria, COUNT(*) as cantidad FROM products GROUP BY category;

SELECT 'PEDIDOS POR ESTADO:' as info;
SELECT status as estado, COUNT(*) as cantidad FROM orders GROUP BY status;

SELECT 'INFORMES POR TIPO:' as info;
SELECT report_type as tipo, COUNT(*) as cantidad FROM reports GROUP BY report_type;

SELECT 'INFORMES POR ESTADO:' as info;
SELECT status as estado, COUNT(*) as cantidad FROM reports GROUP BY status;

SELECT 'CONFIGURACIÓN COMPLETADA EXITOSAMENTE ✅' as resultado;
SELECT 'SISTEMA DE MIS PEDIDOS IMPLEMENTADO ✅' as funcionalidad;
SELECT 'SISTEMA DE INFORMES Y NOTIFICACIONES IMPLEMENTADO ✅' as nueva_funcionalidad;