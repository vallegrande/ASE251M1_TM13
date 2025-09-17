document.addEventListener('DOMContentLoaded', function() {
    // Implementar compartir en redes sociales
    const shareButtons = document.querySelectorAll('button[data-share]');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.dataset.share;
            const url = window.location.href;
            const title = document.querySelector('h1').textContent;
            shareNews(platform, url, title);
        });
    });

    // Implementar guardar noticia
    const bookmarkButton = document.querySelector('button[data-action="bookmark"]');
    if (bookmarkButton) {
        bookmarkButton.addEventListener('click', function() {
            const newsId = this.dataset.newsId;
            toggleBookmark(newsId);
        });
    }
});

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

// Función para guardar/quitar de guardados
function toggleBookmark(newsId) {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarkedNews') || '[]');
    const index = bookmarks.indexOf(newsId);
    
    if (index === -1) {
        bookmarks.push(newsId);
        showNotification('Noticia guardada en favoritos');
    } else {
        bookmarks.splice(index, 1);
        showNotification('Noticia eliminada de favoritos');
    }

    localStorage.setItem('bookmarkedNews', JSON.stringify(bookmarks));
    updateBookmarkButton(newsId);
}

// Función para actualizar el botón de guardar
function updateBookmarkButton(newsId) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedNews') || '[]');
    const button = document.querySelector('button[data-action="bookmark"]');
    const icon = button.querySelector('.material-icons');
    
    if (bookmarks.includes(newsId)) {
        icon.textContent = 'bookmark';
        button.classList.add('text-blue-600');
    } else {
        icon.textContent = 'bookmark_border';
        button.classList.remove('text-blue-600');
    }
}

// Función para mostrar notificaciones
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out';
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateY(-20px)';
    }, 100);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}