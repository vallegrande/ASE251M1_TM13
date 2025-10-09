document.addEventListener('DOMContentLoaded', function() {
    // Obtener el carrito del sessionStorage primero, luego del localStorage
    window.cart = JSON.parse(sessionStorage.getItem('checkout_cart')) || 
                  JSON.parse(localStorage.getItem('cart')) || [];
    
    console.log('Carrito cargado en checkout:', window.cart);
    
    // Si el carrito está vacío, redirigir al carrito
    if (window.cart.length === 0) {
        showNotification('El carrito está vacío. Redirigiendo...', 'error');
        setTimeout(() => {
            window.location.href = '/carrito';
        }, 2000);
        return;
    }
    
    updateOrderSummary();

    // Event listeners para los métodos de pago
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            selectPaymentMethod(this.value);
        });
    });

    // También agregar event listeners para los divs clickeables
    document.querySelectorAll('[onclick*="selectPaymentMethod"]').forEach(element => {
        element.addEventListener('click', function() {
            const method = this.getAttribute('onclick').match(/selectPaymentMethod\('(\w+)'\)/)[1];
            selectPaymentMethod(method);
        });
    });

    // Event listener para subida de archivos - MEJORADO
    const fileUpload = document.getElementById('file-upload');
    const dropZone = fileUpload ? fileUpload.closest('div.border-dashed') : null;

    if (fileUpload && dropZone) {
        // Prevenir comportamiento por defecto para drag & drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Efectos visuales para drag & drop
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        // Manejar drop
        dropZone.addEventListener('drop', handleDrop, false);

        // Manejar selección de archivo
        fileUpload.addEventListener('change', function() {
            handleFiles(this.files);
        });

        // Click en la zona para abrir selector
        dropZone.addEventListener('click', function(e) {
            if (!e.target.closest('input[type="file"]')) {
                fileUpload.click();
            }
        });
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        dropZone.classList.add('border-blue-500', 'bg-blue-50');
        dropZone.classList.remove('border-gray-300');
    }

    function unhighlight(e) {
        dropZone.classList.remove('border-blue-500', 'bg-blue-50');
        dropZone.classList.add('border-gray-300');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
});

// Función para manejar la selección del método de pago
function selectPaymentMethod(method) {
    console.log('Seleccionando método de pago:', method);
    
    // Actualizar radio button
    const radioButton = document.querySelector(`input[value="${method}"]`);
    if (radioButton) {
        radioButton.checked = true;
        console.log('Radio button actualizado');
    }
    
    // Ocultar todos los detalles
    const yapeDetails = document.getElementById('yapeDetails');
    const transferDetails = document.getElementById('transferDetails');
    
    if (yapeDetails) {
        yapeDetails.classList.add('hidden');
        console.log('Yape details ocultado');
    }
    
    if (transferDetails) {
        transferDetails.classList.add('hidden');
        console.log('Transfer details ocultado');
    }
    
    // Mostrar los detalles del método seleccionado
    const selectedDetails = document.getElementById(`${method}Details`);
    if (selectedDetails) {
        selectedDetails.classList.remove('hidden');
        console.log(`${method} details mostrado`);
    } else {
        console.error(`No se encontró el elemento ${method}Details`);
    }
}

