document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Lightbox
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
            'resizeDuration': 200,
            'wrapAround': true,
            'fadeDuration': 300,
            'imageFadeDuration': 300,
            'albumLabel': "Imagen %1 de %2"
        });
    }

    // Variables globales para el filtro
    let currentFilter = 'todos';
    let isAnimating = false;

    // Función para filtrar la galería
    window.filterGallery = function(category) {
        // Prevenir múltiples animaciones simultáneas
        if (isAnimating) return;
        
        // Si ya está seleccionado el mismo filtro, no hacer nada
        if (currentFilter === category) return;
        
        isAnimating = true;
        currentFilter = category;

        // Guardar preferencia
        saveFilterPreference(category);

        // Actualizar botones de filtro
        updateFilterButtons(category);

        // Filtrar imágenes con animación
        filterImagesWithAnimation(category);
    };

    // Función para actualizar los botones de filtro
    function updateFilterButtons(activeCategory) {
        const filterButtons = document.querySelectorAll('.category-filter');
        filterButtons.forEach(button => {
            button.classList.remove('active');
            if (button.onclick && button.onclick.toString().includes(activeCategory)) {
                // Botón activo
                button.classList.remove('bg-gray-200', 'text-gray-700');
                button.classList.add('bg-blue-600', 'text-white', 'active');
            } else {
                // Botón inactivo
                button.classList.remove('bg-blue-600', 'text-white');
                button.classList.add('bg-gray-200', 'text-gray-700');
            }
        });
    }

    // Función para filtrar imágenes con animación mejorada
    function filterImagesWithAnimation(category) {
        const items = document.querySelectorAll('.gallery-item');
        const gridContainer = document.querySelector('.grid');
        
        // Primero, animar salida de elementos que se van a ocultar
        const itemsToHide = [];
        const itemsToShow = [];
        
        items.forEach(item => {
            if (category === 'todos' || item.classList.contains(category)) {
                itemsToShow.push(item);
            } else {
                itemsToHide.push(item);
            }
        });

        // Animar salida
        itemsToHide.forEach((item, index) => {
            setTimeout(() => {
                item.style.transform = 'scale(0.8)';
                item.style.opacity = '0';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 200);
            }, index * 50);
        });

        // Esperar que termine la animación de salida y luego mostrar elementos
        setTimeout(() => {
            // Mostrar elementos filtrados
            itemsToShow.forEach((item, index) => {
                item.style.display = 'block';
                item.style.transform = 'scale(0.8)';
                item.style.opacity = '0';
                
                setTimeout(() => {
                    item.style.transform = 'scale(1)';
                    item.style.opacity = '1';
                }, index * 100 + 100);
            });

            // Actualizar contador de imágenes
            updateImageCounter(itemsToShow.length);
            
            // Marcar animación como completa
            setTimeout(() => {
                isAnimating = false;
            }, itemsToShow.length * 100 + 500);
            
        }, itemsToHide.length * 50 + 200);
    }

    // Función para actualizar contador de imágenes
    function updateImageCounter(count) {
        let counter = document.querySelector('.image-counter');
        if (!counter) {
            // Crear contador si no existe
            counter = document.createElement('div');
            counter.className = 'image-counter text-center text-gray-600 mb-6';
            const filtersContainer = document.querySelector('.flex.flex-wrap.justify-center');
            filtersContainer.parentNode.insertBefore(counter, filtersContainer.nextSibling);
        }
        
        const categoryText = currentFilter === 'todos' ? 'todas las categorías' : currentFilter;
        counter.innerHTML = `<p class="text-sm"><span class="font-semibold text-blue-600">${count}</span> imágenes en <span class="font-medium">${categoryText}</span></p>`;
    }

    // Configurar transiciones CSS para animaciones suaves
    function setupTransitions() {
        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.9)';
        });
    }

    // Animación inicial de carga mejorada
    function initializeGallery() {
        setupTransitions();
        
        const items = document.querySelectorAll('.gallery-item');
        setTimeout(() => {
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, index * 100);
            });
            
            // Actualizar contador inicial
            setTimeout(() => {
                updateImageCounter(items.length);
            }, items.length * 100 + 200);
        }, 300);
    }

    // Mejorar efectos de hover
    function setupHoverEffects() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            const overlay = item.querySelector('.absolute.inset-0.bg-gradient-to-t');
            
            item.addEventListener('mouseenter', function() {
                if (overlay) {
                    overlay.style.opacity = '1';
                }
            });

            item.addEventListener('mouseleave', function() {
                if (overlay) {
                    overlay.style.opacity = '0';
                }
            });
        });
    }

    // Función para buscar imágenes por texto
    window.searchGallery = function(searchTerm) {
        const items = document.querySelectorAll('.gallery-item');
        const normalizedSearch = searchTerm.toLowerCase().trim();
        const clearButton = document.getElementById('clear-search');
        
        // Mostrar/ocultar botón de limpiar
        if (normalizedSearch !== '') {
            clearButton.classList.remove('hidden');
        } else {
            clearButton.classList.add('hidden');
        }
        
        if (normalizedSearch === '') {
            // Si no hay término de búsqueda, mostrar según filtro actual
            filterGallery(currentFilter);
            return;
        }
        
        let visibleCount = 0;
        items.forEach(item => {
            const title = item.querySelector('img').alt.toLowerCase();
            const description = item.querySelector('.text-sm') ? item.querySelector('.text-sm').textContent.toLowerCase() : '';
            
            if (title.includes(normalizedSearch) || description.includes(normalizedSearch)) {
                item.style.display = 'block';
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
                visibleCount++;
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
        
        // Actualizar contador con resultados de búsqueda
        updateSearchCounter(visibleCount, normalizedSearch);
    };

    // Función para limpiar búsqueda
    window.clearSearch = function() {
        const searchInput = document.getElementById('search-input');
        const clearButton = document.getElementById('clear-search');
        
        searchInput.value = '';
        clearButton.classList.add('hidden');
        
        // Restaurar filtro actual
        filterGallery(currentFilter);
    };

    // Función para actualizar contador de búsqueda
    function updateSearchCounter(count, searchTerm) {
        let counter = document.querySelector('.image-counter');
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'image-counter text-center text-gray-600 mb-6';
            const filtersContainer = document.querySelector('.bg-white.rounded-2xl.shadow-lg');
            filtersContainer.parentNode.insertBefore(counter, filtersContainer.nextSibling);
        }
        
        counter.innerHTML = `<p class="text-sm">
            <span class="font-semibold text-blue-600">${count}</span> 
            ${count === 1 ? 'resultado' : 'resultados'} para 
            "<span class="font-medium text-gray-800">${searchTerm}</span>"
        </p>`;
    }

    // Mostrar subfiltros de años al hacer click en Promociones
    window.addEventListener('DOMContentLoaded', function() {
        const promocionesBtn = document.querySelector("button[onclick=\"filterGallery('promociones')\"]");
        const promocionesYears = document.getElementById('promociones-years');
        if (promocionesBtn && promocionesYears) {
            promocionesBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                promocionesYears.classList.toggle('hidden');
            });
        }
    });

    // Inicializar todo
    initializeGallery();
    setupHoverEffects();
    
    // Configurar eventos adicionales
    setupKeyboardShortcuts();
    setupIntersectionObserver();
    
    console.log('Gallery filters initialized successfully');

    // Funciones adicionales de utilidad
    
    // Atajos de teclado para filtros
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        filterGallery('todos');
                        break;
                    case '2':
                        e.preventDefault();
                        filterGallery('espacios');
                        break;
                    case '3':
                        e.preventDefault();
                        filterGallery('actividades');
                        break;
                    case '4':
                        e.preventDefault();
                        filterGallery('eventos');
                        break;
                    case '5':
                        e.preventDefault();
                        filterGallery('proyectos');
                        break;
                    case 'f':
                        e.preventDefault();
                        document.getElementById('search-input').focus();
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                clearSearch();
            }
        });
    }

    // Observador de intersección para animaciones lazy
    function setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });

            // Observar todos los elementos de galería
            document.querySelectorAll('.gallery-item').forEach(item => {
                observer.observe(item);
            });
        }
    }

    // Función para guardar preferencias de filtro
    function saveFilterPreference(filter) {
        try {
            localStorage.setItem('galleryFilter', filter);
        } catch (e) {
            console.log('No se pudo guardar la preferencia de filtro');
        }
    }

    // Función para cargar preferencias de filtro
    function loadFilterPreference() {
        try {
            const savedFilter = localStorage.getItem('galleryFilter');
            if (savedFilter && savedFilter !== 'todos') {
                setTimeout(() => {
                    filterGallery(savedFilter);
                }, 500);
            }
        } catch (e) {
            console.log('No se pudo cargar la preferencia de filtro');
        }
    }

    // Cargar preferencias al inicio
    loadFilterPreference();
});