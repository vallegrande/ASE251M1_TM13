// Admin Gallery - JavaScript para gestión de galería

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Gallery initialized');
    
    // Inicializar contadores
    updateImageCounter();
    
    // Configurar eventos de los modales
    setupModalEvents();
    
    // Configurar formularios
    setupForms();
});

// ========== GESTIÓN DE MODALES ==========

function openUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.style.display = 'block';
    modal.classList.add('fade-in');
    
    // Focus en el primer campo
    setTimeout(() => {
        const firstInput = modal.querySelector('input[type="file"]');
        if (firstInput) firstInput.focus();
    }, 300);
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.style.display = 'none';
    modal.classList.remove('fade-in');
    
    // Resetear formulario
    document.getElementById('uploadForm').reset();
}

function openEditModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'block';
    modal.classList.add('fade-in');
    
    // Focus en el primer campo
    setTimeout(() => {
        const firstInput = modal.querySelector('input[type="text"]');
        if (firstInput) firstInput.focus();
    }, 300);
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
    modal.classList.remove('fade-in');
    
    // Resetear formulario
    document.getElementById('editForm').reset();
}

function setupModalEvents() {
    // Cerrar modales al hacer clic fuera
    ['uploadModal', 'editModal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    if (modalId === 'uploadModal') {
                        closeUploadModal();
                    } else {
                        closeEditModal();
                    }
                }
            });
        }
    });
    
    // Cerrar modales con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeUploadModal();
            closeEditModal();
        }
    });
}

// ========== GESTIÓN DE IMÁGENES ==========

function editImage(imageId) {
    // Encontrar el elemento de la imagen
    const imageElement = document.querySelector(`[data-image-id="${imageId}"]`);
    
    if (imageElement) {
        const title = imageElement.dataset.title;
        const category = imageElement.dataset.category;
        const description = imageElement.dataset.description || '';
        
        // Cargar datos en el formulario de edición
        document.getElementById('editImageId').value = imageId;
        document.getElementById('editTitle').value = title;
        document.getElementById('editDescription').value = description;
        document.getElementById('editCategory').value = category;
        
        openEditModal();
    } else {
        // Si no encontramos los datos en el DOM, hacer petición al servidor
        fetch(`/admin/gallery/get/${imageId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('editImageId').value = imageId;
                document.getElementById('editTitle').value = data.image.title;
                document.getElementById('editDescription').value = data.image.description || '';
                document.getElementById('editCategory').value = data.image.category;
                openEditModal();
            } else {
                showNotification('Error al cargar los datos de la imagen', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error al cargar los datos de la imagen', 'error');
        });
    }
}

function deleteImage(imageId) {
    // Mostrar confirmación personalizada
    if (showConfirmDialog('¿Estás seguro de que quieres eliminar esta imagen?', 'Esta acción no se puede deshacer.')) {
        // Mostrar loading
        const imageElement = document.querySelector(`[data-image-id="${imageId}"]`);
        if (imageElement) {
            imageElement.classList.add('loading');
        }
        
        fetch(`/admin/gallery/delete/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Animar salida del elemento
                if (imageElement) {
                    imageElement.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => {
                        imageElement.remove();
                        updateImageCounter();
                        showNotification('Imagen eliminada exitosamente', 'success');
                    }, 300);
                } else {
                    location.reload();
                }
            } else {
                if (imageElement) {
                    imageElement.classList.remove('loading');
                }
                showNotification('Error al eliminar la imagen: ' + data.message, 'error');
            }
        })
        .catch(error => {
            if (imageElement) {
                imageElement.classList.remove('loading');
            }
            showNotification('Error al eliminar la imagen', 'error');
        });
    }
}

// ========== FILTROS Y BÚSQUEDA ==========

function filterGallery() {
    const filter = document.getElementById('categoryFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.gallery-item');
    let visibleCount = 0;
    
    items.forEach(item => {
        const category = item.dataset.category;
        const title = item.dataset.title.toLowerCase();
        
        const matchesCategory = filter === '' || category === filter;
        const matchesSearch = searchTerm === '' || title.includes(searchTerm);
        
        if (matchesCategory && matchesSearch) {
            item.style.display = 'block';
            item.classList.add('fade-in');
            visibleCount++;
        } else {
            item.style.display = 'none';
            item.classList.remove('fade-in');
        }
    });
    
    updateImageCounter(visibleCount);
}

function searchGallery() {
    filterGallery(); // Reutilizar la lógica de filtrado
}

function updateImageCounter(count = null) {
    const counter = document.getElementById('imageCount');
    if (counter) {
        if (count === null) {
            const visibleItems = document.querySelectorAll('.gallery-item[style*="display: block"], .gallery-item:not([style*="display: none"])');
            count = visibleItems.length;
        }
        counter.textContent = count;
    }
}

// ========== CONFIGURACIÓN DE FORMULARIOS ==========

function setupForms() {
    // Formulario de subida
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUploadSubmit);
    }
    
    // Formulario de edición
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }
    
    // Preview de imagen en upload
    const imageInput = uploadForm?.querySelector('input[type="file"]');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }
}

function handleUploadSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Validaciones básicas
    if (!formData.get('image') || !formData.get('title') || !formData.get('category')) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
        return;
    }
    
    // Deshabilitar botón y mostrar loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subiendo...';
    
    fetch('/admin/gallery/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Imagen subida exitosamente', 'success');
            closeUploadModal();
            setTimeout(() => location.reload(), 1000);
        } else {
            showNotification('Error al subir la imagen: ' + data.message, 'error');
        }
    })
    .catch(error => {
        showNotification('Error al subir la imagen', 'error');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subir Imagen';
    });
}

function handleEditSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const imageId = document.getElementById('editImageId').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Validaciones básicas
    if (!formData.get('title') || !formData.get('category')) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
        return;
    }
    
    // Deshabilitar botón y mostrar loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';
    
    fetch(`/admin/gallery/edit/${imageId}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Imagen actualizada exitosamente', 'success');
            closeEditModal();
            setTimeout(() => location.reload(), 1000);
        } else {
            showNotification('Error al editar la imagen: ' + data.message, 'error');
        }
    })
    .catch(error => {
        showNotification('Error al editar la imagen', 'error');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Cambios';
    });
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        // Validar tamaño de archivo (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('El archivo es muy grande. Máximo 5MB permitido.', 'error');
            e.target.value = '';
            return;
        }
        
        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showNotification('Tipo de archivo no válido. Solo se permiten imágenes.', 'error');
            e.target.value = '';
            return;
        }
        
        // Crear preview (opcional - puedes implementar esto más tarde)
        console.log('Archivo seleccionado:', file.name, 'Tamaño:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    }
}

// ========== UTILIDADES ==========

function showNotification(message, type = 'info') {
    // Crear notificación toast
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300`;
    
    // Estilos según el tipo
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.innerHTML = `
        <div class="flex items-center">
            <span class="mr-2">${getNotificationIcon(type)}</span>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-white hover:text-gray-200">
                <span class="material-icons text-sm">close</span>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        default: return 'ℹ️';
    }
}

function showConfirmDialog(title, description = '') {
    return confirm(`${title}\n\n${description}`);
}

// ========== ATAJOS DE TECLADO ==========

document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + U para abrir modal de upload
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        openUploadModal();
    }
    
    // F para enfocar búsqueda
    if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.focus();
        }
    }
});

// ========== ANIMACIONES CSS ADICIONALES ==========

const additionalCSS = `
@keyframes fadeOut {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0.9); }
}
`;

// Inyectar CSS adicional
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);