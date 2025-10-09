// Profile Management JavaScript - Enhanced Version
// Handles user profile editing, password changes, and section navigation

let editingFields = new Set();
let hasChanges = false;
let originalValues = {};

/**
 * Shows the selected section and updates navigation
 * @param {string} sectionName - The name of the section to show
 */
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section with smooth animation
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.style.opacity = '0';
        targetSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            targetSection.style.transition = 'all 0.3s ease-out';
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
        }, 10);
    }
    
    // Update navigation with enhanced styling
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active', 'bg-blue-50', 'text-blue-700');
        button.classList.add('text-gray-700', 'hover:bg-blue-50', 'hover:text-blue-700');
        
        // Reset icon colors
        const icon = button.querySelector('div');
        if (icon) {
            icon.classList.remove('bg-blue-200', 'text-blue-600', 'bg-green-200', 'text-green-600', 'bg-purple-200', 'text-purple-600');
            icon.classList.add('bg-gray-100', 'text-gray-600');
        }
        
        // Reset text colors
        const description = button.querySelector('.text-sm');
        if (description) {
            description.classList.remove('text-blue-500');
            description.classList.add('text-gray-500');
        }
    });
    
    const activeButton = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeButton) {
        activeButton.classList.add('active', 'bg-blue-50', 'text-blue-700');
        activeButton.classList.remove('text-gray-700');
        
        // Update icon colors based on section
        const icon = activeButton.querySelector('div');
        const description = activeButton.querySelector('.text-sm');
        
        if (icon && description) {
            if (sectionName === 'personal') {
                icon.classList.add('bg-blue-200', 'text-blue-600');
                description.classList.add('text-blue-500');
            } else if (sectionName === 'security') {
                icon.classList.add('bg-green-200', 'text-green-600');
                description.classList.add('text-blue-500');
            } else if (sectionName === 'preferences') {
                icon.classList.add('bg-purple-200', 'text-purple-600');
                description.classList.add('text-blue-500');
            }
            icon.classList.remove('bg-gray-100', 'text-gray-600');
            description.classList.remove('text-gray-500');
        }
    }
}

/**
 * Toggles edit mode for a specific field
 * @param {string} fieldName - The name of the field to toggle
 */
function toggleEdit(fieldName) {
    const input = document.querySelector(`input[name="${fieldName}"]`);
    const button = input.closest('.bg-gray-50').querySelector('button');
    const container = input.closest('.bg-gray-50');
    
    if (!input || !button || !container) return;
    
    if (editingFields.has(fieldName)) {
        // Stop editing
        input.readOnly = true;
        input.classList.remove('border-2', 'border-blue-500', 'bg-white', 'shadow-md');
        button.innerHTML = `
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Editar
        `;
        button.classList.remove('text-red-600', 'hover:text-red-800', 'hover:bg-red-50');
        button.classList.add('text-blue-600', 'hover:text-blue-800', 'hover:bg-blue-50');
        container.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
        container.classList.add('hover:bg-gray-100');
        editingFields.delete(fieldName);
        
        // Restore original value if not saved
        if (originalValues[fieldName] !== undefined) {
            input.value = originalValues[fieldName];
        }
    } else {
        // Start editing
        originalValues[fieldName] = input.value;
        input.readOnly = false;
        input.classList.add('border-2', 'border-blue-500', 'bg-white', 'shadow-md');
        input.focus();
        button.innerHTML = `
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Cancelar
        `;
        button.classList.add('text-red-600', 'hover:text-red-800', 'hover:bg-red-50');
        button.classList.remove('text-blue-600', 'hover:text-blue-800', 'hover:bg-blue-50');
        container.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
        container.classList.remove('hover:bg-gray-100');
        editingFields.add(fieldName);
        hasChanges = true;
    }
    
    // Show/hide save button with animation
    const saveContainer = document.getElementById('saveButtonContainer');
    if (saveContainer) {
        if (editingFields.size > 0) {
            saveContainer.classList.remove('hidden');
            setTimeout(() => {
                saveContainer.style.opacity = '1';
                saveContainer.style.transform = 'translateY(0)';
            }, 10);
        } else {
            saveContainer.style.opacity = '0';
            saveContainer.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                saveContainer.classList.add('hidden');
            }, 200);
        }
    }
}

/**
 * Cancels all changes and restores original values
 */
