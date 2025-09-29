-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS wawalu_db;
USE wawalu_db;

-- Tabla de usuarios (debe crearse primero ya que otras tablas la referencian)
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
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Tabla de programas
CREATE TABLE IF NOT EXISTS programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    age_range VARCHAR(50),
    capacity INT,
    price DECIMAL(10,2),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo en programas
INSERT INTO programs (name, description, age_range, capacity, price, active) VALUES
('Programa Bebés', 'Programa especializado para bebés y niños pequeños', '6 meses - 2 años', 8, 500.00, true),
('Programa Inicial', 'Programa de desarrollo temprano', '2 - 3 años', 12, 600.00, true),
('Programa Preescolar', 'Programa completo de educación preescolar', '3 - 5 años', 15, 700.00, true);

-- Tabla de información adicional de padres
CREATE TABLE IF NOT EXISTS parent_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    dni VARCHAR(8) NOT NULL,
    occupation VARCHAR(100),
    relationship ENUM('padre', 'madre', 'tutor') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_dni (user_id, dni)
);



-- Tabla de estudiantes
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    guardian_id INT,
    program_id INT,
    blood_type VARCHAR(5),
    allergies TEXT,
    medical_notes TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    photo VARCHAR(255),
    status ENUM('active', 'inactive', 'graduated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guardian_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
    INDEX idx_guardian (guardian_id),
    INDEX idx_program (program_id),
    INDEX idx_status (status)
);

-- Tabla de contactos/mensajes
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT,
    status ENUM('pending', 'contacted', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de matrículas
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    program_id INT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    enrollment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Tabla de noticias
CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    excerpt TEXT,
    image_url VARCHAR(255),
    author_id INT,
    category VARCHAR(50),
    is_featured BOOLEAN DEFAULT false,
    slug VARCHAR(200) UNIQUE,
    meta_description VARCHAR(255),
    meta_keywords VARCHAR(255),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_published (published_at),
    INDEX idx_category (category),
    FULLTEXT INDEX idx_content (title, content)
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category ENUM('uniformes', 'utiles', 'accesorios') NOT NULL,
    image_url VARCHAR(255),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_active (active)
);

-- Tabla de carrito de compras
CREATE TABLE IF NOT EXISTS shopping_cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id)
);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    shipping_address TEXT,
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- Tabla de detalles de orden
CREATE TABLE IF NOT EXISTS order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Tabla de galería de imágenes
CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);

-- Tabla de eventos del calendario
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    location VARCHAR(200),
    type ENUM('academic', 'social', 'holiday', 'other') NOT NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dates (start_date, end_date),
    INDEX idx_type (type)
);

-- Tabla de asistencia
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (student_id, date),
    INDEX idx_date (date)
);

-- Tabla de pagos de matrícula
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE RESTRICT,
    INDEX idx_status (status)
);

-- Tabla de actividades de administradores
CREATE TABLE IF NOT EXISTS admin_activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_description TEXT NOT NULL,
    target_table VARCHAR(50),
    target_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id),
    INDEX idx_admin (admin_id),
    INDEX idx_action (action_type),
    INDEX idx_timestamp (timestamp)
);

-- Tabla de sesiones activas
CREATE TABLE IF NOT EXISTS active_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_session (user_id, session_id),
    INDEX idx_last_activity (last_activity)
);

-- Tabla de configuraciones del sitio
CREATE TABLE IF NOT EXISTS site_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    `key` VARCHAR(100) UNIQUE NOT NULL,
    `value` TEXT,
    description VARCHAR(255),
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_key (`key`)
);

-- Actualizar usuarios existentes para marcar staff como admins
UPDATE users SET is_admin = TRUE WHERE role = 'staff';

-- Insertar productos de ejemplo para la tienda
INSERT IGNORE INTO products (id, name, description, price, stock, category, image_url, active) VALUES
-- Productos de uniformes
(1, 'Uniforme Diario', 'Uniforme escolar diario completo con camisa y pantalón/falda', 89.90, 20, 'uniformes', 'uniform1.jpg', TRUE),
(2, 'Uniforme Deportivo', 'Conjunto deportivo completo con polo y short', 79.90, 15, 'uniformes', 'uniform2.jpg', TRUE),
(3, 'Polo Institucional', 'Polo con logo institucional bordado', 29.90, 50, 'uniformes', 'polo.jpg', TRUE),
(4, 'Short Deportivo', 'Short deportivo con logo institucional', 35.90, 30, 'uniformes', 'short.jpg', TRUE),
(5, 'Medias Escolares', 'Par de medias escolares color blanco', 12.90, 100, 'uniformes', 'socks.jpg', TRUE),
(6, 'Casaca Institucional', 'Casaca con logo bordado y cierre frontal', 89.90, 25, 'uniformes', 'jacket.jpg', TRUE),

-- Productos de útiles escolares
(7, 'Kit de Arte', 'Kit completo de arte con pinceles, témperas y papel', 45.90, 40, 'utiles', 'artkit.jpg', TRUE),
(8, 'Cuaderno A4', 'Cuaderno institucional tamaño A4 con logo', 8.90, 200, 'utiles', 'notebook.jpg', TRUE),
(9, 'Set de Lápices', 'Set de lápices de colores de 24 unidades', 15.90, 80, 'utiles', 'pencils.jpg', TRUE),
(10, 'Plastilina', 'Set de plastilina no tóxica de 6 colores', 12.90, 60, 'utiles', 'clay.jpg', TRUE),
(11, 'Tijeras Escolares', 'Tijeras punta roma de seguridad para niños', 5.90, 150, 'utiles', 'scissors.jpg', TRUE),
(12, 'Folder Institucional', 'Folder con logo institucional tamaño A4', 7.90, 120, 'utiles', 'folder.jpg', TRUE),
(13, 'Témperas', 'Set de témperas de 12 colores no tóxicas', 18.90, 75, 'utiles', 'paint.jpg', TRUE),

