// Elementos del DOM
const menuButton = document.getElementById('menu-button');
const closeButton = document.getElementById('close-menu');
const mobileMenu = document.getElementById('mobile-menu');
const menuOverlay = mobileMenu.querySelector('.bg-black');

// Función para mostrar el menú
function showMenu() {
    mobileMenu.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
}

// Función para ocultar el menú
function hideMenu() {
    mobileMenu.classList.add('hidden');
    document.body.style.overflow = ''; // Restaurar scroll del body
}

// Event listeners
menuButton.addEventListener('click', showMenu);
closeButton.addEventListener('click', hideMenu);
menuOverlay.addEventListener('click', hideMenu);

// Cerrar el menú al presionar la tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        hideMenu();
    }
});

// Cerrar el menú cuando se hace click en un enlace del menú móvil
const mobileMenuLinks = mobileMenu.getElementsByTagName('a');
Array.from(mobileMenuLinks).forEach(link => {
    link.addEventListener('click', hideMenu);
});

// Prevenir que los clicks dentro del menú móvil cierren el menú
const menuContent = mobileMenu.querySelector('.bg-white');
menuContent.addEventListener('click', (e) => {
    e.stopPropagation();
});