function cancelChanges() {
    editingFields.forEach(fieldName => {
        const input = document.querySelector(`input[name="${fieldName}"]`);
        if (input && originalValues[fieldName] !== undefined) {
            input.value = originalValues[fieldName];
        }
        toggleEdit(fieldName);
    });
    hasChanges = false;
}

/**
 * Shows an alert message with appropriate styling
 * @param {string} message - The message to display
 * @param {string} type - The type of alert ('success' or 'error')
 */
function showAlert(message, type = 'success') {
    const alertDiv = document.getElementById('alertMessage');
    if (!alertDiv) return;
    
    const baseClasses = 'mb-6 p-4 rounded-xl border-l-4 shadow-sm';
    
    if (type === 'success') {
        alertDiv.className = `${baseClasses} bg-green-50 text-green-700 border-green-400`;
    } else {
        alertDiv.className = `${baseClasses} bg-red-50 text-red-700 border-red-400`;
    }
    
    alertDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${type === 'success' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}"/>
            </svg>
            <span class="font-medium">${message}</span>
        </div>
    `;
    alertDiv.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            alertDiv.classList.add('hidden');
            alertDiv.style.opacity = '1';
            alertDiv.style.transform = 'translateY(0)';
        }, 300);
    }, 5000);
}

/**
 * Shows a password-specific alert message
 * @param {string} message - The message to display
 * @param {string} type - The type of alert ('success' or 'error')
 */
function showPasswordAlert(message, type = 'success') {
    const alertDiv = document.getElementById('passwordAlertMessage');
    if (!alertDiv) return;
    
    const baseClasses = 'mb-6 p-4 rounded-xl border-l-4 shadow-sm';
    
    if (type === 'success') {
        alertDiv.className = `${baseClasses} bg-green-50 text-green-700 border-green-400`;
    } else {
        alertDiv.className = `${baseClasses} bg-red-50 text-red-700 border-red-400`;
    }
    
    alertDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${type === 'success' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}"/>
            </svg>
            <span class="font-medium">${message}</span>
        </div>
    `;
    alertDiv.classList.remove('hidden');
    
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            alertDiv.classList.add('hidden');
            alertDiv.style.opacity = '1';
            alertDiv.style.transform = 'translateY(0)';
        }, 300);
    }, 5000);
}

/**
 * Enhanced password strength checker
 * @param {string} password - The password to check
 */
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthIndicator || !strengthBar || !strengthText) return;
    
    if (!password) {
        strengthIndicator.classList.add('hidden');
        return;
    }
    
    strengthIndicator.classList.remove('hidden');
    
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('al menos 8 caracteres');
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('letras mayúsculas');
    
    // Lowercase check
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('letras minúsculas');
    
    // Number check
    if (/\d/.test(password)) score += 1;
    else feedback.push('números');
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('símbolos especiales');
    
    // Update visual indicator
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const texts = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
    const widths = ['20%', '40%', '60%', '80%', '100%'];
    
    strengthBar.className = `h-2 rounded-full transition-all duration-300 ${colors[score - 1] || 'bg-gray-300'}`;
    strengthBar.style.width = widths[score - 1] || '0%';
    
    if (score === 0) {
        strengthText.textContent = 'Ingresa una contraseña';
    } else if (score < 3) {
        strengthText.textContent = `${texts[score - 1]} - Añade: ${feedback.slice(0, 2).join(', ')}`;
    } else {
        strengthText.textContent = texts[score - 1];
    }
}

/**
 * Initialize profile functionality when DOM is loaded
 */
