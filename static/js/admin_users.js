// JS para CRUD de usuarios en admin usando AJAX y componentes reutilizables

document.addEventListener('DOMContentLoaded', function() {
    // Abrir modal para agregar usuario
    window.openAddUserModal = function() {
        document.getElementById('userModal').classList.remove('hidden');
        document.getElementById('modalTitle').textContent = 'Agregar Usuario';
        renderUserForm();
    };

    // Abrir modal para editar usuario
    window.openEditUserModal = function(userId) {
        fetch(`/admin/users/${userId}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById('userModal').classList.remove('hidden');
                document.getElementById('modalTitle').textContent = 'Editar Usuario';
                renderUserForm(data);
            });
    };

    // Cerrar modal
    window.closeUserModal = function() {
        document.getElementById('userModal').classList.add('hidden');
    };

    // Renderizar formulario reutilizable
    function renderUserForm(user) {
        // Rellenar campos si es edición
        document.getElementById('userForm').reset();
        if (user) {
            document.getElementById('name').value = user.name;
            document.getElementById('email').value = user.email;
            document.getElementById('role').value = user.role;
            document.getElementById('is_admin').checked = user.is_admin;
            document.getElementById('is_active').checked = user.is_active;
        }
    }

    // Enviar formulario (alta/edición)
    document.getElementById('userForm').onsubmit = function(e) {
        e.preventDefault();
        const userId = window.editingUserId;
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            role: document.getElementById('role').value,
            is_admin: document.getElementById('is_admin').checked,
            is_active: document.getElementById('is_active').checked
        };
        let url = '/admin/users';
        let method = 'POST';
        if (userId) {
            url = `/admin/users/${userId}`;
            method = 'PUT';
        }
        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert(data.message);
            }
        });
    };

    // Eliminar usuario
    window.confirmDeleteUser = function(userId) {
        if (confirm('¿Seguro que deseas eliminar este usuario?')) {
            fetch(`/admin/users/${userId}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert(data.message);
                    }
                });
        }
    };
});
