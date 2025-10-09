// Menú móvil mejorado con animaciones suaves
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    let isMenuOpen = false;
    
    if (menuButton && mobileMenu) {
        // Función para mostrar el menú
        function showMenu() {
            isMenuOpen = true;
            mobileMenu.classList.remove('hidden');
            
            // Animación de entrada
            setTimeout(() => {
                mobileMenu.classList.remove('scale-95', 'opacity-0');
                mobileMenu.classList.add('scale-100', 'opacity-100');
            }, 10);
            
            // Cambiar ícono del botón
            updateMenuButtonIcon(true);
        }
        
        // Función para ocultar el menú
        function hideMenu() {
            isMenuOpen = false;
            
            // Animación de salida
            mobileMenu.classList.remove('scale-100', 'opacity-100');
            mobileMenu.classList.add('scale-95', 'opacity-0');
            
            // Ocultar después de la animación
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
            
            // Cambiar ícono del botón
            updateMenuButtonIcon(false);
        }
        
        // Función para cambiar el ícono del botón hamburguesa
        function updateMenuButtonIcon(isOpen) {
            const icon = menuButton.querySelector('svg');
            if (icon) {
                icon.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
                icon.style.transition = 'transform 0.3s ease-in-out';
            }
        }
        
        // Toggle del menú móvil
        menuButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (isMenuOpen) {
                hideMenu();
            } else {
                showMenu();
            }
        });
        
        // Cerrar menú al hacer click fuera
        document.addEventListener('click', function(e) {
            if (isMenuOpen && !mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
                hideMenu();
            }
        });
        
        // Cerrar menú al hacer click en enlaces con animación de hover
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(function(link) {
            // Animación de hover mejorada
            link.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(4px)';
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0px)';
            });
            
            // Cerrar menú al hacer click
            link.addEventListener('click', function() {
                setTimeout(hideMenu, 150); // Pequeño delay para mejor UX
            });
        });
        
        // Cerrar menú al redimensionar pantalla a desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 1024 && isMenuOpen) {
                hideMenu();
            }
        });
        
        // Cerrar menú con tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                hideMenu();
            }
        });
        
        // Inicializar estado del menú
        mobileMenu.classList.add('scale-95', 'opacity-0');
    }
});