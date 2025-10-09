// Libro de Reclamaciones - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeReclamacionesForm();
});

function initializeReclamacionesForm() {
    const form = document.getElementById('reclamacionForm');
    const submitButton = document.getElementById('submitButton');
    
    // Validación en tiempo real
    setupRealTimeValidation();
    
    // Manejo del envío del formulario
    form.addEventListener('submit', handleFormSubmit);
    
    // Validación de número de documento según tipo
    setupDocumentValidation();
    
    // Formato de teléfono
    setupPhoneFormatting();
    
    // Animaciones de entrada
    animateFormSections();
    
    // Auto-save (guardar en localStorage)
    setupAutoSave();
}

function setupRealTimeValidation() {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Validación según el tipo de campo
    switch(fieldName) {
        case 'nombres':
        case 'apellidos':
            if (!value) {
                isValid = false;
                errorMessage = 'Este campo es obligatorio';
            } else if (value.length < 2) {
                isValid = false;
                errorMessage = 'Debe tener al menos 2 caracteres';
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Solo se permiten letras y espacios';
            }
            break;
            
        case 'numeroDocumento':
            const tipoDoc = document.getElementById('tipoDocumento').value;
            if (!value) {
                isValid = false;
                errorMessage = 'Este campo es obligatorio';
            } else {
                const validation = validateDocumentNumber(value, tipoDoc);
                isValid = validation.isValid;
                errorMessage = validation.message;
            }
            break;
            
        case 'telefono':
            if (!value) {
                isValid = false;
                errorMessage = 'Este campo es obligatorio';
            } else if (!/^\+?51\s?9\d{8}$/.test(value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = 'Formato válido: +51 999 999 999';
            }
            break;
            
        case 'email':
            if (!value) {
                isValid = false;
                errorMessage = 'Este campo es obligatorio';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Ingrese un email válido';
            }
            break;
            
        case 'montoReclamado':
            if (!value) {
                isValid = false;
                errorMessage = 'Este campo es obligatorio';
            } else if (parseFloat(value) <= 0) {
                isValid = false;
                errorMessage = 'El monto debe ser mayor a 0';
            }
            break;
            
        case 'descripcionBien':
        case 'detalleReclamacion':
        case 'pedidoConsumidor':
            if (!value) {
                isValid = false;
                errorMessage = 'Este campo es obligatorio';
            } else if (value.length < 10) {
                isValid = false;
                errorMessage = 'Debe tener al menos 10 caracteres';
            }
            break;
    }
    
    // Aplicar estilos de validación
    if (isValid) {
        field.classList.remove('error');
        field.classList.add('success');
        removeFieldError(field);
    } else {
        field.classList.remove('success');
        field.classList.add('error');
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function validateDocumentNumber(number, type) {
    const cleanNumber = number.replace(/[^0-9]/g, '');
    
    switch(type) {
        case 'DNI':
            if (cleanNumber.length !== 8) {
                return { isValid: false, message: 'El DNI debe tener 8 dígitos' };
            }
            break;
            
        case 'CE':
            if (cleanNumber.length < 8 || cleanNumber.length > 12) {
                return { isValid: false, message: 'El CE debe tener entre 8 y 12 dígitos' };
            }
            break;
            
        case 'PASAPORTE':
            if (number.length < 6 || number.length > 12) {
                return { isValid: false, message: 'El pasaporte debe tener entre 6 y 12 caracteres' };
            }
            break;
            
        case 'RUC':
            if (cleanNumber.length !== 11) {
                return { isValid: false, message: 'El RUC debe tener 11 dígitos' };
            }
            if (!validateRUC(cleanNumber)) {
                return { isValid: false, message: 'RUC inválido' };
            }
            break;
            
        default:
            return { isValid: false, message: 'Seleccione un tipo de documento' };
    }
    
    return { isValid: true, message: '' };
}

function validateRUC(ruc) {
    // Validación básica de RUC peruano
    if (ruc.length !== 11) return false;
    
    const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    
    for (let i = 0; i < 10; i++) {
        sum += parseInt(ruc[i]) * weights[i];
    }
    
    const remainder = sum % 11;
    const digit = remainder < 2 ? remainder : 11 - remainder;
    
    return digit === parseInt(ruc[10]);
}

function setupDocumentValidation() {
    const tipoDocumento = document.getElementById('tipoDocumento');
    const numeroDocumento = document.getElementById('numeroDocumento');
    
    tipoDocumento.addEventListener('change', function() {
        numeroDocumento.value = '';
        clearFieldError(numeroDocumento);
        
        // Actualizar placeholder según el tipo
        switch(this.value) {
            case 'DNI':
                numeroDocumento.placeholder = '12345678';
                numeroDocumento.maxLength = 8;
                break;
            case 'CE':
                numeroDocumento.placeholder = '123456789012';
                numeroDocumento.maxLength = 12;
                break;
            case 'PASAPORTE':
                numeroDocumento.placeholder = 'ABC123456';
                numeroDocumento.maxLength = 12;
                break;
            case 'RUC':
                numeroDocumento.placeholder = '12345678901';
                numeroDocumento.maxLength = 11;
                break;
            default:
                numeroDocumento.placeholder = '';
                numeroDocumento.maxLength = '';
        }
    });
}

function setupPhoneFormatting() {
    const telefonoInput = document.getElementById('telefono');
    
    telefonoInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        
        // Agregar +51 si no está presente
        if (value.length > 0 && !value.startsWith('51')) {
            if (value.startsWith('9')) {
                value = '51' + value;
            }
        }
        
        // Formatear: +51 999 999 999
        if (value.length >= 2) {
            if (value.startsWith('51') && value.length >= 11) {
                value = value.substring(0, 11);
                this.value = `+${value.substring(0, 2)} ${value.substring(2, 5)} ${value.substring(5, 8)} ${value.substring(8, 11)}`;
            }
        }
    });
}

function animateFormSections() {
    const sections = document.querySelectorAll('.border-b');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s ease';
        observer.observe(section);
    });
}

