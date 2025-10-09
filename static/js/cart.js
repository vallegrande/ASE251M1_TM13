document.addEventListener('DOMContentLoaded', function() {
    // Estado global
    let lastDeletedItem = null;
    let appliedCoupon = null;
    
    // Determinar si el usuario está autenticado basado en datos del servidor
    const isAuthenticated = window.cartData && window.cartData.is_authenticated !== undefined 
        ? window.cartData.is_authenticated 
        : false;
    
    console.log('Usuario autenticado en carrito:', isAuthenticated);
    
    // Usar datos del servidor si está autenticado, sino usar localStorage
    let cart = [];
    
    console.log('🔍 DEBUG: isAuthenticated =', isAuthenticated);
    console.log('🔍 DEBUG: window.cartData =', window.cartData);
    
    if (isAuthenticated && window.cartData && window.cartData.items && window.cartData.items.length > 0) {
        // Convertir datos del servidor al formato esperado
        cart = window.cartData.items.map(item => ({
            id: item.product_id,
            productId: item.product_id,
            quantity: item.quantity,
            name: item.name,
            price: parseFloat(item.price),
            image: item.image_url || 'default.jpg'
        }));
        console.log('📊 Carrito cargado desde servidor:', cart);
    } else {
        // Fallback a localStorage para usuarios no autenticados
        const localStorageCart = localStorage.getItem('cart');
        console.log('🔍 DEBUG: localStorage raw data:', localStorageCart);
        
        if (localStorageCart) {
            try {
                cart = JSON.parse(localStorageCart);
                console.log('📊 Carrito parseado desde localStorage:', cart);
                console.log('📊 Número de items en carrito:', cart.length);
                
                // Debug cada item
                cart.forEach((item, index) => {
                    console.log(`� Item ${index}:`, {
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        talla: item.talla
                    });
                });
            } catch (e) {
                console.error('❌ Error parseando carrito desde localStorage:', e);
                cart = [];
            }
        } else {
            console.log('📊 No hay datos en localStorage, carrito vacío');
            cart = [];
        }
    }
    
    let itemBeingDeleted = null;
    
    // Elementos del DOM
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartTemplate = document.getElementById('emptyCart');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    const shippingElement = document.getElementById('shipping');
    const checkoutButton = document.getElementById('checkoutButton');
    const deleteModal = document.getElementById('deleteConfirmModal');
    const deleteNotification = document.getElementById('deleteNotification');

    // Productos de ejemplo (en una implementación real, estos vendrían de la API)
    const productsData = {
        1: { name: 'Uniforme Diario', price: 89.90, image: 'uniform1.jpg' },
        2: { name: 'Uniforme Deportivo', price: 79.90, image: 'uniform2.jpg' },
        3: { name: 'Polo Institucional', price: 29.90, image: 'polo.jpg' },
        4: { name: 'Short Deportivo', price: 35.90, image: 'short.jpg' },
        5: { name: 'Medias Escolares', price: 12.90, image: 'socks.jpg' },
        6: { name: 'Casaca Institucional', price: 89.90, image: 'jacket.jpg' },
        7: { name: 'Kit de Arte', price: 45.90, image: 'artkit.jpg' },
        8: { name: 'Cuaderno A4', price: 8.90, image: 'notebook.jpg' },
        9: { name: 'Set de Lápices', price: 15.90, image: 'pencils.jpg' },
        10: { name: 'Plastilina', price: 12.90, image: 'clay.jpg' },
        11: { name: 'Tijeras Escolares', price: 5.90, image: 'scissors.jpg' },
        12: { name: 'Folder Institucional', price: 7.90, image: 'folder.jpg' },
        13: { name: 'Témperas', price: 18.90, image: 'paint.jpg' },
        14: { name: 'Mochila Escolar', price: 79.90, image: 'backpack.jpg' },
        15: { name: 'Lonchera Térmica', price: 45.90, image: 'lunchbox.jpg' },
        16: { name: 'Gorro Institucional', price: 25.90, image: 'hat.jpg' },
        17: { name: 'Botella de Agua', price: 19.90, image: 'bottle.jpg' },
        18: { name: 'Set de Toallas', price: 29.90, image: 'towels.jpg' },
        19: { name: 'Mandil de Arte', price: 35.90, image: 'apron.jpg' },
        20: { name: 'Porta Útiles', price: 22.90, image: 'case.jpg' }
    };

    // Función para obtener información del producto
    function getProductInfo(productId, cartItem = null) {
        console.log('🔍 getProductInfo called with:', { productId, cartItem });
        
        // Si el item del carrito tiene la información completa, usarla
        if (cartItem && cartItem.name && cartItem.price !== undefined) {
            console.log('✅ Usando datos del carrito:', cartItem);
            return {
                name: cartItem.name,
                price: cartItem.price,
                image: cartItem.image || 'default.jpg'
            };
        }
        
        // Fallback al diccionario de productos
        const productInfo = productsData[productId];
        if (productInfo) {
            console.log('✅ Usando datos del diccionario:', productInfo);
            return productInfo;
        }
        
        console.warn('⚠️ Producto no encontrado, usando datos por defecto para ID:', productId);
        return { 
            name: `Producto ${productId}`, 
            price: 0, 
            image: 'default.jpg' 
        };
    }

    // Función para animar un cambio de cantidad
    function animateQuantityChange(element, isIncrease) {
        element.style.transform = `scale(1.2) translateY(${isIncrease ? '-2px' : '2px'})`;
        element.style.color = isIncrease ? 'green' : 'red';
        
        setTimeout(() => {
            element.style.transform = 'scale(1) translateY(0)';
            element.style.color = '';
        }, 200);
    }

    // Función para guardar el carrito
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    // Función para actualizar la vista del carrito
    function updateCartView() {
        console.log('🔄 updateCartView called with cart:', cart);
        console.log('🔄 Cart length:', cart.length);
        
        const cartContainer = document.getElementById('cartContainer');
        const emptyCartTemplate = document.getElementById('emptyCart');
        
        console.log('🔍 cartContainer found:', !!cartContainer);
        console.log('🔍 emptyCartTemplate found:', !!emptyCartTemplate);
        
        if (cart.length === 0) {
            console.log('📦 Carrito vacío, mostrando template vacío');
            if (cartContainer) cartContainer.classList.add('hidden');
            if (emptyCartTemplate) emptyCartTemplate.classList.remove('hidden');
            updateCheckoutButton(0);
            return;
        }

        console.log('📦 Carrito con productos, mostrando contenido');
        if (cartContainer) cartContainer.classList.remove('hidden');
        if (emptyCartTemplate) emptyCartTemplate.classList.add('hidden');
        
        // Limpiar contenedor y agregar header
        cartItemsContainer.innerHTML = `
            <div class="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-600">
                <div class="md:col-span-6">Producto</div>
                <div class="md:col-span-2 text-center">Precio</div>
                <div class="md:col-span-2 text-center">Cantidad</div>
                <div class="md:col-span-2 text-center">Total</div>
            </div>
        `;
        
        let subtotal = 0;

        cart.forEach((item, index) => {
            console.log(`🛒 Procesando item ${index}:`, item);
            const product = getProductInfo(item.id, item);
            console.log('📦 Información del producto:', product);
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            console.log('💰 Total del item:', itemTotal);

            const itemElement = document.createElement('div');
            itemElement.className = 'border-t border-gray-100 transition-all duration-300 hover:bg-gray-50';
            itemElement.setAttribute('data-item', item.id);
            itemElement.innerHTML = `
                <div class="grid md:grid-cols-12 gap-4 p-4 items-center">
                    <!-- Producto -->
                    <div class="md:col-span-6 flex items-center space-x-4">
                        <div class="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img src="/static/img/products/${product.image}" 
                                 alt="${product.name}" 
                                 class="w-full h-full object-cover"
                                 onerror="this.src='/static/img/default-product.png'">
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-800">${product.name}</h3>
                            <p class="text-sm text-gray-500">Código: #${item.id}</p>
                        </div>
                    </div>

                    <!-- Precio -->
                    <div class="md:col-span-2 text-center">
                        <span class="text-gray-600">S/. ${product.price.toFixed(2)}</span>
                    </div>

                    <!-- Cantidad -->
                    <div class="md:col-span-2">
                        <div class="flex items-center justify-center space-x-2">
                            <button onclick="updateQuantity('${item.id}', -1)" 
                                    class="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors">
                                <span class="material-icons text-sm">remove</span>
                            </button>
                            <input type="number" value="${item.quantity}" 
                                   min="1" max="99" 
                                   data-quantity="${item.id}"
                                   class="w-12 text-center border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                   onchange="updateQuantityDirect('${item.id}', this.value)">
                            <button onclick="updateQuantity('${item.id}', 1)" 
                                    class="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors">
                                <span class="material-icons text-sm">add</span>
                            </button>
                        </div>
                    </div>

                    <!-- Total -->
                    <div class="md:col-span-2 text-center font-medium text-gray-800">
                        <span data-total="${item.id}">S/. ${itemTotal.toFixed(2)}</span>
                    </div>

                    <!-- Botón eliminar -->
                    <div class="flex items-center justify-end">
                        <button onclick="showDeleteConfirmation('${item.id}')" 
                                class="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                title="Eliminar producto">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        updateTotals(subtotal);
        updateRecommendations();
    }

    // Función para actualizar los totales
    function updateTotals(subtotal) {
        // Si tenemos datos del servidor, usarlos
        if (window.cartData) {
            const serverData = window.cartData;
            subtotalElement.textContent = `S/. ${serverData.subtotal.toFixed(2)}`;
            taxElement.textContent = `S/. ${serverData.tax.toFixed(2)}`;
            totalElement.textContent = `S/. ${serverData.total.toFixed(2)}`;
            
            if (serverData.shipping > 0) {
                shippingElement.textContent = `S/. ${serverData.shipping.toFixed(2)}`;
            } else {
                shippingElement.textContent = 'Gratis';
            }
            
            updateCheckoutButton(serverData.total);
            console.log('💰 Totales actualizados desde servidor');
            return;
        }
        
        // Fallback: cálculo local
        const tax = subtotal * 0.18; // IGV 18%
        let shipping = 0;

        // Calcular envío (gratis si la compra es mayor a S/. 200)
        if (subtotal > 0 && subtotal < 200) {
            shipping = 15;
            shippingElement.textContent = `S/. ${shipping.toFixed(2)}`;
        } else if (subtotal >= 200) {
            shippingElement.textContent = 'Gratis';
        } else {
            shippingElement.textContent = 'Calculado en checkout';
        }

        // Aplicar cupón si existe
        let discount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.type === 'percentage') {
                discount = subtotal * (appliedCoupon.value / 100);
            } else if (appliedCoupon.type === 'fixed') {
                discount = appliedCoupon.value;
            }
        }

        const total = subtotal + tax + shipping - discount;

        subtotalElement.textContent = `S/. ${subtotal.toFixed(2)}`;
        taxElement.textContent = `S/. ${tax.toFixed(2)}`;
        totalElement.textContent = `S/. ${total.toFixed(2)}`;

        updateCheckoutButton(total);
    }

    // Función para actualizar el estado del botón de checkout
    function updateCheckoutButton(total = 0) {
        const isEmpty = cart.length === 0;
        checkoutButton.disabled = isEmpty;
        checkoutButton.classList.toggle('opacity-50', isEmpty);
        checkoutButton.classList.toggle('cursor-not-allowed', isEmpty);
        
        if (isEmpty) {
            checkoutButton.innerHTML = `
                <span class="material-icons">shopping_cart</span>
                <span>Carrito Vacío</span>
            `;
        } else {
            checkoutButton.innerHTML = `
                <span class="material-icons">shopping_cart_checkout</span>
                <span>Proceder al Pago (S/. ${total.toFixed(2)})</span>
            `;
        }
    }

    // Función para actualizar recomendaciones
    function updateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations');
        if (!recommendationsContainer) return;

        // Obtener productos relacionados basados en los items del carrito
        getRecommendedProducts().then(products => {
            const grid = recommendationsContainer.querySelector('.grid');
            if (!grid) return;
            
            grid.innerHTML = '';

            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';
                card.innerHTML = `
                    <div class="relative pb-[100%]">
                        <img src="/static/img/products/${product.image}" 
                             alt="${product.name}" 
                             class="absolute inset-0 w-full h-full object-cover"
                             onerror="this.src='/static/img/default-product.png'">
                    </div>
                    <div class="p-4">
                        <h4 class="font-medium text-gray-800 truncate">${product.name}</h4>
                        <p class="text-blue-600 font-bold mt-1">S/. ${product.price.toFixed(2)}</p>
                        <button onclick="addToCartFromRecommendations(${product.id})" 
                                class="w-full mt-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors text-sm">
                            Agregar al Carrito
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });
        });
    }

    // Función para obtener productos recomendados
    async function getRecommendedProducts() {
        // En una implementación real, esto haría una llamada a la API
        const allProducts = [
            { id: 1, name: "Uniforme Diario", price: 89.90, image: "uniform1.jpg" },
            { id: 7, name: "Kit de Arte", price: 45.90, image: "artkit.jpg" },
            { id: 14, name: "Mochila Escolar", price: 79.90, image: "backpack.jpg" },
            { id: 17, name: "Botella de Agua", price: 19.90, image: "bottle.jpg" }
        ];
        
        // Filtrar productos que no están en el carrito
        const cartIds = cart.map(item => item.id);
        return allProducts.filter(product => !cartIds.includes(product.id)).slice(0, 4);
    }

    // Función para agregar al carrito desde recomendaciones
    window.addToCartFromRecommendations = function(productId) {
        const existingItem = cart.find(item => item.id == productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                quantity: 1
            });
        }

        saveCart();
        updateCartView();
        showNotification('Producto agregado al carrito', 'success');
    };

    // Función para actualizar los totales
    function updateTotals(subtotal) {
        const tax = subtotal * 0.18; // IGV 18%
        let shipping = 0;

        // Calcular envío (gratis si la compra es mayor a S/. 200)
        if (subtotal > 0 && subtotal < 200) {
            shipping = 15;
            shippingElement.textContent = `S/. ${shipping.toFixed(2)}`;
        } else if (subtotal >= 200) {
            shippingElement.textContent = 'Gratis';
        } else {
            shippingElement.textContent = 'Calculado en checkout';
        }

        // Aplicar cupón si existe
        let discount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.type === 'percentage') {
                discount = subtotal * (appliedCoupon.value / 100);
            } else if (appliedCoupon.type === 'fixed') {
                discount = appliedCoupon.value;
            }
        }

        const total = subtotal + tax + shipping - discount;

        subtotalElement.textContent = `S/. ${subtotal.toFixed(2)}`;
        taxElement.textContent = `S/. ${tax.toFixed(2)}`;
        totalElement.textContent = `S/. ${total.toFixed(2)}`;

        updateCheckoutButton(total);
    }

    // Función para actualizar el estado del botón de checkout
    function updateCheckoutButton(total = 0) {
        const isEmpty = cart.length === 0;
        checkoutButton.disabled = isEmpty;
        checkoutButton.classList.toggle('opacity-50', isEmpty);
        
        if (isEmpty) {
            checkoutButton.innerHTML = `
                <span class="material-icons">shopping_cart</span>
                <span>Carrito Vacío</span>
            `;
        } else {
            checkoutButton.innerHTML = `
                <span class="material-icons">shopping_cart_checkout</span>
                <span>Proceder al Pago (S/. ${total.toFixed(2)})</span>
            `;
        }
    }

    // Función para actualizar recomendaciones
    function updateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations');
        if (!recommendationsContainer) return;

        // Obtener productos relacionados basados en los items del carrito
        getRecommendedProducts().then(products => {
            const grid = recommendationsContainer.querySelector('.grid');
            grid.innerHTML = '';

            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';
                card.innerHTML = `
                    <div class="relative pb-[100%]">
                        <img src="/static/img/products/${product.image}" 
                             alt="${product.name}" 
                             class="absolute inset-0 w-full h-full object-cover">
                    </div>
                    <div class="p-4">
                        <h4 class="font-medium text-gray-800 truncate">${product.name}</h4>
                        <p class="text-blue-600 font-bold mt-1">S/. ${product.price.toFixed(2)}</p>
                        <button onclick="addToCart(${product.id})" 
                                class="w-full mt-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors text-sm">
                            Agregar al Carrito
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });
        });
    }

    // Función para obtener productos recomendados (simulada)
    async function getRecommendedProducts() {
        // Esta función debería hacer una llamada a la API para obtener recomendaciones reales
        return [
            { id: 1, name: "Producto Recomendado 1", price: 29.99, image: "prod1.jpg" },
            { id: 2, name: "Producto Recomendado 2", price: 39.99, image: "prod2.jpg" },
            { id: 3, name: "Producto Recomendado 3", price: 49.99, image: "prod3.jpg" },
            { id: 4, name: "Producto Recomendado 4", price: 59.99, image: "prod4.jpg" }
        ];
    }

    // Función para actualizar la cantidad
    window.updateQuantity = function(productId, change) {
        const item = cart.find(item => item.id == productId);
        if (!item) return;

        const newQuantity = item.quantity + change;

        if (newQuantity < 1) {
            showDeleteConfirmation(productId);
            return;
        }
        if (newQuantity > 99) {
            showNotification('Cantidad máxima permitida: 99', 'error');
            return;
        }

        // Actualizar la cantidad
        item.quantity = newQuantity;
        
        // Animar el cambio en el input
        const quantityElement = document.querySelector(`[data-quantity="${productId}"]`);
        const totalElement = document.querySelector(`[data-total="${productId}"]`);
        
        if (quantityElement) {
            animateQuantityChange(quantityElement, change > 0);
            quantityElement.value = newQuantity;
        }

        // Actualizar el total del item
        if (totalElement) {
            const cartItem = cart.find(item => item.id == productId);
            const product = getProductInfo(productId, cartItem);
            const newTotal = (product.price * newQuantity).toFixed(2);
            totalElement.style.transition = 'all 0.3s ease-out';
            totalElement.style.transform = 'scale(1.1)';
            totalElement.style.color = change > 0 ? 'green' : 'red';
            
            setTimeout(() => {
                totalElement.textContent = `S/. ${newTotal}`;
                totalElement.style.transform = 'scale(1)';
                totalElement.style.color = '';
            }, 200);
        }

        // Guardar y actualizar vista
        saveCart();
        setTimeout(() => updateCartView(), 300);
        showNotification(`Cantidad actualizada: ${newQuantity}`, 'success');
    };

    // Función para actualizar cantidad directamente desde el input
    window.updateQuantityDirect = function(productId, newQuantity) {
        newQuantity = parseInt(newQuantity);
        const item = cart.find(item => item.id == productId);
        
        if (!item) return;

        // Validar límites
        if (newQuantity < 1) {
            showDeleteConfirmation(productId);
            // Restaurar valor anterior
            const quantityElement = document.querySelector(`[data-quantity="${productId}"]`);
            if (quantityElement) quantityElement.value = item.quantity;
            return;
        }
        if (newQuantity > 99) {
            const quantityElement = document.querySelector(`[data-quantity="${productId}"]`);
            if (quantityElement) quantityElement.value = 99;
            newQuantity = 99;
            showNotification('Cantidad máxima permitida: 99', 'error');
        }

        // Solo actualizar si el valor ha cambiado
        if (newQuantity !== item.quantity) {
            item.quantity = newQuantity;
            saveCart();
            updateCartView();
            showNotification(`Cantidad actualizada: ${newQuantity}`, 'success');
        }
    };

    // Modal de confirmación para eliminar producto
    window.showDeleteConfirmation = function(productId) {
        itemBeingDeleted = productId;
        
        // Obtener información del producto
        const cartItem = cart.find(item => item.id == productId);
        const product = getProductInfo(productId, cartItem);
        
        // Actualizar el contenido del modal
        const modalTitle = deleteModal.querySelector('h3');
        const modalDescription = deleteModal.querySelector('p');
        
        modalTitle.textContent = 'Eliminar producto';
        modalDescription.textContent = `¿Estás seguro que deseas eliminar "${product.name}" del carrito?`;
        
        // Configurar el botón de confirmar
        const confirmButton = document.getElementById('confirmDelete');
        confirmButton.onclick = function() {
            confirmDelete();
        };
        
        // Animar la entrada del modal
        deleteModal.classList.remove('hidden');
        setTimeout(() => {
            const modalContent = deleteModal.querySelector('.transform');
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }, 10);
    };

    // Cerrar modal de confirmación
    window.closeDeleteModal = function() {
        const modalContent = deleteModal.querySelector('.transform');
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
        
        setTimeout(() => {
            deleteModal.classList.add('hidden');
            itemBeingDeleted = null;
        }, 300);
    };

    // Confirmar eliminación del producto
    window.confirmDelete = function() {
        if (itemBeingDeleted) {
            removeFromCart(itemBeingDeleted);
            closeDeleteModal();
        }
    };

    // Función para eliminar un producto del carrito
    window.removeFromCart = function(productId) {
        const itemIndex = cart.findIndex(item => item.id == productId);
        
        if (itemIndex === -1) {
            showNotification('Producto no encontrado en el carrito', 'error');
            return;
        }

        // Guardar el item para poder deshacerlo
        lastDeletedItem = { ...cart[itemIndex] };

        // Animar la salida del elemento
        const itemElement = document.querySelector(`[data-item="${productId}"]`);
        if (itemElement) {
            itemElement.style.transition = 'all 0.3s ease-out';
            itemElement.style.transform = 'translateX(100%)';
            itemElement.style.opacity = '0';
            
            setTimeout(() => {
                // Eliminar del array
                cart.splice(itemIndex, 1);
                saveCart();
                updateCartView();
                showDeleteNotification();
                showNotification('Producto eliminado del carrito', 'success');
            }, 300);
        } else {
            // Eliminar inmediatamente si no se encuentra el elemento
            cart.splice(itemIndex, 1);
            saveCart();
            updateCartView();
            showDeleteNotification();
            showNotification('Producto eliminado del carrito', 'success');
        }
    };

    // Mostrar notificación de eliminación con opción de deshacer
    function showDeleteNotification() {
        // Ocultar notificación anterior si existe
        if (!deleteNotification.classList.contains('hidden')) {
            deleteNotification.classList.add('hidden');
        }

        // Mostrar nueva notificación con animación
        setTimeout(() => {
            deleteNotification.classList.remove('hidden');
            deleteNotification.style.transform = 'translateX(100%)';
            deleteNotification.style.opacity = '0';
            
            requestAnimationFrame(() => {
                deleteNotification.style.transition = 'all 0.3s ease-out';
                deleteNotification.style.transform = 'translateX(0)';
                deleteNotification.style.opacity = '1';
            });

            // Configurar el temporizador para ocultar
            const timer = setTimeout(() => {
                hideDeleteNotification();
            }, 5000);

            // Guardar el timer en el elemento para poder cancelarlo si es necesario
            deleteNotification.dataset.timer = timer;
        }, 100);
    }

    // Ocultar notificación de eliminación
    function hideDeleteNotification() {
        if (!deleteNotification.classList.contains('hidden')) {
            deleteNotification.style.transform = 'translateX(100%)';
            deleteNotification.style.opacity = '0';
            
            setTimeout(() => {
                deleteNotification.classList.add('hidden');
                lastDeletedItem = null;
            }, 300);
        }
    }

    // Deshacer eliminación
    window.undoDelete = function() {
        if (!lastDeletedItem) return;

        // Cancelar el temporizador de ocultamiento si existe
        const timer = deleteNotification.dataset.timer;
        if (timer) clearTimeout(timer);

        // Restaurar el item con animación
        cart.push(lastDeletedItem);
        saveCart();
        
        // Actualizar vista con animación
        updateCartView();
        
        // Ocultar notificación con animación
        hideDeleteNotification();
        
        // Mostrar notificación de éxito
        showNotification('Producto restaurado', 'success');
        
        // Limpiar el item eliminado
        lastDeletedItem = null;
    };

    // Función para actualizar el contador del carrito en el header
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCounters = document.querySelectorAll('.cart-count');
        cartCounters.forEach(counter => {
            counter.textContent = count;
        });
    }

    // Función para mostrar notificaciones
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        notification.className = `fixed bottom-4 left-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out z-50`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animar entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateY(-20px)';
        });

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateY(0) translateX(-100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Función para aplicar cupón
    window.applyCoupon = function() {
        const couponInput = document.getElementById('coupon');
        const couponCode = couponInput.value.trim().toUpperCase();
        
        if (!couponCode) {
            showNotification('Por favor ingresa un código de cupón', 'error');
            return;
        }

        // Cupones de ejemplo
        const coupons = {
            'DESCUENTO10': { type: 'percentage', value: 10, description: '10% de descuento' },
            'PRIMERACOMPRA': { type: 'fixed', value: 20, description: 'S/. 20 de descuento' },
            'ESTUDIANTE5': { type: 'percentage', value: 5, description: '5% de descuento estudiantil' }
        };

        if (coupons[couponCode]) {
            appliedCoupon = { code: couponCode, ...coupons[couponCode] };
            couponInput.disabled = true;
            couponInput.parentElement.nextElementSibling.innerHTML = `
                <div class="text-sm text-green-600 flex items-center justify-between">
                    <span>✓ Cupón aplicado: ${appliedCoupon.description}</span>
                    <button onclick="removeCoupon()" class="text-red-500 hover:text-red-700">Quitar</button>
                </div>
            `;
            updateCartView();
            showNotification(`Cupón aplicado: ${appliedCoupon.description}`, 'success');
        } else {
            showNotification('Código de cupón inválido', 'error');
        }
    };

    // Función para quitar cupón
    window.removeCoupon = function() {
        appliedCoupon = null;
        const couponInput = document.getElementById('coupon');
        couponInput.disabled = false;
        couponInput.value = '';
        couponInput.parentElement.nextElementSibling.innerHTML = '';
        updateCartView();
        showNotification('Cupón removido', 'success');
    };

    // Función para proceder al checkout
    window.proceedToCheckout = function() {
        if (cart.length === 0) {
            showNotification('El carrito está vacío', 'error');
            return;
        }
        
        // Verificar si el usuario está autenticado
        fetch('/api/check_auth', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                // Usuario autenticado, proceder al checkout
                sessionStorage.setItem('checkout_cart', JSON.stringify(cart));
                if (appliedCoupon) {
                    sessionStorage.setItem('applied_coupon', JSON.stringify(appliedCoupon));
                }
                window.location.href = '/checkout';
            } else {
                // Usuario no autenticado, redirigir al login
                sessionStorage.setItem('checkout_cart', JSON.stringify(cart));
                if (appliedCoupon) {
                    sessionStorage.setItem('applied_coupon', JSON.stringify(appliedCoupon));
                }
                // Guardar la URL de retorno
                sessionStorage.setItem('return_url', '/checkout');
                showNotification('Debes iniciar sesión para continuar con la compra', 'info');
                setTimeout(() => {
                    window.location.href = '/login?return_url=' + encodeURIComponent('/checkout');
                }, 1500);
            }
        })
        .catch(error => {
            console.error('Error checking authentication:', error);
            // En caso de error, asumir que no está autenticado
            sessionStorage.setItem('checkout_cart', JSON.stringify(cart));
            if (appliedCoupon) {
                sessionStorage.setItem('applied_coupon', JSON.stringify(appliedCoupon));
            }
            sessionStorage.setItem('return_url', '/checkout');
            showNotification('Debes iniciar sesión para continuar con la compra', 'info');
            setTimeout(() => {
                window.location.href = '/login?return_url=' + encodeURIComponent('/checkout');
            }, 1500);
        });
    };

    // Evento para el botón de pago
    if (checkoutButton) {
        checkoutButton.addEventListener('click', proceedToCheckout);
    }

    // Cerrar modal al hacer clic fuera de él
    deleteModal?.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });

    // Inicializar la vista del carrito
    updateCartView();
});