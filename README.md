# 🎓 Wawalu Centro Educativo

> Plataforma web integral para centro educativo basado en metodología Reggio Emilia con sistema de inscripciones, tienda virtual y gestión administrativa completa.

![Estado del Proyecto](https://img.shields.io/badge/estado-en%20desarrollo-yellow)
![Versión](https://img.shields.io/badge/versión-2.0.0-blue)
![Licencia](https://img.shields.io/badge/licencia-MIT-green)
![Última Actualización](https://img.shields.io/badge/última%20actualización-octubre%202025-brightgreen)

## 📋 **Tabla de Contenidos**

- [Características](#-características)
- [Tecnologías](#️-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API](#-api)
- [Base de Datos](#️-base-de-datos)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

## ✨ **Características**

### 🏫 **Portal Educativo**
- ✅ Información institucional y programas educativos
- ✅ Calendario de actividades y eventos
- ✅ Galería de fotos e imágenes con gestión admin
- ✅ Sistema de noticias y actualizaciones
- ✅ Sistema de contacto integrado con WhatsApp
- ✅ Footer horizontal optimizado y responsive

### 👨‍👩‍👧‍👦 **Sistema de Matriculación**
- ✅ Formulario de matrícula completo (/matricula)
- ✅ Gestión de datos familiares y médicos
- ✅ Confirmación automática por email
- ✅ Panel administrativo para seguimiento
- ✅ Página de éxito de inscripción

### 🛒 **E-commerce Avanzado**
- ✅ Tienda virtual con productos educativos
- ✅ Carrito de compras con localStorage
- ✅ Sistema de checkout con múltiples métodos de pago
- ✅ Gestión completa de inventario y órdenes
- ✅ Historial de pedidos de usuario (/mis-pedidos)
- ✅ Confirmaciones de pedido con email

### 👤 **Gestión de Usuarios Completa**
- ✅ Sistema de registro e inicio de sesión
- ✅ Perfiles de usuario personalizados
- ✅ Roles y permisos (usuario/admin)
- ✅ Autenticación segura con bcrypt
- ✅ Cambio de contraseña
- ✅ Gestión de sesiones

### 🔧 **Panel Administrativo Avanzado**
- ✅ Dashboard con métricas y estadísticas
- ✅ Gestión completa de usuarios y permisos
- ✅ Administración de productos y inventario
- ✅ Gestión de contenido web dinámico
- ✅ Control de inscripciones y órdenes
- ✅ Gestión de galería de imágenes
- ✅ Sistema de noticias admin
- ✅ Herramientas de seguridad

### 📞 **Sistema de Contacto Integrado**
- ✅ Información de contacto actualizada
- ✅ Email: diego.centeno@vallegrande.edu.pe
- ✅ WhatsApp: +51 942 139 788
- ✅ Facebook: https://www.facebook.com/search/top?q=wawalu
- ✅ Botón flotante de WhatsApp
- ✅ Enlaces directos clickeables

### 🆘 **Atención al Cliente**
- ✅ Libro de reclamaciones digital (/libro-reclamaciones)
- ✅ Sistema de seguimiento de reclamaciones
- ✅ Consulta de estado por número
- ✅ Panel admin para gestión de reclamaciones

### 📱 **Diseño Responsive Moderno**
- ✅ Interfaz moderna con Tailwind CSS
- ✅ Completamente responsive para móviles
- ✅ Footer horizontal optimizado
- ✅ Navegación intuitiva y accesible
- ✅ Animaciones y transiciones suaves
- ✅ Material Icons integrados

## 🛠️ **Tecnologías**

### **Backend**
- ![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white) **Python 3.8+**
- ![Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white) **Flask 2.3.3**
- ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white) **MySQL 8.0+**

### **Frontend**
- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) **HTML5**
- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) **CSS3 + Tailwind CSS**
- ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) **JavaScript ES6+**

### **Herramientas**
- ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) **Docker** (para base de datos)
- ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) **Node.js** (para Tailwind CSS)
- ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) **Git** (control de versiones)

## 🚀 **Instalación**

### **Prerrequisitos**
- Python 3.8 o superior
- Node.js 16 o superior
- MySQL 8.0 o superior (o Docker)
- Git

### **1. Clonar el repositorio**
```bash
git clone https://github.com/vallegrande/ASE251S2_T13_wp.git
cd ASE251S2_T13_wp
```

### **2. Configurar entorno virtual de Python**
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate
```

### **3. Instalar dependencias Python**
```bash
pip install -r requirements.txt
```

### **4. Configurar Node.js y Tailwind CSS**
```bash
# Instalar dependencias de Node.js
npm install

# Compilar CSS de Tailwind
npm run build:css
```

### **5. Configurar base de datos**

#### **Opción A: Con Docker (Recomendado)**
```bash
# Crear contenedor MySQL
docker run --name wawalu-mysql \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=wawalu_db \
  -e MYSQL_USER=wawalu_user \
  -e MYSQL_PASSWORD=wawalu123 \
  -p 3306:3306 \
  -d mysql:8.0

