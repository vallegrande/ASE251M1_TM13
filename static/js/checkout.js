document.addEventListener('DOMContentLoaded', function() {
    // Obtener el carrito del localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateOrderSummary();

    // Event listeners para los métodos de pago
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updatePaymentMethod(this.value);
        });
    });

    // Event listener para subida de archivos
    const fileUpload = document.getElementById('file-upload');
    const dropZone = fileUpload.closest('div.border-dashed');

    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('border-blue-500');
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('border-blue-500');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('border-blue-500');
        handleFiles(e.dataTransfer.files);
    });

    fileUpload.addEventListener('change', function() {
        handleFiles(this.files);
    });
});

// Función para manejar la selección del método de pago
function selectPaymentMethod(method) {
    // Actualizar radio button
    document.querySelector(`input[value="${method}"]`).checked = true;
    
    // Ocultar todos los detalles
    document.getElementById('yapeDetails').classList.add('hidden');
    document.getElementById('transferDetails').classList.add('hidden');
    
    // Mostrar los detalles del método seleccionado
    document.getElementById(`${method}Details`).classList.remove('hidden');
}

// Función para actualizar el resumen de la orden
function updateOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutItems = document.getElementById('checkoutItems');
    const subtotalElement = document.getElementById('checkout-subtotal');
    const taxElement = document.getElementById('checkout-tax');
    const totalElement = document.getElementById('checkout-total');
    
    let subtotal = 0;
    checkoutItems.innerHTML = '';

    cart.forEach(item => {
        const productCard = document.querySelector(`[data-id="${item.id}"]`);
        if (!productCard) return;

        const productName = productCard.dataset.name;
        const productPrice = parseFloat(productCard.dataset.price);
        const itemTotal = productPrice * item.quantity;
        subtotal += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'py-4';
        itemElement.innerHTML = `
            <div class="flex justify-between">
                <div>
                    <h4 class="font-medium">${productName}</h4>
                    <p class="text-sm text-gray-500">Cantidad: ${item.quantity}</p>
                </div>
                <span class="font-medium">S/. ${itemTotal.toFixed(2)}</span>
            </div>
        `;
        checkoutItems.appendChild(itemElement);
    });

    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    subtotalElement.textContent = `S/. ${subtotal.toFixed(2)}`;
    taxElement.textContent = `S/. ${tax.toFixed(2)}`;
    totalElement.textContent = `S/. ${total.toFixed(2)}`;
}

// Función para manejar archivos
function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
        showNotification('Por favor, selecciona una imagen', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotification('La imagen no debe exceder los 5MB', 'error');
        return;
    }

    // Aquí podrías mostrar una vista previa de la imagen
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.createElement('img');
        preview.src = e.target.result;
        preview.className = 'mt-2 rounded-lg w-full max-w-xs mx-auto';
        
        const dropZone = document.querySelector('.border-dashed');
        const existingPreview = dropZone.querySelector('img');
        if (existingPreview) {
            existingPreview.remove();
        }
        dropZone.appendChild(preview);
    };
    reader.readAsDataURL(file);
}

// Función para enviar el pedido
function submitOrder() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    const operationNumber = document.getElementById('operationNumber').value;
    const fileUpload = document.getElementById('file-upload');

    if (!paymentMethod) {
        showNotification('Por favor, selecciona un método de pago', 'error');
        return;
    }

    if (!operationNumber) {
        showNotification('Por favor, ingresa el número de operación', 'error');
        return;
    }

    if (!fileUpload.files[0]) {
        showNotification('Por favor, sube el comprobante de pago', 'error');
        return;
    }

    // Aquí irá la lógica para enviar el pedido al servidor
    // Por ahora solo mostraremos una notificación
    showNotification('¡Pedido enviado con éxito!', 'success');
    setTimeout(() => {
        localStorage.removeItem('cart');
        window.location.href = '/'; // Redirigir al inicio
    }, 2000);
}

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
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