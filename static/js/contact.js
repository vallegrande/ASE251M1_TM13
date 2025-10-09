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
    function showSuccess(message, whatsappUrl = null) {
        let content = message;
        
        if (whatsappUrl) {
            content += '<br><br><div class="mt-4">';
            content += '<p class="text-sm text-gray-600 mb-2">También puedes contactarnos directamente:</p>';
            content += `<a href="${whatsappUrl}" target="_blank" class="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">`;
            content += '<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">';
            content += '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.097"/>';
            content += '</svg>Continuar por WhatsApp</a></div>';
        }
        
        successDisplay.innerHTML = content;
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
                    phone: form.phone ? form.phone.value : '',
                    subject: form.subject.value,
                    message: form.message.value
                }),
            });

            const data = await response.json();

            if (response.ok) {
                let message = '¡Gracias! Tu mensaje ha sido enviado correctamente. Nos pondremos en contacto contigo pronto.';
                if (data.warning) {
                    message += ` <br><small class="text-yellow-600">${data.warning}</small>`;
                }
                showSuccess(message, data.whatsapp_url);
            } else {
                showError(data.message || 'Error al enviar el mensaje');
            }
        } catch (error) {
            showError('Error de conexión. Por favor, intenta nuevamente');
        }
    });

    // Función para generar enlaces de WhatsApp dinámicos
    window.openWhatsApp = function(message) {
        if (!message) {
            message = "Hola, me gustaría obtener más información sobre Wawalu.";
        }
        
        fetch('/api/contact/whatsapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.open(data.whatsapp_url, '_blank');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Fallback: usar enlace básico
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/51987654321?text=${encodedMessage}`, '_blank');
        });
    };
});