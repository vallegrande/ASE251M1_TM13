document.addEventListener('DOMContentLoaded', function() {
    // Mostrar/ocultar filtro de tallas según categoría
    const sizeFilterContainer = document.getElementById('sizeFilterContainer');
    
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'uniformes') {
                sizeFilterContainer.style.display = '';
            } else {
                sizeFilterContainer.style.display = 'none';
                // Reset size filter to "todas"
                const sizeRadio = document.querySelector('input[name="size"][value="todas"]');
                if (sizeRadio) sizeRadio.checked = true;
            }
            applyFilters();
        });
    });

    // Agregar eventos a los radio buttons de tallas
    document.querySelectorAll('input[name="size"]').forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });

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
                category: productCard.dataset.category,
                talla: productCard.dataset.talla,
                features: JSON.parse(productCard.dataset.features)
            };

            // Actualizar contenido del modal
            document.getElementById('modalProductName').textContent = productData.name;
            document.getElementById('modalProductDescription').textContent = productData.description;
            document.getElementById('modalProductPrice').textContent = `S/. ${parseFloat(productData.price).toFixed(2)}`;
            document.getElementById('modalProductImage').src = `/static/img/products/${productData.image}`;
            document.getElementById('modalProductStock').textContent = `Stock: ${productData.stock}`;
            
            // Mostrar/ocultar selector de talla
            const sizeSelector = document.getElementById('modalSizeSelector');
            const modalSize = document.getElementById('modalProductSize');
            if (productData.category === 'uniformes') {
                sizeSelector.style.display = 'block';
                modalSize.value = ''; // Reset selection
            } else {
                sizeSelector.style.display = 'none';
            }
            
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
    window.addToCartFromModal = async function() {
        if (currentProductId) {
            const productCard = document.querySelector(`.product-card[data-id="${currentProductId}"]`);
            const category = productCard.dataset.category;
            const modalSize = document.getElementById('modalProductSize');
            
            // Verificar si se necesita seleccionar talla
            if (category === 'uniformes' && (!modalSize.value || modalSize.value === '')) {
                showNotification('Por favor selecciona una talla', 'error');
                return;
            }
            
            const quantity = parseInt(modalQuantityInput.value);
            const selectedSize = modalSize.value;
            
            // Si es un uniforme con talla seleccionada, buscar el producto específico con esa talla
            let productIdToAdd = currentProductId;
            if (category === 'uniformes' && selectedSize) {
                // Aquí podrías implementar lógica para encontrar el producto específico con la talla
                // Por ahora usaremos el ID actual
                await addToCartWithQuantity(productIdToAdd, quantity);
            } else {
                await addToCartWithQuantity(productIdToAdd, quantity);
            }
            
            closeProductModal();
        }
    };

    // Modificar la función addToCart para soportar cantidades
    window.addToCartWithQuantity = async function(productId, quantity = 1) {
        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity
                })
            });

            const data = await response.json();

            if (data.success) {
                showNotification(data.message, 'success');
                updateCartCount(data.cart_total);
            } else {
                showNotification(data.message, 'error');
                if (response.status === 401) {
                    // Redirigir a login si no está autenticado
                    window.location.href = '/login';
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al agregar al carrito', 'error');
        }
    };

    // Función para añadir al carrito (simple)
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
        const selectedSizeRadio = document.querySelector('input[name="size"]:checked');
        const selectedSize = selectedSizeRadio ? selectedSizeRadio.value : 'todas';

        const productCards = document.querySelectorAll('.product-card');

        productCards.forEach(card => {
            const price = parseFloat(card.dataset.price);
            const name = card.dataset.name.toLowerCase();
            const category = card.dataset.category;
            const talla = card.dataset.talla || '';

            const matchesCategory = selectedCategory === 'todos' || category === selectedCategory;
            const matchesPrice = price >= minPrice && price <= maxPrice;
            const matchesSearch = name.includes(searchTerm);
            let matchesSize = true;
            if (selectedCategory === 'uniformes' && selectedSize !== 'todas') {
                matchesSize = talla === selectedSize;
            }

            if (matchesCategory && matchesPrice && matchesSearch && matchesSize) {
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

    // Función para actualizar etiquetas de filtros activos y estadísticas
    function updateActiveFilters(category, minPrice, maxPrice, searchTerm) {
        const activeFiltersContainer = document.getElementById('activeFilters');
        const activeFiltersBar = document.getElementById('activeFiltersBar');
        const activeFiltersCount = document.getElementById('activeFiltersCount');
        const filtersCountNumber = document.getElementById('filtersCountNumber');
        const categoryBadge = document.getElementById('categoryBadge');
        const priceRange = document.getElementById('priceRange');
        const minPriceDisplay = document.getElementById('minPriceDisplay');
        const maxPriceDisplay = document.getElementById('maxPriceDisplay');
        
        activeFiltersContainer.innerHTML = '';
        let filterCount = 0;

        // Función para crear etiqueta
        function createFilterTag(text, type, icon = 'label') {
            const tag = document.createElement('div');
            tag.className = 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full flex items-center border border-blue-200 hover:bg-blue-200 transition-colors';
            tag.innerHTML = `
                <span class="material-icons text-xs mr-1">${icon}</span>
                <span>${text}</span>
                <button onclick="removeFilter('${type}')" class="ml-2 hover:bg-blue-300 rounded-full p-0.5 transition-colors">
                    <span class="material-icons text-xs">close</span>
                </button>
            `;
            return tag;
        }

        // Actualizar badge de categoría
        if (category !== 'todos') {
            const categoryNames = {
                'uniformes': 'Uniformes',
                'utiles': 'Útiles Escolares', 
                'accesorios': 'Accesorios'
            };
            categoryBadge.textContent = categoryNames[category] || category;
            activeFiltersContainer.appendChild(createFilterTag(
                categoryNames[category] || category,
                'category',
                'category'
            ));
            filterCount++;
        } else {
            categoryBadge.textContent = 'Todos los productos';
        }

        // Etiqueta de talla
        const selectedSizeRadio = document.querySelector('input[name="size"]:checked');
        if (category === 'uniformes' && selectedSizeRadio && selectedSizeRadio.value !== 'todas') {
            activeFiltersContainer.appendChild(createFilterTag(
                `Talla ${selectedSizeRadio.value}`,
                'size',
                'straighten'
            ));
            filterCount++;
        }

        // Etiqueta de precio
        if (minPrice > 0 || maxPrice < 100) {
            activeFiltersContainer.appendChild(createFilterTag(
                `S/. ${minPrice} - S/. ${maxPrice}`,
                'price',
                'monetization_on'
            ));
            filterCount++;
            
            // Mostrar rango de precio en el header
            minPriceDisplay.textContent = minPrice;
            maxPriceDisplay.textContent = maxPrice;
            priceRange.style.display = '';
        } else {
            priceRange.style.display = 'none';
        }

        // Etiqueta de búsqueda
        if (searchTerm.trim() !== '') {
            activeFiltersContainer.appendChild(createFilterTag(
                `"${searchTerm}"`,
                'search',
                'search'
            ));
            filterCount++;
        }

        // Mostrar/ocultar barra de filtros y contador
        if (filterCount > 0) {
            activeFiltersBar.style.display = '';
            activeFiltersCount.style.display = '';
            filtersCountNumber.textContent = filterCount;
        } else {
            activeFiltersBar.style.display = 'none';
            activeFiltersCount.style.display = 'none';
        }

        // Actualizar contador de productos
        updateProductCount();
    }

    // Función para actualizar contador de productos
    function updateProductCount() {
        const visibleProducts = document.querySelectorAll('.product-card:not([style*="display: none"])').length;
        const totalProducts = document.querySelectorAll('.product-card').length;
        const productCountElement = document.getElementById('productCount');
        
        if (visibleProducts === totalProducts) {
            productCountElement.innerHTML = `<span class="text-green-600 font-semibold">${totalProducts}</span> productos disponibles`;
        } else {
            productCountElement.innerHTML = `<span class="text-blue-600 font-semibold">${visibleProducts}</span> de <span class="text-gray-500">${totalProducts}</span> productos`;
        }
    }

    // Función para eliminar filtros
    window.removeFilter = function(type) {
        if (type === 'size') {
            sizeFilter.value = 'todas';
        }
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

    // Función para actualizar el contador del carrito
    function updateCartCount(total = null) {
        let count = total;
        if (count === null) {
            count = cart.reduce((total, item) => total + item.quantity, 0);
        }
        const cartCounters = document.querySelectorAll('.cart-count, [class*="cart"] span');
        cartCounters.forEach(counter => {
            if (counter.textContent !== undefined) {
                counter.textContent = count;
            }
        });
    }

    // Función para limpiar todos los filtros
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            // Reset category filter
            const categoryRadio = document.querySelector('input[name="category"][value="todos"]');
            if (categoryRadio) categoryRadio.checked = true;
            
            // Reset size filter
            const sizeRadio = document.querySelector('input[name="size"][value="todas"]');
            if (sizeRadio) sizeRadio.checked = true;
            
            // Hide size filter container
            sizeFilterContainer.style.display = 'none';
            
            // Reset price range
            minPriceInput.value = 0;
            maxPriceInput.value = 100;
            document.getElementById('minPriceValue').textContent = 'S/. 0';
            document.getElementById('maxPriceValue').textContent = 'S/. 100';
            
            // Clear search
            searchInput.value = '';
            
            // Reset sort
            sortBySelect.value = 'default';
            
            // Apply filters
            applyFilters();
            
            showNotification('Filtros limpiados exitosamente', 'success');
        });
    }

    // Función para mostrar notificaciones
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        notification.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out z-50`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animar entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateY(-20px)';
        });

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateY(0) translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
});