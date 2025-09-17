document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Lightbox
    lightbox.option({
        'resizeDuration': 200,
        'wrapAround': true,
        'fadeDuration': 300,
        'imageFadeDuration': 300,
        'albumLabel': "Imagen %1 de %2"
    });

    // Función para filtrar la galería
    window.filterGallery = function(category) {
        // Actualizar botones de filtro
        const filterButtons = document.querySelectorAll('.category-filter');
        filterButtons.forEach(button => {
            if (button.textContent.trim().toLowerCase() === category) {
                button.classList.remove('bg-gray-200', 'text-gray-700');
                button.classList.add('bg-blue-600', 'text-white');
            } else {
                button.classList.remove('bg-blue-600', 'text-white');
                button.classList.add('bg-gray-200', 'text-gray-700');
            }
        });

        // Filtrar imágenes
        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => {
            if (category === 'todos' || item.classList.contains(category)) {
                // Mostrar con animación
                item.style.opacity = '0';
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                }, 50);
            } else {
                // Ocultar con animación
                item.style.opacity = '0';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    };

    // Configurar efectos de hover para las imágenes
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const overlay = this.querySelector('.from-black\\/50');
            if (overlay) {
                overlay.style.opacity = '1';
            }
        });

        item.addEventListener('mouseleave', function() {
            const overlay = this.querySelector('.from-black\\/50');
            if (overlay) {
                overlay.style.opacity = '0';
            }
        });
    });

    // Animación inicial de carga
    setTimeout(() => {
        galleryItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
            }, index * 100);
        });
    }, 300);
});