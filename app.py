from flask import Flask, render_template, redirect, url_for, request, jsonify, session, flash
from flask_mysqldb import MySQL
import os
from pathlib import Path
import MySQLdb.cursors
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime

app = Flask(__name__)

# Configuración de MySQL
app.config['MYSQL_HOST'] = 'localhost'  # Host de tu contenedor Docker
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'wawalu123456'
app.config['MYSQL_DB'] = 'wawalu_db'

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

# Clave secreta para sesiones
app.secret_key = 'tu_clave_secreta_aqui'  # Cambia esto por una clave secreta segura

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
        data = request.get_json()
        # Aquí irá la lógica de envío de correo
        return jsonify({
            "success": True,
            "message": "Mensaje enviado correctamente"
        }), 200
    return render_template('contact.html')

@app.route('/galeria')
def gallery():
    # Datos de ejemplo de imágenes
    images = [
        {
            'file': 'space1.jpg',
            'category': 'espacios',
            'title': 'Sala de Arte',
            'description': 'Espacio dedicado a la expresión artística'
        },
        {
            'file': 'space2.jpg',
            'category': 'espacios',
            'title': 'Área de Juegos',
            'description': 'Zona de recreación y desarrollo motriz'
        },
        {
            'file': 'activity1.jpg',
            'category': 'actividades',
            'title': 'Taller de Pintura',
            'description': 'Niños explorando su creatividad'
        },
        {
            'file': 'activity2.jpg',
            'category': 'actividades',
            'title': 'Hora de Lectura',
            'description': 'Momento de historias y aprendizaje'
        },
        {
            'file': 'event1.jpg',
            'category': 'eventos',
            'title': 'Día de la Familia',
            'description': 'Celebración con padres y niños'
        },
        {
            'file': 'event2.jpg',
            'category': 'eventos',
            'title': 'Festival de Arte',
            'description': 'Exposición de trabajos artísticos'
        },
        {
            'file': 'project1.jpg',
            'category': 'proyectos',
            'title': 'Huerto Escolar',
            'description': 'Aprendiendo sobre la naturaleza'
        },
        {
            'file': 'project2.jpg',
            'category': 'proyectos',
            'title': 'Reciclaje Creativo',
            'description': 'Proyecto de conciencia ambiental'
        }
    ]
    return render_template('gallery.html', images=images)

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
        flash('Por favor inicia sesión para ver tu carrito', 'warning')
        return redirect(url_for('login'))
    
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    # Obtener items del carrito del usuario
    cursor.execute('''
        SELECT sc.*, p.name, p.price, p.image_url 
        FROM shopping_cart sc 
        JOIN products p ON sc.product_id = p.id 
        WHERE sc.user_id = %s
    ''', (session['id'],))
    
    cart_items = cursor.fetchall()
    
    # Calcular totales
    subtotal = sum(item['price'] * item['quantity'] for item in cart_items)
    tax = subtotal * 0.18  # 18% IGV
    shipping = 15 if subtotal < 200 else 0  # Envío gratis para compras mayores a S/. 200
    total = subtotal + tax + shipping
    
    return render_template('cart.html', 
                         cart_items=cart_items,
                         subtotal=subtotal,
                         tax=tax,
                         shipping=shipping,
                         total=total)

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

@app.route('/checkout')
def checkout():
    return render_template('checkout.html')

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
    # Placeholder para la gestión de órdenes
    return render_template('admin/orders.html')

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
        
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Matrícula enviada correctamente"
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error al procesar la matrícula: {str(e)}"
        }), 500

@app.route('/enrollment/success')
def enrollment_success():
    return render_template('enrollment_success.html')

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
                session['id'] = user['id']
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

if __name__ == '__main__':
    app.run(debug=True)
