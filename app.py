from flask import Flask, render_template, redirect, url_for, request, jsonify, session, flash, send_from_directory
import os
from pathlib import Path

# Database adapter: try to use flask_mysqldb (mysqlclient) first, otherwise fall back to PyMySQL shim
try:
    from flask_mysqldb import MySQL
    import MySQLdb.cursors
except Exception:
    # Fallback for environments where compiling mysqlclient is difficult (eg. Windows)
    # Use PyMySQL and provide a lightweight MySQL class with a `.connection` property
    import pymysql
    pymysql.install_as_MySQLdb()
    import MySQLdb.cursors  # now available via the shim

    class MySQL:
        def __init__(self, app=None):
            self.app = None
            if app:
                self.init_app(app)

        def init_app(self, app):
            self.app = app

        @property
        def connection(self):
            cfg = self.app.config
            # Return a new connection each time to mimic flask_mysqldb behavior
            return pymysql.connect(
                host=cfg.get('MYSQL_HOST', 'localhost'),
                user=cfg.get('MYSQL_USER', 'root'),
                password=cfg.get('MYSQL_PASSWORD', ''),
                db=cfg.get('MYSQL_DB', ''),
                port=int(cfg.get('MYSQL_PORT', 3306)),
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=cfg.get('MYSQL_AUTOCOMMIT', True)
            )
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime
from dotenv import load_dotenv
from decimal import Decimal
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import urllib.parse

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)

# Configuración de MySQL AWS RDS
app.config['MYSQL_HOST'] = os.getenv('DB_HOST', 'wawalu.czi4a8qyuwk5.us-east-1.rds.amazonaws.com')
app.config['MYSQL_USER'] = os.getenv('DB_USER', 'root')
app.config['MYSQL_PASSWORD'] = os.getenv('DB_PASSWORD', 'diego123456')
app.config['MYSQL_DB'] = os.getenv('DB_NAME', 'wawalu_db')
app.config['MYSQL_PORT'] = int(os.getenv('DB_PORT', 3306))

# Configuraciones adicionales para AWS RDS
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
app.config['MYSQL_AUTOCOMMIT'] = True
app.config['MYSQL_CONNECT_TIMEOUT'] = 60

# Configuración de contacto
CONTACT_EMAIL = 'diego.centeno@vallegrande.edu.pe'
CONTACT_PHONE = '+51 942 139 788'
WHATSAPP_NUMBER = '51942139788'  # Sin + y sin espacios para WhatsApp
FACEBOOK_URL = 'https://www.facebook.com/search/top?q=wawalu'

# Configuración de correo SMTP (opcional para envío automático)
SMTP_SERVER = 'smtp.gmail.com'  # O el servidor de tu proveedor
SMTP_PORT = 587

# Ruta para Términos y Condiciones
@app.route('/terminos')
def terms():
    return render_template('terms.html')
SMTP_EMAIL = os.getenv('SMTP_EMAIL', CONTACT_EMAIL)
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')  # Contraseña de aplicación

# Configuración de seguridad CSP
@app.after_request
def set_csp_header(response):
    csp_policy = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self';"
    )
    response.headers['Content-Security-Policy'] = csp_policy
    return response