# Importar schema
docker exec -i wawalu-mysql mysql -u wawalu_user -pwawalu123 wawalu_db < schema.sql
```

#### **Opción B: MySQL Local**
```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE wawalu_db;
CREATE USER 'wawalu_user'@'localhost' IDENTIFIED BY 'wawalu123';
GRANT ALL PRIVILEGES ON wawalu_db.* TO 'wawalu_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Importar schema
mysql -u wawalu_user -p wawalu_db < schema.sql
```

## ⚙️ **Configuración**

### **Variables de Entorno**
Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wawalu_db
DB_USER=wawalu_user
DB_PASSWORD=wawalu123

# Flask
FLASK_DEBUG=True
SECRET_KEY=tu-clave-secreta-aqui

# Email (opcional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-password
```

### **Configuración de la Base de Datos**
El archivo `schema.sql` incluye:
- 📊 Estructura completa de tablas
- 👤 Usuarios de ejemplo (incluyendo admin)
- 🛍️ 20 productos de ejemplo
- 📰 Noticias de muestra
- ⚙️ Configuraciones del sitio

## 🎮 **Uso**

### **Iniciar la aplicación**
```bash
# Activar entorno virtual
venv\Scripts\activate

# Ejecutar aplicación
python app.py
```

### **Acceso al sitio**
- **Frontend:** http://localhost:5000
- **Panel Admin:** http://localhost:5000/admin

### **Credenciales por defecto**
```
Admin:
Email: diego.centeno@vallegrande.edu.pe
Password: 123456

Usuario test:
Email: juan@example.com
Password: password123
```

### **Desarrollo con Tailwind CSS**
```bash
# Compilar CSS una vez
npm run build:css

# Modo watch (recompila automáticamente)
npm run watch:css
```

## 📁 **Estructura del Proyecto**

```
wawalu/
├── 📄 app.py                    # Aplicación Flask principal
├── 📄 schema.sql                # Base de datos MySQL
├── 📄 requirements.txt          # Dependencias Python
├── 📄 package.json              # Configuración npm
├── 📄 tailwind.config.js        # Configuración Tailwind
├── 📄 sitemap.xml               # Sitemap para SEO
├── 📄 README.md                 # Este archivo
│
├── 📁 static/                   # Archivos estáticos
│   ├── 📁 css/                  # Hojas de estilo
│   ├── 📁 js/                   # JavaScript
│   ├── 📁 img/                  # Imágenes
│   └── 📁 icons/                # Iconos
│
├── 📁 templates/                # Plantillas HTML
│   ├── 📄 base.html             # Template base
│   ├── 📄 index.html            # Página principal
│   ├── 📄 shop.html             # Tienda
│   ├── 📄 cart.html             # Carrito
│   └── 📁 admin/                # Templates admin
│
├── 📁 venv/                     # Entorno virtual
└── 📁 node_modules/             # Dependencias Node.js
```

## 🔗 **API**

### **Autenticación**
```
POST /login                    # Iniciar sesión
POST /register                 # Registrar usuario
POST /logout                   # Cerrar sesión
GET  /profile                  # Perfil de usuario
POST /profile/update           # Actualizar perfil
POST /profile/change-password  # Cambiar contraseña
```

### **Contacto y Comunicación**
```
GET  /contacto                 # Formulario de contacto
POST /contacto                 # Enviar mensaje
GET  /api/contact/info         # Información de contacto
POST /api/contact/whatsapp     # Generar enlace WhatsApp
```

### **E-commerce**
```
GET  /tienda                   # Obtener productos
POST /api/cart/add             # Agregar al carrito
PUT  /api/cart/update          # Actualizar carrito
DELETE /api/cart/remove        # Eliminar del carrito
GET  /api/cart/count           # Contador del carrito
GET  /carrito                  # Ver carrito
GET  /checkout                 # Página de checkout
POST /process_order            # Procesar compra
GET  /mis-pedidos              # Historial de pedidos
GET  /order_confirmation/<id>  # Confirmación de pedido
```

### **Matriculación**
```
GET  /matricula                # Formulario de matrícula
POST /api/enrollment/submit    # Procesar matrícula
GET  /enrollment/success       # Éxito de matrícula
```

### **Noticias**
```
GET  /noticias                 # Lista de noticias
GET  /noticias/<id>            # Noticia específica
```

### **Atención al Cliente**
```
GET  /libro-reclamaciones              # Formulario de reclamaciones
POST /libro-reclamaciones              # Enviar reclamación
GET  /api/reclamacion/consultar/<num>  # Consultar reclamación
```

