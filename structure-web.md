# 🏗️ Estructura Web - Wawalu Centro Educativo

## 📁 **Estructura de Directorios**

```
wawalu/
├── 📄 app.py                    # Aplicación Flask principal
├── 📄 schema.sql                # Base de datos MySQL
├── 📄 requirements.txt          # Dependencias Python
├── 📄 package.json              # Configuración npm/Tailwind
├── 📄 tailwind.config.js        # Configuración Tailwind CSS
├── 📄 sitemap.xml               # Sitemap para SEO
├── 📄 sitemap.md                # Documentación del sitemap
├── 📄 structure-web.md          # Este archivo
│
├── 📁 static/                   # Archivos estáticos
│   ├── 📁 css/
│   │   ├── 📄 input.css         # CSS fuente de Tailwind
│   │   ├── 📄 output.css        # CSS compilado de Tailwind
│   │   ├── 📄 calendar.css      # Estilos del calendario
│   │   └── 📄 slider.css        # Estilos del slider
│   │
│   ├── 📁 js/
│   │   ├── 📄 cart.js           # Funcionalidad del carrito
│   │   ├── 📄 checkout.js       # Proceso de pago
│   │   ├── 📄 shop.js           # Funcionalidad de la tienda
│   │   ├── 📄 login.js          # Sistema de login
│   │   ├── 📄 register.js       # Sistema de registro
│   │   ├── 📄 contact.js        # Formulario de contacto
│   │   ├── 📄 enrollment.js     # Formulario de inscripción
│   │   ├── 📄 calendar.js       # Calendario interactivo
│   │   ├── 📄 gallery.js        # Galería de imágenes
│   │   ├── 📄 news.js           # Gestión de noticias
│   │   ├── 📄 news-detail.js    # Detalle de noticias
│   │   ├── 📄 menu.js           # Menú responsive
│   │   └── 📄 slider.js         # Slider de imágenes
│   │
│   ├── 📁 img/
│   │   ├── 📄 logo.png          # Logo principal
│   │   ├── 📄 fondo.png         # Imagen de fondo
│   │   └── 📄 imagen1-13.jpg    # Galería de imágenes
│   │
│   └── 📁 icons/
│       ├── 📄 facebook.png      # Icono Facebook
│       ├── 📄 instagram.png     # Icono Instagram
│       ├── 📄 whatsapp.png      # Icono WhatsApp
│       └── 📄 yape.png          # Icono Yape
│
├── 📁 templates/                # Plantillas HTML
│   ├── 📄 base.html             # Template base
│   ├── 📄 auth_base.html        # Template para autenticación
│   ├── 📄 index.html            # Página de inicio
│   ├── 📄 about.html            # Página nosotros
│   ├── 📄 programs.html         # Página programas
│   ├── 📄 calendar.html         # Página calendario
│   ├── 📄 news.html             # Listado de noticias
│   ├── 📄 news-detail.html      # Detalle de noticia
│   ├── 📄 gallery.html          # Página galería
│   ├── 📄 shop.html             # Página tienda
│   ├── 📄 cart.html             # Página carrito
│   ├── 📄 checkout.html         # Página checkout
│   ├── 📄 contact.html          # Página contacto
│   ├── 📄 login.html            # Página login
│   ├── 📄 register.html         # Página registro
│   ├── 📄 profile.html          # Página perfil
│   ├── 📄 enrollment.html       # Página inscripción
│   ├── 📄 enrollment_success.html # Confirmación inscripción
│   │
│   └── 📁 admin/               # Templates administrativos
│       ├── 📄 base.html         # Base admin
│       ├── 📄 dashboard.html    # Dashboard
│       ├── 📄 users.html        # Gestión usuarios
│       ├── 📄 products.html     # Gestión productos
│       ├── 📄 content.html      # Gestión contenido
│       ├── 📄 news.html         # Gestión noticias
│       ├── 📄 programs.html     # Gestión programas
│       ├── 📄 enrollments.html  # Gestión inscripciones
│       └── 📄 orders.html       # Gestión órdenes
│
├── 📁 venv/                     # Entorno virtual Python
└── 📁 node_modules/             # Dependencias Node.js/Tailwind
```

## 🎯 **Arquitectura del Sistema**

### **🔧 Backend (Flask)**
```
app.py
├── Configuración Flask
├── Conexión MySQL
├── Rutas principales (/home, /about, etc.)
├── Rutas de autenticación (/login, /register)
├── Rutas del e-commerce (/shop, /cart, /checkout)
├── Rutas administrativas (/admin/*)
├── APIs REST (/api/*)
└── Manejo de errores
```

