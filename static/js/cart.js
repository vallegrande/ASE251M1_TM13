document.addEventListener('DOMContentLoaded', function() {
    // Estado global
    let lastDeletedItem = null;
    let appliedCoupon = null;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
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

    // Obtener el carrito del localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Función para actualizar la vista del carrito
    function updateCartView() {
        if (cart.length === 0) {
            document.getElementById('cartContainer').classList.add('hidden');
            emptyCartTemplate.classList.remove('hidden');
            return;
        }

        document.getElementById('cartContainer').classList.remove('hidden');
        emptyCartTemplate.classList.add('hidden');
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        // Header de la tabla (ya está en el HTML)

        cart.forEach(item => {
            const productCard = document.querySelector(`[data-id="${item.id}"]`);
            const productName = productCard ? productCard.dataset.name : 'Producto no disponible';
            const productPrice = productCard ? parseFloat(productCard.dataset.price) : 0;
            const productImage = productCard ? productCard.dataset.image : 'default.jpg';
            const itemTotal = productPrice * item.quantity;
            subtotal += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'border-t border-gray-100 transition-all duration-300 hover:bg-gray-50';
            itemElement.innerHTML = `
                <div class="grid md:grid-cols-12 gap-4 p-4 items-center">
                    <!-- Producto -->
                    <div class="md:col-span-6 flex items-center space-x-4">
                        <div class="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img src="/static/img/products/${productImage}" 
                                 alt="${productName}" 
                                 class="w-full h-full object-cover">
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-800">${productName}</h3>
                            <p class="text-sm text-gray-500">Código: #${item.id}</p>
                        </div>
                    </div>

                    <!-- Precio -->
                    <div class="md:col-span-2 text-center">
                        <span class="text-gray-600">S/. ${productPrice.toFixed(2)}</span>
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
                        S/. ${itemTotal.toFixed(2)}
                    </div>
                </div>

                <!-- Acciones -->
                <div class="flex items-center justify-end px-4 pb-4 md:absolute md:right-4 md:top-4">
                    <button onclick="showDeleteConfirmation('${item.id}')" 
                            class="text-gray-400 hover:text-red-500 transition-colors">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        updateTotals(subtotal);
        updateRecommendations();
        updateCheckoutButton();
    }

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
        const item = cart.find(item => item.id === productId);
        if (!item) return;

        const quantityElement = document.querySelector(`[data-quantity="${productId}"]`);
        const totalElement = document.querySelector(`[data-total="${productId}"]`);
        const price = parseFloat(document.querySelector(`[data-price="${productId}"]`).dataset.value);

        const newQuantity = item.quantity + change;
        if (newQuantity < 1) {
            showDeleteConfirmation(productId);
            return;
        }
        if (newQuantity > 99) {
            showNotification('Cantidad máxima permitida: 99', 'error');
            return;
        }

        // Aplicar el cambio con animación
        if (quantityElement) {
            // Animar el cambio de cantidad
            animateQuantityChange(quantityElement, change > 0);
            
            // Actualizar el valor con una animación suave
            quantityElement.style.transition = 'all 0.2s ease-out';
            setTimeout(() => {
                quantityElement.value = newQuantity;
                quantityElement.style.transition = '';
            }, 100);
        }

        // Actualizar el total del ítem con animación
        if (totalElement) {
            const newTotal = (price * newQuantity).toFixed(2);
            totalElement.style.transition = 'all 0.3s ease-out';
            totalElement.style.transform = 'scale(1.1)';
            totalElement.style.color = change > 0 ? 'green' : 'red';
            
            setTimeout(() => {
                totalElement.textContent = `S/. ${newTotal}`;
                totalElement.style.transform = 'scale(1)';
                totalElement.style.color = '';
            }, 200);
        }

        // Actualizar el estado del carrito
        item.quantity = newQuantity;
        saveCart();
        updateCartView();

        // Mostrar notificación
        showNotification(`Cantidad actualizada: ${newQuantity}`, 'success');
    };

    // Función para actualizar cantidad directamente desde el input
    window.updateQuantityDirect = function(productId, input) {
        const newQuantity = parseInt(input.value);
        const item = cart.find(item => item.id === productId);
        
        if (!item) return;

        // Validar límites
        if (newQuantity < 1) {
            showDeleteConfirmation(productId);
            input.value = item.quantity; // Restaurar valor anterior
            return;
        }
        if (newQuantity > 99) {
            input.value = 99;
            showNotification('Cantidad máxima permitida: 99', 'error');
            return;
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
        const item = cart.find(item => item.id === productId);
        const productName = document.querySelector(`[data-name="${productId}"]`)?.textContent || 'este producto';
        
        // Actualizar el contenido del modal
        const modalTitle = deleteModal.querySelector('h3');
        const modalDescription = deleteModal.querySelector('p');
        
        modalTitle.textContent = 'Eliminar producto';
        modalDescription.textContent = `¿Estás seguro que deseas eliminar ${productName} del carrito?`;
        
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
        const itemToDelete = cart.find(item => item.id === productId);
        if (!itemToDelete) return;

        // Guardar el item eliminado para poder deshacerlo
        lastDeletedItem = { ...itemToDelete };
        
        // Animar la salida del elemento
        const itemElement = document.querySelector(`[data-item="${productId}"]`);
        if (itemElement) {
            itemElement.style.transition = 'all 0.3s ease-out';
            itemElement.style.transform = 'translateX(100%)';
            itemElement.style.opacity = '0';
            
            setTimeout(() => {
                cart = cart.filter(item => item.id !== productId);
                saveCart();
                updateCartView();
                showDeleteNotification();
            }, 300);
        } else {
            cart = cart.filter(item => item.id !== productId);
            saveCart();
            updateCartView();
            showDeleteNotification();
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

    // Evento para el botón de pago
    checkoutButton.addEventListener('click', function() {
        if (cart.length === 0) {
            showNotification('El carrito está vacío');
            return;
        }
        // Aquí puedes agregar la lógica para proceder al pago
        alert('Implementar proceso de pago');
    });

    // Inicializar la vista del carrito
    updateCartView();
});