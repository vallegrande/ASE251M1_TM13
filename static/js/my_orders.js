/**
 * My Orders Page JavaScript
 * Handles filtering, animations, and interactions for the orders page
 */

class OrdersManager {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.orderCards = document.querySelectorAll('.order-card');
        this.init();
    }

    init() {
        this.setupFilters();
        this.setupAnimations();
        this.initializeFilterButtons();
    }

    setupFilters() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilterClick(e));
        });
    }

    handleFilterClick(event) {
        const button = event.target;
        const status = button.dataset.status;
        
        // Update active button
        this.updateActiveButton(button);
        
        // Filter cards
        this.filterCards(status);
    }

    updateActiveButton(activeButton) {
        // Remove active state from all buttons
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active', 'bg-blue-600', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        });
        
        // Add active state to clicked button
        activeButton.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        activeButton.classList.add('active', 'bg-blue-600', 'text-white');
    }

    filterCards(status) {
        this.orderCards.forEach(card => {
            if (status === 'all' || card.dataset.status === status) {
                this.showCard(card);
            } else {
                this.hideCard(card);
            }
        });
    }

    showCard(card) {
        card.style.display = 'block';
        card.classList.add('fade-in-up');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            card.classList.remove('fade-in-up');
        }, 300);
    }

    hideCard(card) {
        card.style.display = 'none';
        card.classList.remove('fade-in-up');
    }

    setupAnimations() {
        // Add intersection observer for cards animation on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.orderCards.forEach(card => {
            observer.observe(card);
        });
    }

    initializeFilterButtons() {
        // Set initial styles for filter buttons
        this.filterButtons.forEach(btn => {
            if (!btn.classList.contains('active')) {
                btn.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
            } else {
                btn.classList.add('bg-blue-600', 'text-white');
            }
        });
    }
}

// Order Actions Handler
class OrderActions {
    constructor() {
        this.setupActionButtons();
    }

    setupActionButtons() {
        // Reorder buttons
        document.querySelectorAll('[data-action="reorder"]').forEach(button => {
            button.addEventListener('click', (e) => this.handleReorder(e));
        });

        // Cancel buttons
        document.querySelectorAll('[data-action="cancel"]').forEach(button => {
            button.addEventListener('click', (e) => this.handleCancel(e));
        });

        // Review buttons
        document.querySelectorAll('[data-action="review"]').forEach(button => {
            button.addEventListener('click', (e) => this.handleReview(e));
        });
    }

    handleReorder(event) {
        const button = event.target.closest('button');
        const orderId = button.dataset.orderId;
        
        if (confirm('¿Deseas reordenar este pedido?')) {
            // Add loading state
            button.disabled = true;
            button.innerHTML = '<span class="material-icons animate-spin mr-2 text-sm">refresh</span>Reordenando...';
            
            // Simulate API call
            setTimeout(() => {
                alert('Pedido agregado al carrito');
                button.disabled = false;
                button.innerHTML = '<span class="material-icons mr-2 text-sm">refresh</span>Reordenar';
            }, 2000);
        }
    }

    handleCancel(event) {
        const button = event.target.closest('button');
        const orderId = button.dataset.orderId;
        
        if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
            // Add loading state
            button.disabled = true;
            button.innerHTML = '<span class="material-icons animate-spin mr-2 text-sm">cancel</span>Cancelando...';
            
            // Simulate API call
            setTimeout(() => {
                alert('Pedido cancelado exitosamente');
                location.reload();
            }, 2000);
        }
    }

    handleReview(event) {
        const button = event.target.closest('button');
        const orderId = button.dataset.orderId;
        
        // Redirect to review page or open modal
        window.location.href = `/review/${orderId}`;
    }
}

// Statistics Counter Animation
class StatsCounter {
    constructor() {
        this.setupCounters();
    }

    setupCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.textContent.replace(/\D/g, ''));
        const duration = 1000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format number based on original format
            if (element.textContent.includes('S/')) {
                element.textContent = `S/ ${current.toFixed(2)}`;
            } else {
                element.textContent = Math.floor(current).toString();
            }
        }, 16);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new OrdersManager();
    new OrderActions();
    new StatsCounter();
    
    // Add loading animation
    document.body.classList.add('orders-loaded');
});

// Utility functions
const OrdersUtils = {
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    formatPrice: function(price) {
        return `S/ ${parseFloat(price).toFixed(2)}`;
    },
    
    getStatusText: function(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'confirmed': 'Confirmado',
            'processing': 'Procesando',
            'shipped': 'Enviado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    }
};