### **🎨 Frontend (HTML + Tailwind + JS)**
```
Templates Hierarchy:
├── base.html (Layout principal)
│   ├── index.html
│   ├── about.html
│   ├── programs.html
│   ├── calendar.html
│   ├── news.html
│   ├── gallery.html
│   ├── shop.html
│   ├── cart.html
│   ├── checkout.html
│   ├── contact.html
│   └── profile.html
│
├── auth_base.html (Layout autenticación)
│   ├── login.html
│   └── register.html
│
└── admin/base.html (Layout administrativo)
    ├── dashboard.html
    ├── users.html
    ├── products.html
    ├── content.html
    ├── news.html
    ├── programs.html
    ├── enrollments.html
    └── orders.html
```

### **💾 Base de Datos (MySQL)**
```
wawalu_db
├── users              # Usuarios del sistema
├── products           # Productos de la tienda
├── shopping_cart      # Carrito de compras
├── orders             # Órdenes de compra
├── order_items        # Items de las órdenes
├── enrollments        # Inscripciones de estudiantes
├── news               # Noticias del centro
└── site_settings      # Configuraciones del sitio
```

## 🚀 **Flujo de Datos**

### **📝 Inscripción de Estudiantes**
```
enrollment.html → enrollment.js → app.py (/enrollment) → MySQL (enrollments)
```

### **🛒 E-commerce**
```
shop.html → shop.js → app.py (/api/cart/*) → MySQL (shopping_cart) → cart.html → checkout.html
```

### **👤 Autenticación**
```
login.html → login.js → app.py (/login) → MySQL (users) → Session → Dashboard
```

### **📰 Gestión de Noticias**
```
admin/news.html → news.js → app.py (/admin/news) → MySQL (news) → news.html
```

## 🎨 **Sistema de Estilos**

### **Tailwind CSS**
```
input.css (fuente)
├── @tailwind base
├── @tailwind components
└── @tailwind utilities
    ↓ (compilación)
output.css (producción)
```

### **CSS Personalizado**
```
static/css/
├── calendar.css    # Estilos específicos del calendario
└── slider.css      # Estilos específicos del slider
```

## 📱 **Componentes JavaScript**

### **🛒 E-commerce**
- `shop.js` - Catálogo de productos, filtros, agregar al carrito
- `cart.js` - Gestión del carrito, actualizar cantidades, eliminar items
- `checkout.js` - Proceso de pago, validación de formularios

### **👤 Autenticación**
- `login.js` - Formulario de login, validación
- `register.js` - Formulario de registro, validación

### **📋 Formularios**
- `contact.js` - Formulario de contacto
- `enrollment.js` - Formulario de inscripción

### **🎨 UI/UX**
- `menu.js` - Menú responsive, navegación móvil
- `slider.js` - Slider de imágenes en homepage
- `gallery.js` - Galería interactiva de fotos
- `calendar.js` - Calendario de eventos

### **📰 Contenido**
- `news.js` - Gestión de noticias (admin)
- `news-detail.js` - Visualización de noticias

## 🔐 **Seguridad**

### **Autenticación**
- Bcrypt para hash de contraseñas
- Sessions de Flask para manejo de estado
- Verificación de roles (user/admin)

### **Validación**
- Validación frontend (JavaScript)
- Validación backend (Python)
- Sanitización de datos de entrada

### **Protección**
- CSRF protection
- SQL injection prevention
- XSS protection

## 📊 **Performance**

### **Frontend**
- Tailwind CSS compilado y minificado
- JavaScript modular por página
- Imágenes optimizadas
- Lazy loading

### **Backend**
- Conexiones de DB optimizadas
- Queries eficientes
- Caché de sesiones
- Compresión de respuestas

## 🔧 **Desarrollo**

### **Comandos Principales**
```bash
# Activar entorno virtual
venv\Scripts\activate

# Instalar dependencias Python
pip install -r requirements.txt

# Compilar CSS
npm run build:css

# Modo desarrollo CSS
npm run watch:css

# Ejecutar aplicación
python app.py
```

### **Estructura de URLs**
```
/ (GET)                    # Homepage
/nosotros (GET)            # About page
/programas (GET)           # Programs page
/calendario (GET)          # Calendar page
/noticias (GET)            # News listing
/noticias/<int:id> (GET)   # News detail
/galeria (GET)             # Gallery page
/tienda (GET)              # Shop page
/carrito (GET)             # Cart page
/checkout (GET)            # Checkout page
/contacto (GET/POST)       # Contact page
/inscripcion (GET/POST)    # Enrollment page
/login (GET/POST)          # Login page
/registro (GET/POST)       # Register page
/perfil (GET)              # Profile page
/admin/* (GET/POST)        # Admin pages
/api/* (POST/PUT/DELETE)   # API endpoints
```

## 🎯 **Próximas Mejoras**

### **Funcionalidades**
- [ ] Sistema de testimonios
- [ ] Blog educativo
- [ ] Chat en línea
- [ ] Notificaciones push
- [ ] Multi-idioma

### **Técnicas**
- [ ] API REST completa
- [ ] Tests automatizados
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] CDN para assets