# Funciones de utilidad para contacto
def send_email(to_email, subject, body, is_html=False):
    """Función para enviar correos electrónicos"""
    try:
        if not SMTP_PASSWORD:
            print("❌ ERROR: SMTP_PASSWORD no configurado en .env")
            print("📧 Para configurar Gmail:")
            print("1. Ve a https://myaccount.google.com/security")
            print("2. Activa 'Verificación en 2 pasos'")
            print("3. Ve a 'Contraseñas de aplicaciones'")
            print("4. Genera una contraseña para 'Correo'")
            print("5. Agrega SMTP_PASSWORD=tu-contraseña-generada en .env")
            return False
            
        print(f"📧 Intentando enviar email a: {to_email}")
        print(f"📧 Desde: {SMTP_EMAIL}")
        print(f"📧 Servidor: {SMTP_SERVER}:{SMTP_PORT}")
            
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        
        if is_html:
            msg.attach(MIMEText(body, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_EMAIL, to_email, text)
        server.quit()
        
        print("✅ Email enviado exitosamente!")
        return True
    except Exception as e:
        print(f"❌ Error enviando correo: {e}")
        print(f"📧 Verifica tu configuración SMTP en .env")
        return False

def generate_whatsapp_url(message):
    """Genera URL de WhatsApp con mensaje predefinido"""
    encoded_message = urllib.parse.quote(message)
    return f"https://wa.me/{WHATSAPP_NUMBER}?text={encoded_message}"

def get_contact_info():
    """Retorna información de contacto para usar en templates"""
    return {
        'email': CONTACT_EMAIL,
        'phone': CONTACT_PHONE,
        'whatsapp': WHATSAPP_NUMBER,
        'whatsapp_url': generate_whatsapp_url("Hola, me gustaría obtener más información sobre Wawalu."),
        'facebook_url': FACEBOOK_URL
    }

# Admin middleware
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session or not session.get('is_admin'):
            flash('Acceso denegado. Se requieren privilegios de administrador.', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Function to track user activity
def track_user_activity():
    if 'logged_in' in session and 'id' in session:
        cursor = mysql.connection.cursor()
        cursor.execute('''
            INSERT INTO active_sessions (user_id, session_id, ip_address, user_agent)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE last_activity = CURRENT_TIMESTAMP
        ''', (
            session['id'],
            session.get('_id', ''),
            request.remote_addr,
            request.user_agent.string
        ))
        mysql.connection.commit()

# Inicialización de MySQL
mysql = MySQL(app)

# Clave secreta para sesiones desde variable de entorno
app.secret_key = os.getenv('SECRET_KEY', 'wawalu-secret-key-super-secure-2025')

# Filtros personalizados para Jinja2
@app.template_filter('nl2br')
def nl2br_filter(text):
    """Convierte saltos de línea en etiquetas <br>"""
    if not text:
        return text
    return text.replace('\n', '<br>\n').replace('\r\n', '<br>\n')

# Context processor para hacer información de contacto disponible globalmente
@app.context_processor
def inject_contact_info():
    return {'contact_info': get_contact_info()}

def test_db_connection():
    """Función para probar la conexión a la base de datos AWS RDS"""
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        cursor.close()
        print("✅ Conexión exitosa a AWS RDS MySQL")
        return True
    except Exception as e:
        print(f"❌ Error conectando a AWS RDS: {e}")
        return False

def get_menu_images():
    """Obtiene las imágenes del directorio img y las organiza por categorías."""
    img_dir = Path(app.static_folder) / 'img'
    menu_items = []
    
    # Categorías predefinidas con sus rutas y nombres
    categories = {
        'espacios': {'path': 'espacios', 'title': 'Nuestros Espacios'},
        'actividades': {'path': 'actividades', 'title': 'Actividades'},
        'eventos': {'path': 'eventos', 'title': 'Eventos Especiales'},
        'proyectos': {'path': 'proyectos', 'title': 'Proyectos'},
        'gallery': {'path': 'gallery', 'title': 'Galería'},
    }
    
    # Extensiones de imagen permitidas
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    
    for category, info in categories.items():
        category_path = img_dir / info['path']
        if category_path.exists():
            images = []
            for img_file in category_path.iterdir():
                if img_file.suffix.lower() in allowed_extensions:
                    images.append({
                        'filename': img_file.name,
                        'path': f"img/{info['path']}/{img_file.name}",
                        'alt': img_file.stem.replace('-', ' ').title()
                    })
            if images:
                menu_items.append({
                    'category': category,
                    'title': info['title'],
                    'images': sorted(images, key=lambda x: x['filename'])[:4]  # Limitamos a 4 imágenes por categoría
                })
    
    return menu_items

@app.route('/')
def home():
    menu_images = get_menu_images()
    return render_template('index.html', menu_images=menu_images)

@app.route('/calendario')
def calendar():
    return render_template('calendar.html')

@app.route('/programas')
def programs():
    return render_template('programs.html')

@app.route('/nosotros')
def about():
    return render_template('about.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        try:
            data = request.get_json()
            name = data.get('fullName')  # Cambiado de 'name' a 'fullName' para coincidir con el frontend
            email = data.get('email')
            password = data.get('password')
            phone = data.get('phone')  # Agregado el campo teléfono
            role = data.get('role')  # Agregado el campo role
            
            # Verificar que todos los campos necesarios estén presentes
            if not all([name, email, password, phone, role]):
                return jsonify({
                    "success": False,
                    "message": "Todos los campos son obligatorios"
                }), 400
                
            # Validar que el rol sea válido para registro público
            valid_roles = ['padre', 'madre', 'tutor']
            if role not in valid_roles:
                return jsonify({
                    "success": False,
                    "message": "Rol no válido para registro público"
                }), 400

            # Crear cursor para la base de datos
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            
            # Verificar si el email ya existe
            cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
            account = cursor.fetchone()
            
            if account:
                return jsonify({
                    "success": False,
                    "message": "Ya existe una cuenta con este correo electrónico"
                }), 400
            
            # Hashear la contraseña
            hashed_password = generate_password_hash(password)
            
            # Insertar nuevo usuario
            cursor.execute('INSERT INTO users (name, email, password, phone, role) VALUES (%s, %s, %s, %s, %s)',
                         (name, email, hashed_password, phone, role))
            
            # Guardar cambios
            mysql.connection.commit()
            
            # Enviar email de notificación de nuevo registro
            email_subject = f"Nuevo Registro de Usuario - {name}"
            
            email_body = f"""
Nuevo usuario registrado en la página web de Wawalu

=== INFORMACIÓN DEL USUARIO ===
Nombre completo: {name}
Email: {email}
Teléfono: {phone}
Rol/Relación: {role}

=== DETALLES DEL REGISTRO ===
Fecha de registro: {datetime.now().strftime('%d/%m/%Y %H:%M')}
IP de origen: {request.remote_addr}

---
Este usuario se registró desde el formulario de registro de Wawalu.
Ya puede iniciar sesión y proceder con la matrícula de estudiantes.
"""
            
            # Intentar enviar correo
            print(f"🔄 Intentando enviar email de nuevo registro...")
            print(f"📧 Destinatario: {CONTACT_EMAIL}")
            print(f"📧 Asunto: {email_subject}")
            email_sent = send_email(CONTACT_EMAIL, email_subject, email_body)
            print(f"📧 Resultado del envío: {'✅ Exitoso' if email_sent else '❌ Falló'}")
            
            return jsonify({
                "success": True,
                "message": "Registro exitoso"
            }), 200
            
        except Exception as e:
            return jsonify({
                "success": False,
                "message": "Error en el registro: " + str(e)
            }), 500
            
    return render_template('register.html')

@app.route('/contacto', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        try:
            data = request.get_json()
            name = data.get('name', '')
            email = data.get('email', '')
            phone = data.get('phone', '')
            subject = data.get('subject', 'Contacto desde Wawalu')
            message = data.get('message', '')
            
            # Validar campos requeridos
            if not all([name, email, message]):
                return jsonify({
                    "success": False,
                    "message": "Nombre, email y mensaje son campos obligatorios"
                }), 400
            
            # Crear cursor para guardar en base de datos
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            
            # Crear tabla de contactos si no existe
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS contact_messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    phone VARCHAR(20),
                    subject VARCHAR(200),
                    message TEXT NOT NULL,
                    status ENUM('nuevo', 'leido', 'respondido') DEFAULT 'nuevo',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            ''')
            mysql.connection.commit()
            
            # Guardar mensaje en base de datos
            cursor.execute('''
                INSERT INTO contact_messages (name, email, phone, subject, message)
                VALUES (%s, %s, %s, %s, %s)
            ''', (name, email, phone, subject, message))
            mysql.connection.commit()
            
            # Preparar contenido del correo
            email_subject = f"Nuevo mensaje de contacto: {subject}"
            email_body = f"""
            Nuevo mensaje de contacto recibido:
            
            Nombre: {name}
            Email: {email}
            Teléfono: {phone or 'No proporcionado'}
            Asunto: {subject}
            
            Mensaje:
            {message}
            
            ---
            Este mensaje fue enviado desde el formulario de contacto de Wawalu.
            """
            
            # Intentar enviar correo
            print(f"🔄 Intentando enviar email desde formulario de contacto...")
            print(f"📧 Destinatario: {CONTACT_EMAIL}")
            print(f"📧 Asunto: {email_subject}")
            email_sent = send_email(CONTACT_EMAIL, email_subject, email_body)
            print(f"📧 Resultado del envío: {'✅ Exitoso' if email_sent else '❌ Falló'}")
            
            # Generar URL de WhatsApp como alternativa
            whatsapp_message = f"Hola, soy {name}. {message}"
            whatsapp_url = generate_whatsapp_url(whatsapp_message)
            
            response_data = {
                "success": True,
                "message": "Mensaje recibido correctamente",
                "whatsapp_url": whatsapp_url
            }
            
            if not email_sent:
                response_data["warning"] = "El mensaje se guardó pero no se pudo enviar por correo automáticamente"
            
            return jsonify(response_data), 200
            
        except Exception as e:
            return jsonify({
                "success": False,
                "message": f"Error al procesar el mensaje: {str(e)}"
            }), 500
    
    # GET request - mostrar página de contacto con información
    return render_template('contact.html')

@app.route('/api/contact/info', methods=['GET'])
def get_contact_info_api():
    """API para obtener información de contacto"""
    return jsonify({
        "success": True,
        "contact": get_contact_info()
    })

@app.route('/api/contact/whatsapp', methods=['POST'])
def generate_whatsapp_link():
    """API para generar enlace de WhatsApp con mensaje personalizado"""
    try:
        data = request.get_json()
        message = data.get('message', 'Hola, me gustaría obtener más información sobre Wawalu.')
        
        whatsapp_url = generate_whatsapp_url(message)
        
        return jsonify({
            "success": True,
            "whatsapp_url": whatsapp_url,
            "phone": CONTACT_PHONE
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error generando enlace: {str(e)}"
        }), 500

@app.route('/galeria')
def gallery():
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Crear tabla de galería si no existe
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS gallery (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                category ENUM('espacios', 'actividades', 'eventos', 'proyectos') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        ''')
        mysql.connection.commit()
        
        # Obtener todas las imágenes
        cursor.execute('SELECT * FROM gallery ORDER BY created_at DESC')
        images = cursor.fetchall()
        
        # Si no hay imágenes, insertar algunas de ejemplo
        if not images:
            example_images = [
                ('imagen1.jpg', 'Sala de Arte', 'Espacio dedicado a la expresión artística', 'espacios'),
                ('imagen2.jpg', 'Área de Juegos', 'Zona de recreación y desarrollo motriz', 'espacios'),
                ('imagen3.jpg', 'Taller de Pintura', 'Niños explorando su creatividad', 'actividades'),
                ('imagen4.jpg', 'Hora de Lectura', 'Momento de historias y aprendizaje', 'actividades'),
                ('imagen5.jpg', 'Día de la Familia', 'Celebración con padres y niños', 'eventos'),
                ('imagen6.jpg', 'Festival de Arte', 'Exposición de trabajos artísticos', 'eventos'),
                ('imagen7.jpg', 'Proyecto Naturaleza', 'Explorando el mundo natural', 'proyectos'),
                ('imagen8.jpg', 'Proyecto Ciencia', 'Experimentos divertidos', 'proyectos')
            ]
            
            for filename, title, description, category in example_images:
                cursor.execute('''
                    INSERT INTO gallery (filename, title, description, category) 
                    VALUES (%s, %s, %s, %s)
                ''', (filename, title, description, category))
            
            mysql.connection.commit()
            
            # Obtener las imágenes recién insertadas
            cursor.execute('SELECT * FROM gallery ORDER BY created_at DESC')
            images = cursor.fetchall()
        
        return render_template('gallery.html', images=images)
        
    except Exception as e:
        flash(f'Error al cargar la galería: {str(e)}', 'error')
        # Datos de respaldo si hay error con la base de datos
        fallback_images = [
            {
                'filename': 'imagen1.jpg',
                'title': 'Sala de Arte',
                'description': 'Espacio dedicado a la expresión artística',
                'category': 'espacios'
            },
            {
                'filename': 'imagen2.jpg',
                'title': 'Área de Juegos', 
                'description': 'Zona de recreación y desarrollo motriz',
                'category': 'espacios'
            }
        ]
        return render_template('gallery.html', images=fallback_images)

@app.route('/tienda')
def shop():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM products WHERE active = TRUE ORDER BY category, name')
    db_products = cursor.fetchall()
    
    # Organizar productos por categoría
    products = {}
    for product in db_products:
        category = product['category']
        if category not in products:
            products[category] = []
        products[category].append({
            'id': product['id'],
            'name': product['name'],
            'price': float(product['price']),
            'image': product['image_url'] or 'default.jpg',
            'description': product['description'] or '',
            'stock': product['stock'],
            'talla': product.get('talla', None),
            'features': []  # Agregar características si es necesario
        })
    
    # Si no hay productos en la base de datos, usar datos de ejemplo
    if not products:
        products = {
            'uniformes': [
                {'id': 1, 'name': 'Uniforme Diario', 'price': 89.90, 'image': 'uniform1.jpg', 'description': 'Uniforme escolar diario completo', 'stock': 20},
                {'id': 2, 'name': 'Uniforme Deportivo', 'price': 79.90, 'image': 'uniform2.jpg', 'description': 'Conjunto deportivo completo', 'stock': 15},
                {'id': 3, 'name': 'Polo Institucional', 'price': 29.90, 'image': 'polo.jpg', 'description': 'Polo con logo institucional', 'stock': 50},
                {'id': 4, 'name': 'Short Deportivo', 'price': 35.90, 'image': 'short.jpg', 'description': 'Short deportivo con logo', 'stock': 30},
                {'id': 5, 'name': 'Medias Escolares', 'price': 12.90, 'image': 'socks.jpg', 'description': 'Par de medias escolares', 'stock': 100},
                {'id': 6, 'name': 'Casaca Institucional', 'price': 89.90, 'image': 'jacket.jpg', 'description': 'Casaca con logo bordado', 'stock': 25},
            ],
            'utiles': [
                {'id': 7, 'name': 'Kit de Arte', 'price': 45.90, 'image': 'artkit.jpg', 'description': 'Kit completo de arte', 'stock': 40},
                {'id': 8, 'name': 'Cuaderno A4', 'price': 8.90, 'image': 'notebook.jpg', 'description': 'Cuaderno institucional A4', 'stock': 200},
                {'id': 9, 'name': 'Set de Lápices', 'price': 15.90, 'image': 'pencils.jpg', 'description': 'Set de lápices de colores', 'stock': 80},
                {'id': 10, 'name': 'Plastilina', 'price': 12.90, 'image': 'clay.jpg', 'description': 'Set de plastilina no tóxica', 'stock': 60},
                {'id': 11, 'name': 'Tijeras Escolares', 'price': 5.90, 'image': 'scissors.jpg', 'description': 'Tijeras punta roma', 'stock': 150},
                {'id': 12, 'name': 'Folder Institucional', 'price': 7.90, 'image': 'folder.jpg', 'description': 'Folder con logo', 'stock': 120},
                {'id': 13, 'name': 'Témperas', 'price': 18.90, 'image': 'paint.jpg', 'description': 'Set de témperas', 'stock': 75},
            ],
            'accesorios': [
                {'id': 14, 'name': 'Mochila Escolar', 'price': 79.90, 'image': 'backpack.jpg', 'description': 'Mochila con logo', 'stock': 35},
                {'id': 15, 'name': 'Lonchera Térmica', 'price': 45.90, 'image': 'lunchbox.jpg', 'description': 'Lonchera térmica con logo', 'stock': 45},
                {'id': 16, 'name': 'Gorro Institucional', 'price': 25.90, 'image': 'hat.jpg', 'description': 'Gorro con protección UV', 'stock': 55},
                {'id': 17, 'name': 'Botella de Agua', 'price': 19.90, 'image': 'bottle.jpg', 'description': 'Botella reutilizable', 'stock': 90},
                {'id': 18, 'name': 'Set de Toallas', 'price': 29.90, 'image': 'towels.jpg', 'description': 'Set de 2 toallas', 'stock': 40},
                {'id': 19, 'name': 'Mandil de Arte', 'price': 35.90, 'image': 'apron.jpg', 'description': 'Mandil para actividades artísticas', 'stock': 30},
                {'id': 20, 'name': 'Porta Útiles', 'price': 22.90, 'image': 'case.jpg', 'description': 'Estuche para útiles', 'stock': 70},
            ]
        }
    
    return render_template('shop.html', products=products)

@app.route('/carrito')
def cart():
    if 'logged_in' not in session:
        # Usuario no autenticado - mostrar carrito con datos de localStorage
        return render_template('cart.html', 
                             cart_items=[],  # Array vacío, será llenado por JavaScript
                             subtotal=0,
                             tax=0,
                             shipping=0,
                             total=0,
                             is_authenticated=False)
    
    # Usuario autenticado - carrito desde base de datos
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    # Obtener items del carrito del usuario
    cursor.execute('''
        SELECT sc.*, p.name, p.price, p.image_url 
        FROM shopping_cart sc 
        JOIN products p ON sc.product_id = p.id 
        WHERE sc.user_id = %s
    ''', (session['id'],))
    
    cart_items = cursor.fetchall()
    
    # Calcular totales - convertir Decimal a float para evitar errores de tipo
    subtotal = float(sum(Decimal(str(item['price'])) * item['quantity'] for item in cart_items))
    tax = subtotal * 0.18  # 18% IGV
    shipping = 15.0 if subtotal < 200 else 0.0  # Envío gratis para compras mayores a S/. 200
    total = subtotal + tax + shipping
    
    return render_template('cart.html', 
                         cart_items=cart_items,
                         subtotal=subtotal,
                         tax=tax,
                         shipping=shipping,
                         total=total,
                         is_authenticated=True)

@app.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    if 'logged_in' not in session:
        return jsonify({
            "success": False,
            "message": "Por favor inicia sesión para agregar productos al carrito"
        }), 401
    
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Verificar si el producto existe y hay stock suficiente
        cursor.execute('SELECT id, stock FROM products WHERE id = %s', (product_id,))
        product = cursor.fetchone()
        
        if not product:
            return jsonify({
                "success": False,
                "message": "Producto no encontrado"
            }), 404
            
        if product['stock'] < quantity:
            return jsonify({
                "success": False,
                "message": "No hay suficiente stock disponible"
            }), 400
        
        # Verificar si el producto ya está en el carrito
        cursor.execute('''
            SELECT quantity FROM shopping_cart 
            WHERE user_id = %s AND product_id = %s
        ''', (session['id'], product_id))
        
        cart_item = cursor.fetchone()
        
        if cart_item:
            # Actualizar cantidad si ya existe
            new_quantity = cart_item['quantity'] + quantity
            cursor.execute('''
                UPDATE shopping_cart 
                SET quantity = %s 
                WHERE user_id = %s AND product_id = %s
            ''', (new_quantity, session['id'], product_id))
        else:
            # Insertar nuevo item en el carrito
            cursor.execute('''
                INSERT INTO shopping_cart (user_id, product_id, quantity) 
                VALUES (%s, %s, %s)
            ''', (session['id'], product_id, quantity))
        
        mysql.connection.commit()
        
        # Obtener cantidad total en el carrito
        cursor.execute('''
            SELECT SUM(quantity) as total 
            FROM shopping_cart 
            WHERE user_id = %s
        ''', (session['id'],))
        
        cart_total = cursor.fetchone()['total'] or 0
        
        return jsonify({
            "success": True,
            "message": "Producto agregado al carrito",
            "cart_total": cart_total
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error al agregar al carrito: {str(e)}"
        }), 500

@app.route('/api/cart/update', methods=['POST'])
def update_cart():
    if 'logged_in' not in session:
        return jsonify({"success": False, "message": "No autorizado"}), 401
    
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        quantity = data.get('quantity')
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        if quantity > 0:
            # Verificar stock disponible
            cursor.execute('SELECT stock FROM products WHERE id = %s', (product_id,))
            product = cursor.fetchone()
            
            if not product or product['stock'] < quantity:
                return jsonify({
                    "success": False,
                    "message": "Stock insuficiente"
                }), 400
            
            # Actualizar cantidad
            cursor.execute('''
                UPDATE shopping_cart 
                SET quantity = %s 
                WHERE user_id = %s AND product_id = %s
            ''', (quantity, session['id'], product_id))
        else:
            # Eliminar item del carrito
            cursor.execute('''
                DELETE FROM shopping_cart 
                WHERE user_id = %s AND product_id = %s
            ''', (session['id'], product_id))
        
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Carrito actualizado"
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error al actualizar el carrito: {str(e)}"
        }), 500

@app.route('/api/cart/remove', methods=['POST'])
def remove_from_cart():
    if 'logged_in' not in session:
        return jsonify({"success": False, "message": "No autorizado"}), 401
    
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            DELETE FROM shopping_cart 
            WHERE user_id = %s AND product_id = %s
        ''', (session['id'], product_id))
        
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Producto eliminado del carrito"
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error al eliminar del carrito: {str(e)}"
        }), 500

@app.route('/api/cart/count', methods=['GET'])
def get_cart_count():
    if 'logged_in' not in session:
        return jsonify({
            "success": True,
            "count": 0,
            "message": "Usuario no autenticado"
        }), 200
    
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT SUM(quantity) as total 
            FROM shopping_cart 
            WHERE user_id = %s
        ''', (session['id'],))
        
        result = cursor.fetchone()
        total = result['total'] if result and result['total'] else 0
        
        return jsonify({
            "success": True,
            "count": int(total)
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "count": 0,
            "message": f"Error al obtener contador del carrito: {str(e)}"
        }), 500