### **Administración**
```
GET  /admin                           # Dashboard admin
GET  /admin/users                     # Gestionar usuarios
POST /admin/users                     # Crear usuario
PUT  /admin/users/<id>                # Actualizar usuario
DELETE /admin/users/<id>              # Eliminar usuario
GET  /admin/products                  # Gestionar productos
POST /admin/products                  # Crear producto
PUT  /admin/products/<id>             # Actualizar producto
DELETE /admin/products/<id>           # Eliminar producto
GET  /admin/orders                    # Gestionar órdenes
GET  /admin/orders/<id>               # Ver orden específica
POST /admin/orders/<id>/verify_payment # Verificar pago
GET  /admin/enrollments               # Gestionar matrículas
GET  /admin/news                      # Gestionar noticias
POST /admin/news                      # Crear noticia
DELETE /admin/news/<id>               # Eliminar noticia
GET  /admin/content                   # Gestionar contenido
POST /admin/content/update            # Actualizar contenido
GET  /admin/gallery                   # Gestionar galería
POST /admin/gallery/upload            # Subir imagen
POST /admin/gallery/edit/<id>         # Editar imagen
DELETE /admin/gallery/delete/<id>     # Eliminar imagen
GET  /admin/reclamaciones             # Gestionar reclamaciones
GET  /admin/reclamaciones/<id>        # Ver reclamación
POST /admin/reclamaciones/<id>/responder # Responder reclamación
```

## 🗄️ **Base de Datos**

### **Tablas Principales**
- `users` - Usuarios del sistema
- `products` - Productos de la tienda
- `shopping_cart` - Carrito de compras
- `orders` - Órdenes de compra
- `order_items` - Items de las órdenes
- `enrollments` - Matrículas de estudiantes
- `news` - Noticias del centro
- `site_settings` - Configuraciones del sitio
- `gallery_images` - Imágenes de la galería
- `reclamaciones` - Libro de reclamaciones
- `contact_submissions` - Formularios de contacto

### **Diagrama ER**
```
users --|< shopping_cart >|-- products
users --|< orders >|-- order_items >|-- products
users --|< enrollments
users --|< reclamaciones
users --|< contact_submissions
gallery_images (standalone)
news (standalone)
site_settings (standalone)
```

## 🤝 **Contribuir**

1. **Fork el proyecto**
2. **Crea una rama** (`git checkout -b feature/nueva-caracteristica`)
3. **Commit tus cambios** (`git commit -m 'Agregar nueva característica'`)
4. **Push a la rama** (`git push origin feature/nueva-caracteristica`)
5. **Abre un Pull Request**

### **Guías de Contribución**
- Usar convenciones de código PEP 8 para Python
- Comentar código complejo
- Agregar tests para nuevas funcionalidades
- Actualizar documentación cuando sea necesario

## 🧪 **Testing**

```bash
# Ejecutar tests
pytest

# Ejecutar tests con cobertura
pytest --cov=app

# Ejecutar tests específicos
pytest tests/test_auth.py
```

## 🚀 **Despliegue**

### **Producción**
1. Configurar servidor web (Nginx/Apache)
2. Usar WSGI server (Gunicorn)
3. Configurar base de datos MySQL
4. Configurar certificados SSL
5. Configurar backup automático

### **Docker**
```bash
# Construir imagen
docker build -t wawalu-app .

# Ejecutar contenedor
docker run -p 5000:5000 wawalu-app
```

## 📈 **Roadmap**

### **Versión 2.1** (Próxima)
- [ ] Sistema de testimonios de padres
- [ ] Chat en línea con soporte
- [ ] Notificaciones push
- [ ] API REST completa documentada
- [ ] Sistema de citas para reuniones
- [ ] Integración con calendario Google

### **Versión 2.2** (Futuro)
- [ ] Multi-idioma (ES/EN)
- [ ] App móvil nativa
- [ ] Integración avanzada con redes sociales
- [ ] Sistema de reportes avanzados
- [ ] Portal de padres dedicado
- [ ] Sistema de evaluaciones online

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 **Contacto**

**Wawalu Centro Educativo**
- 🌐 Website: [wawalu.com](https://wawalu.com)
- 📧 Email: [diego.centeno@vallegrande.edu.pe](mailto:diego.centeno@vallegrande.edu.pe)
- 📱 WhatsApp: [+51 942 139 788](https://wa.me/51942139788)
- 📘 Facebook: [Wawalu](https://www.facebook.com/search/top?q=wawalu)
- 📍 Dirección: Av. Mariscal Benavides 1365, Cañete, Lima, Perú

**Desarrolladores**
- 👨‍💻 Diego Centeno - [diego.centeno@vallegrande.edu.pe](mailto:diego.centeno@vallegrande.edu.pe)
- 🏫 Universidad Tecnológica del Perú - Valle Grande
- 🐙 GitHub: [vallegrande/ASE251S2_T13_wp](https://github.com/vallegrande/ASE251S2_T13_wp)

**📅 Última Actualización: Octubre 2025**
- ✅ Sistema de contacto completamente funcional
- ✅ Footer horizontal optimizado
- ✅ Sistema de matrículas mejorado
- ✅ Panel administrativo expandido
- ✅ Sistema de reclamaciones implementado

---

<div align="center">

**⭐ ¡No olvides dar una estrella al proyecto si te gustó! ⭐**

Hecho con ❤️ para la educación infantil

</div>