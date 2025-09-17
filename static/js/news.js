document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos
    const searchInput = document.querySelector('input[type="text"]');
    const newsItems = document.querySelectorAll('.news-item');
    const categoryFilters = document.querySelectorAll('.category-filter');

    // Event listener para búsqueda
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = this.value.toLowerCase();
            filterNewsBySearch(searchTerm);
        }, 300);
    });

    // Event listeners para filtros de categoría
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remover clase activa de todos los filtros
            categoryFilters.forEach(f => f.classList.remove('active', 'bg-blue-600', 'text-white'));
            
            // Agregar clase activa al filtro seleccionado
            this.classList.add('active', 'bg-blue-600', 'text-white');
        });
    });
});

// Función para filtrar noticias
window.filterNews = function(category) {
    const newsItems = document.querySelectorAll('.news-item');
    const searchTerm = document.querySelector('input[type="text"]').value.toLowerCase();

    newsItems.forEach(item => {
        const itemCategory = item.dataset.category;
        const matchesCategory = category === 'all' || itemCategory === category;
        const matchesSearch = item.textContent.toLowerCase().includes(searchTerm);

        if (matchesCategory && matchesSearch) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
};

// Función para filtrar por búsqueda
function filterNewsBySearch(searchTerm) {
    const newsItems = document.querySelectorAll('.news-item');
    const activeCategory = document.querySelector('.category-filter.active').textContent.trim().toLowerCase();

    newsItems.forEach(item => {
        const itemCategory = item.dataset.category;
        const matchesCategory = activeCategory === 'todas' || itemCategory === activeCategory;
        const matchesSearch = item.textContent.toLowerCase().includes(searchTerm);

        if (matchesCategory && matchesSearch) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Función para compartir noticia
function shareNews(platform, url, title) {
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`
    };

    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank');
    }
}