function initializeProfile() {
    // Profile form submission with loading state
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            const submitButton = document.querySelector('#saveButtonContainer button[type="submit"]');
            
            if (!submitButton) return;
            
            const originalText = submitButton.innerHTML;
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
            `;
            
            try {
                const response = await fetch('/profile/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showAlert(result.message || 'Perfil actualizado correctamente', 'success');
                    // Reset editing state
                    editingFields.clear();
                    originalValues = {};
                    document.querySelectorAll('input').forEach(input => {
                        input.readOnly = true;
                        input.classList.remove('border-2', 'border-blue-500', 'bg-white', 'shadow-md');
                    });
                    document.querySelectorAll('button[onclick^="toggleEdit"]').forEach(button => {
                        button.innerHTML = `
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Editar
                        `;
                        button.classList.remove('text-red-600', 'hover:text-red-800', 'hover:bg-red-50');
                        button.classList.add('text-blue-600', 'hover:text-blue-800', 'hover:bg-blue-50');
                    });
                    document.querySelectorAll('.bg-gray-50').forEach(container => {
                        container.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
                        container.classList.add('hover:bg-gray-100');
                    });
                    const saveContainer = document.getElementById('saveButtonContainer');
                    if (saveContainer) {
                        saveContainer.classList.add('hidden');
                    }
                    hasChanges = false;
                } else {
                    showAlert(result.message || 'Error al actualizar el perfil', 'error');
                }
            } catch (error) {
                showAlert('Error de conexión. Intente nuevamente.', 'error');
            } finally {
                // Restore button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    }

    // Enhanced password form submission
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            const submitButton = this.querySelector('button[type="submit"]');
            
            if (!submitButton) return;
            
            const originalText = submitButton.innerHTML;
            
            if (data.new_password !== data.confirm_password) {
                showPasswordAlert('Las contraseñas no coinciden', 'error');
                return;
            }
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cambiando...
            `;
            
            try {
                const response = await fetch('/profile/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showPasswordAlert(result.message || 'Contraseña cambiada exitosamente', 'success');
                    this.reset();
                    const passwordStrength = document.getElementById('passwordStrength');
                    if (passwordStrength) {
                        passwordStrength.classList.add('hidden');
                    }
                } else {
                    showPasswordAlert(result.message || 'Error al cambiar la contraseña', 'error');
                }
            } catch (error) {
                showPasswordAlert('Error de conexión. Intente nuevamente.', 'error');
            } finally {
                // Restore button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    }

    // Add password strength checking
    const newPasswordInput = document.querySelector('input[name="new_password"]');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function(e) {
            checkPasswordStrength(e.target.value);
        });
    }

    // Add initial animation to the page
    const mainContent = document.querySelector('.container');
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            mainContent.style.transition = 'all 0.5s ease-out';
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Set initial save button styles
    const saveContainer = document.getElementById('saveButtonContainer');
    if (saveContainer) {
        saveContainer.style.transition = 'all 0.2s ease-out';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeProfile);

/**
 * Toggles edit mode for a specific field
 * @param {string} fieldName - The name of the field to toggle
 */
function toggleEdit(fieldName) {
    const input = document.querySelector(`input[name="${fieldName}"]`);
    const button = input.closest('.border').querySelector('button');
    const container = input.closest('.border');
    
    if (!input || !button || !container) return;
    
    if (editingFields.has(fieldName)) {
        // Stop editing
        input.readOnly = true;
        input.classList.remove('bg-white', 'border-blue-500');
        button.textContent = 'Editar';
        button.classList.remove('text-red-600');
        button.classList.add('text-blue-600');
        container.classList.remove('ring-2', 'ring-blue-500');
        editingFields.delete(fieldName);
        
        // Restore original value if not saved
        if (originalValues[fieldName] !== undefined) {
            input.value = originalValues[fieldName];
        }
    } else {
        // Start editing
        originalValues[fieldName] = input.value;
        input.readOnly = false;
        input.classList.add('bg-white', 'border-blue-500');
        input.focus();
        button.textContent = 'Cancelar';
        button.classList.add('text-red-600');
        button.classList.remove('text-blue-600');
        container.classList.add('ring-2', 'ring-blue-500');
        editingFields.add(fieldName);
        hasChanges = true;
    }
    
    // Show/hide save button
    const saveContainer = document.getElementById('saveButtonContainer');
    if (saveContainer) {
        if (editingFields.size > 0) {
            saveContainer.classList.remove('hidden');
        } else {
            saveContainer.classList.add('hidden');
        }
    }
}

/**
 * Cancels all changes and restores original values
 */
function cancelChanges() {
    editingFields.forEach(fieldName => {
        const input = document.querySelector(`input[name="${fieldName}"]`);
        if (input && originalValues[fieldName] !== undefined) {
            input.value = originalValues[fieldName];
        }
        toggleEdit(fieldName);
    });
    hasChanges = false;
}

/**
 * Shows an alert message with appropriate styling
 * @param {string} message - The message to display
 * @param {string} type - The type of alert ('success' or 'error')
 */