@app.route('/checkout')
def checkout():
    if 'logged_in' not in session:
        flash('Debes iniciar sesión para continuar con la compra', 'error')
        return redirect(url_for('login'))
    
    # Obtener items del carrito del usuario
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT sc.*, p.name, p.price, p.image_url 
            FROM shopping_cart sc 
            JOIN products p ON sc.product_id = p.id 
            WHERE sc.user_id = %s
        ''', (session['id'],))
        
        cart_items = cursor.fetchall()
        
        # Calcular totales
        subtotal = float(sum(Decimal(str(item['price'])) * item['quantity'] for item in cart_items))
        tax = subtotal * 0.18  # 18% IGV
        shipping = 15.0 if subtotal < 200 else 0.0  # Envío gratis para compras mayores a S/. 200
        total = subtotal + tax + shipping
        
        return render_template('checkout.html', 
                             cart_items=cart_items,
                             subtotal=subtotal,
                             tax=tax,
                             shipping=shipping,
                             total=total)
    except Exception as e:
        flash('Error al cargar el checkout. Intenta nuevamente.', 'error')
        return redirect(url_for('cart'))

@app.route('/mis-pedidos', endpoint='my_orders')
def my_orders():
    """Página de Mis Pedidos"""
    print("="*50)
    print("FUNCIÓN MY_ORDERS LLAMADA")
    print(f"Session data: {session}")
    print(f"Logged in: {'logged_in' in session}")
    print(f"User ID: {session.get('id', 'No ID')}")
    print("="*50)
    
    if 'logged_in' not in session:
        print("Usuario no logueado, redirigiendo a login")
        flash('Debes iniciar sesión para ver tus pedidos.', 'error')
        return redirect(url_for('login'))
    
    try:
        print("Intentando conectar a la base de datos...")
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Obtener pedidos del usuario con detalles
        print(f"Ejecutando query para usuario ID: {session['id']}")
        cursor.execute("""
            SELECT 
                o.id,
                o.total_amount,
                o.status,
                o.created_at,
                o.shipping_address,
                o.payment_method,
                o.payment_status,
                o.notes
            FROM orders o
            WHERE o.user_id = %s
            ORDER BY o.created_at DESC
        """, (session['id'],))
        
        orders = cursor.fetchall()
        print(f"Tipo de orders: {type(orders)}")
        print(f"Orders raw: {orders}")
        
        # Verificar que orders sea una lista/tupla válida
        if not isinstance(orders, (list, tuple)):
            print("Orders no es lista/tupla, convirtiendo a lista vacía")
            orders = []
        
        print(f"Pedidos encontrados: {len(orders)}")
        
        # Para cada pedido, obtener los items
        orders_with_items = []
        for order in orders:
            if isinstance(order, dict) and 'id' in order:
                print(f"Procesando pedido ID: {order['id']}")
                cursor.execute("""
                    SELECT 
                        od.product_id,
                        od.quantity,
                        od.unit_price as price,
                        od.product_name,
                        p.image_url
                    FROM order_details od
                    JOIN products p ON od.product_id = p.id
                    WHERE od.order_id = %s
                """, (order['id'],))
                
                items = cursor.fetchall()
                print(f"Items raw: {items}")
                print(f"Tipo de items: {type(items)}")
                
                if not isinstance(items, (list, tuple)):
                    print("Items no es lista/tupla, convirtiendo a lista vacía")
                    items = []
                else:
                    items = list(items)  # Asegurar que es lista
                    print(f"Items convertidos a lista: {items}")
                
                order_dict = dict(order)
                order_dict['products'] = items  # Cambiado de 'items' a 'products' para evitar conflictos
                print(f"Order dict final: {order_dict}")
                orders_with_items.append(order_dict)
        
        cursor.close()
        print(f"Renderizando template con {len(orders_with_items)} pedidos")
        
        return render_template('my_orders.html', orders=orders_with_items)
        
    except Exception as e:
        print(f"Error obteniendo pedidos: {e}")
        print(f"Tipo de error: {type(e)}")
        import traceback
        traceback.print_exc()
        flash('Error al cargar los pedidos. Intenta nuevamente.', 'error')
        return redirect(url_for('home'))

@app.route('/pedido/<int:order_id>')
def order_detail(order_id):
    """Página de detalle de pedido"""
    if 'logged_in' not in session:
        flash('Debes iniciar sesión para ver el pedido.', 'error')
        return redirect(url_for('login'))
    
    try:
        cursor = mysql.connection.cursor()
        
        # Verificar que el pedido pertenece al usuario
        cursor.execute("""
            SELECT 
                o.id,
                o.total_amount,
                o.status,
                o.created_at,
                o.shipping_address,
                o.payment_method,
                o.payment_status,
                o.notes,
                u.name as user_name,
                u.email as user_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = %s AND o.user_id = %s
        """, (order_id, session['id']))
        
        order = cursor.fetchone()
        
        if not order:
            flash('Pedido no encontrado.', 'error')
            return redirect(url_for('my_orders'))
        
        # Obtener items del pedido
        cursor.execute("""
            SELECT 
                od.product_id,
                od.quantity,
                od.unit_price as price,
                od.product_name,
                p.image_url,
                p.description
            FROM order_details od
            JOIN products p ON od.product_id = p.id
            WHERE od.order_id = %s
        """, (order_id,))
        
        items = cursor.fetchall()
        cursor.close()
        
        order_dict = dict(order)
        order_dict['items'] = items
        
        return render_template('order_detail.html', order=order_dict)
        
    except Exception as e:
        print(f"Error obteniendo detalle del pedido: {e}")
        flash('Error al cargar el pedido. Intenta nuevamente.', 'error')
        return redirect(url_for('my_orders'))

@app.route('/process_order', methods=['POST'])
def process_order():
    try:
        if 'logged_in' not in session:
            return jsonify({'success': False, 'message': 'Usuario no autenticado'})
        
        user_id = session['id']  # Corregido: usar session['id'] consistentemente
        
        # Obtener datos del formulario
        data = request.get_json() if request.is_json else request.form
        
        payment_method = data.get('payment_method')
        operation_number = data.get('operation_number', '')
        shipping_address = data.get('shipping_address', '')
        notes = data.get('notes', '')
        
        # Validaciones
        if not payment_method:
            return jsonify({'success': False, 'message': 'Método de pago es requerido'})
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Obtener items del carrito
        cursor.execute('''
            SELECT sc.*, p.name, p.price, p.stock
            FROM shopping_cart sc 
            JOIN products p ON sc.product_id = p.id 
            WHERE sc.user_id = %s
        ''', (user_id,))
        
        cart_items = cursor.fetchall()
        
        if not cart_items:
            return jsonify({'success': False, 'message': 'El carrito está vacío'})
        
        # Verificar stock
        for item in cart_items:
            if item['stock'] < item['quantity']:
                return jsonify({
                    'success': False, 
                    'message': f'Stock insuficiente para {item["name"]}'
                })
        
        # Calcular total
        total_amount = float(sum(Decimal(str(item['price'])) * item['quantity'] for item in cart_items))
        tax = total_amount * 0.18
        shipping = 15.0 if total_amount < 200 else 0.0
        final_total = total_amount + tax + shipping
        
        # Crear la orden
        cursor.execute('''
            INSERT INTO orders (user_id, total_amount, status, payment_method, shipping_address, notes, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        ''', (user_id, final_total, 'pending', payment_method, shipping_address, notes))
        
        order_id = cursor.lastrowid
        
        # Procesar items del carrito
        for item in cart_items:
            # Insertar detalle de orden
            cursor.execute('''
                INSERT INTO order_details (order_id, product_id, product_name, quantity, unit_price, total_price)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (order_id, item['product_id'], item['name'], item['quantity'], 
                  item['price'], float(item['price']) * item['quantity']))
            
            # Actualizar stock
            cursor.execute('''
                UPDATE products SET stock = stock - %s WHERE id = %s
            ''', (item['quantity'], item['product_id']))
        
        # Crear registro de pago si se proporciona número de operación
        if operation_number:
            cursor.execute('''
                INSERT INTO order_payments (order_id, amount, payment_method, transaction_id, status, created_at)
                VALUES (%s, %s, %s, %s, %s, NOW())
            ''', (order_id, final_total, payment_method, operation_number, 'pending'))
        
        # Limpiar carrito
        cursor.execute('DELETE FROM shopping_cart WHERE user_id = %s', (user_id,))
        
        mysql.connection.commit()
        
        # Obtener información del usuario para el email
        cursor.execute('SELECT name, email, phone FROM users WHERE id = %s', (user_id,))
        user_info = cursor.fetchone()
        user_name = user_info['name'] if user_info else 'Usuario desconocido'
        user_email = user_info['email'] if user_info else 'No especificado'
        user_phone = user_info['phone'] if user_info else 'No especificado'
        
        # Generar lista de productos para el email
        products_list = []
        for item in cart_items:
            product_total = float(item['price']) * item['quantity']
            products_list.append(f"- {item['name']} (Cantidad: {item['quantity']}) - S/ {product_total:.2f}")
        
        products_text = "\n".join(products_list)
        
        # Enviar email de notificación de nueva orden al administrador
        admin_email_subject = f"Nueva Orden #{order_id} - {user_name}"
        
        admin_email_body = f"""
Nueva orden recibida desde la tienda online de Wawalu

=== INFORMACIÓN DE LA ORDEN ===
Número de orden: #{order_id}
Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}
Estado: Pendiente

=== INFORMACIÓN DEL CLIENTE ===
Nombre: {user_name}
Email: {user_email}
Teléfono: {user_phone}

=== PRODUCTOS ORDENADOS ===
{products_text}

=== DETALLES DE PAGO ===
Subtotal: S/ {total_amount:.2f}
IGV (18%): S/ {tax:.2f}
Envío: S/ {shipping:.2f}
TOTAL: S/ {final_total:.2f}

Método de pago: {payment_method}
{f'Número de operación: {operation_number}' if operation_number else 'Sin número de operación proporcionado'}

=== DIRECCIÓN DE ENVÍO ===
{shipping_address if shipping_address else 'No especificada'}

=== NOTAS ADICIONALES ===
{notes if notes else 'Ninguna'}

---
Esta orden fue generada desde la tienda online de Wawalu.
Por favor, revise y procese esta orden en el panel de administración.
"""
        
        # Enviar email al administrador
        print(f"🔄 Intentando enviar email de nueva orden...")
        print(f"📧 Destinatario: {CONTACT_EMAIL}")
        print(f"📧 Asunto: {admin_email_subject}")
        email_sent = send_email(CONTACT_EMAIL, admin_email_subject, admin_email_body)
        print(f"📧 Resultado del envío: {'✅ Exitoso' if email_sent else '❌ Falló'}")
        
        return jsonify({
            'success': True, 
            'message': 'Orden procesada exitosamente',
            'order_id': order_id,
            'redirect_url': url_for('order_confirmation', order_id=order_id)
        })
        
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'success': False, 'message': f'Error al procesar la orden: {str(e)}'})