// Función para actualizar el resumen de la orden
function updateOrderSummary() {
    // Usar la variable global cart que se define al inicio
    const checkoutItems = document.getElementById('checkoutItems');
    const subtotalElement = document.getElementById('checkout-subtotal');
    const taxElement = document.getElementById('checkout-tax');
    const totalElement = document.getElementById('checkout-total');
    
    if (!checkoutItems || !subtotalElement || !taxElement || !totalElement) {
        console.error('Elementos de checkout no encontrados en el DOM');
        return;
    }
    
    let subtotal = 0;
    checkoutItems.innerHTML = '';

    window.cart.forEach(item => {
        // Usar los datos del carrito directamente
        const productName = item.name || `Producto #${item.id}`;
        const productPrice = parseFloat(item.price || 0);
        const itemTotal = productPrice * item.quantity;
        subtotal += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'py-4';
        itemElement.innerHTML = `
            <div class="flex justify-between">
                <div>
                    <h4 class="font-medium">${productName}</h4>
                    <p class="text-sm text-gray-500">Cantidad: ${item.quantity}</p>
                    ${item.talla ? `<p class="text-sm text-gray-500">Talla: ${item.talla}</p>` : ''}
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

// Función para manejar archivos - MEJORADA
function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Por favor, selecciona una imagen válida (PNG, JPG, GIF)', 'error');
        return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('La imagen no debe exceder los 5MB', 'error');
        return;
    }

    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = function(e) {
        updateFilePreview(e.target.result, file.name);
        showNotification('Archivo cargado exitosamente', 'success');
    };
    
    reader.onerror = function() {
        showNotification('Error al leer el archivo', 'error');
    };
    
    reader.readAsDataURL(file);
}

// Función para actualizar la vista previa del archivo
function updateFilePreview(imageSrc, fileName) {
    const dropZone = document.querySelector('.border-dashed');
    if (!dropZone) return;

    // Remover vista previa anterior
    const existingPreview = dropZone.querySelector('.file-preview');
    if (existingPreview) {
        existingPreview.remove();
    }

    // Crear nueva vista previa
    const previewContainer = document.createElement('div');
    previewContainer.className = 'file-preview mt-4 p-4 bg-gray-50 rounded-lg';
    
    previewContainer.innerHTML = `
        <div class="flex items-center space-x-4">
            <img src="${imageSrc}" class="w-16 h-16 object-cover rounded-lg border">
            <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 truncate">${fileName}</p>
                <p class="text-xs text-green-600">
                    <span class="material-icons text-sm">check_circle</span>
                    Archivo cargado
                </p>
            </div>
            <button type="button" onclick="removeFilePreview()" class="text-red-500 hover:text-red-700">
                <span class="material-icons text-sm">close</span>
            </button>
        </div>
    `;
    
    dropZone.appendChild(previewContainer);
}

// Función para remover la vista previa
function removeFilePreview() {
    const fileUpload = document.getElementById('file-upload');
    const preview = document.querySelector('.file-preview');
    
    if (fileUpload) {
        fileUpload.value = '';
    }
    
    if (preview) {
        preview.remove();
    }
    
    showNotification('Archivo removido', 'info');
}

// Función para enviar el pedido
function submitOrder() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    const operationNumber = document.getElementById('operationNumber').value;
    const fileUpload = document.getElementById('file-upload');
    const cart = window.cart || [];

    // Validaciones
    if (!paymentMethod) {
        showNotification('Por favor, selecciona un método de pago', 'error');
        return;
    }

    if (!operationNumber.trim()) {
        showNotification('Por favor, ingresa el número de operación', 'error');
        return;
    }

    if (!fileUpload.files[0]) {
        showNotification('Por favor, sube el comprobante de pago', 'error');
        return;
    }

    if (cart.length === 0) {
        showNotification('El carrito está vacío', 'error');
        return;
    }

    // Calcular total
    let subtotal = 0;
    cart.forEach(item => {
        const productCard = document.querySelector(`[data-id="${item.id}"]`);
        if (productCard) {
            const productPrice = parseFloat(productCard.dataset.price);
            subtotal += productPrice * item.quantity;
        }
    });
    const total = subtotal * 1.18; // Incluir IGV

    // Crear FormData para envío
    const formData = new FormData();
    formData.append('payment_method', paymentMethod.value);
    formData.append('operation_number', operationNumber);
    formData.append('total_amount', total.toFixed(2));
    formData.append('cart_items', JSON.stringify(cart));
    formData.append('receipt', fileUpload.files[0]);

    // Deshabilitar botón
    const submitBtn = document.querySelector('button[onclick="submitOrder()"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-icons animate-spin mr-2">refresh</span>Procesando...';

    // Enviar al servidor
    fetch('/process_order', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('¡Pedido enviado con éxito!', 'success');
            localStorage.removeItem('cart');
            
            // Redirigir a confirmación
            setTimeout(() => {
                window.location.href = `/order_confirmation/${data.order_id}`;
            }, 2000);
        } else {
            showNotification(data.message || 'Error al procesar el pedido', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error de conexión. Inténtalo de nuevo.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
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