document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('enrollmentForm');
    const errorDisplay = document.getElementById('errorDisplay');
    const submitButton = document.getElementById('submitButton');

    // Función para mostrar errores
    function showError(message) {
        errorDisplay.textContent = message;
        errorDisplay.classList.remove('hidden');
        submitButton.disabled = false;
        submitButton.innerHTML = '<span class="material-icons mr-2">how_to_reg</span>Enviar Matrícula';
    }

    // Función para ocultar errores
    function hideError() {
        errorDisplay.classList.add('hidden');
    }

    // Manejo del envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideError();

        // Validar la edad según el programa seleccionado
        const birthDate = new Date(form.birthDate.value);
        const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        if (age < 0 || age > 12) {
            showError('La edad del estudiante debe estar entre 0 y 12 años');
            return;
        }

        // Validar formato del teléfono de emergencia
        const phoneRegex = /^\d{9}$/;
        if (!phoneRegex.test(form.emergencyPhone.value.replace(/\s/g, ''))) {
            showError('El teléfono de emergencia debe tener 9 dígitos');
            return;
        }

        // Validar términos y condiciones
        if (!form.terms.checked) {
            showError('Debe aceptar los términos y condiciones');
            return;
        }

        // Deshabilitar el botón y mostrar estado de carga
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="animate-spin material-icons mr-2">refresh</span>Procesando...';

        try {
            const response = await fetch('/api/enrollment/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // Datos del padre/madre/apoderado
                    parentName: form.parentName.value,
                    parentDNI: form.parentDNI.value,
                    parentEmail: form.parentEmail.value,
                    parentPhone: form.parentPhone.value,
                    parentAddress: form.parentAddress.value,
                    parentOccupation: form.parentOccupation.value,
                    relationship: form.relationship.value,
                    
                    // Datos del estudiante
                    firstName: form.firstName.value,
                    lastName: form.lastName.value,
                    birthDate: form.birthDate.value,
                    bloodType: form.bloodType.value,
                    allergies: form.allergies.value,
                    medicalNotes: form.medicalNotes.value,
                    emergencyContact: form.emergencyContact.value,
                    emergencyPhone: form.emergencyPhone.value,
                    programId: form.program.value
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Mostrar mensaje de éxito y redireccionar
                window.location.href = '/enrollment/success';
            } else {
                showError(data.message || 'Error al procesar la matrícula');
            }
        } catch (error) {
            showError('Error de conexión. Por favor, intenta nuevamente');
        }
    });

    // Validación de la fecha de nacimiento en tiempo real
    const birthDateInput = document.getElementById('birthDate');
    birthDateInput.addEventListener('change', function() {
        const birthDate = new Date(this.value);
        const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        if (age < 0 || age > 12) {
            this.setCustomValidity('La edad debe estar entre 0 y 12 años');
        } else {
            this.setCustomValidity('');
        }
    });

    // Validación del teléfono de emergencia en tiempo real
    const phoneInput = document.getElementById('emergencyPhone');
    phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').substring(0, 9);
        const isValid = /^\d{9}$/.test(this.value);
        
        if (!isValid) {
            this.setCustomValidity('El teléfono debe tener 9 dígitos');
        } else {
            this.setCustomValidity('');
        }
    });
});