@app.route('/order_confirmation/<int:order_id>')
def order_confirmation(order_id):
    if 'logged_in' not in session:
        return redirect(url_for('login'))
    
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Obtener información de la orden
        cursor.execute('''
            SELECT o.*, p.transaction_id, p.status as payment_status
            FROM orders o
            LEFT JOIN order_payments p ON o.id = p.order_id
            WHERE o.id = %s AND o.user_id = %s
        ''', (order_id, session['id']))  # Corregido: usar session['id']
        
        order = cursor.fetchone()
        
        if not order:
            flash('Orden no encontrada', 'error')
            return redirect(url_for('home'))
        
        # Obtener detalles de la orden
        cursor.execute('''
            SELECT od.*, p.image_url
            FROM order_details od
            LEFT JOIN products p ON od.product_id = p.id
            WHERE od.order_id = %s
        ''', (order_id,))
        
        order_items = cursor.fetchall()
        
        return render_template('order_confirmation.html', order=order, items=order_items)
        
    except Exception as e:
        flash(f'Error al cargar la confirmación: {str(e)}', 'error')
        return redirect(url_for('home'))

@app.route('/noticias')
def news():
    # Datos de ejemplo para noticias destacadas
    featured_news = [
        {
            'id': 1,
            'title': 'Gran inauguración del nuevo espacio de arte',
            'excerpt': 'Celebramos la apertura de nuestro nuevo espacio dedicado al arte y la creatividad...',
            'image': 'news1.jpg',
            'date': '15 de Septiembre, 2025',
            'category': 'Eventos',
            'is_featured': True
        },
        {
            'id': 2,
            'title': 'Taller de música para padres e hijos',
            'excerpt': 'Únete a nuestra sesión especial donde padres e hijos aprenderán juntos...',
            'image': 'news2.jpg',
            'date': '20 de Septiembre, 2025',
            'category': 'Actividades',
            'is_featured': True
        },
        {
            'id': 3,
            'title': 'Nuevos programas educativos para el 2026',
            'excerpt': 'Conoce nuestros nuevos programas diseñados para potenciar el aprendizaje...',
            'image': 'news3.jpg',
            'date': '25 de Septiembre, 2025',
            'category': 'Anuncios',
            'is_featured': True
        }
    ]

    # Datos de ejemplo para la lista de noticias
    news_list = [
        {
            'id': 4,
            'title': 'Festival de Arte y Cultura',
            'excerpt': 'Una celebración del arte y la cultura con exhibiciones, presentaciones y talleres...',
            'image': 'news4.jpg',
            'date': '1 de Octubre, 2025',
            'category': 'Eventos'
        },
        {
            'id': 5,
            'title': 'Nuevo programa de becas 2026',
            'excerpt': 'Anunciamos nuestro nuevo programa de becas para familias...',
            'image': 'news5.jpg',
            'date': '5 de Octubre, 2025',
            'category': 'Anuncios'
        },
        {
            'id': 6,
            'title': 'Taller de Ciencias Divertidas',
            'excerpt': 'Experimentos emocionantes y descubrimientos asombrosos en nuestro taller...',
            'image': 'news6.jpg',
            'date': '10 de Octubre, 2025',
            'category': 'Actividades'
        }
    ]

    return render_template('news.html', 
                         featured_news=featured_news, 
                         news_list=news_list)

@app.route('/noticias/<int:id>')
def news_detail(id):
    # Datos de ejemplo para una noticia específica
    news = {
        'id': id,
        'title': 'Gran inauguración del nuevo espacio de arte',
        'image': 'news1.jpg',
        'date': '15 de Septiembre, 2025',
        'category': 'Eventos',
        'author': 'María García',
        'role': 'Directora de Programas Educativos',
        'content': '''
            <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            
            <h2 class="text-2xl font-bold mt-8 mb-4">Un nuevo espacio para la creatividad</h2>
            
            <p class="mb-4">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            
            <ul class="list-disc ml-6 mb-4">
                <li>Área de pintura y dibujo</li>
                <li>Zona de escultura</li>
                <li>Espacio de exposición</li>
                <li>Área de materiales</li>
            </ul>
            
            <p class="mb-4">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
            
            <blockquote class="border-l-4 border-blue-600 pl-4 my-6 italic">
                "El arte es fundamental para el desarrollo integral de nuestros niños. Este nuevo espacio nos permitirá expandir sus horizontes creativos."
            </blockquote>
            
            <p class="mb-4">Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
        ''',
        'tags': ['Arte', 'Creatividad', 'Educación', 'Inauguración']
    }

    # Datos de ejemplo para noticias relacionadas
    related_news = [
        {
            'id': 2,
            'title': 'Taller de música para padres e hijos',
            'image': 'news2.jpg',
            'date': '20 de Septiembre, 2025'
        },
        {
            'id': 3,
            'title': 'Nuevos programas educativos para el 2026',
            'image': 'news3.jpg',
            'date': '25 de Septiembre, 2025'
        }
    ]

    return render_template('news-detail.html', 
                         news=news, 
                         related_news=related_news)