function showAlert(message, type = 'success') {
    const alertDiv = document.getElementById('alertMessage');
    if (!alertDiv) return;
    
    const baseClasses = 'mb-4 p-4 rounded-lg border';
    
    if (type === 'success') {
        alertDiv.className = `${baseClasses} bg-green-50 text-green-700 border-green-200`;
    } else {
        alertDiv.className = `${baseClasses} bg-red-50 text-red-700 border-red-200`;
    }
    
    alertDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${type === 'success' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}"/>
            </svg>
            <span>${message}</span>
        </div>
    `;
    alertDiv.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertDiv.classList.add('hidden');
    }, 5000);
}

/**
 * Shows a password-specific alert message
 * @param {string} message - The message to display
 * @param {string} type - The type of alert ('success' or 'error')
 */
function showPasswordAlert(message, type = 'success') {
    const alertDiv = document.getElementById('passwordAlertMessage');
    if (!alertDiv) return;
    
    const baseClasses = 'mb-4 p-4 rounded-lg border';
    
    if (type === 'success') {
        alertDiv.className = `${baseClasses} bg-green-50 text-green-700 border-green-200`;
    } else {
        alertDiv.className = `${baseClasses} bg-red-50 text-red-700 border-red-200`;
    }
    
    alertDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${type === 'success' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}"/>
            </svg>
            <span>${message}</span>
        </div>
    `;
    alertDiv.classList.remove('hidden');
    
    setTimeout(() => {
        alertDiv.classList.add('hidden');
    }, 5000);
}

/**
 * Enhanced password strength checker
 * @param {string} password - The password to check
 */
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthIndicator || !strengthBar || !strengthText) return;
    
    if (!password) {
        strengthIndicator.classList.add('hidden');
        return;
    }
    
    strengthIndicator.classList.remove('hidden');
    
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('al menos 8 caracteres');
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('letras mayúsculas');
    
    // Lowercase check
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('letras minúsculas');
    
    // Number check
    if (/\d/.test(password)) score += 1;
    else feedback.push('números');
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('símbolos especiales');
    
    // Update visual indicator
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const texts = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
    const widths = ['20%', '40%', '60%', '80%', '100%'];
    
    strengthBar.className = `h-2 rounded-full transition-all duration-300 ${colors[score - 1] || 'bg-gray-300'}`;
    strengthBar.style.width = widths[score - 1] || '0%';
    
    if (score === 0) {
        strengthText.textContent = 'Ingresa una contraseña';
    } else if (score < 3) {
        strengthText.textContent = `${texts[score - 1]} - Añade: ${feedback.slice(0, 2).join(', ')}`;
    } else {
        strengthText.textContent = texts[score - 1];
    }
}

/**
 * Initialize profile functionality when DOM is loaded
 */
