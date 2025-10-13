document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentStep = 1;
    const totalSteps = 4;
    const form = document.getElementById('enrollmentForm');
    const errorDisplay = document.getElementById('errorDisplay');
    const successDisplay = document.getElementById('successDisplay');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Elementos de pasos
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const stepContents = document.querySelectorAll('.step-content');

    // Botones de navegación
    const nextButtons = {
        1: document.getElementById('nextStep1'),
        2: document.getElementById('nextStep2'),
        3: document.getElementById('nextStep3')
    };

    const prevButtons = {
        2: document.getElementById('prevStep2'),
        3: document.getElementById('prevStep3'),
        4: document.getElementById('prevStep4')
    };

    const submitButton = document.getElementById('submitButton');

    // Inicialización
    init();

    function init() {
        setupEventListeners();
        loadUserData();
        updateStepDisplay();
        setupValidation();
    }

    function setupEventListeners() {
        // Botones de navegación
        Object.keys(nextButtons).forEach(step => {
            if (nextButtons[step]) {
                nextButtons[step].addEventListener('click', () => nextStep(parseInt(step)));
            }
        });

        Object.keys(prevButtons).forEach(step => {
            if (prevButtons[step]) {
                prevButtons[step].addEventListener('click', () => prevStep(parseInt(step)));
            }
        });

        // Envío del formulario
        form.addEventListener('submit', handleSubmit);

        // Validación en tiempo real
        setupRealTimeValidation();

        // Eventos específicos
        setupSpecialEvents();
    }

    function setupRealTimeValidation() {
        // Validación para todos los campos
        const allInputs = form.querySelectorAll('input, select, textarea');
        allInputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });

        // Validaciones específicas
        setupDNIValidation();
        setupPhoneValidation();
        setupBirthDateValidation();
        setupProgramValidation();
    }

    function setupSpecialEvents() {
        // Cálculo de edad automático
        const birthDateInput = document.getElementById('birthDate');
        birthDateInput.addEventListener('change', calculateAge);

        // Mostrar detalles del programa
        const programSelect = document.getElementById('program');
        programSelect.addEventListener('change', showProgramDetails);

        // Autocompletar contacto de emergencia
        const parentNameInput = document.getElementById('parentName');
        const parentPhoneInput = document.getElementById('parentPhone');
        
        parentNameInput.addEventListener('blur', () => {
            const emergencyContactInput = document.getElementById('emergencyContact');
            if (!emergencyContactInput.value && parentNameInput.value) {
                emergencyContactInput.value = parentNameInput.value;
            }
        });

        parentPhoneInput.addEventListener('blur', () => {
            const emergencyPhoneInput = document.getElementById('emergencyPhone');
            if (!emergencyPhoneInput.value && parentPhoneInput.value) {
                emergencyPhoneInput.value = parentPhoneInput.value;
            }
        });
    }

    function setupDNIValidation() {
        const dniInput = document.getElementById('parentDNI');
        dniInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 8);
        });
    }

    function setupPhoneValidation() {
        const phoneInputs = ['parentPhone', 'emergencyPhone'];
        phoneInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            input.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '').substring(0, 9);
            });
        });
    }

    function setupBirthDateValidation() {
        const birthDateInput = document.getElementById('birthDate');
        
        // Establecer fecha máxima (hoy) y mínima (12 años atrás)
        const today = new Date();
        const maxDate = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 12);
        
        birthDateInput.max = today.toISOString().split('T')[0];
        birthDateInput.min = minDate.toISOString().split('T')[0];
    }

    function setupProgramValidation() {
        const programSelect = document.getElementById('program');
        programSelect.addEventListener('change', validateAgeForProgram);
    }

    function calculateAge() {
        const birthDateInput = document.getElementById('birthDate');
        const ageDisplay = document.getElementById('ageDisplay');
        
        if (birthDateInput.value) {
            const birthDate = new Date(birthDateInput.value);
            const today = new Date();
            const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
            
            ageDisplay.textContent = `Edad: ${age} años`;
            ageDisplay.className = age >= 0 && age <= 12 ? 'text-sm text-green-600 mt-1' : 'text-sm text-red-600 mt-1';
            
            validateAgeForProgram();
        } else {
            ageDisplay.textContent = '';
        }
    }

    function validateAgeForProgram() {
        const birthDateInput = document.getElementById('birthDate');
        const programSelect = document.getElementById('program');
        const ageCompatibility = document.getElementById('ageCompatibility');
        
        if (birthDateInput.value && programSelect.value) {
            const birthDate = new Date(birthDateInput.value);
            const today = new Date();
            const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
            
            const selectedOption = programSelect.options[programSelect.selectedIndex];
            const ageRange = selectedOption.getAttribute('data-age-range');
            
            // Parsear rango de edad (ejemplo: "3-6 años")
            const ageRangeMatch = ageRange.match(/(\d+)-(\d+)/);
            if (ageRangeMatch) {
                const minAge = parseInt(ageRangeMatch[1]);
                const maxAge = parseInt(ageRangeMatch[2]);
                
                if (age >= minAge && age <= maxAge) {
                    ageCompatibility.innerHTML = `<span class="text-green-600">✓ La edad del estudiante es compatible con este programa</span>`;
                } else {
                    ageCompatibility.innerHTML = `<span class="text-red-600">⚠ Este programa es para niños de ${minAge} a ${maxAge} años. El estudiante tiene ${age} años.</span>`;
                }
            }
        }
    }

    function showProgramDetails() {
        const programSelect = document.getElementById('program');
        const programDetails = document.getElementById('programDetails');
        const programDescription = document.getElementById('programDescription');
        const programPrice = document.getElementById('programPrice');
        
        if (programSelect.value) {
            const selectedOption = programSelect.options[programSelect.selectedIndex];
            const description = selectedOption.getAttribute('data-description');
            const price = selectedOption.getAttribute('data-price');
            
            programDescription.textContent = description;
            programPrice.textContent = `Precio: S/. ${parseFloat(price).toFixed(2)}`;
            programDetails.classList.remove('hidden');
            
            validateAgeForProgram();
        } else {
            programDetails.classList.add('hidden');
        }
    }

    async function loadUserData() {
        try {
            const response = await fetch('/api/user/profile');
            if (response.ok) {
                const userData = await response.json();
                
                // Precompletar datos del usuario
                document.getElementById('parentName').value = userData.name || '';
                document.getElementById('parentEmail').value = userData.email || '';
                document.getElementById('parentPhone').value = userData.phone || '';
                document.getElementById('parentAddress').value = userData.address || '';
                
                // Preseleccionar relación basada en el rol
                const relationshipSelect = document.getElementById('relationship');
                if (userData.role && ['padre', 'madre', 'tutor'].includes(userData.role)) {
                    relationshipSelect.value = userData.role;
                }
            }
        } catch (error) {
            console.log('No se pudieron cargar los datos del usuario:', error);
        }
    }

    function nextStep(step) {
        if (validateCurrentStep()) {
            currentStep = step + 1;
            updateStepDisplay();
            
            if (currentStep === 4) {
                updateSummary();
            }
        }
    }

    function prevStep(step) {
        currentStep = step - 1;
        updateStepDisplay();
    }

    function updateStepDisplay() {
        // Actualizar indicadores de paso
        stepIndicators.forEach((indicator, index) => {
            const stepNumber = index + 1;
            indicator.classList.remove('active', 'completed');
            
            if (stepNumber < currentStep) {
                indicator.classList.add('completed');
            } else if (stepNumber === currentStep) {
                indicator.classList.add('active');
            }
        });

        // Mostrar/ocultar contenido de pasos
        stepContents.forEach((content, index) => {
            const stepNumber = index + 1;
            if (stepNumber === currentStep) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });

        // Scroll al inicio del formulario
        document.querySelector('.bg-white.shadow-lg').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    function validateCurrentStep() {
        let isValid = true;
        const currentStepElement = document.getElementById(`step${currentStep}`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        
        hideMessages();
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            showError('Por favor, complete todos los campos requeridos correctamente.');
        }

        return isValid;
    }

    function validateField(field) {
        const fieldContainer = field.closest('.form-field');
        const messageContainer = fieldContainer?.querySelector('.field-message');
        
        let isValid = true;
        let message = '';

        // Limpiar estado previo
        clearFieldError(field);

        // Validar campo requerido
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            message = 'Este campo es requerido';
        }
        // Validaciones específicas por tipo de campo
        else if (field.value.trim()) {
            switch (field.id) {
                case 'parentDNI':
                    if (!/^\d{8}$/.test(field.value)) {
                        isValid = false;
                        message = 'El DNI debe tener 8 dígitos';
                    }
                    break;
                case 'parentEmail':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                        isValid = false;
                        message = 'Ingrese un email válido';
                    }
                    break;
                case 'parentPhone':
                case 'emergencyPhone':
                    if (!/^\d{9}$/.test(field.value)) {
                        isValid = false;
                        message = 'El teléfono debe tener 9 dígitos';
                    }
                    break;
                case 'birthDate':
                    const birthDate = new Date(field.value);
                    const today = new Date();
                    const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
                    if (age < 0 || age > 12) {
                        isValid = false;
                        message = 'La edad debe estar entre 0 y 12 años';
                    }
                    break;
            }
        }

        // Aplicar estado visual
        if (fieldContainer) {
            if (!isValid) {
                fieldContainer.classList.add('error');
                fieldContainer.classList.remove('success');
                if (messageContainer) {
                    messageContainer.innerHTML = `<span class="field-error">${message}</span>`;
                }
            } else if (field.value.trim()) {
                fieldContainer.classList.add('success');
                fieldContainer.classList.remove('error');
                if (messageContainer) {
                    messageContainer.innerHTML = `<span class="field-success">✓</span>`;
                }
            }
        }

        return isValid;
    }

    function clearFieldError(field) {
        const fieldContainer = field.closest('.form-field');
        const messageContainer = fieldContainer?.querySelector('.field-message');
        
        if (fieldContainer) {
            fieldContainer.classList.remove('error');
            if (!field.value.trim()) {
                fieldContainer.classList.remove('success');
                if (messageContainer) {
                    messageContainer.innerHTML = '';
                }
            }
        }
    }

    function updateSummary() {
        // Actualizar resumen en el paso 4
        document.getElementById('summaryParentName').textContent = document.getElementById('parentName').value;
        document.getElementById('summaryParentDNI').textContent = document.getElementById('parentDNI').value;
        document.getElementById('summaryParentEmail').textContent = document.getElementById('parentEmail').value;
        document.getElementById('summaryParentPhone').textContent = document.getElementById('parentPhone').value;
        document.getElementById('summaryRelationship').textContent = document.getElementById('relationship').value;
        
        document.getElementById('summaryStudentName').textContent = 
            `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`;
        document.getElementById('summaryBirthDate').textContent = 
            new Date(document.getElementById('birthDate').value).toLocaleDateString('es-PE');
        
        const birthDate = new Date(document.getElementById('birthDate').value);
        const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        document.getElementById('summaryAge').textContent = `${age} años`;
        
        document.getElementById('summaryBloodType').textContent = document.getElementById('bloodType').value;
        document.getElementById('summaryEmergencyContact').textContent = 
            `${document.getElementById('emergencyContact').value} - ${document.getElementById('emergencyPhone').value}`;
        
        const programSelect = document.getElementById('program');
        const selectedOption = programSelect.options[programSelect.selectedIndex];
        document.getElementById('summaryProgramName').textContent = selectedOption.text;
        
        const price = selectedOption.getAttribute('data-price');
        document.getElementById('summaryProgramPrice').textContent = `S/. ${parseFloat(price).toFixed(2)}`;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (!validateCurrentStep()) {
            return;
        }

        if (!document.getElementById('terms').checked) {
            showError('Debe aceptar los términos y condiciones');
            return;
        }

        showLoading(true);
        
        try {
            const formData = {
                parentName: document.getElementById('parentName').value,
                parentDNI: document.getElementById('parentDNI').value,
                parentEmail: document.getElementById('parentEmail').value,
                parentPhone: document.getElementById('parentPhone').value,
                parentAddress: document.getElementById('parentAddress').value,
                parentOccupation: document.getElementById('parentOccupation').value,
                relationship: document.getElementById('relationship').value,
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                birthDate: document.getElementById('birthDate').value,
                bloodType: document.getElementById('bloodType').value,
                allergies: document.getElementById('allergies').value || 'Ninguna',
                medicalNotes: document.getElementById('medicalNotes').value || 'Ninguna',
                emergencyContact: document.getElementById('emergencyContact').value,
                emergencyPhone: document.getElementById('emergencyPhone').value,
                programId: document.getElementById('program').value
            };

            const response = await fetch('/api/enrollment/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('¡Matrícula enviada exitosamente! Será redirigido en unos segundos...');
                setTimeout(() => {
                    window.location.href = '/enrollment/success';
                }, 3000);
            } else {
                showError(data.message || 'Error al procesar la matrícula');
            }
        } catch (error) {
            showError('Error de conexión. Por favor, intente nuevamente.');
        } finally {
            showLoading(false);
        }
    }

    function setupValidation() {
        // Configurar validación HTML5 personalizada
        const form = document.getElementById('enrollmentForm');
        form.noValidate = true; // Desactivar validación HTML5 nativa para usar la personalizada
    }

    function showError(message) {
        hideMessages();
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorDisplay.classList.remove('hidden');
        errorDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showSuccess(message) {
        hideMessages();
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = message;
        successDisplay.classList.remove('hidden');
        successDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideMessages() {
        errorDisplay.classList.add('hidden');
        successDisplay.classList.add('hidden');
    }

    function showLoading(show) {
        if (show) {
            loadingOverlay.classList.remove('hidden');
            submitButton.disabled = true;
        } else {
            loadingOverlay.classList.add('hidden');
            submitButton.disabled = false;
        }
    }
});