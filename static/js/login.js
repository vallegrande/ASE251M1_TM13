document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = document.getElementById('submitButton');
    const errorDisplay = document.getElementById('errorDisplay');

    // Función para validar email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Función para mostrar errores
    function showError(message) {
        errorDisplay.textContent = message;
        errorDisplay.classList.remove('hidden');
        errorDisplay.classList.remove('bg-green-100', 'border-green-400', 'text-green-700');
        errorDisplay.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
        setTimeout(() => {
            errorDisplay.classList.add('hidden');
        }, 3000);
    }

    // Función para mostrar mensajes de éxito
    function showSuccessMessage(message) {
        errorDisplay.textContent = message;
        errorDisplay.classList.remove('hidden');
        errorDisplay.classList.remove('bg-red-100', 'border-red-400', 'text-red-700');
        errorDisplay.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
    }

    // Función para habilitar/deshabilitar el botón de envío
    function toggleSubmitButton() {
        const isEmailValid = isValidEmail(emailInput.value);
        const isPasswordValid = passwordInput.value.length >= 6;
        submitButton.disabled = !(isEmailValid && isPasswordValid);
        submitButton.classList.toggle('opacity-50', !(isEmailValid && isPasswordValid));
    }

    // Validación en tiempo real
    emailInput.addEventListener('input', function() {
        this.classList.toggle('border-red-500', !isValidEmail(this.value) && this.value !== '');
        toggleSubmitButton();
    });

    passwordInput.addEventListener('input', function() {
        this.classList.toggle('border-red-500', this.value.length < 6 && this.value !== '');
        toggleSubmitButton();
    });

    // Manejo del formulario
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!isValidEmail(emailInput.value)) {
            showError('Por favor, ingresa un correo electrónico válido');
            return;
        }

        if (passwordInput.value.length < 6) {
            showError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Iniciando sesión...
        `;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailInput.value,
                    password: passwordInput.value,
                    remember: document.getElementById('remember').checked
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Verificar si hay una URL de retorno en la URL o en sessionStorage
                const urlParams = new URLSearchParams(window.location.search);
                const returnUrl = urlParams.get('return_url') || sessionStorage.getItem('return_url') || '/';
                
                // Limpiar la URL de retorno del sessionStorage
                sessionStorage.removeItem('return_url');
                
                // Mostrar mensaje de éxito
                showSuccessMessage('¡Bienvenido! Redirigiendo...');
                
                // Redirigir después de un breve delay
                setTimeout(() => {
                    window.location.href = returnUrl;
                }, 1000);
            } else {
                showError(data.message || 'Error al iniciar sesión');
                submitButton.disabled = false;
                submitButton.innerHTML = '<span class="material-icons mr-2">login</span>Iniciar Sesión';
            }
        } catch (error) {
            showError('Error de conexión. Por favor, intenta de nuevo.');
            submitButton.disabled = false;
            submitButton.innerHTML = '<span class="material-icons mr-2">login</span>Iniciar Sesión';
        }
    });

    // Toggle de visibilidad de contraseña
    const togglePassword = document.getElementById('togglePassword');
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });
});