@app.route('/libro-reclamaciones', methods=['GET', 'POST'])
def libro_reclamaciones():
    if request.method == 'POST':
        try:
            data = request.get_json()
            
            # Validar campos requeridos
            required_fields = [
                'nombres', 'apellidos', 'tipoDocumento', 'numeroDocumento', 
                'telefono', 'email', 'direccion', 'tipoBien', 'montoReclamado',
                'descripcionBien', 'tipoReclamacion', 'detalleReclamacion', 
                'pedidoConsumidor', 'aceptaTerminos'
            ]
            
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return jsonify({
                    "success": False,
                    "message": f"Faltan campos requeridos: {', '.join(missing_fields)}"
                }), 400
            
            # Crear cursor para la base de datos
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            
            # Crear tabla de reclamaciones si no existe
            cursor.execute('''
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
                    INDEX idx_fecha (fecha_reclamacion)
                )
            ''')
            mysql.connection.commit()
            
            # Generar número de reclamación único
            import random
            import string
            from datetime import datetime
            
            fecha_actual = datetime.now()
            numero_reclamacion = f"REC-{fecha_actual.strftime('%Y%m%d')}-{''.join(random.choices(string.digits, k=4))}"
            
            # Insertar reclamación
            cursor.execute('''
                INSERT INTO reclamaciones (
                    numero_reclamacion, nombres, apellidos, tipo_documento, numero_documento,
                    telefono, email, direccion, tipo_bien, monto_reclamado, descripcion_bien,
                    tipo_reclamacion, detalle_reclamacion, pedido_consumidor
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
                numero_reclamacion, data['nombres'], data['apellidos'], 
                data['tipoDocumento'], data['numeroDocumento'], data['telefono'],
                data['email'], data['direccion'], data['tipoBien'], 
                float(data['montoReclamado']), data['descripcionBien'],
                data['tipoReclamacion'], data['detalleReclamacion'], 
                data['pedidoConsumidor']
            ))
            
            mysql.connection.commit()
            
            # Envío de correo de confirmación (opcional)
            # Aquí se podría implementar el envío de email
            
            return jsonify({
                "success": True,
                "message": "Reclamación registrada exitosamente",
                "numero_reclamacion": numero_reclamacion
            }), 200
            
        except Exception as e:
            mysql.connection.rollback()
            return jsonify({
                "success": False,
                "message": f"Error al procesar la reclamación: {str(e)}"
            }), 500
    
    return render_template('libro_reclamaciones.html')

@app.route('/api/reclamacion/consultar/<numero_reclamacion>')
def consultar_reclamacion(numero_reclamacion):
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('''
            SELECT * FROM reclamaciones 
            WHERE numero_reclamacion = %s
        ''', (numero_reclamacion,))
        
        reclamacion = cursor.fetchone()
        
        if not reclamacion:
            return jsonify({
                "success": False,
                "message": "Número de reclamación no encontrado"
            }), 404
        
        return jsonify({
            "success": True,
            "reclamacion": dict(reclamacion)
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error al consultar la reclamación: {str(e)}"
        }), 500

@app.route('/admin')
@admin_required
def admin_dashboard():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    # Get statistics
    cursor.execute('SELECT COUNT(*) as total FROM users')
    total_users = cursor.fetchone()['total']
    
    cursor.execute('SELECT COUNT(*) as active FROM active_sessions WHERE last_activity > DATE_SUB(NOW(), INTERVAL 15 MINUTE)')
    active_users = cursor.fetchone()['active']
    
    cursor.execute('SELECT COUNT(*) as pending FROM enrollments WHERE status = "pending"')
    pending_enrollments = cursor.fetchone()['pending']
    
    cursor.execute('SELECT COUNT(*) as new FROM shopping_cart WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)')
    new_orders = cursor.fetchone()['new']
    
    # Get recent users
    cursor.execute('SELECT name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5')
    recent_users = cursor.fetchall()
    
    # Get active sessions
    cursor.execute('''
        SELECT u.name as user_name, s.last_activity, s.ip_address 
        FROM active_sessions s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.last_activity > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    ''')
    active_sessions = cursor.fetchall()
    
    stats = {
        'total_users': total_users,
        'active_users': active_users,
        'pending_enrollments': pending_enrollments,
        'new_orders': new_orders
    }
    
    return render_template('admin/dashboard.html', 
                         stats=stats,
                         recent_users=recent_users,
                         active_sessions=active_sessions)

@app.route('/admin/users')
@admin_required
def admin_users():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM users ORDER BY created_at DESC')
    users = cursor.fetchall()
    return render_template('admin/users.html', users=users)

@app.route('/admin/programs')
@admin_required
def admin_programs():
    # Placeholder para la gestión de programas
    return render_template('admin/programs.html')

@app.route('/admin/enrollments')
@admin_required
def admin_enrollments():
    # Placeholder para la gestión de matrículas
    return render_template('admin/enrollments.html')

@app.route('/admin/products')
@admin_required
def admin_products():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM products ORDER BY created_at DESC')
    products = cursor.fetchall()
    return render_template('admin/products.html', products=products)

@app.route('/admin/products', methods=['POST'])
@admin_required
def create_product():
    try:
        data = request.get_json()
        name = data.get('name')
        price = data.get('price')
        description = data.get('description')
        category = data.get('category')
        stock = data.get('stock', 0)
        image_url = data.get('image_url', '')
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        cursor.execute('''
            INSERT INTO products (name, price, description, category, stock, image_url, active) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        ''', (name, price, description, category, stock, image_url, True))
        
        mysql.connection.commit()
        
        # Log admin activity
        cursor.execute('''
            INSERT INTO admin_activities (admin_id, action_type, action_description, target_table, target_id)
            VALUES (%s, %s, %s, %s, %s)
        ''', (
            session['id'],
            'create',
            f'Created product: {name}',
            'products',
            cursor.lastrowid
        ))
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Producto creado exitosamente"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/admin/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    try:
        data = request.get_json()
        name = data.get('name')
        price = data.get('price')
        description = data.get('description')
        category = data.get('category')
        stock = data.get('stock')
        image_url = data.get('image_url')
        active = data.get('active', True)
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        cursor.execute('''
            UPDATE products 
            SET name = %s, price = %s, description = %s, category = %s, 
                stock = %s, image_url = %s, active = %s
            WHERE id = %s
        ''', (name, price, description, category, stock, image_url, active, product_id))
        
        mysql.connection.commit()
        
        # Log admin activity
        cursor.execute('''
            INSERT INTO admin_activities (admin_id, action_type, action_description, target_table, target_id)
            VALUES (%s, %s, %s, %s, %s)
        ''', (
            session['id'],
            'update',
            f'Updated product: {name}',
            'products',
            product_id
        ))
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Producto actualizado exitosamente"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/admin/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Obtener información del producto antes de eliminarlo
        cursor.execute('SELECT name FROM products WHERE id = %s', (product_id,))
        product = cursor.fetchone()
        
        if not product:
            return jsonify({
                "success": False,
                "message": "Producto no encontrado"
            }), 404
        
        cursor.execute('DELETE FROM products WHERE id = %s', (product_id,))
        mysql.connection.commit()
        
        # Log admin activity
        cursor.execute('''
            INSERT INTO admin_activities (admin_id, action_type, action_description, target_table, target_id)
            VALUES (%s, %s, %s, %s, %s)
        ''', (
            session['id'],
            'delete',
            f'Deleted product: {product["name"]}',
            'products',
            product_id
        ))
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Producto eliminado exitosamente"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/admin/orders')
@admin_required
def admin_orders():
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Obtener todas las órdenes con información de usuario y pago
        cursor.execute('''
            SELECT o.*, u.name as user_name, u.email as user_email,
                   op.payment_method, op.transaction_id, op.status as payment_status,
                   op.receipt_image, op.created_at as payment_date
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_payments op ON o.id = op.order_id
            ORDER BY o.created_at DESC
        ''')
        
        orders = cursor.fetchall()
        
        return render_template('admin/orders.html', orders=orders)
        
    except Exception as e:
        flash(f'Error al cargar las órdenes: {str(e)}', 'error')
        return render_template('admin/orders.html', orders=[])

@app.route('/admin/orders/<int:order_id>')
@admin_required
def admin_order_detail(order_id):
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Obtener información de la orden
        cursor.execute('''
            SELECT o.*, u.name as user_name, u.email as user_email, u.phone,
                   op.payment_method, op.transaction_id, op.status as payment_status,
                   op.receipt_image, op.notes, op.created_at as payment_date
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_payments op ON o.id = op.order_id
            WHERE o.id = %s
        ''', (order_id,))
        
        order = cursor.fetchone()
        
        if not order:
            flash('Orden no encontrada', 'error')
            return redirect(url_for('admin_orders'))
        
        # Obtener detalles de la orden
        cursor.execute('''
            SELECT od.*, p.name, p.image_url
            FROM order_details od
            JOIN products p ON od.product_id = p.id
            WHERE od.order_id = %s
        ''', (order_id,))
        
        order_items = cursor.fetchall()
        
        return render_template('admin/order_detail.html', order=order, items=order_items)
        
    except Exception as e:
        flash(f'Error al cargar el detalle de la orden: {str(e)}', 'error')
        return redirect(url_for('admin_orders'))

@app.route('/admin/orders/<int:order_id>/verify_payment', methods=['POST'])
@admin_required
def verify_payment(order_id):
    try:
        action = request.form.get('action')  # 'approve' or 'reject'
        notes = request.form.get('notes', '')
        
        if action not in ['approve', 'reject']:
            return jsonify({'success': False, 'message': 'Acción inválida'})
        
        cursor = mysql.connection.cursor()
        
        # Actualizar estado del pago
        new_status = 'completed' if action == 'approve' else 'failed'
        cursor.execute('''
            UPDATE order_payments 
            SET status = %s, notes = %s, verified_by = %s, verified_at = NOW()
            WHERE order_id = %s
        ''', (new_status, notes, session['user_id'], order_id))
        
        # Si se aprueba el pago, actualizar también la orden
        if action == 'approve':
            cursor.execute('''
                UPDATE orders SET status = 'paid' WHERE id = %s
            ''', (order_id,))
        else:
            # Si se rechaza, devolver stock
            cursor.execute('''
                UPDATE products p 
                JOIN order_details od ON p.id = od.product_id 
                SET p.stock = p.stock + od.quantity 
                WHERE od.order_id = %s
            ''', (order_id,))
            
            cursor.execute('''
                UPDATE orders SET status = 'cancelled' WHERE id = %s
            ''', (order_id,))
        
        mysql.connection.commit()
        
        message = 'Pago aprobado exitosamente' if action == 'approve' else 'Pago rechazado'
        return jsonify({'success': True, 'message': message})
        
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

# ========== GESTIÓN DE CONTENIDO WEB ==========
@app.route('/admin/content')
@admin_required
def admin_content():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    # Obtener configuraciones del sitio
    cursor.execute('SELECT * FROM site_settings')
    settings = cursor.fetchall()
    
    # Organizar configuraciones por tipo
    site_config = {}
    for setting in settings:
        site_config[setting['key']] = setting['value']
    
    return render_template('admin/content.html', site_config=site_config)

@app.route('/admin/content/update', methods=['POST'])
@admin_required
def update_site_content():
    try:
        data = request.get_json()
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        for key, value in data.items():
            # Actualizar o insertar configuración
            cursor.execute('''
                INSERT INTO site_settings (key, value, updated_by) 
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                value = VALUES(value), 
                updated_by = VALUES(updated_by),
                updated_at = CURRENT_TIMESTAMP
            ''', (key, value, session['id']))
        
        mysql.connection.commit()
        
        # Log admin activity
        cursor.execute('''
            INSERT INTO admin_activities (admin_id, action_type, action_description, target_table)
            VALUES (%s, %s, %s, %s)
        ''', (
            session['id'],
            'update',
            f'Updated site content: {", ".join(data.keys())}',
            'site_settings'
        ))
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Contenido actualizado exitosamente"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# ========== GESTIÓN DE NOTICIAS ==========
@app.route('/admin/news')
@admin_required
def admin_news():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM news ORDER BY created_at DESC')
    news = cursor.fetchall()
    return render_template('admin/news.html', news=news)

@app.route('/admin/news', methods=['POST'])
@admin_required
def create_news():
    try:
        data = request.get_json()
        title = data.get('title')
        content = data.get('content')
        excerpt = data.get('excerpt')
        category = data.get('category')
        image_url = data.get('image_url', '')
        is_featured = data.get('is_featured', False)
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        cursor.execute('''
            INSERT INTO news (title, content, excerpt, category, image_url, is_featured, author_id) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        ''', (title, content, excerpt, category, image_url, is_featured, session['id']))
        
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Noticia creada exitosamente"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/admin/news/<int:news_id>', methods=['DELETE'])
@admin_required
def delete_news(news_id):
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('DELETE FROM news WHERE id = %s', (news_id,))
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Noticia eliminada exitosamente"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# ========== GESTIÓN DE RECLAMACIONES ==========
@app.route('/admin/reclamaciones')
@admin_required
def admin_reclamaciones():
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Obtener estadísticas
        cursor.execute('''
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN estado = 'EN_PROCESO' THEN 1 ELSE 0 END) as en_proceso,
                SUM(CASE WHEN estado = 'RESUELTO' THEN 1 ELSE 0 END) as resueltas
            FROM reclamaciones
        ''')
        stats = cursor.fetchone() or {}
        
        # Obtener todas las reclamaciones
        cursor.execute('''
            SELECT * FROM reclamaciones 
            ORDER BY fecha_reclamacion DESC
        ''')
        reclamaciones = cursor.fetchall()
        
        return render_template('admin/reclamaciones.html', 
                             reclamaciones=reclamaciones, 
                             stats=stats)
        
    except Exception as e:
        flash(f'Error al cargar las reclamaciones: {str(e)}', 'error')
        return render_template('admin/reclamaciones.html', 
                             reclamaciones=[], 
                             stats={})

@app.route('/admin/reclamaciones/<int:reclamacion_id>')
@admin_required
def admin_reclamacion_detail(reclamacion_id):
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM reclamaciones WHERE id = %s', (reclamacion_id,))
        reclamacion = cursor.fetchone()
        
        if not reclamacion:
            return jsonify({
                "success": False,
                "message": "Reclamación no encontrada"
            }), 404
        
        return jsonify({
            "success": True,
            "reclamacion": dict(reclamacion)
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error al obtener la reclamación: {str(e)}"
        }), 500

@app.route('/admin/reclamaciones/<int:reclamacion_id>/responder', methods=['POST'])
@admin_required
def responder_reclamacion(reclamacion_id):
    try:
        data = request.get_json()
        estado = data.get('estado')
        respuesta_empresa = data.get('respuesta_empresa')
        acciones_adoptadas = data.get('acciones_adoptadas')
        observaciones = data.get('observaciones')
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Verificar que la reclamación existe
        cursor.execute('SELECT * FROM reclamaciones WHERE id = %s', (reclamacion_id,))
        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Reclamación no encontrada"
            }), 404
        
        # Actualizar la reclamación
        cursor.execute('''
            UPDATE reclamaciones 
            SET estado = %s, respuesta_empresa = %s, acciones_adoptadas = %s, 
                observaciones = %s, fecha_respuesta = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (estado, respuesta_empresa, acciones_adoptadas, observaciones, reclamacion_id))
        
        mysql.connection.commit()
        
        # Log admin activity
        cursor.execute('''
            INSERT INTO admin_activities (admin_id, action_type, action_description, target_table, target_id)
            VALUES (%s, %s, %s, %s, %s)
        ''', (
            session['id'],
            'update',
            f'Responded to complaint #{reclamacion_id}',
            'reclamaciones',
            reclamacion_id
        ))
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Respuesta guardada exitosamente"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error al guardar la respuesta: {str(e)}"
        }), 500

