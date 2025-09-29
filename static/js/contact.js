document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const errorDisplay = document.getElementById('errorDisplay');
    const successDisplay = document.getElementById('successDisplay');
    const submitButton = document.getElementById('submitButton');

    // Función para mostrar errores
    function showError(message) {
        errorDisplay.textContent = message;
        errorDisplay.classList.remove('hidden');
        successDisplay.classList.add('hidden');
        submitButton.disabled = false;
        submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
        submitButton.innerHTML = '<span class="material-icons mr-2">send</span>Enviar Mensaje';
    }

    // Función para mostrar mensaje de éxito
    function showSuccess(message) {
        successDisplay.textContent = message;
        successDisplay.classList.remove('hidden');
        errorDisplay.classList.add('hidden');
        form.reset();
        submitButton.disabled = false;
        submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
        submitButton.innerHTML = '<span class="material-icons mr-2">send</span>Enviar Mensaje';
    }

    // Manejo del envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validar correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email.value)) {
            showError('Por favor, ingresa un correo electrónico válido');
            return;
        }

        // Validar longitud del mensaje
        if (form.message.value.length < 10) {
            showError('El mensaje debe tener al menos 10 caracteres');
            return;
        }

        // Deshabilitar el botón y mostrar estado de carga
        submitButton.disabled = true;
        submitButton.classList.add('opacity-50', 'cursor-not-allowed');
        submitButton.innerHTML = '<span class="animate-spin material-icons mr-2">refresh</span>Enviando...';

        try {
            const response = await fetch('/contacto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: form.name.value,
                    email: form.email.value,
                    subject: form.subject.value,
                    message: form.message.value
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('¡Gracias! Tu mensaje ha sido enviado correctamente. Nos pondremos en contacto contigo pronto.');
            } else {
                showError(data.message || 'Error al enviar el mensaje');
            }
        } catch (error) {
            showError('Error de conexión. Por favor, intenta nuevamente');
        }
    });
});