-- Productos de accesorios
(14, 'Mochila Escolar', 'Mochila escolar con logo institucional y compartimentos', 79.90, 35, 'accesorios', 'backpack.jpg', TRUE),
(15, 'Lonchera Térmica', 'Lonchera térmica con logo institucional', 45.90, 45, 'accesorios', 'lunchbox.jpg', TRUE),
(16, 'Gorro Institucional', 'Gorro con protección UV y logo bordado', 25.90, 55, 'accesorios', 'hat.jpg', TRUE),
(17, 'Botella de Agua', 'Botella de agua reutilizable con logo', 19.90, 90, 'accesorios', 'bottle.jpg', TRUE),
(18, 'Set de Toallas', 'Set de 2 toallas con logo institucional', 29.90, 40, 'accesorios', 'towels.jpg', TRUE),
(19, 'Mandil de Arte', 'Mandil impermeable para actividades artísticas', 35.90, 30, 'accesorios', 'apron.jpg', TRUE),
(20, 'Porta Útiles', 'Estuche para útiles escolares con compartimentos', 22.90, 70, 'accesorios', 'case.jpg', TRUE);

-- Crear un usuario administrador por defecto (password: admin123)
INSERT IGNORE INTO users (id, name, email, password, role, is_admin, phone, created_at) VALUES 
(1, 'Administrador', 'admin@wawalu.edu.pe', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNi2JL8MgWcl2', 'admin', TRUE, '999888777', NOW());

-- Crear cuenta de administrador de Diego Centeno (password: Diego!123)
INSERT IGNORE INTO users (id, name, email, password, role, is_admin, phone, created_at) VALUES 
(2, 'Diego Centeno', 'diego.centeno@vallegrande.edu.pe', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE, '999888778', NOW());

-- Crear algunos usuarios de ejemplo (password: 123456)
INSERT IGNORE INTO users (name, email, password, role, is_admin, phone, created_at) VALUES 
('María García', 'maria.garcia@example.com', '$2b$12$K4vGzaHCh8Hw1fHcPmC1vuZtHv.VgsP8rLPkJqZoThHKUhQm8bUNW', 'madre', FALSE, '987654321', NOW()),
('Juan Pérez', 'juan.perez@example.com', '$2b$12$K4vGzaHCh8Hw1fHcPmC1vuZtHv.VgsP8rLPkJqZoThHKUhQm8bUNW', 'padre', FALSE, '987654322', NOW()),
('Ana López', 'ana.lopez@example.com', '$2b$12$K4vGzaHCh8Hw1fHcPmC1vuZtHv.VgsP8rLPkJqZoThHKUhQm8bUNW', 'tutor', FALSE, '987654323', NOW());

-- Agregar algunas noticias de ejemplo
INSERT IGNORE INTO news (title, content, excerpt, category, image_url, is_featured, author_id, published_at, created_at) VALUES
('Bienvenidos al nuevo año escolar 2025', 'Estamos emocionados de dar la bienvenida a todos nuestros estudiantes y familias...', 'Iniciamos un nuevo año lleno de oportunidades de aprendizaje y crecimiento.', 'Anuncios', 'news1.jpg', TRUE, 1, NOW(), NOW()),
('Inauguración del nuevo espacio de arte', 'Con gran alegría anunciamos la inauguración de nuestro nuevo espacio dedicado al arte...', 'Un espacio especialmente diseñado para fomentar la creatividad de nuestros niños.', 'Eventos', 'news2.jpg', TRUE, 1, NOW(), NOW()),
('Taller de música para padres e hijos', 'Invitamos a todas las familias a participar en nuestro taller especial de música...', 'Una oportunidad única para compartir y aprender en familia.', 'Actividades', 'news3.jpg', FALSE, 1, NOW(), NOW());

-- Insertar configuraciones básicas del sitio
INSERT IGNORE INTO site_settings (`key`, `value`, description, updated_by) VALUES
('site_name', 'Centro Educativo Wawalu', 'Nombre del sitio web', 2),
('site_description', 'Centro de desarrollo educativo temprano especializado en el crecimiento integral de los niños', 'Descripción del sitio web', 2),
('contact_email', 'diego.centeno@vallegrande.edu.pe', 'Email de contacto principal', 2),
('contact_phone', '+51 999 888 777', 'Teléfono de contacto principal', 2),
('contact_address', 'Av. Educación 123, Lima, Perú', 'Dirección física del centro', 2),
('facebook_url', 'https://facebook.com/wawalu', 'URL de Facebook', 2),
('instagram_url', 'https://instagram.com/wawalu', 'URL de Instagram', 2),
('whatsapp_number', '+51999888777', 'Número de WhatsApp', 2),
('enrollment_open', 'true', 'Estado de las matrículas (true/false)', 2),
('enrollment_deadline', '2025-12-15', 'Fecha límite de matrícula', 2);

-- Verificar la creación exitosa de productos
SELECT 'Productos creados exitosamente' as mensaje, COUNT(*) as total_productos FROM products;
SELECT 'Por categoría:' as detalle, category as categoria, COUNT(*) as cantidad FROM products GROUP BY category;