function initializeProfile() {
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            const submitButton = this.querySelector('button[type="submit"]');
            
            if (!submitButton) return;
            
            const originalText = submitButton.innerHTML;
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = 'Guardando...';
            
            try {
                const response = await fetch('/profile/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showAlert(result.message || 'Perfil actualizado correctamente', 'success');
                    // Reset editing state
                    editingFields.clear();
                    originalValues = {};
                    document.querySelectorAll('input[readonly]').forEach(input => {
                        input.classList.remove('bg-white', 'border-blue-500');
                    });
                    document.querySelectorAll('button[type="button"]').forEach(button => {
                        if (button.textContent === 'Cancelar') {
                            button.textContent = 'Editar';
                            button.classList.remove('text-red-600');
                            button.classList.add('text-blue-600');
                        }
                    });
                    document.querySelectorAll('.border').forEach(container => {
                        container.classList.remove('ring-2', 'ring-blue-500');
                    });
                    const saveContainer = document.getElementById('saveButtonContainer');
                    if (saveContainer) {
                        saveContainer.classList.add('hidden');
                    }
                    hasChanges = false;
                } else {
                    showAlert(result.message || 'Error al actualizar el perfil', 'error');
                }
            } catch (error) {
                showAlert('Error de conexión. Intente nuevamente.', 'error');
            } finally {
                // Restore button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    }

    // Password form submission
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            const submitButton = this.querySelector('button[type="submit"]');
            
            if (!submitButton) return;
            
            const originalText = submitButton.innerHTML;
            
            if (data.new_password !== data.confirm_password) {
                showPasswordAlert('Las contraseñas no coinciden', 'error');
                return;
            }
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = 'Cambiando...';
            
            try {
                const response = await fetch('/profile/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showPasswordAlert(result.message || 'Contraseña cambiada exitosamente', 'success');
                    this.reset();
                    const passwordStrength = document.getElementById('passwordStrength');
                    if (passwordStrength) {
                        passwordStrength.classList.add('hidden');
                    }
                } else {
                    showPasswordAlert(result.message || 'Error al cambiar la contraseña', 'error');
                }
            } catch (error) {
                showPasswordAlert('Error de conexión. Intente nuevamente.', 'error');
            } finally {
                // Restore button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    }

    // Add password strength checking
    const newPasswordInput = document.querySelector('input[name="new_password"]');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function(e) {
            checkPasswordStrength(e.target.value);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeProfile);

/**
 * Toggles edit mode for a specific field
 * @param {string} fieldName - The name of the field to toggle
 */
function toggleEdit(fieldName) {
    const input = document.querySelector(`input[name="${fieldName}"]`);
    const button = input.closest('.flex').querySelector('button');
    const container = input.closest('.bg-gray-50');
    
    if (editingFields.has(fieldName)) {
        // Stop editing
        input.readOnly = true;
        input.classList.remove('border-2', 'border-blue-500', 'bg-white', 'shadow-md');
        button.innerHTML = `
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Editar
        `;
        button.classList.remove('text-red-600', 'hover:text-red-800', 'hover:bg-red-50');
        button.classList.add('text-blue-600', 'hover:text-blue-800', 'hover:bg-blue-50');
        container.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
        editingFields.delete(fieldName);
        
        // Restore original value if not saved
        if (!hasChanges) {
            input.value = originalValues[fieldName] || '';
        }
    } else {
        // Start editing
        originalValues[fieldName] = input.value;
        input.readOnly = false;
        input.classList.add('border-2', 'border-blue-500', 'bg-white', 'shadow-md');
        input.focus();
        button.innerHTML = `
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Cancelar
        `;
        button.classList.add('text-red-600', 'hover:text-red-800', 'hover:bg-red-50');
        button.classList.remove('text-blue-600', 'hover:text-blue-800', 'hover:bg-blue-50');
        container.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
        editingFields.add(fieldName);
        hasChanges = true;
    }
    
    // Show/hide save button with animation
    const saveContainer = document.getElementById('saveButtonContainer');
    if (editingFields.size > 0) {
        saveContainer.classList.remove('hidden');
        setTimeout(() => {
            saveContainer.style.opacity = '1';
            saveContainer.style.transform = 'translateY(0)';
        }, 10);
    } else {
        saveContainer.style.opacity = '0';
        saveContainer.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            saveContainer.classList.add('hidden');
        }, 200);
    }
}

/**
 * Cancels all changes and restores original values
 */
function cancelChanges() {
    // Restore all original values and stop editing
    editingFields.forEach(fieldName => {
        const input = document.querySelector(`input[name="${fieldName}"]`);
        input.value = originalValues[fieldName] || '';
        toggleEdit(fieldName);
    });
    hasChanges = false;
}

/**
 * Shows an alert message with appropriate styling
 * @param {string} message - The message to display
 * @param {string} type - The type of alert ('success' or 'error')
 */
function showAlert(message, type = 'success') {
    const alertDiv = document.getElementById('alertMessage');
    const baseClasses = 'mb-6 p-4 rounded-xl border-l-4 shadow-sm';
    
    if (type === 'success') {
        alertDiv.className = `${baseClasses} bg-green-50 text-green-700 border-green-400`;
    } else {
        alertDiv.className = `${baseClasses} bg-red-50 text-red-700 border-red-400`;
    }
    
    alertDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${type === 'success' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}"/>
            </svg>
            <span class="font-medium">${message}</span>
        </div>
    `;
    alertDiv.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            alertDiv.classList.add('hidden');
            alertDiv.style.opacity = '1';
            alertDiv.style.transform = 'translateY(0)';
        }, 300);
    }, 5000);
}

/**
 * Shows a password-specific alert message
 * @param {string} message - The message to display
 * @param {string} type - The type of alert ('success' or 'error')
 */
function showPasswordAlert(message, type = 'success') {
    const alertDiv = document.getElementById('passwordAlertMessage');
    const baseClasses = 'mb-6 p-4 rounded-xl border-l-4 shadow-sm';
    
    if (type === 'success') {
        alertDiv.className = `${baseClasses} bg-green-50 text-green-700 border-green-400`;
    } else {
        alertDiv.className = `${baseClasses} bg-red-50 text-red-700 border-red-400`;
    }
    
    alertDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${type === 'success' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}"/>
            </svg>
            <span class="font-medium">${message}</span>
        </div>
    `;
    alertDiv.classList.remove('hidden');
    
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            alertDiv.classList.add('hidden');
            alertDiv.style.opacity = '1';
            alertDiv.style.transform = 'translateY(0)';
        }, 300);
    }, 5000);
}