function setupAutoSave() {
    const form = document.getElementById('reclamacionForm');
    const inputs = form.querySelectorAll('input, textarea, select');
    
    // Cargar datos guardados
    loadSavedData();
    
    // Guardar en cada cambio
    inputs.forEach(input => {
        input.addEventListener('change', saveFormData);
        if (input.type !== 'radio' && input.type !== 'checkbox') {
            input.addEventListener('input', debounce(saveFormData, 1000));
        }
    });
}

function saveFormData() {
    const form = document.getElementById('reclamacionForm');
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    localStorage.setItem('reclamacionForm', JSON.stringify(data));
    
    // Mostrar indicador de guardado
    showAutoSaveIndicator();
}

function loadSavedData() {
    const savedData = localStorage.getItem('reclamacionForm');
    if (!savedData) return;
    
    try {
        const data = JSON.parse(savedData);
        
        Object.keys(data).forEach(key => {
            const field = document.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'radio') {
                    const radioOption = document.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if (radioOption) radioOption.checked = true;
                } else if (field.type === 'checkbox') {
                    field.checked = data[key] === 'on';
                } else {
                    field.value = data[key];
                }
            }
        });
        
        showAlert('info', 'Se han cargado los datos guardados automáticamente', 3000);
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

function showAutoSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    indicator.innerHTML = '<span class="material-icons mr-1 text-sm">check</span>Guardado automáticamente';
    
    document.body.appendChild(indicator);
    
    setTimeout(() => {
        indicator.remove();
    }, 2000);
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validar todos los campos
    const isFormValid = validateForm();
    
    if (!isFormValid) {
        showAlert('error', 'Por favor, complete todos los campos obligatorios correctamente');
        return;
    }
    
    // Mostrar estado de carga
    showLoading(true);
    
    // Simular envío (aquí iría la llamada real al servidor)
    setTimeout(() => {
        submitReclamacion();
    }, 2000);
}

function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], textarea[required], select[required]');
    const radioGroups = ['tipoBien', 'tipoReclamacion'];
    const checkbox = document.getElementById('aceptaTerminos');
    
    let isValid = true;
    
    // Validar campos requeridos
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Validar grupos de radio
    radioGroups.forEach(groupName => {
        const checked = document.querySelector(`input[name="${groupName}"]:checked`);
        if (!checked) {
            isValid = false;
            showAlert('error', `Debe seleccionar una opción en ${groupName === 'tipoBien' ? 'Tipo de Bien' : 'Tipo de Reclamación'}`);
        }
    });
    
    // Validar checkbox de términos
    if (!checkbox.checked) {
        isValid = false;
        showAlert('error', 'Debe aceptar los términos y condiciones');
    }
    
    return isValid;
}

