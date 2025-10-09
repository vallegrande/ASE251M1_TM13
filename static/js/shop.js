document.addEventListener('DOMContentLoaded', function() {
    // Variables globales con verificación de existencia
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const minPriceValue = document.getElementById('minPriceValue');
    const maxPriceValue = document.getElementById('maxPriceValue');
    const searchInput = document.getElementById('searchInput');
    const sortBySelect = document.getElementById('sortBy');
    const sizeFilterContainer = document.getElementById('sizeFilterContainer');
    
    // Verificar que los elementos esenciales existan
    if (!minPriceInput || !maxPriceInput || !minPriceValue || !maxPriceValue) {
        console.warn('Algunos elementos de precio no se encontraron en el DOM');
    }
    
    // Inicializar valores de precio
    if (minPriceValue) minPriceValue.textContent = 'S/. 0';
    if (maxPriceValue) maxPriceValue.textContent = 'S/. 100';
    
    console.log('Shop.js cargado correctamente');
    
    // Mostrar/ocultar filtro de tallas según categoría
    
    // Mostrar/ocultar filtro de tallas según categoría con mejor manejo
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', function() {
            console.log('Categoría seleccionada:', this.value);
            if (sizeFilterContainer) {
                if (this.value === 'uniformes') {
                    sizeFilterContainer.style.display = 'block';
                    console.log('Mostrando filtro de tallas');
                } else {
                    sizeFilterContainer.style.display = 'none';
                    // Reset size filter to "todas"
                    const sizeRadio = document.querySelector('input[name="size"][value="todas"]');
                    if (sizeRadio) {
                        sizeRadio.checked = true;
                        console.log('Reseteando talla a "todas"');
                    }
                }
            }
            // Aplicar filtros después de cambiar categoría
            setTimeout(() => applyFilters(), 100);
        });
    });

    // Agregar eventos a los radio buttons de tallas con mejor manejo
    document.querySelectorAll('input[name="size"]').forEach(radio => {
        radio.addEventListener('change', function() {
            console.log('Talla seleccionada:', this.value);
            setTimeout(() => applyFilters(), 100);
        });
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
            
            // Mostrar talla si existe
            const tallaInfo = document.getElementById('modalProductTalla');
            if (productData.talla && productData.talla !== '') {
                tallaInfo.textContent = `Talla: ${productData.talla}`;
                tallaInfo.style.display = 'block';
            } else {
                tallaInfo.style.display = 'none';
            }

            // Mostrar características
            const featuresList = document.getElementById('modalProductFeatures');
            featuresList.innerHTML = '';
            productData.features.forEach(feature => {
                const li = document.createElement('li');
                li.className = 'flex items-center';
                li.innerHTML = `
                    <span class="material-icons text-green-600 text-sm mr-2">check_circle</span>
                    ${feature}
                `;
                featuresList.appendChild(li);
            });

            // Resetear cantidad
            modalQuantityInput.value = 1;

            // Mostrar modal
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    };

    // Función para cerrar modal (alias para compatibilidad)
    window.closeModal = function() {
        closeProductModal();
    };

    // Cerrar modal al hacer clic en el overlay
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeProductModal();
        }
    });

    // Funciones para incrementar/decrementar cantidad en el modal
    window.incrementQuantity = function() {
        const currentValue = parseInt(modalQuantityInput.value) || 1;
        modalQuantityInput.value = currentValue + 1;
        console.log('Cantidad incrementada a:', modalQuantityInput.value);
    };

    window.decrementQuantity = function() {
        const currentValue = parseInt(modalQuantityInput.value) || 1;
        const newValue = Math.max(1, currentValue - 1);
        modalQuantityInput.value = newValue;
        console.log('Cantidad decrementada a:', modalQuantityInput.value);
    };

    // Función para cerrar modal
    window.closeProductModal = function() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        currentProductId = null;
        console.log('Modal cerrado');
    };

    // Función para verificar si el usuario está autenticado
    async function checkUserAuthentication() {
        try {
            const response = await fetch('/api/check_auth');
            const data = await response.json();
            return data.authenticated;
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            return false;
        }
    }

    // Función para agregar al carrito vía API (usuarios autenticados)
    async function addToCartAPI(productId, quantity = 1) {
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
            
            if (response.ok && data.success) {
                console.log('Producto agregado vía API:', data);
                return { success: true, message: data.message || 'Producto agregado al carrito' };
            } else {
                console.error('Error de API:', data);
                return { success: false, message: data.message || 'Error al agregar producto' };
            }
        } catch (error) {
            console.error('Error en API request:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }

    // Función principal para agregar al carrito (TEMPORAL: solo localStorage)
    window.addToCart = async function(productId) {
        console.log('=== addToCart LLAMADO ===');
        console.log('ID recibido:', productId);
        
        if (!productId) {
            console.error('ID de producto no proporcionado');
            showNotification('Error: ID de producto no válido', 'error');
            return;
        }

        // **SOLUCIÓN TEMPORAL: Siempre usar localStorage**
        // Esto evita problemas de sesión hasta resolver el login
        console.log('� Usando localStorage (modo temporal)');
        await addToCartLocalStorage(productId, true);
    };

    // Función para usuarios autenticados (API + localStorage de respaldo)
    async function addToCartAuthenticated(productId) {
        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: parseInt(productId),
                    quantity: 1
                })
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('✅ Producto agregado vía API');
                updateCartCounter();
                showNotification(data.message || 'Producto agregado al carrito', 'success');
                
                // También actualizar localStorage como respaldo
                await addToCartLocalStorage(productId, false); // false = no mostrar notificación
            } else {
                console.error('❌ Error de API:', data);
                showNotification(data.message || 'Error al agregar producto', 'error');
                
                // Fallback a localStorage si falla la API
                console.log('🔄 Fallback a localStorage');
                await addToCartLocalStorage(productId);
            }
        } catch (error) {
            console.error('❌ Error en API request:', error);
            showNotification('Error de conexión', 'error');
            
            // Fallback a localStorage si falla la conexión
            console.log('🔄 Fallback a localStorage por error de conexión');
            await addToCartLocalStorage(productId);
        }
    }

    // Función para usuarios no autenticados (solo localStorage)
    async function addToCartLocalStorage(productId, showNotif = true) {
        const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
        console.log('Selector usado:', `.product-card[data-id="${productId}"]`);
        console.log('Elemento encontrado:', productCard);
        
        if (productCard) {
            console.log('Dataset del producto:', productCard.dataset);
            
            const productData = {
                id: productId,
                name: productCard.dataset.name,
                price: parseFloat(productCard.dataset.price),
                image: productCard.dataset.image,
                talla: productCard.dataset.talla || '',
                quantity: 1
            };

            console.log('Datos del producto construidos:', productData);

            // Validar datos esenciales
            if (!productData.name || !productData.price) {
                console.error('Datos de producto incompletos:', productData);
                if (showNotif) showNotification('Error: Datos de producto incompletos', 'error');
                return;
            }

            // Actualizar localStorage
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            console.log('Carrito actual:', cart);
            
            // Buscar si el producto ya existe en el carrito
            const existingIndex = cart.findIndex(item => 
                item.id == productData.id && item.talla === productData.talla
            );

            if (existingIndex > -1) {
                cart[existingIndex].quantity += 1;
                console.log('Producto existente actualizado, nueva cantidad:', cart[existingIndex].quantity);
            } else {
                cart.push(productData);
                console.log('Nuevo producto agregado al carrito');
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            console.log('Carrito guardado en localStorage:', cart);
            
            updateCartCounter();
            if (showNotif) showNotification(`${productData.name} agregado al carrito`, 'success');
        } else {
            console.error('Producto no encontrado con ID:', productId);
            console.log('Productos disponibles:');
            document.querySelectorAll('.product-card').forEach((card, index) => {
                console.log(`${index}: ID=${card.dataset.id}, Name=${card.dataset.name}`);
            });
            if (showNotif) showNotification('Error: Producto no encontrado', 'error');
        }
    }

    // Función simplificada para agregar al carrito desde el modal
    window.addToCartFromModal = function() {
        console.log('addToCartFromModal llamado');
        
        if (!currentProductId) {
            console.error('No hay producto seleccionado en el modal');
            return;
        }

        const quantity = parseInt(modalQuantityInput.value) || 1;
        
        // SIEMPRE usar localStorage (sincronización posterior en checkout)
        const productCard = document.querySelector(`.product-card[data-id="${currentProductId}"]`);
        
        if (productCard) {
            const productData = {
                id: currentProductId,
                name: productCard.dataset.name,
                price: parseFloat(productCard.dataset.price),
                image: productCard.dataset.image,
                talla: productCard.dataset.talla || '',
                quantity: quantity
            };

            console.log('Datos del producto desde modal:', productData);

            // Agregar al carrito (localStorage)
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            // Buscar si el producto ya existe en el carrito
            const existingIndex = cart.findIndex(item => 
                item.id == productData.id && item.talla === productData.talla
            );

            if (existingIndex > -1) {
                cart[existingIndex].quantity += quantity;
                console.log('Producto existente desde modal, nueva cantidad:', cart[existingIndex].quantity);
            } else {
                cart.push(productData);
                console.log('Producto agregado al carrito desde modal');
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCounter();
            showNotification(`${productData.name} (x${quantity}) agregado al carrito`, 'success');
            closeProductModal();
        } else {
            console.error('Producto no encontrado en modal:', currentProductId);
            showNotification('Error: Producto no encontrado', 'error');
        }
    };

    // Función para comprar ahora
    window.buyNow = function() {
        addToCart();
        // Redirigir al carrito
        window.location.href = '/cart';
    };

    // Función principal de filtros mejorada
    window.applyFilters = function() {
        try {
            console.log('Aplicando filtros...');
            
            // Obtener valores con verificaciones
            const categoryRadio = document.querySelector('input[name="category"]:checked');
            const selectedCategory = categoryRadio ? categoryRadio.value : 'todos';
            
            const minPrice = minPriceInput ? parseInt(minPriceInput.value) || 0 : 0;
            const maxPrice = maxPriceInput ? parseInt(maxPriceInput.value) || 100 : 100;
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            const sortBy = sortBySelect ? sortBySelect.value : 'default';
            
            const selectedSizeRadio = document.querySelector('input[name="size"]:checked');
            const selectedSize = selectedSizeRadio ? selectedSizeRadio.value : 'todas';

            const productCards = document.querySelectorAll('.product-card');
            console.log(`Encontradas ${productCards.length} tarjetas de productos`);
            
            let visibleCount = 0;

            productCards.forEach(card => {
                try {
                    const price = parseFloat(card.dataset.price) || 0;
                    const name = (card.dataset.name || '').toLowerCase();
                    const category = card.dataset.category || '';
                    const talla = card.dataset.talla || '';

                    const matchesCategory = selectedCategory === 'todos' || category === selectedCategory;
                    const matchesPrice = price >= minPrice && price <= maxPrice;
                    const matchesSearch = !searchTerm || name.includes(searchTerm);
                    let matchesSize = true;
                    
                    if (selectedCategory === 'uniformes' && selectedSize !== 'todas') {
                        matchesSize = talla === selectedSize;
                    }

                    if (matchesCategory && matchesPrice && matchesSearch && matchesSize) {
                        card.style.display = 'block';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                } catch (cardError) {
                    console.error('Error procesando tarjeta:', cardError);
                }
            });
            
            console.log(`${visibleCount} productos visibles después del filtrado`);

            // Ordenar productos
            sortProducts(productCards, sortBy);

            // Actualizar etiquetas de filtros activos y estadísticas
            updateActiveFilters(selectedCategory, minPrice, maxPrice, searchTerm);
            
        } catch (error) {
            console.error('Error en applyFilters:', error);
        }
    };
    // Función para ordenar productos
    function sortProducts(productCards, sortBy) {
        try {
            const productsContainer = document.querySelector('.grid');
            if (!productsContainer) {
                console.warn('Contenedor de productos no encontrado');
                return;
            }
            
            const products = Array.from(productCards);

            products.sort((a, b) => {
                const priceA = parseFloat(a.dataset.price) || 0;
                const priceB = parseFloat(b.dataset.price) || 0;
                const nameA = (a.dataset.name || '').toLowerCase();
                const nameB = (b.dataset.name || '').toLowerCase();

                switch (sortBy) {
                    case 'price-asc':
                        return priceA - priceB;
                    case 'price-desc':
                        return priceB - priceA;
                    case 'name-asc':
                        return nameA.localeCompare(nameB);
                    case 'name-desc':
                        return nameB.localeCompare(nameA);
                    case 'newest':
                        return 0; // Para futuras implementaciones
                    case 'popular':
                        return 0; // Para futuras implementaciones
                    default:
                        return 0;
                }
            });

            // Reordenar elementos en el DOM
            products.forEach(product => {
                productsContainer.appendChild(product);
            });
        } catch (error) {
            console.error('Error en sortProducts:', error);
        }
    }

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
        
        if (activeFiltersContainer) activeFiltersContainer.innerHTML = '';
        let filterCount = 0;

        // Función para crear etiqueta mejorada
        function createFilterTag(text, type, icon = 'label') {
            const tag = document.createElement('div');
            tag.className = 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full flex items-center border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 cursor-pointer';
            tag.innerHTML = `
                <span class="material-icons text-xs mr-1.5">${icon}</span>
                <span class="font-medium">${text}</span>
                <button onclick="removeFilter('${type}')" class="ml-2 hover:bg-blue-300 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400" title="Quitar filtro">
                    <span class="material-icons text-xs">close</span>
                </button>
            `;
            return tag;
        }

        // Actualizar badge de categoría
        if (categoryBadge) {
            if (category !== 'todos') {
                const categoryNames = {
                    'uniformes': 'Uniformes',
                    'utiles': 'Útiles Escolares', 
                    'accesorios': 'Accesorios'
                };
                categoryBadge.textContent = categoryNames[category] || category;
                if (activeFiltersContainer) {
                    activeFiltersContainer.appendChild(createFilterTag(
                        categoryNames[category] || category,
                        'category',
                        'category'
                    ));
                }
                filterCount++;
            } else {
                categoryBadge.textContent = 'Todos los productos';
            }
        }

        // Etiqueta de talla
        const selectedSizeRadio = document.querySelector('input[name="size"]:checked');
        if (category === 'uniformes' && selectedSizeRadio && selectedSizeRadio.value !== 'todas') {
            if (activeFiltersContainer) {
                activeFiltersContainer.appendChild(createFilterTag(
                    `Talla ${selectedSizeRadio.value}`,
                    'size',
                    'straighten'
                ));
            }
            filterCount++;
        }

        // Etiqueta de precio (solo mostrar si hay cambios significativos)
        if ((minPrice > 0 && minPrice > 5) || (maxPrice < 100 && maxPrice < 95)) {
            if (activeFiltersContainer) {
                activeFiltersContainer.appendChild(createFilterTag(
                    `S/. ${minPrice} - S/. ${maxPrice}`,
                    'price',
                    'monetization_on'
                ));
            }
            filterCount++;
            
            // Mostrar rango de precio en el header
            if (minPriceDisplay) minPriceDisplay.textContent = minPrice;
            if (maxPriceDisplay) maxPriceDisplay.textContent = maxPrice;
            if (priceRange) priceRange.style.display = '';
        } else {
            if (priceRange) priceRange.style.display = 'none';
        }

        // Etiqueta de búsqueda
        if (searchTerm.trim() !== '') {
            if (activeFiltersContainer) {
                activeFiltersContainer.appendChild(createFilterTag(
                    `"${searchTerm}"`,
                    'search',
                    'search'
                ));
            }
            filterCount++;
        }

        // Mostrar/ocultar barra de filtros y contador con animaciones
        if (filterCount > 0) {
            if (activeFiltersBar) {
                activeFiltersBar.style.display = '';
                activeFiltersBar.classList.add('filter-indicator');
            }
            if (activeFiltersCount) {
                activeFiltersCount.style.display = '';
                activeFiltersCount.classList.add('filter-indicator');
            }
            if (filtersCountNumber) filtersCountNumber.textContent = filterCount;
            
            // Corregir gramática del texto de filtros
            const filtersText = document.getElementById('filtersText');
            if (filtersText) {
                filtersText.textContent = filterCount === 1 ? 'filtro activo' : 'filtros activos';
            }
        } else {
            if (activeFiltersBar) activeFiltersBar.style.display = 'none';
            if (activeFiltersCount) activeFiltersCount.style.display = 'none';
        }

        // Actualizar contador de productos
        updateProductCount();
    }

    // Función para actualizar contador de productos
    function updateProductCount() {
        try {
            const visibleProducts = document.querySelectorAll('.product-card:not([style*="display: none"])').length;
            const totalProducts = document.querySelectorAll('.product-card').length;
            const productCountElement = document.getElementById('productCount');
            
            console.log(`Productos visibles: ${visibleProducts}/${totalProducts}`);
            
            if (productCountElement) {
                if (totalProducts === 0) {
                    productCountElement.innerHTML = '<span class="text-gray-500">No hay productos disponibles</span>';
                } else if (visibleProducts === totalProducts) {
                    productCountElement.innerHTML = `<span class="text-green-600 font-semibold">${totalProducts}</span> productos disponibles`;
                } else if (visibleProducts === 0) {
                    productCountElement.innerHTML = '<span class="text-red-600 font-semibold">No hay productos que coincidan con los filtros</span>';
                } else {
                    productCountElement.innerHTML = `<span class="text-blue-600 font-semibold">${visibleProducts}</span> de <span class="text-gray-500">${totalProducts}</span> productos`;
                }
            }
        } catch (error) {
            console.error('Error en updateProductCount:', error);
        }
    }

    // Función para eliminar filtros
    window.removeFilter = function(type) {
        switch (type) {
            case 'category':
                const categoryTodos = document.querySelector('input[name="category"][value="todos"]');
                if (categoryTodos) categoryTodos.checked = true;
                break;
            case 'size':
                const sizeAllRadio = document.querySelector('input[name="size"][value="todas"]');
                if (sizeAllRadio) sizeAllRadio.checked = true;
                break;
            case 'price':
                if (minPriceInput) minPriceInput.value = 0;
                if (maxPriceInput) maxPriceInput.value = 100;
                if (minPriceValue) minPriceValue.textContent = 'S/. 0';
                if (maxPriceValue) maxPriceValue.textContent = 'S/. 100';
                break;
            case 'search':
                if (searchInput) searchInput.value = '';
                break;
        }
        applyFilters();
    };

    // Función para limpiar todos los filtros mejorada
    window.clearAllFilters = function() {
        console.log('Limpiando todos los filtros...');
        
        // Mostrar feedback visual inmediato
        const clearBtn = document.getElementById('clearAllFilters');
        if (clearBtn) {
            const originalText = clearBtn.innerHTML;
            clearBtn.innerHTML = '<span class="material-icons text-sm">refresh</span> Limpiando...';
            clearBtn.disabled = true;
            
            setTimeout(() => {
                clearBtn.innerHTML = originalText;
                clearBtn.disabled = false;
            }, 1000);
        }
        
        // Reset categorías
        const categoryTodos = document.querySelector('input[name="category"][value="todos"]');
        if (categoryTodos) categoryTodos.checked = true;
        
        // Reset tallas
        const sizeAllRadio = document.querySelector('input[name="size"][value="todas"]');
        if (sizeAllRadio) sizeAllRadio.checked = true;
        
        // Reset precio
        if (minPriceInput) minPriceInput.value = 0;
        if (maxPriceInput) maxPriceInput.value = 100;
        if (minPriceValue) minPriceValue.textContent = 'S/. 0';
        if (maxPriceValue) maxPriceValue.textContent = 'S/. 100';
        
        // Reset búsqueda
        if (searchInput) searchInput.value = '';
        
        // Reset ordenamiento
        if (sortBySelect) sortBySelect.value = 'default';
        
        // Ocultar filtro de tallas
        if (sizeFilterContainer) sizeFilterContainer.style.display = 'none';
        
        // Aplicar filtros con un pequeño delay para efecto visual
        setTimeout(() => {
            applyFilters();
            showNotification('✨ Todos los filtros han sido limpiados', 'success');
        }, 300);
    };

    // Eventos de los sliders de precio
    if (minPriceInput) {
        minPriceInput.addEventListener('input', function() {
            minPriceValue.textContent = `S/. ${this.value}`;
            applyFilters();
        });
    }

    if (maxPriceInput) {
        maxPriceInput.addEventListener('input', function() {
            maxPriceValue.textContent = `S/. ${this.value}`;
            applyFilters();
        });
    }

    // Evento de búsqueda en tiempo real
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyFilters();
            }, 300);
        });
    }

    // Agregar eventos a radio buttons de categorías
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });

    // Evento del selector de ordenamiento
    if (sortBySelect) {
        sortBySelect.addEventListener('change', function() {
            console.log('Ordenamiento cambiado:', this.value);
            applyFilters();
        });
    }

    // Eventos para botones de limpiar filtros
    const clearFiltersBtn = document.getElementById('clearFilters');
    const clearAllFiltersBtn = document.getElementById('clearAllFilters');
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            console.log('Limpiando filtros...');
            clearAllFilters();
        });
    }
    
    if (clearAllFiltersBtn) {
        clearAllFiltersBtn.addEventListener('click', function() {
            console.log('Limpiando todos los filtros...');
            clearAllFilters();
        });
    }

    // Función para actualizar contador del carrito (TEMPORAL: solo localStorage)
    async function updateCartCounter() {
        try {
            // **SOLUCIÓN TEMPORAL: Siempre usar localStorage**
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            console.log('📊 Contador del carrito desde localStorage:', totalItems);
            
            // Actualizar todos los contadores en la página
            document.querySelectorAll('.cart-counter').forEach(counter => {
                if (counter.textContent !== undefined) {
                    counter.textContent = totalItems;
                    console.log('🔄 Contador actualizado:', totalItems);
                }
            });
            
        } catch (error) {
            console.warn('⚠️ Error en updateCartCounter:', error);
            // Fallback seguro
            document.querySelectorAll('.cart-counter').forEach(counter => {
                if (counter.textContent !== undefined) {
                    counter.textContent = '0';
                }
            });
        }
    }

    // Función para mostrar notificaciones mejorada
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const icons = {
            'success': '✅',
            'error': '❌', 
            'info': 'ℹ️',
            'warning': '⚠️'
        };
        const bgColors = {
            'success': 'from-green-500 to-green-600',
            'error': 'from-red-500 to-red-600',
            'info': 'from-blue-500 to-blue-600',
            'warning': 'from-yellow-500 to-yellow-600'
        };
        
        notification.className = `fixed bottom-4 right-4 bg-gradient-to-r ${bgColors[type] || bgColors.success} text-white px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-500 ease-out z-50 max-w-sm`;
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="text-xl mr-3">${icons[type] || icons.success}</span>
                <span class="font-medium">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animar entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateY(-20px) scale(1.05)';
            notification.style.opacity = '1';
        });

        // Remover después de 4 segundos
        setTimeout(() => {
            notification.style.transform = 'translateY(0) translateX(120%) scale(0.95)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }, 4000);
    }

    // Función de prueba para verificar funcionamiento
    window.testShop = async function() {
        console.log('=== PRUEBA DE TIENDA ===');
        
        // Verificar autenticación
        const isAuthenticated = await checkUserAuthentication();
        console.log('Estado de autenticación:', isAuthenticated);
        
        // Verificar elementos DOM
        console.log('Productos encontrados:', document.querySelectorAll('.product-card').length);
        console.log('Radio buttons categoría:', document.querySelectorAll('input[name="category"]').length);
        console.log('Radio buttons talla:', document.querySelectorAll('input[name="size"]').length);
        
        // Listar todos los productos con sus IDs
        console.log('Lista de productos:');
        document.querySelectorAll('.product-card').forEach((card, index) => {
            console.log(`${index + 1}. ID: ${card.dataset.id}, Nombre: ${card.dataset.name}, Precio: ${card.dataset.price}`);
        });
        
        // Verificar localStorage solo si no está autenticado
        if (!isAuthenticated) {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            console.log('Carrito actual en localStorage:', cart);
        } else {
            console.log('Usuario autenticado - carrito en base de datos');
        }
        
        // Probar agregar producto con ID 1
        console.log('Probando agregar producto ID 1...');
        await addToCart(1);
        
        setTimeout(async () => {
            if (!isAuthenticated) {
                const newCart = JSON.parse(localStorage.getItem('cart') || '[]');
                console.log('Carrito después de test (localStorage):', newCart);
            } else {
                console.log('Carrito actualizado en base de datos');
            }
        }, 1000);
    };

    // Función de debugging para verificar estado
    window.debugCart = async function() {
        console.log('=== DEBUG CARRITO ===');
        
        // Verificar autenticación
        try {
            const authResponse = await fetch('/api/check_auth');
            const authData = await authResponse.json();
            console.log('Estado de autenticación:', authData);
            
            if (authData.authenticated) {
                console.log('Usuario autenticado, carrito en base de datos');
            } else {
                console.log('Usuario NO autenticado, carrito en localStorage');
                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                console.log('Carrito actual en localStorage:', cart);
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
        }
        
        // Verificar DOM
        console.log('Elementos encontrados:');
        console.log('- Productos:', document.querySelectorAll('.product-card').length);
        console.log('- Contadores del carrito:', document.querySelectorAll('.cart-counter').length);
        
        // Probar un producto específico
        const firstProduct = document.querySelector('.product-card');
        if (firstProduct) {
            console.log('Primer producto:', {
                id: firstProduct.dataset.id,
                name: firstProduct.dataset.name,
                price: firstProduct.dataset.price
            });
        }
    };

    // Función para limpiar carrito (útil para testing)
    window.clearCart = function() {
        localStorage.removeItem('cart');
        updateCartCounter();
        console.log('Carrito limpiado');
        showNotification('Carrito limpiado', 'info');
    };

    // Test actualizado para la nueva funcionalidad
    window.testAddProduct = function(productId = 1) {
        console.log(`=== TEST: Agregando producto ${productId} ===`);
        try {
            addToCart(productId);
            console.log('Test completado - usando localStorage');
            
            // Verificar localStorage
            setTimeout(() => {
                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                console.log('Carrito después del test:', cart);
                
                if (cart.length > 0) {
                    console.log('✅ Producto agregado correctamente');
                } else {
                    console.log('❌ No se encontraron productos en el carrito');
                }
            }, 1000);
        } catch (error) {
            console.error('Error en test:', error);
        }
    };

    // Inicializar contador del carrito
    updateCartCounter();
    
    // Inicializar filtros después de que todo esté cargado
    setTimeout(() => {
        console.log('Inicializando filtros...');
        applyFilters();
    }, 500);
    
    console.log('Shop.js completamente inicializado');
    
    // Mensaje de versión para verificar si se carga correctamente
    console.log('🛒 SHOP.JS VERSION: 2024-10-02 SIMPLIFICADO');
    console.log('ℹ️ Usando SIEMPRE localStorage para el carrito');
});