@app.route('/admin/reclamaciones/export')
@admin_required
def export_reclamaciones():
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM reclamaciones ORDER BY fecha_reclamacion DESC')
        reclamaciones = cursor.fetchall()
        
        # Crear CSV
        import csv
        import io
        from flask import make_response
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Headers
        writer.writerow([
            'Número', 'Nombres', 'Apellidos', 'Tipo Documento', 'Número Documento',
            'Teléfono', 'Email', 'Dirección', 'Tipo Bien', 'Monto Reclamado',
            'Descripción Bien', 'Tipo Reclamación', 'Detalle Reclamación',
            'Pedido Consumidor', 'Estado', 'Fecha Reclamación', 'Fecha Respuesta',
            'Respuesta Empresa', 'Acciones Adoptadas', 'Observaciones'
        ])
        
        # Data
        for rec in reclamaciones:
            writer.writerow([
                rec['numero_reclamacion'], rec['nombres'], rec['apellidos'],
                rec['tipo_documento'], rec['numero_documento'], rec['telefono'],
                rec['email'], rec['direccion'], rec['tipo_bien'], rec['monto_reclamado'],
                rec['descripcion_bien'], rec['tipo_reclamacion'], rec['detalle_reclamacion'],
                rec['pedido_consumidor'], rec['estado'], rec['fecha_reclamacion'],
                rec['fecha_respuesta'], rec['respuesta_empresa'], rec['acciones_adoptadas'],
                rec['observaciones']
            ])
        
        output.seek(0)
        
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = 'attachment; filename=reclamaciones.csv'
        
        return response
        
    except Exception as e:
        flash(f'Error al exportar reclamaciones: {str(e)}', 'error')
        return redirect(url_for('admin_reclamaciones'))

@app.route('/admin/users', methods=['POST'])
@admin_required
def create_user():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        is_admin = data.get('is_admin', False)
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Verificar si el email ya existe
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        if cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "El email ya está registrado"
            }), 400
        
        hashed_password = generate_password_hash(password)
        
        cursor.execute('''
            INSERT INTO users (name, email, password, role, is_admin) 
            VALUES (%s, %s, %s, %s, %s)
        ''', (name, email, hashed_password, role, is_admin))
        
        mysql.connection.commit()
        
        # Log admin activity
        cursor.execute('''
            INSERT INTO admin_activities (admin_id, action_type, action_description, target_table, target_id)
            VALUES (%s, %s, %s, %s, %s)
        ''', (
            session['id'],
            'create',
            f'Created user: {email}',
            'users',
            cursor.lastrowid
        ))
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Usuario creado exitosamente"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/admin/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT id, name, email, role, is_admin FROM users WHERE id = %s', (user_id,))
    user = cursor.fetchone()
    
    if not user:
        return jsonify({
            "success": False,
            "message": "Usuario no encontrado"
        }), 404
        
    return jsonify(user)

@app.route('/admin/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        role = data.get('role')
        is_admin = data.get('is_admin', False)
        password = data.get('password')
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Verificar si el usuario existe
        cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Usuario no encontrado"
            }), 404
        
        # Verificar si el nuevo email ya existe (excluyendo el usuario actual)
        cursor.execute('SELECT * FROM users WHERE email = %s AND id != %s', (email, user_id))
        if cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "El email ya está en uso"
            }), 400
            
        if password:
            hashed_password = generate_password_hash(password)
            cursor.execute('''
                UPDATE users 
                SET name = %s, email = %s, password = %s, role = %s, is_admin = %s 
                WHERE id = %s
            ''', (name, email, hashed_password, role, is_admin, user_id))
        else:
            cursor.execute('''
                UPDATE users 
                SET name = %s, email = %s, role = %s, is_admin = %s 
                WHERE id = %s
            ''', (name, email, role, is_admin, user_id))
            
        mysql.connection.commit()
        
        # Log admin activity
        cursor.execute('''
            INSERT INTO admin_activities (admin_id, action_type, action_description, target_table, target_id)
            VALUES (%s, %s, %s, %s, %s)
        ''', (
            session['id'],
            'update',
            f'Updated user: {email}',
            'users',
            user_id
        ))
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Usuario actualizado exitosamente"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Verificar si el usuario existe
        cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({
                "success": False,
                "message": "Usuario no encontrado"
            }), 404
            
        # No permitir eliminar al propio usuario
        if user_id == session['id']:
            return jsonify({
                "success": False,
                "message": "No puedes eliminar tu propia cuenta"
            }), 400
            
        cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
        mysql.connection.commit()
        
        # Log admin activity
        cursor.execute('''
            INSERT INTO admin_activities (admin_id, action_type, action_description, target_table, target_id)
            VALUES (%s, %s, %s, %s, %s)
        ''', (
            session['id'],
            'delete',
            f'Deleted user: {user["email"]}',
            'users',
            user_id
        ))
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Usuario eliminado exitosamente"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/logout', methods=['GET', 'POST'])
def logout():
    if 'logged_in' in session:
        # Remove active session record
        cursor = mysql.connection.cursor()
        cursor.execute('DELETE FROM active_sessions WHERE user_id = %s', (session['id'],))
        mysql.connection.commit()
    
    # Limpiar la sesión
    session.clear()
    flash('Has cerrado sesión correctamente', 'success')
    return redirect(url_for('home'))

@app.route('/profile')
def profile():
    if 'logged_in' not in session:
        flash('Por favor inicia sesión para ver tu perfil', 'warning')
        return redirect(url_for('login'))
    
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM users WHERE id = %s', (session['id'],))
    user = cursor.fetchone()
    
    # Get additional parent info if exists
    cursor.execute('SELECT * FROM parent_info WHERE user_id = %s', (session['id'],))
    parent_info = cursor.fetchone()
    
    return render_template('profile.html', user=user, parent_info=parent_info)

@app.route('/informes')
def informes():
    """Página de informes para padres - Ver informes enviados por profesores"""
    if 'logged_in' not in session:
        flash('Por favor inicia sesión para ver los informes', 'warning')
        return redirect(url_for('login'))
    
    # Verificar que sea un padre/madre/tutor (no admin)
    if session.get('is_admin'):
        return redirect(url_for('admin_dashboard'))
    
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    # Obtener los estudiantes asociados al padre/madre/tutor
    cursor.execute('''
        SELECT s.id, CONCAT(s.first_name, ' ', s.last_name) as name, p.name as program_name 
        FROM students s
        LEFT JOIN programs p ON s.program_id = p.id
        WHERE s.guardian_id = %s
        ORDER BY s.first_name, s.last_name
    ''', (session['id'],))
    students = cursor.fetchall()
    
    # Obtener filtros de la URL
    student_filter = request.args.get('student_id', '')
    type_filter = request.args.get('report_type', '')
    status_filter = request.args.get('status', '')
    
    # Construir consulta de informes con filtros
    where_conditions = ['s.guardian_id = %s']
    params = [session['id']]
    
    if student_filter:
        where_conditions.append('r.student_id = %s')
        params.append(student_filter)
    
    if type_filter:
        where_conditions.append('r.report_type = %s')
        params.append(type_filter)
    
    if status_filter:
        where_conditions.append('r.status = %s')
        params.append(status_filter)
    
    where_clause = ' AND '.join(where_conditions)
    
    # Obtener informes con filtros aplicados
    cursor.execute(f'''
        SELECT r.*, 
               CONCAT(s.first_name, ' ', s.last_name) as student_name,
               u.name as teacher_name
        FROM reports r
        LEFT JOIN students s ON r.student_id = s.id
        LEFT JOIN users u ON r.teacher_id = u.id
        WHERE {where_clause}
        ORDER BY r.created_at DESC
        LIMIT 50
    ''', params)
    reports = cursor.fetchall()
    
    cursor.close()
    
    return render_template('reports.html', reports=reports, students=students)

