// Checkout JavaScript - Wawalu

class CheckoutManager {
    constructor() {
        this.selectedPaymentMethod = null;
        this.uploadedFile = null;
        this.formValidation = {
            firstName: false,
            lastName: false,
            shippingAddress: false,
            phone: false,
            email: false,
            paymentMethod: false
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCartData();
        this.initializeFormValidation();
        this.setupFileUpload();
    }

    setupEventListeners() {
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => {
                const methodType = method.dataset.method;
                this.selectPaymentMethod(methodType);
            });
        });

        // Radio button changes
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectPaymentMethod(e.target.value);
            });
        });

        // Form submission
        const submitBtn = document.getElementById('submitOrderBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitOrder();
            });
        }

        // Form validation on input
        document.querySelectorAll('#checkoutForm input, #checkoutForm textarea').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Modal close events
        const viewOrderBtn = document.getElementById('viewOrderBtn');
        if (viewOrderBtn) {
            viewOrderBtn.addEventListener('click', () => {
                window.location.href = '/my-orders';
            });
        }
    }

    selectPaymentMethod(method) {
        // Clear previous selection
        document.querySelectorAll('.payment-method').forEach(m => {
            m.classList.remove('selected');
            m.classList.remove('border-blue-500', 'bg-blue-50');
        });

        // Hide all payment details
        document.querySelectorAll('.payment-details').forEach(detail => {
            detail.classList.add('hidden');
        });

        // Select new method
        const selectedMethod = document.querySelector(`[data-method="${method}"]`);
        if (selectedMethod) {
            selectedMethod.classList.add('selected', 'border-blue-500', 'bg-blue-50');
            
            // Show payment details
            const details = selectedMethod.querySelector('.payment-details');
            if (details) {
                details.classList.remove('hidden');
            }

            // Update radio button
            const radio = selectedMethod.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }

            this.selectedPaymentMethod = method;
            this.formValidation.paymentMethod = true;

            // Show/hide payment proof section
            const paymentProof = document.getElementById('paymentProof');
            if (paymentProof) {
                if (method === 'yape' || method === 'transfer') {
                    paymentProof.classList.remove('hidden');
                    // Make operation number required
                    const operationNumber = document.getElementById('operationNumber');
                    if (operationNumber) {
                        operationNumber.required = true;
                    }
                } else if (method === 'cash') {
                    paymentProof.classList.add('hidden');
                    // Remove operation number requirement
                    const operationNumber = document.getElementById('operationNumber');
                    if (operationNumber) {
                        operationNumber.required = false;
                    }
                }
            }

            this.updateSubmitButton();
        }
    }

    setupFileUpload() {
        const uploadArea = document.querySelector('[for="receiptUpload"]');
        if (!uploadArea) return;
        
        const uploadContainer = uploadArea.closest('.border-dashed');
        const fileInput = document.getElementById('receiptUpload');
        const preview = document.getElementById('uploadPreview');

        if (!uploadContainer || !fileInput || !preview) return;

        // Drag and drop events
        uploadContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadContainer.classList.add('border-blue-400', 'bg-blue-50');
        });

        uploadContainer.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadContainer.classList.remove('border-blue-400', 'bg-blue-50');
        });

        uploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadContainer.classList.remove('border-blue-400', 'bg-blue-50');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
    }

    handleFileUpload(file) {
        // Validate file
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

        if (file.size > maxSize) {
            this.showError('El archivo es demasiado grande. Máximo 5MB.');
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            this.showError('Tipo de archivo no válido. Solo JPG, PNG o PDF.');
            return;
        }

        this.uploadedFile = file;
        this.showFilePreview(file);
    }

    showFilePreview(file) {
        const preview = document.getElementById('uploadPreview');
        if (!preview) return;
        
        preview.innerHTML = '';
        preview.classList.remove('hidden');

        const previewContainer = document.createElement('div');
        previewContainer.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';

        const fileInfo = document.createElement('div');
        fileInfo.className = 'flex items-center space-x-3';

        const icon = document.createElement('span');
        icon.className = 'material-icons text-blue-600';
        icon.textContent = file.type.includes('pdf') ? 'picture_as_pdf' : 'image';

        const details = document.createElement('div');
        details.innerHTML = `
            <p class="text-sm font-medium text-gray-900">${file.name}</p>
            <p class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB</p>
        `;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'text-red-600 hover:text-red-800';
        removeBtn.innerHTML = '<span class="material-icons text-sm">delete</span>';
        removeBtn.addEventListener('click', () => {
            this.uploadedFile = null;
            preview.classList.add('hidden');
            const fileInput = document.getElementById('receiptUpload');
            if (fileInput) {
                fileInput.value = '';
            }
        });

        fileInfo.appendChild(icon);
        fileInfo.appendChild(details);
        previewContainer.appendChild(fileInfo);
        previewContainer.appendChild(removeBtn);
        preview.appendChild(previewContainer);
    }

    loadCartData() {
        // Los datos del carrito se pasan desde el template
        if (typeof cartData !== 'undefined' && cartData.length > 0) {
            this.displayCartItems(cartData);
        } else {
            // Fallback: cargar desde localStorage si no hay datos del servidor
            const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
            this.displayCartItems(cartItems);
        }
    }

    displayCartItems(items) {
        const container = document.getElementById('checkoutItems');
        if (!container) return;

        // Los items ya están renderizados en el template
        // Solo necesitamos manejar la actualización dinámica si es necesario
    }

    initializeFormValidation() {
        // Pre-fill user data if available
        this.prefillUserData();
    }

    prefillUserData() {
        // Si hay datos de usuario en sesión, pre-llenar el formulario
        const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
        
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        
        if (userData.firstName && firstName) firstName.value = userData.firstName;
        if (userData.lastName && lastName) lastName.value = userData.lastName;
        if (userData.email && email) email.value = userData.email;
        if (userData.phone && phone) phone.value = userData.phone;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name || field.id;
        let isValid = false;

        // Clear previous errors
        this.clearFieldError(field);

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                isValid = value.length >= 2;
                if (!isValid) {
                    this.showFieldError(field, 'Debe tener al menos 2 caracteres');
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                if (!isValid) {
                    this.showFieldError(field, 'Ingresa un email válido');
                }
                break;

            case 'phone':
                const phoneRegex = /^[0-9]{9}$/;
                isValid = phoneRegex.test(value.replace(/\s/g, ''));
                if (!isValid) {
                    this.showFieldError(field, 'Debe tener 9 dígitos');
                }
                break;

            case 'shippingAddress':
                isValid = value.length >= 10;
                if (!isValid) {
                    this.showFieldError(field, 'Dirección muy corta');
                }
                break;

            case 'operationNumber':
                if (field.required) {
                    isValid = value.length >= 6;
                    if (!isValid) {
                        this.showFieldError(field, 'Número de operación requerido');
                    }
                } else {
                    isValid = true;
                }
                break;

            default:
                isValid = !field.required || value.length > 0;
        }

        this.formValidation[fieldName] = isValid;
        this.updateSubmitButton();
        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('border-red-500', 'bg-red-50');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-600 text-sm mt-1 flex items-center';
        errorDiv.innerHTML = `<span class="material-icons text-sm mr-1">error</span>${message}`;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('border-red-500', 'bg-red-50');
        field.classList.add('border-green-500', 'bg-green-50');
        
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    validateForm() {
        const form = document.getElementById('checkoutForm');
        if (!form) return false;
        
        const requiredFields = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Validate payment method
        if (!this.selectedPaymentMethod) {
            this.showError('Selecciona un método de pago');
            isValid = false;
        }

        return isValid;
    }

    updateSubmitButton() {
        const submitBtn = document.getElementById('submitOrderBtn');
        if (!submitBtn) return;
        
        const requiredFieldsValid = Object.values(this.formValidation).every(valid => valid);
        
        if (requiredFieldsValid && this.selectedPaymentMethod) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    async submitOrder() {
        if (!this.validateForm()) {
            this.showError('Por favor, completa todos los campos requeridos');
            return;
        }

        const submitBtn = document.getElementById('submitOrderBtn');
        const btnText = document.getElementById('submitBtnText');
        
        if (!submitBtn || !btnText) return;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        btnText.textContent = 'Procesando...';

        try {
            const formData = new FormData();
            
            // Add form data
            const firstName = document.getElementById('firstName');
            const lastName = document.getElementById('lastName');
            const shippingAddress = document.getElementById('shippingAddress');
            const phone = document.getElementById('phone');
            const email = document.getElementById('email');
            const orderNotes = document.getElementById('orderNotes');
            
            if (firstName) formData.append('firstName', firstName.value);
            if (lastName) formData.append('lastName', lastName.value);
            if (shippingAddress) formData.append('shippingAddress', shippingAddress.value);
            if (phone) formData.append('phone', phone.value);
            if (email) formData.append('email', email.value);
            if (orderNotes) formData.append('orderNotes', orderNotes.value);
            
            formData.append('paymentMethod', this.selectedPaymentMethod);
            
            // Add payment proof if required
            if (this.selectedPaymentMethod === 'yape' || this.selectedPaymentMethod === 'transfer') {
                const operationNumber = document.getElementById('operationNumber');
                if (operationNumber) {
                    formData.append('operationNumber', operationNumber.value);
                }
                
                if (this.uploadedFile) {
                    formData.append('receipt', this.uploadedFile);
                }
            }

            const response = await fetch('/process_order', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccessModal(result.order_id);
                // Clear cart
                localStorage.removeItem('cart');
            } else {
                this.showError(result.message || 'Error al procesar el pedido');
            }

        } catch (error) {
            console.error('Error submitting order:', error);
            this.showError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            // Reset button state
            if (submitBtn && btnText) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                btnText.textContent = 'Confirmar Pedido';
            }
        }
    }

    showSuccessModal(orderId) {
        const modal = document.getElementById('confirmationModal');
        if (!modal) {
            // Create modal if it doesn't exist
            this.createSuccessModal(orderId);
            return;
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Store order ID for viewing
        const viewOrderBtn = document.getElementById('viewOrderBtn');
        if (viewOrderBtn) {
            viewOrderBtn.setAttribute('data-order-id', orderId);
        }
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            window.location.href = '/my-orders';
        }, 5000);
    }

    createSuccessModal(orderId) {
        const modal = document.createElement('div');
        modal.id = 'confirmationModal';
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 m-4 max-w-md w-full">
                <div class="text-center">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="material-icons text-green-600 text-2xl">check_circle</span>
                    </div>
                    <h3 class="text-lg font-semibold mb-2">¡Pedido Realizado!</h3>
                    <p class="text-gray-600 mb-4">Tu pedido ha sido procesado exitosamente.</p>
                    <div class="space-y-2">
                        <button id="viewOrderBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                            Ver Mi Pedido
                        </button>
                        <button onclick="window.location.href='/shop'" 
                                class="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50">
                            Seguir Comprando
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener to view order button
        const viewOrderBtn = modal.querySelector('#viewOrderBtn');
        if (viewOrderBtn) {
            viewOrderBtn.addEventListener('click', () => {
                window.location.href = '/my-orders';
            });
        }
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            window.location.href = '/my-orders';
        }, 5000);
    }

    showError(message) {
        // Create or update error notification
        let errorDiv = document.getElementById('errorNotification');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'errorNotification';
            errorDiv.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
            document.body.appendChild(errorDiv);
        }

        errorDiv.innerHTML = `
            <span class="material-icons mr-2">error</span>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <span class="material-icons text-sm">close</span>
            </button>
        `;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv && errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    showSuccess(message) {
        // Create success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        successDiv.innerHTML = `
            <span class="material-icons mr-2">check_circle</span>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <span class="material-icons text-sm">close</span>
            </button>
        `;
        
        document.body.appendChild(successDiv);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Initialize checkout when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.checkoutManager = new CheckoutManager();
});

// Additional utility functions for backward compatibility
function selectPaymentMethod(method) {
    if (window.checkoutManager) {
        window.checkoutManager.selectPaymentMethod(method);
    }
}

function submitOrder() {
    if (window.checkoutManager) {
        window.checkoutManager.submitOrder();
    }
}