function submitReclamacion() {
    const formData = new FormData(document.getElementById('reclamacionForm'));
    
    // Convertir FormData a objeto
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Agregar timestamp
    data.fechaReclamacion = new Date().toISOString();
    data.numeroReclamacion = generateReclamacionNumber();
    
    // Aquí iría la llamada al servidor
    console.log('Datos de reclamación:', data);
    
    // Simular respuesta exitosa
    setTimeout(() => {
        showLoading(false);
        showSuccessMessage(data.numeroReclamacion);
        clearSavedData();
    }, 1000);
}

function generateReclamacionNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `REC-${year}${month}${day}-${random}`;
}

function showSuccessMessage(numeroReclamacion) {
    const message = `
        <div class="text-center">
            <div class="mb-4">
                <span class="material-icons text-6xl text-green-500">check_circle</span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">¡Reclamación Enviada Exitosamente!</h3>
            <p class="text-gray-600 mb-4">Su reclamación ha sido registrada con el número:</p>
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p class="text-lg font-bold text-green-800">${numeroReclamacion}</p>
            </div>
            <p class="text-sm text-gray-500 mb-6">
                Recibirá una respuesta dentro de 30 días calendario. 
                Guarde este número para futuras consultas.
            </p>
            <div class="flex gap-4 justify-center">
                <button onclick="window.print()" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
                    <span class="material-icons mr-1">print</span>Imprimir
                </button>
                <button onclick="location.reload()" class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600">
                    <span class="material-icons mr-1">refresh</span>Nueva Reclamación
                </button>
            </div>
        </div>
    `;
    
    showModal('Reclamación Registrada', message);
}

function showLoading(show) {
    const form = document.getElementById('reclamacionForm');
    const submitButton = document.getElementById('submitButton');
    
    if (show) {
        form.classList.add('loading');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="material-icons animate-spin mr-2">refresh</span>Enviando...';
    } else {
        form.classList.remove('loading');
        submitButton.disabled = false;
        submitButton.innerHTML = '<span class="material-icons mr-2">send</span>Enviar Reclamación';
    }
}

function limpiarFormulario() {
    if (confirm('¿Está seguro que desea limpiar todos los campos del formulario?')) {
        document.getElementById('reclamacionForm').reset();
        clearAllFieldErrors();
        clearSavedData();
        showAlert('info', 'Formulario limpiado correctamente');
    }
}

function clearSavedData() {
    localStorage.removeItem('reclamacionForm');
}

function clearAllFieldErrors() {
    const fields = document.querySelectorAll('.error, .success');
    fields.forEach(field => {
        field.classList.remove('error', 'success');
    });
    
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(message => message.remove());
}

function showFieldError(field, message) {
    removeFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function removeFieldError(field) {
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function clearFieldError(field) {
    field.classList.remove('error');
    removeFieldError(field);
}

function showAlert(type, message, duration = 5000) {
    const alertContainer = document.getElementById('alertContainer');
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} p-4 rounded-lg mb-4 flex items-center`;
    
    const icon = type === 'error' ? 'error' : type === 'success' ? 'check_circle' : 'info';
    
    alertDiv.innerHTML = `
        <span class="material-icons mr-3">${icon}</span>
        <span class="flex-1">${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-3 text-gray-500 hover:text-gray-700">
            <span class="material-icons">close</span>
        </button>
    `;
    
    alertContainer.appendChild(alertDiv);
    
    if (duration > 0) {
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, duration);
    }
}

function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold">${title}</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <span class="material-icons">close</span>
                </button>
            </div>
            <div>${content}</div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar con Escape
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Utilidad para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Función para imprimir
function printReclamacion() {
    window.print();
}

// Exportar funciones globales
window.limpiarFormulario = limpiarFormulario;
window.printReclamacion = printReclamacion;