@app.route('/mark_report_read', methods=['POST'])
def mark_report_read():
    """Marcar un informe como leído"""
    if 'logged_in' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401
    
    try:
        data = request.get_json()
        report_id = data.get('report_id')
        
        if not report_id:
            return jsonify({'success': False, 'message': 'ID de informe requerido'}), 400
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Verificar que el informe pertenece a un estudiante del padre logueado
        cursor.execute('''
            SELECT r.id 
            FROM reports r
            JOIN students s ON r.student_id = s.id
            WHERE r.id = %s AND s.guardian_id = %s
        ''', (report_id, session['id']))
        
        if not cursor.fetchone():
            cursor.close()
            return jsonify({'success': False, 'message': 'Informe no encontrado'}), 404
        
        # Marcar como leído
        cursor.execute('''
            UPDATE reports 
            SET status = 'read', read_at = NOW() 
            WHERE id = %s
        ''', (report_id,))
        
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({'success': True, 'message': 'Informe marcado como leído'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500

@app.route('/notifications')
def notifications():
    """Página de notificaciones para usuarios"""
    if 'logged_in' not in session:
        flash('Por favor inicia sesión para ver las notificaciones', 'warning')
        return redirect(url_for('login'))
    
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    # Obtener notificaciones del usuario
    cursor.execute('''
        SELECT rn.*, r.title as report_title, r.subject as report_subject,
               CONCAT(s.first_name, ' ', s.last_name) as student_name
        FROM report_notifications rn
        LEFT JOIN reports r ON rn.report_id = r.id
        LEFT JOIN students s ON r.student_id = s.id
        WHERE rn.recipient_id = %s
        ORDER BY rn.created_at DESC
        LIMIT 50
    ''', (session['id'],))
    
    notifications = cursor.fetchall()
    
    # Marcar notificaciones in-app como leídas
    cursor.execute('''
        UPDATE report_notifications 
        SET read_at = NOW() 
        WHERE recipient_id = %s AND notification_type = 'in_app' AND read_at IS NULL
    ''', (session['id'],))
    
    mysql.connection.commit()
    cursor.close()
    
    return render_template('notifications.html', notifications=notifications)

@app.route('/notification_preferences')
def notification_preferences():
    """Página de preferencias de notificación"""
    if 'logged_in' not in session:
        flash('Por favor inicia sesión para configurar las notificaciones', 'warning')
        return redirect(url_for('login'))
    
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    # Obtener preferencias actuales del usuario
    cursor.execute('''
        SELECT * FROM notification_preferences 
        WHERE user_id = %s
        ORDER BY notification_type, report_type
    ''', (session['id'],))
    
    preferences = cursor.fetchall()
    cursor.close()
    
    return render_template('notification_preferences.html', preferences=preferences)

@app.route('/update_notification_preferences', methods=['POST'])
def update_notification_preferences():
    """Actualizar preferencias de notificación"""
    if 'logged_in' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401
    
    try:
        data = request.get_json()
        user_id = session['id']
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Eliminar preferencias existentes del usuario
        cursor.execute('DELETE FROM notification_preferences WHERE user_id = %s', (user_id,))
        
        # Insertar nuevas preferencias
        for pref in data.get('preferences', []):
            cursor.execute('''
                INSERT INTO notification_preferences 
                (user_id, notification_type, report_type, is_enabled, frequency, 
                 quiet_hours_start, quiet_hours_end, weekend_notifications, priority_filter)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
                user_id, pref.get('notification_type'), pref.get('report_type'),
                pref.get('is_enabled', True), pref.get('frequency', 'immediate'),
                pref.get('quiet_hours_start'), pref.get('quiet_hours_end'),
                pref.get('weekend_notifications', True), pref.get('priority_filter', 'all')
            ))
        
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({'success': True, 'message': 'Preferencias actualizadas correctamente'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Error actualizando preferencias'}), 500

@app.route('/send_test_notification', methods=['POST'])
def send_test_notification():
    """Enviar notificación de prueba"""
    if 'logged_in' not in session:
        return jsonify({'success': False, 'message': 'No autorizado'}), 401
    
    try:
        data = request.get_json()
        notification_type = data.get('type', 'email')
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Crear una notificación de prueba
        cursor.execute('''
            INSERT INTO report_notifications 
            (report_id, recipient_id, notification_type, status, priority, subject, message, 
             recipient_email, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
        ''', (
            1, session['id'], notification_type, 'sent', 'normal',
            'Notificación de Prueba - Sistema Wawalu',
            'Esta es una notificación de prueba para verificar que el sistema funciona correctamente.',
            session.get('email', 'test@example.com')
        ))
        
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            'success': True, 
            'message': f'Notificación de prueba ({notification_type}) enviada correctamente'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Error enviando notificación de prueba'}), 500
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500

@app.route('/profile/update', methods=['POST'])
def update_profile():
    if 'logged_in' not in session:
        return jsonify({
            "success": False,
            "message": "No autorizado"
        }), 401
    
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        address = data.get('address')
        
        # Additional parent info
        dni = data.get('dni')
        occupation = data.get('occupation')
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Check if email is already taken by another user
        cursor.execute('SELECT id FROM users WHERE email = %s AND id != %s', (email, session['id']))
        if cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "El correo electrónico ya está en uso por otro usuario"
            }), 400
        
        # Update user information
        cursor.execute('''
            UPDATE users 
            SET name = %s, email = %s, phone = %s, address = %s
            WHERE id = %s
        ''', (name, email, phone, address, session['id']))
        
        # Update or insert parent info if provided
        if dni or occupation:
            cursor.execute('''
                INSERT INTO parent_info (user_id, dni, occupation, relationship)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                dni = VALUES(dni),
                occupation = VALUES(occupation)
            ''', (session['id'], dni, occupation, session['role']))
        
        mysql.connection.commit()
        
        # Update session data
        session['name'] = name
        session['email'] = email
        
        return jsonify({
            "success": True,
            "message": "Perfil actualizado correctamente"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error al actualizar el perfil: {str(e)}"
        }), 500

@app.route('/profile/change-password', methods=['POST'])
def change_password():
    if 'logged_in' not in session:
        return jsonify({
            "success": False,
            "message": "No autorizado"
        }), 401
    
    try:
        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
        
        if new_password != confirm_password:
            return jsonify({
                "success": False,
                "message": "Las contraseñas nuevas no coinciden"
            }), 400
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT password FROM users WHERE id = %s', (session['id'],))
        user = cursor.fetchone()
        
        if not check_password_hash(user['password'], current_password):
            return jsonify({
                "success": False,
                "message": "La contraseña actual es incorrecta"
            }), 400
        
        # Update password
        hashed_password = generate_password_hash(new_password)
        cursor.execute('UPDATE users SET password = %s WHERE id = %s', (hashed_password, session['id']))
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Contraseña actualizada correctamente"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error al cambiar la contraseña: {str(e)}"
        }), 500

@app.route('/matricula')
def enrollment():
    if 'logged_in' not in session:
        flash('Por favor inicia sesión para realizar la matrícula', 'warning')
    
    # Obtener los programas disponibles
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT id, name, description, age_range, capacity, price FROM programs WHERE active = TRUE')
    programs = cursor.fetchall()
    
    return render_template('enrollment.html', programs=programs)

@app.route('/api/enrollment/submit', methods=['POST'])
def submit_enrollment():
    if 'logged_in' not in session:
        return jsonify({
            "success": False,
            "message": "Debe iniciar sesión para realizar la matrícula"
        }), 401
    
    try:
        data = request.get_json()
        
        # Validar campos requeridos
        required_fields = ['firstName', 'lastName', 'birthDate', 'bloodType', 
                         'emergencyContact', 'emergencyPhone', 'programId']
        
        if not all(field in data for field in required_fields):
            return jsonify({
                "success": False,
                "message": "Faltan campos requeridos"
            }), 400
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Verificar si hay cupo en el programa
        cursor.execute('SELECT capacity FROM programs WHERE id = %s', (data['programId'],))
        program = cursor.fetchone()
        
        if not program:
            return jsonify({
                "success": False,
                "message": "El programa seleccionado no existe"
            }), 404
        
        # Actualizar información del padre/usuario
        cursor.execute('''
            UPDATE users 
            SET name = %s, phone = %s, address = %s
            WHERE id = %s
        ''', (
            data['parentName'],
            data['parentPhone'],
            data['parentAddress'],
            session['id']
        ))

        # Verificar que el relationship coincida con el role del usuario
        cursor.execute('SELECT role FROM users WHERE id = %s', (session['id'],))
        user_role = cursor.fetchone()['role']
        if user_role != data['relationship']:
            return jsonify({
                "success": False,
                "message": "El tipo de relación debe coincidir con el rol del usuario"
            }), 400

        # Insertar información adicional del padre en una tabla separada si es necesario
        cursor.execute('''
            INSERT INTO parent_info 
            (user_id, dni, occupation, relationship)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE 
            dni = VALUES(dni),
            occupation = VALUES(occupation),
            relationship = VALUES(relationship)
        ''', (
            session['id'],
            data['parentDNI'],
            data['parentOccupation'],
            data['relationship']
        ))  # Insertar el estudiante
        cursor.execute('''
            INSERT INTO students 
            (first_name, last_name, birth_date, guardian_id, program_id, blood_type, 
             allergies, medical_notes, emergency_contact, emergency_phone)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            data['firstName'],
            data['lastName'],
            data['birthDate'],
            session['id'],
            data['programId'],
            data['bloodType'],
            data.get('allergies', ''),
            data.get('medicalNotes', ''),
            data['emergencyContact'],
            data['emergencyPhone']
        ))
         
        # Crear la matrícula
        student_id = cursor.lastrowid
        cursor.execute('''
            INSERT INTO enrollments (student_id, program_id, status, enrollment_date)
            VALUES (%s, %s, %s, CURDATE())
        ''', (student_id, data['programId'], 'pending'))
        
        # Obtener información del programa para el email
        cursor.execute('SELECT name, description, price FROM programs WHERE id = %s', (data['programId'],))
        program_info = cursor.fetchone()
        program_name = program_info['name'] if program_info else 'Programa no encontrado'
        program_description = program_info['description'] if program_info else ''
        program_price = program_info['price'] if program_info else 0
        
        # Obtener información del padre/tutor
        cursor.execute('SELECT name, email, phone FROM users WHERE id = %s', (session['id'],))
        parent_info = cursor.fetchone()
        parent_name = parent_info['name'] if parent_info else 'No especificado'
        parent_email = parent_info['email'] if parent_info else 'No especificado'
        parent_phone = parent_info['phone'] if parent_info else 'No especificado'
        
        mysql.connection.commit()
        
        # Enviar email de notificación de matrícula
        email_subject = f"Nueva Matrícula - {data['firstName']} {data['lastName']} - Programa: {program_name}"
        
        email_body = f"""
Nueva matrícula recibida desde la página web de Wawalu

=== INFORMACIÓN DEL ESTUDIANTE ===
Nombre completo: {data['firstName']} {data['lastName']}
Fecha de nacimiento: {data['birthDate']}
Tipo de sangre: {data['bloodType']}
Alergias: {data.get('allergies', 'Ninguna especificada')}
Notas médicas: {data.get('medicalNotes', 'Ninguna especificada')}

=== CONTACTO DE EMERGENCIA ===
Nombre: {data['emergencyContact']}
Teléfono: {data['emergencyPhone']}

=== INFORMACIÓN DEL PADRE/TUTOR ===
Nombre: {parent_name}
Email: {parent_email}
Teléfono: {parent_phone}
DNI: {data['parentDNI']}
Ocupación: {data['parentOccupation']}
Relación: {data['relationship']}

=== PROGRAMA SELECCIONADO ===
Nombre: {program_name}
Descripción: {program_description}
Precio: S/ {program_price}

=== ESTADO DE LA MATRÍCULA ===
Estado: Pendiente de revisión
Fecha de matrícula: {datetime.now().strftime('%d/%m/%Y %H:%M')}
ID del estudiante: {student_id}

---
Esta matrícula fue enviada desde el formulario de inscripción de Wawalu.
Por favor, revise y procese esta solicitud en el panel de administración.
"""
        
        # Intentar enviar correo
        print(f"🔄 Intentando enviar email de matrícula...")
        print(f"📧 Destinatario: {CONTACT_EMAIL}")
        print(f"📧 Asunto: {email_subject}")
        email_sent = send_email(CONTACT_EMAIL, email_subject, email_body)
        print(f"📧 Resultado del envío: {'✅ Exitoso' if email_sent else '❌ Falló'}")
        
        return jsonify({
            "success": True,
            "message": "Matrícula enviada correctamente"
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error al procesar la matrícula: {str(e)}"
        }), 500

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Endpoint para obtener los datos del usuario logueado"""
    if 'logged_in' not in session:
        return jsonify({
            "success": False,
            "message": "Usuario no autenticado"
        }), 401
    
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Obtener datos del usuario
        cursor.execute('SELECT name, email, phone, role FROM users WHERE id = %s', (session['id'],))
        user_data = cursor.fetchone()
        
        if user_data:
            # Obtener información adicional del padre si existe
            cursor.execute('SELECT dni, occupation, address FROM parent_info WHERE user_id = %s', (session['id'],))
            parent_info = cursor.fetchone()
            
            response_data = {
                'name': user_data['name'],
                'email': user_data['email'],
                'phone': user_data['phone'],
                'role': user_data['role'],
                'dni': parent_info['dni'] if parent_info else '',
                'occupation': parent_info['occupation'] if parent_info else '',
                'address': parent_info['address'] if parent_info else ''
            }
            
            return jsonify(response_data), 200
        else:
            return jsonify({
                "success": False,
                "message": "Usuario no encontrado"
            }), 404
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error al obtener datos del usuario: {str(e)}"
        }), 500

@app.route('/enrollment/success')
def enrollment_success():
    return render_template('enrollment_success.html')

@app.route('/debug/enrollment')
def debug_enrollment():
    """Página de debug para el formulario de matrícula"""
    return send_from_directory('.', 'debug_enrollment.html')

@app.route('/api/check_auth', methods=['GET'])
def check_auth():
    """API endpoint para verificar si el usuario está autenticado"""
    return jsonify({
        'authenticated': 'id' in session,
        'user_id': session.get('id'),
        'user_name': session.get('name')
    })

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        try:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
            remember = data.get('remember')

            # Verificar campos obligatorios
            if not all([email, password]):
                return jsonify({
                    "success": False,
                    "message": "Todos los campos son obligatorios"
                }), 400

            # Crear cursor
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            
            # Buscar usuario por email
            cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
            user = cursor.fetchone()

            # Verificar si existe el usuario y la contraseña es correcta
            if user and check_password_hash(user['password'], password):
                # Guardar información en la sesión
                session['logged_in'] = True
                session['user_id'] = user['id']  # Usar user_id para consistencia
                session['id'] = user['id']  # Mantener compatibilidad
                session['name'] = user['name']
                session['email'] = user['email']
                session['role'] = user['role']
                session['is_admin'] = user['is_admin']

                # Track user activity
                track_user_activity()

                return jsonify({
                    "success": True,
                    "user": {
                        "name": user['name'],
                        "email": user['email'],
                        "role": user['role'],
                        "is_admin": user['is_admin']
                    }
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "message": "Correo o contraseña incorrectos"
                }), 401

        except Exception as e:
            return jsonify({
                "success": False,
                "message": "Error en el inicio de sesión: " + str(e)
            }), 500

    return render_template('login.html')

# ========== GESTIÓN DE GALERÍA ==========
@app.route('/admin/gallery')
@admin_required
def admin_gallery():
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Crear tabla de galería si no existe (usando el esquema correcto)
        cursor.execute('''
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
            )
        ''')
        mysql.connection.commit()
        
        # Obtener todas las imágenes
        cursor.execute('SELECT * FROM gallery ORDER BY created_at DESC')
        images = cursor.fetchall()
        
        return render_template('admin/gallery.html', images=images)
        
    except Exception as e:
        flash(f'Error al cargar la galería: {str(e)}', 'error')
        return render_template('admin/gallery.html', images=[])

@app.route('/admin/gallery/upload', methods=['POST'])
@admin_required
def upload_gallery_image():
    try:
        import os
        from werkzeug.utils import secure_filename
        
        if 'image' not in request.files:
            return jsonify({'success': False, 'message': 'No se seleccionó archivo'})
        
        file = request.files['image']
        title = request.form.get('title')
        description = request.form.get('description', '')
        category = request.form.get('category')
        
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No se seleccionó archivo'})
        
        if not title or not category:
            return jsonify({'success': False, 'message': 'Título y categoría son requeridos'})
        
        # Validar extensiones permitidas
        ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS):
            return jsonify({'success': False, 'message': 'Tipo de archivo no permitido'})
        
        filename = secure_filename(file.filename)
        upload_path = os.path.join(app.root_path, 'static', 'img', filename)
        
        # Asegurar que el directorio existe
        os.makedirs(os.path.dirname(upload_path), exist_ok=True)
        
        file.save(upload_path)
        
        # Guardar en base de datos
        cursor = mysql.connection.cursor()
        cursor.execute('''
            INSERT INTO gallery (image_url, title, description, category)
            VALUES (%s, %s, %s, %s)
        ''', (filename, title, description, category))
        mysql.connection.commit()
        
        return jsonify({'success': True, 'message': 'Imagen subida exitosamente'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error al subir imagen: {str(e)}'})

@app.route('/admin/gallery/edit/<int:image_id>', methods=['POST'])
@admin_required
def edit_gallery_image(image_id):
    try:
        title = request.form.get('title')
        description = request.form.get('description', '')
        category = request.form.get('category')
        
        if not title or not category:
            return jsonify({'success': False, 'message': 'Título y categoría son requeridos'})
        
        cursor = mysql.connection.cursor()
        cursor.execute('''
            UPDATE gallery 
            SET title = %s, description = %s, category = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (title, description, category, image_id))
        mysql.connection.commit()
        
        if cursor.rowcount > 0:
            return jsonify({'success': True, 'message': 'Imagen actualizada exitosamente'})
        else:
            return jsonify({'success': False, 'message': 'Imagen no encontrada'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error al editar imagen: {str(e)}'})

@app.route('/admin/gallery/get/<int:image_id>', methods=['GET'])
@admin_required
def get_gallery_image(image_id):
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute('SELECT * FROM gallery WHERE id = %s', (image_id,))
        image = cursor.fetchone()
        
        if not image:
            return jsonify({'success': False, 'message': 'Imagen no encontrada'})
        
        return jsonify({'success': True, 'image': image})
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error al obtener imagen: {str(e)}'})

@app.route('/admin/gallery/delete/<int:image_id>', methods=['DELETE'])
@admin_required
def delete_gallery_image(image_id):
    try:
        import os
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Obtener información de la imagen antes de eliminar
        cursor.execute('SELECT filename FROM gallery WHERE id = %s', (image_id,))
        image = cursor.fetchone()
        
        if not image:
            return jsonify({'success': False, 'message': 'Imagen no encontrada'})
        
        # Eliminar archivo físico
        file_path = os.path.join(app.root_path, 'static', 'img', image['filename'])
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Eliminar de base de datos
        cursor.execute('DELETE FROM gallery WHERE id = %s', (image_id,))
        mysql.connection.commit()
        
        return jsonify({'success': True, 'message': 'Imagen eliminada exitosamente'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error al eliminar imagen: {str(e)}'})

# ========== UTILIDADES DE ADMINISTRACIÓN ==========

@app.route('/admin/reset-passwords', methods=['POST'])
@admin_required
def reset_passwords():
    """
    Ruta de administración para resetear contraseñas corruptas
    Acceso: Solo administradores
    """
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Obtener usuarios con problemas de hash
        cursor.execute('SELECT id, name, email FROM users WHERE id IN (1, 2)')
        users = cursor.fetchall()
        
        updated_users = []
        
        for user in users:
            # Contraseña por defecto para reseteo
            new_password = 'admin123'
            new_hash = generate_password_hash(new_password)
            
            # Actualizar contraseña
            cursor.execute('UPDATE users SET password = %s WHERE id = %s', (new_hash, user['id']))
            
            updated_users.append({
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'new_password': new_password
            })
        
        mysql.connection.commit()
        
        return jsonify({
            'success': True,
            'message': 'Contraseñas resetadas exitosamente',
            'updated_users': updated_users
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al resetear contraseñas: {str(e)}'
        })

@app.route('/admin/fix-hashes')
@admin_required
def fix_password_hashes():
    """
    Página de administración para reparar hashes de contraseñas
    Acceso: Solo administradores
    """
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Verificar usuarios con posibles problemas de hash
        cursor.execute('SELECT id, name, email, LEFT(password, 20) as hash_preview FROM users ORDER BY id')
        users = cursor.fetchall()
        
        return render_template('admin/fix_hashes.html', users=users)
        
    except Exception as e:
        flash(f'Error al cargar usuarios: {str(e)}', 'error')
        return redirect(url_for('admin_dashboard'))

@app.route('/utils/generate-hash/<password>')
def generate_hash_util(password):
    """
    Utilidad para generar hash de contraseña (solo en desarrollo)
    Eliminar en producción por seguridad
    """
    if app.config.get('DEBUG'):
        hash_result = generate_password_hash(password)
        return jsonify({
            'password': password,
            'hash': hash_result,
            'hash_preview': hash_result[:50] + '...'
        })
    else:
        return jsonify({'error': 'Disponible solo en modo debug'}), 403

@app.route('/debug/routes')
def show_routes():
    """Debug: Mostrar todas las rutas registradas"""
    if app.config.get('DEBUG'):
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append({
                'endpoint': rule.endpoint,
                'methods': list(rule.methods),
                'rule': rule.rule
            })
        return jsonify(routes)
    else:
        return jsonify({'error': 'Debug only'}), 403

@app.route('/debug/test-user')
def test_user():
    """Debug: Test login with user ID 1"""
    if app.config.get('DEBUG'):
        try:
            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            cursor.execute('SELECT id, name, email FROM users WHERE id = 1')
            user = cursor.fetchone()
            cursor.close()
            
            if user:
                session['logged_in'] = True
                session['id'] = user['id']
                session['name'] = user['name']
                session['email'] = user['email']
                session['role'] = 'admin'
                session['is_admin'] = True
                session['user_id'] = user['id']
                
                return jsonify({
                    'success': True,
                    'message': 'Test login successful',
                    'user': user
                })
            else:
                return jsonify({'error': 'User not found'}), 404
                
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Debug only'}), 403

if __name__ == '__main__':
    app.run(debug=True)
