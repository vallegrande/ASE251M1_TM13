from flask import Flask, render_template, redirect, url_for, request, jsonify
import os
from pathlib import Path

app = Flask(__name__)

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
        data = request.get_json()
        # Aquí irá la lógica de registro
        return jsonify({"success": True}), 200
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
    # Datos de ejemplo de productos
    products = {
        'uniformes': [
            {'id': 1, 'name': 'Uniforme Diario', 'price': 89.90, 'image': 'uniform1.jpg', 'description': 'Uniforme escolar diario completo'},
            {'id': 2, 'name': 'Uniforme Deportivo', 'price': 79.90, 'image': 'uniform2.jpg', 'description': 'Conjunto deportivo completo'},
            {'id': 3, 'name': 'Polo Institucional', 'price': 29.90, 'image': 'polo.jpg', 'description': 'Polo con logo institucional'},
            {'id': 4, 'name': 'Short Deportivo', 'price': 35.90, 'image': 'short.jpg', 'description': 'Short deportivo con logo'},
            {'id': 5, 'name': 'Medias Escolares', 'price': 12.90, 'image': 'socks.jpg', 'description': 'Par de medias escolares'},
            {'id': 6, 'name': 'Casaca Institucional', 'price': 89.90, 'image': 'jacket.jpg', 'description': 'Casaca con logo bordado'},
        ],
        'utiles': [
            {'id': 7, 'name': 'Kit de Arte', 'price': 45.90, 'image': 'artkit.jpg', 'description': 'Kit completo de arte'},
            {'id': 8, 'name': 'Cuaderno A4', 'price': 8.90, 'image': 'notebook.jpg', 'description': 'Cuaderno institucional A4'},
            {'id': 9, 'name': 'Set de Lápices', 'price': 15.90, 'image': 'pencils.jpg', 'description': 'Set de lápices de colores'},
            {'id': 10, 'name': 'Plastilina', 'price': 12.90, 'image': 'clay.jpg', 'description': 'Set de plastilina no tóxica'},
            {'id': 11, 'name': 'Tijeras Escolares', 'price': 5.90, 'image': 'scissors.jpg', 'description': 'Tijeras punta roma'},
            {'id': 12, 'name': 'Folder Institucional', 'price': 7.90, 'image': 'folder.jpg', 'description': 'Folder con logo'},
            {'id': 13, 'name': 'Témperas', 'price': 18.90, 'image': 'paint.jpg', 'description': 'Set de témperas'},
        ],
        'accesorios': [
            {'id': 14, 'name': 'Mochila Escolar', 'price': 79.90, 'image': 'backpack.jpg', 'description': 'Mochila con logo'},
            {'id': 15, 'name': 'Lonchera Térmica', 'price': 45.90, 'image': 'lunchbox.jpg', 'description': 'Lonchera térmica con logo'},
            {'id': 16, 'name': 'Gorro Institucional', 'price': 25.90, 'image': 'hat.jpg', 'description': 'Gorro con protección UV'},
            {'id': 17, 'name': 'Botella de Agua', 'price': 19.90, 'image': 'bottle.jpg', 'description': 'Botella reutilizable'},
            {'id': 18, 'name': 'Set de Toallas', 'price': 29.90, 'image': 'towels.jpg', 'description': 'Set de 2 toallas'},
            {'id': 19, 'name': 'Mandil de Arte', 'price': 35.90, 'image': 'apron.jpg', 'description': 'Mandil para actividades artísticas'},
            {'id': 20, 'name': 'Porta Útiles', 'price': 22.90, 'image': 'case.jpg', 'description': 'Estuche para útiles'},
        ]
    }
    return render_template('shop.html', products=products)

@app.route('/carrito')
def cart():
    return render_template('cart.html')

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

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        remember = data.get('remember')

        # Aquí irá tu lógica de autenticación
        # Por ahora, simulamos una autenticación básica
        if email == "admin@wawalu.com" and password == "123456":
            return jsonify({"success": True}), 200
        else:
            return jsonify({
                "success": False,
                "message": "Correo o contraseña incorrectos"
            }), 401

    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)