/**
 * Enhanced password strength checker
 * @param {string} password - The password to check
 */
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!password) {
        strengthIndicator.classList.add('hidden');
        return;
    }
    
    strengthIndicator.classList.remove('hidden');
    
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('al menos 8 caracteres');
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('letras mayúsculas');
    
    // Lowercase check
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('letras minúsculas');
    
    // Number check
    if (/\d/.test(password)) score += 1;
    else feedback.push('números');
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('símbolos especiales');
    
    // Update visual indicator
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const texts = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
    const widths = ['20%', '40%', '60%', '80%', '100%'];
    
    strengthBar.className = `h-2 rounded-full transition-all duration-300 ${colors[score - 1] || 'bg-gray-300'}`;
    strengthBar.style.width = widths[score - 1] || '0%';
    
    if (score === 0) {
        strengthText.textContent = 'Ingresa una contraseña';
    } else if (score < 3) {
        strengthText.textContent = `${texts[score - 1]} - Añade: ${feedback.slice(0, 2).join(', ')}`;
    } else {
        strengthText.textContent = texts[score - 1];
    }
}

/**
 * Initialize profile functionality when DOM is loaded
 */
function initializeProfile() {
    // Profile form submission with loading state
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            const submitButton = document.querySelector('#saveButtonContainer button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
            `;
            
            try {
                const response = await fetch('/profile/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showAlert(result.message || 'Perfil actualizado correctamente', 'success');
                    // Reset editing state
                    editingFields.clear();
                    originalValues = {};
                    document.querySelectorAll('input').forEach(input => {
                        input.readOnly = true;
                        input.classList.remove('border-2', 'border-blue-500', 'bg-white', 'shadow-md');
                    });
                    document.querySelectorAll('button[onclick^="toggleEdit"]').forEach(button => {
                        button.innerHTML = `
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Editar
                        `;
                        button.classList.remove('text-red-600', 'hover:text-red-800', 'hover:bg-red-50');
                        button.classList.add('text-blue-600', 'hover:text-blue-800', 'hover:bg-blue-50');
                    });
                    document.querySelectorAll('.bg-gray-50').forEach(container => {
                        container.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
                    });
                    document.getElementById('saveButtonContainer').classList.add('hidden');
                    hasChanges = false;
                } else {
                    showAlert(result.message || 'Error al actualizar el perfil', 'error');
                }
            } catch (error) {
                showAlert('Error de conexión. Intente nuevamente.', 'error');
            } finally {
                // Restore button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    }

    // Enhanced password form submission
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            if (data.new_password !== data.confirm_password) {
                showPasswordAlert('Las contraseñas no coinciden', 'error');
                return;
            }
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cambiando...
            `;
            
            try {
                const response = await fetch('/profile/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showPasswordAlert(result.message || 'Contraseña cambiada exitosamente', 'success');
                    this.reset();
                    document.getElementById('passwordStrength').classList.add('hidden');
                } else {
                    showPasswordAlert(result.message || 'Error al cambiar la contraseña', 'error');
                }
            } catch (error) {
                showPasswordAlert('Error de conexión. Intente nuevamente.', 'error');
            } finally {
                // Restore button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    }

    // Add password strength checking
    const newPasswordInput = document.querySelector('input[name="new_password"]');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function(e) {
            checkPasswordStrength(e.target.value);
        });
    }

    // Add initial animation to the page
    const mainContent = document.querySelector('.container');
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            mainContent.style.transition = 'all 0.5s ease-out';
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Set initial save button styles
    const saveContainer = document.getElementById('saveButtonContainer');
    if (saveContainer) {
        saveContainer.style.transition = 'all 0.2s ease-out';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeProfile);