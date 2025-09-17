document.addEventListener('DOMContentLoaded', function() {
    // Variables para el modal de detalles
    let currentProductId = null;
    const modal = document.getElementById('productModal');
    const modalQuantityInput = document.getElementById('modalQuantity');

    // Función para mostrar detalles del producto
    window.showProductDetails = function(productId) {
        currentProductId = productId;
        const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
        
        if (productCard) {
            // Obtener datos del producto
            const productData = {
                name: productCard.dataset.name,
                price: productCard.dataset.price,
                description: productCard.dataset.description,
                image: productCard.dataset.image,
                stock: productCard.dataset.stock,
                features: JSON.parse(productCard.dataset.features)
            };

            // Actualizar contenido del modal
            document.getElementById('modalProductName').textContent = productData.name;
            document.getElementById('modalProductDescription').textContent = productData.description;
            document.getElementById('modalProductPrice').textContent = `S/. ${parseFloat(productData.price).toFixed(2)}`;
            document.getElementById('modalProductImage').src = `/static/img/products/${productData.image}`;
            document.getElementById('modalProductStock').textContent = productData.stock;
            
            // Actualizar características si existen
            const featuresList = document.getElementById('modalProductFeatures');
            featuresList.innerHTML = '';
            if (productData.features && productData.features.length > 0) {
                productData.features.forEach(feature => {
                    const li = document.createElement('li');
                    li.textContent = feature;
                    featuresList.appendChild(li);
                });
            }

            // Resetear cantidad
            modalQuantityInput.value = 1;

            // Mostrar modal con animación
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.querySelector('.transform').classList.add('scale-100');
                modal.querySelector('.transform').classList.remove('scale-95');
            }, 10);
        }
    };

    // Función para cerrar el modal
    window.closeProductModal = function() {
        modal.querySelector('.transform').classList.add('scale-95');
        modal.querySelector('.transform').classList.remove('scale-100');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    };

    // Funciones para manejar la cantidad en el modal
    window.incrementQuantity = function() {
        modalQuantityInput.value = parseInt(modalQuantityInput.value) + 1;
    };

    window.decrementQuantity = function() {
        const newValue = parseInt(modalQuantityInput.value) - 1;
        if (newValue >= 1) {
            modalQuantityInput.value = newValue;
        }
    };

    // Función para agregar al carrito desde el modal
    window.addToCartFromModal = function() {
        if (currentProductId) {
            const quantity = parseInt(modalQuantityInput.value);
            addToCartWithQuantity(currentProductId, quantity);
            closeProductModal();
        }
    };

    // Modificar la función addToCart para soportar cantidades
    window.addToCartWithQuantity = function(productId, quantity = 1) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: productId,
                quantity: quantity
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification(`${quantity} producto(s) agregado(s) al carrito`);
    };

    // Redefinir la función addToCart para usar la nueva función con cantidad
    window.addToCart = function(productId) {
        addToCartWithQuantity(productId, 1);
    };

    // Inicializar el carrito
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();

    // Inicializar los sliders de precio
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const minPriceValue = document.getElementById('minPriceValue');
    const maxPriceValue = document.getElementById('maxPriceValue');
    const searchInput = document.getElementById('searchInput');
    const sortBySelect = document.getElementById('sortBy');

    // Actualizar valores de precio
    minPriceInput.addEventListener('input', function() {
        minPriceValue.textContent = `S/. ${this.value}`;
        applyFilters();
    });

    maxPriceInput.addEventListener('input', function() {
        maxPriceValue.textContent = `S/. ${this.value}`;
        applyFilters();
    });

    // Función para aplicar todos los filtros
    window.applyFilters = function() {
        const selectedCategory = document.querySelector('input[name="category"]:checked').value;
        const minPrice = parseInt(minPriceInput.value);
        const maxPrice = parseInt(maxPriceInput.value);
        const searchTerm = searchInput.value.toLowerCase();
        const sortBy = sortBySelect.value;

        const productCards = document.querySelectorAll('.product-card');

        productCards.forEach(card => {
            const price = parseFloat(card.dataset.price);
            const name = card.dataset.name.toLowerCase();
            const category = card.dataset.category;

            const matchesCategory = selectedCategory === 'todos' || category === selectedCategory;
            const matchesPrice = price >= minPrice && price <= maxPrice;
            const matchesSearch = name.includes(searchTerm);

            if (matchesCategory && matchesPrice && matchesSearch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        // Ordenar productos
        const productsContainer = document.querySelector('.grid');
        const products = Array.from(productCards);

        products.sort((a, b) => {
            const priceA = parseFloat(a.dataset.price);
            const priceB = parseFloat(b.dataset.price);
            const nameA = a.dataset.name.toLowerCase();
            const nameB = b.dataset.name.toLowerCase();

            switch (sortBy) {
                case 'price-asc':
                    return priceA - priceB;
                case 'price-desc':
                    return priceB - priceA;
                case 'name-asc':
                    return nameA.localeCompare(nameB);
                case 'name-desc':
                    return nameB.localeCompare(nameA);
                default:
                    return 0;
            }
        });

        // Reordenar elementos en el DOM
        products.forEach(product => {
            productsContainer.appendChild(product);
        });

        // Actualizar etiquetas de filtros activos
        updateActiveFilters(selectedCategory, minPrice, maxPrice, searchTerm);
    };

    // Función para actualizar etiquetas de filtros activos
    function updateActiveFilters(category, minPrice, maxPrice, searchTerm) {
        const activeFiltersContainer = document.getElementById('activeFilters');
        activeFiltersContainer.innerHTML = '';

        // Función para crear etiqueta
        function createFilterTag(text, type) {
            const tag = document.createElement('div');
            tag.className = 'bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center';
            tag.innerHTML = `
                <span>${text}</span>
                <button onclick="removeFilter('${type}')" class="ml-2 focus:outline-none">
                    <span class="material-icons text-sm">close</span>
                </button>
            `;
            return tag;
        }

        // Agregar etiquetas según los filtros activos
        if (category !== 'todos') {
            activeFiltersContainer.appendChild(createFilterTag(
                `Categoría: ${category.charAt(0).toUpperCase() + category.slice(1)}`,
                'category'
            ));
        }

        if (minPrice > 0 || maxPrice < 100) {
            activeFiltersContainer.appendChild(createFilterTag(
                `Precio: S/. ${minPrice} - S/. ${maxPrice}`,
                'price'
            ));
        }

        if (searchTerm) {
            activeFiltersContainer.appendChild(createFilterTag(
                `Búsqueda: ${searchTerm}`,
                'search'
            ));
        }
    }

    // Función para eliminar filtros
    window.removeFilter = function(type) {
        switch (type) {
            case 'category':
                document.querySelector('input[value="todos"]').checked = true;
                break;
            case 'price':
                minPriceInput.value = 0;
                maxPriceInput.value = 100;
                minPriceValue.textContent = 'S/. 0';
                maxPriceValue.textContent = 'S/. 100';
                break;
            case 'search':
                searchInput.value = '';
                break;
        }
        applyFilters();
    };

    // Evento de búsqueda en tiempo real
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFilters();
        }, 300);
    });

    // Eventos para aplicar filtros automáticamente
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });

    sortBySelect.addEventListener('change', applyFilters);

    // Función para añadir al carrito
    window.addToCart = function(productId) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                quantity: 1
            });
        }

        // Guardar en localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Actualizar contador del carrito
        updateCartCount();

        // Mostrar notificación
        showNotification('Producto agregado al carrito');
    };

    // Función para actualizar el contador del carrito
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCounters = document.querySelectorAll('.material-icons + span');
        cartCounters.forEach(counter => {
            counter.textContent = count;
        });
    }

    // Función para mostrar notificaciones
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out';
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateY(-20px)';
        }, 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Función para agregar al carrito y redirigir
    window.addToCart = function(productId) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                quantity: 1
            });
        }

        // Guardar en localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Actualizar contador del carrito
        updateCartCount();

        // Mostrar notificación
        showNotification('Producto agregado al carrito');
    };
});