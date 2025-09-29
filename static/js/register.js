document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const errorDisplay = document.getElementById('errorDisplay');
    const submitButton = document.getElementById('submitButton');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Función para mostrar errores
    function showError(message) {
        errorDisplay.textContent = message;
        errorDisplay.classList.remove('hidden');
        submitButton.disabled = false;
        submitButton.innerHTML = '<span class="material-icons mr-2">person_add</span>Crear Cuenta';
    }

    // Función para ocultar errores
    function hideError() {
        errorDisplay.classList.add('hidden');
    }

    // Toggle para mostrar/ocultar contraseña
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });

    // Toggle para mostrar/ocultar confirmación de contraseña
    toggleConfirmPassword.addEventListener('click', function() {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });

    // Manejo del envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideError();

        // Validar que las contraseñas coincidan
        if (passwordInput.value !== confirmPasswordInput.value) {
            showError('Las contraseñas no coinciden');
            return;
        }

        // Validar longitud de la contraseña
        if (passwordInput.value.length < 6) {
            showError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email.value)) {
            showError('Por favor, ingresa un correo electrónico válido');
            return;
        }

        // Validar formato de teléfono (9 dígitos)
        const phoneRegex = /^\d{9}$/;
        if (!phoneRegex.test(form.phone.value.replace(/\s/g, ''))) {
            showError('Por favor, ingresa un número de teléfono válido (9 dígitos)');
            return;
        }

        // Validar términos y condiciones
        if (!form.terms.checked) {
            showError('Debes aceptar los términos y condiciones');
            return;
        }

        // Deshabilitar el botón y mostrar estado de carga
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="animate-spin material-icons mr-2">refresh</span>Procesando...';

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: form.fullName.value,
                    email: form.email.value,
                    phone: form.phone.value,
                    role: form.role.value,
                    password: form.password.value,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirigir al login con mensaje de éxito
                window.location.href = '/login';
            } else {
                showError(data.message || 'Error al crear la cuenta');
            }
        } catch (error) {
            showError('Error de conexión. Por favor, intenta nuevamente');
        }
    });
});