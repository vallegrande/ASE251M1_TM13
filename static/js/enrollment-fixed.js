// Debug y solución para el formulario de matrícula
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando formulario de matrícula...');
    
    // Variables principales
    let currentStep = 1;
    const form = document.getElementById('enrollmentForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const errorDisplay = document.getElementById('errorDisplay');
    const successDisplay = document.getElementById('successDisplay');
    
    // Verificar que los elementos existen
    if (!form) {
        console.error('❌ No se encontró el formulario enrollmentForm');
        return;
    }
    
    console.log('✅ Formulario encontrado');
    
    // Función para mostrar/ocultar pasos
    function showStep(step) {
        console.log(`📍 Mostrando paso ${step}`);
        
        // Ocultar todos los pasos
        for (let i = 1; i <= 4; i++) {
            const stepElement = document.getElementById(`step${i}`);
            if (stepElement) {
                stepElement.classList.add('hidden');
            }
        }
        
        // Mostrar el paso actual
        const currentStepElement = document.getElementById(`step${step}`);
        if (currentStepElement) {
            currentStepElement.classList.remove('hidden');
        }
        
        // Actualizar indicadores
        updateStepIndicators(step);
    }
    
    function updateStepIndicators(step) {
        const indicators = document.querySelectorAll('.step-indicator');
        indicators.forEach((indicator, index) => {
            const stepNum = index + 1;
            indicator.classList.remove('active', 'completed');
            
            if (stepNum < step) {
                indicator.classList.add('completed');
            } else if (stepNum === step) {
                indicator.classList.add('active');
            }
        });
    }
    
    // Función para mostrar errores
    function showError(message) {
        console.error('❌ Error:', message);
        if (errorDisplay) {
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) errorMessage.textContent = message;
            errorDisplay.classList.remove('hidden');
        }
        hideLoading();
    }
    
    // Función para mostrar éxito
    function showSuccess(message) {
        console.log('✅ Éxito:', message);
        if (successDisplay) {
            const successMessage = document.getElementById('successMessage');
            if (successMessage) successMessage.textContent = message;
            successDisplay.classList.remove('hidden');
        }
        hideLoading();
    }
    
    // Función para mostrar/ocultar loading
    function showLoading() {
        console.log('⏳ Mostrando loading...');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }
    }
    
    function hideLoading() {
        console.log('✅ Ocultando loading...');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }
    
    // Función para ocultar mensajes
    function hideMessages() {
        if (errorDisplay) errorDisplay.classList.add('hidden');
        if (successDisplay) successDisplay.classList.add('hidden');
    }
    
    // Función de validación simple
    function validateStep(step) {
        console.log(`🔍 Validando paso ${step}`);
        const stepElement = document.getElementById(`step${step}`);
        if (!stepElement) return false;
        
        const requiredFields = stepElement.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                console.log(`❌ Campo requerido vacío: ${field.id}`);
                field.style.borderColor = '#EF4444';
                isValid = false;
            } else {
                field.style.borderColor = '#10B981';
            }
        });
        
        return isValid;
    }
    
    // Configurar navegación entre pasos
    function setupNavigation() {
        console.log('🔗 Configurando navegación...');
        
        // Botones "Siguiente"
        for (let i = 1; i <= 3; i++) {
            const nextBtn = document.getElementById(`nextStep${i}`);
            if (nextBtn) {
                nextBtn.addEventListener('click', function() {
                    console.log(`➡️ Click en nextStep${i}`);
                    if (validateStep(i)) {
                        currentStep = i + 1;
                        showStep(currentStep);
                        if (currentStep === 4) {
                            updateSummary();
                        }
                    } else {
                        showError('Por favor, complete todos los campos requeridos');
                    }
                });
            }
        }
        
        // Botones "Anterior"
        for (let i = 2; i <= 4; i++) {
            const prevBtn = document.getElementById(`prevStep${i}`);
            if (prevBtn) {
                prevBtn.addEventListener('click', function() {
                    console.log(`⬅️ Click en prevStep${i}`);
                    currentStep = i - 1;
                    showStep(currentStep);
                    hideMessages();
                });
            }
        }
    }
    
    // Función para actualizar el resumen
    function updateSummary() {
        console.log('📝 Actualizando resumen...');
        
        // Datos del apoderado
        const summaryFields = [
            {id: 'summaryParentName', value: document.getElementById('parentName')?.value || ''},
            {id: 'summaryParentDNI', value: document.getElementById('parentDNI')?.value || ''},
            {id: 'summaryParentEmail', value: document.getElementById('parentEmail')?.value || ''},
            {id: 'summaryParentPhone', value: document.getElementById('parentPhone')?.value || ''},
            {id: 'summaryRelationship', value: document.getElementById('relationship')?.value || ''}
        ];
        
        summaryFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) element.textContent = field.value;
        });
        
        // Nombre completo del estudiante
        const firstName = document.getElementById('firstName')?.value || '';
        const lastName = document.getElementById('lastName')?.value || '';
        const summaryStudentName = document.getElementById('summaryStudentName');
        if (summaryStudentName) {
            summaryStudentName.textContent = `${firstName} ${lastName}`;
        }
        
        // Otros campos del estudiante
        const birthDate = document.getElementById('birthDate')?.value;
        if (birthDate) {
            const summaryBirthDate = document.getElementById('summaryBirthDate');
            if (summaryBirthDate) {
                summaryBirthDate.textContent = new Date(birthDate).toLocaleDateString('es-PE');
            }
            
            // Calcular edad
            const age = Math.floor((new Date() - new Date(birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
            const summaryAge = document.getElementById('summaryAge');
            if (summaryAge) {
                summaryAge.textContent = `${age} años`;
            }
        }
        
        // Programa seleccionado
        const programSelect = document.getElementById('program');
        if (programSelect && programSelect.selectedIndex > 0) {
            const selectedOption = programSelect.options[programSelect.selectedIndex];
            const summaryProgramName = document.getElementById('summaryProgramName');
            const summaryProgramPrice = document.getElementById('summaryProgramPrice');
            
            if (summaryProgramName) {
                summaryProgramName.textContent = selectedOption.text;
            }
            
            if (summaryProgramPrice) {
                const price = selectedOption.getAttribute('data-price');
                summaryProgramPrice.textContent = `S/. ${parseFloat(price || 0).toFixed(2)}`;
            }
        }
    }
    
    // Configurar envío del formulario
    function setupFormSubmission() {
        console.log('📤 Configurando envío del formulario...');
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('🚀 Enviando formulario...');
            
            hideMessages();
            
            // Verificar autenticación primero
            try {
                const authResponse = await fetch('/api/check_auth');
                const authData = await authResponse.json();
                console.log('🔐 Estado de autenticación:', authData);
                
                if (!authData.authenticated) {
                    showError('Debe iniciar sesión para realizar la matrícula. Por favor, inicie sesión y vuelva a intentarlo.');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 3000);
                    return;
                }
            } catch (error) {
                console.error('❌ Error verificando autenticación:', error);
                showError('Error de conexión al verificar la sesión');
                return;
            }
            
            // Validar términos y condiciones
            const termsCheckbox = document.getElementById('terms');
            if (!termsCheckbox || !termsCheckbox.checked) {
                showError('Debe aceptar los términos y condiciones');
                return;
            }
            
            // Validar paso final
            if (!validateStep(4)) {
                showError('Por favor, revise los datos ingresados');
                return;
            }
            
            showLoading();
            
            try {
                // Recopilar datos del formulario
                const formData = {
                    parentName: document.getElementById('parentName')?.value || '',
                    parentDNI: document.getElementById('parentDNI')?.value || '',
                    parentEmail: document.getElementById('parentEmail')?.value || '',
                    parentPhone: document.getElementById('parentPhone')?.value || '',
                    parentAddress: document.getElementById('parentAddress')?.value || '',
                    parentOccupation: document.getElementById('parentOccupation')?.value || '',
                    relationship: document.getElementById('relationship')?.value || '',
                    firstName: document.getElementById('firstName')?.value || '',
                    lastName: document.getElementById('lastName')?.value || '',
                    birthDate: document.getElementById('birthDate')?.value || '',
                    bloodType: document.getElementById('bloodType')?.value || '',
                    allergies: document.getElementById('allergies')?.value || 'Ninguna',
                    medicalNotes: document.getElementById('medicalNotes')?.value || 'Ninguna',
                    emergencyContact: document.getElementById('emergencyContact')?.value || '',
                    emergencyPhone: document.getElementById('emergencyPhone')?.value || '',
                    programId: document.getElementById('program')?.value || ''
                };
                
                console.log('📋 Datos del formulario:', formData);
                
                // Validar campos críticos
                const requiredFields = ['parentName', 'parentDNI', 'parentEmail', 'parentPhone', 'firstName', 'lastName', 'birthDate', 'bloodType', 'emergencyContact', 'emergencyPhone', 'programId'];
                const missingFields = requiredFields.filter(field => !formData[field]);
                
                if (missingFields.length > 0) {
                    showError(`Faltan campos requeridos: ${missingFields.join(', ')}`);
                    return;
                }
                
                // Enviar datos
                const response = await fetch('/api/enrollment/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('📡 Respuesta del servidor:', response.status);
                
                const data = await response.json();
                console.log('📄 Datos de respuesta:', data);
                
                if (response.ok) {
                    showSuccess('¡Matrícula enviada exitosamente! Redirigiendo...');
                    setTimeout(() => {
                        window.location.href = '/enrollment/success';
                    }, 2000);
                } else {
                    if (response.status === 401) {
                        showError('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 3000);
                    } else {
                        showError(data.message || `Error ${response.status}: ${response.statusText}`);
                    }
                }
                
            } catch (error) {
                console.error('💥 Error en envío:', error);
                showError('Error de conexión. Por favor, verifique su conexión a internet e intente nuevamente.');
            } finally {
                hideLoading();
            }
        });
    }
    
    // Cargar datos del usuario
    async function loadUserData() {
        console.log('👤 Cargando datos del usuario...');
        try {
            const response = await fetch('/api/user/profile');
            if (response.ok) {
                const userData = await response.json();
                console.log('👤 Datos del usuario:', userData);
                
                // Precompletar campos
                if (userData.name) document.getElementById('parentName').value = userData.name;
                if (userData.email) document.getElementById('parentEmail').value = userData.email;
                if (userData.phone) document.getElementById('parentPhone').value = userData.phone;
                if (userData.address) document.getElementById('parentAddress').value = userData.address;
                if (userData.role) document.getElementById('relationship').value = userData.role;
                
            } else {
                console.log('⚠️ No se pudieron cargar los datos del usuario');
            }
        } catch (error) {
            console.log('⚠️ Error al cargar datos del usuario:', error);
        }
    }
    
    // Verificar autenticación al cargar
    async function checkAuthentication() {
        console.log('🔐 Verificando autenticación...');
        try {
            const response = await fetch('/api/check_auth');
            const data = await response.json();
            console.log('🔐 Estado de autenticación:', data);
            
            if (!data.authenticated) {
                console.log('⚠️ Usuario no autenticado');
                showError('Debe iniciar sesión para acceder al formulario de matrícula');
                return false;
            } else {
                console.log('✅ Usuario autenticado:', data.user_name);
                return true;
            }
        } catch (error) {
            console.error('❌ Error verificando autenticación:', error);
            showError('Error de conexión al verificar la sesión');
            return false;
        }
    }
    
    // Inicialización
    console.log('🎯 Iniciando aplicación...');
    showStep(1);
    setupNavigation();
    setupFormSubmission();
    
    // Verificar autenticación y cargar datos
    checkAuthentication().then(isAuthenticated => {
        if (isAuthenticated) {
            loadUserData();
        }
    });
    
    console.log('✅ Formulario de matrícula inicializado correctamente');
});