// JS para CRUD de productos en admin usando AJAX y componentes reutilizables

document.addEventListener('DOMContentLoaded', function() {
    // Filtros y búsqueda
    const searchInput = document.getElementById('searchProduct');
    const filterCategory = document.getElementById('filterCategory');
    const rows = document.querySelectorAll('.product-row');

    function filterProducts() {
        const search = searchInput.value.toLowerCase();
        const category = filterCategory.value.toLowerCase();
        rows.forEach(row => {
            const name = row.getAttribute('data-name');
            const cat = row.getAttribute('data-category');
            const show = (name.includes(search) || search === '') && (cat === category || category === '');
            row.style.display = show ? '' : 'none';
        });
    }
    searchInput.addEventListener('input', filterProducts);
    filterCategory.addEventListener('change', filterProducts);

    // Modal
    window.openAddProductModal = function() {
        document.getElementById('productModal').classList.remove('hidden');
        document.getElementById('modalTitle').textContent = 'Agregar Producto';
        renderProductForm();
    };
    window.openEditProductModal = function(productId) {
        fetch(`/admin/products/${productId}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById('productModal').classList.remove('hidden');
                document.getElementById('modalTitle').textContent = 'Editar Producto';
                renderProductForm(data);
            });
    };
    window.closeProductModal = function() {
        document.getElementById('productModal').classList.add('hidden');
    };
    function renderProductForm(product) {
        document.getElementById('productForm').reset();
        if (product) {
            document.getElementById('name').value = product.name;
            document.getElementById('description').value = product.description;
            document.getElementById('category').value = product.category;
            document.getElementById('price').value = product.price;
            document.getElementById('stock').value = product.stock;
            document.getElementById('image_url').value = product.image_url;
        }
    }
    // Enviar formulario (alta/edición)
    document.getElementById('productForm').onsubmit = function(e) {
        e.preventDefault();
        const formData = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            price: document.getElementById('price').value,
            stock: document.getElementById('stock').value,
            image_url: document.getElementById('image_url').value
        };
        let url = '/admin/products';
        let method = 'POST';
        if (window.editingProductId) {
            url = `/admin/products/${window.editingProductId}`;
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
    // Eliminar producto
    window.confirmDeleteProduct = function(productId) {
        if (confirm('¿Seguro que deseas eliminar este producto?')) {
            fetch(`/admin/products/${productId}`, { method: 'DELETE' })
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
