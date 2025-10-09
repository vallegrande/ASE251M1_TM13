/**
 * Order Confirmation Page JavaScript
 * Handles animations, interactions, and user feedback for order confirmation
 */

class OrderConfirmationManager {
    constructor() {
        this.orderId = this.getOrderIdFromData();
        this.init();
    }

    init() {
        this.setupAnimations();
        this.setupInteractions();
        this.setupProgressTracking();
        this.updateCartUI();
        this.setupAutoRedirect();
        this.trackOrderView();
    }

    getOrderIdFromData() {
        // Try to get order ID from data attributes or URL
        const orderElement = document.querySelector('[data-order-id]');
        return orderElement ? orderElement.dataset.orderId : null;
    }

    setupAnimations() {
        // Animate success icon
        this.animateSuccessIcon();
        
        // Animate cards with stagger effect
        this.animateCards();
        
        // Animate order items
        this.animateOrderItems();
    }

    animateSuccessIcon() {
        const successIcon = document.querySelector('.success-icon');
        if (successIcon) {
            // Add entrance animation
            successIcon.style.transform = 'scale(0)';
            successIcon.style.opacity = '0';
            
            setTimeout(() => {
                successIcon.style.transform = 'scale(1)';
                successIcon.style.opacity = '1';
                successIcon.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            }, 300);
        }

        // Animate checkmark stroke
        const checkmark = document.querySelector('.checkmark');
        if (checkmark) {
            const pathLength = checkmark.getTotalLength();
            checkmark.style.strokeDasharray = pathLength + ' ' + pathLength;
            checkmark.style.strokeDashoffset = pathLength;
            
            setTimeout(() => {
                checkmark.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
                checkmark.style.strokeDashoffset = '0';
            }, 800);
        }
    }

    animateCards() {
        const cards = document.querySelectorAll('.info-card');
        
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 400 + (index * 200));
        });
    }

    animateOrderItems() {
        const items = document.querySelectorAll('.product-item');
        
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.4s ease-out';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 1000 + (index * 100));
        });
    }

    setupInteractions() {
        // Enhanced button interactions
        this.setupButtonEffects();
        
        // Copy order number functionality
        this.setupCopyOrderNumber();
        
        // Product image interactions
        this.setupProductImageHandlers();
        
        // Contact info interactions
        this.setupContactInteractions();
    }

    setupButtonEffects() {
        const buttons = document.querySelectorAll('.action-button');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRippleEffect(e, button);
            });
            
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px) scale(1.02)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    createRippleEffect(event, button) {
        const ripple = document.createElement('div');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        
        if (!document.querySelector('style[data-ripple]')) {
            style.setAttribute('data-ripple', 'true');
            document.head.appendChild(style);
        }
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    setupCopyOrderNumber() {
        const orderNumberElement = document.querySelector('[data-order-number]');
        if (orderNumberElement) {
            orderNumberElement.style.cursor = 'pointer';
            orderNumberElement.title = 'Haz clic para copiar';
            
            orderNumberElement.addEventListener('click', () => {
                const orderNumber = orderNumberElement.textContent.trim();
                
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(orderNumber).then(() => {
                        this.showNotification('Número de pedido copiado', 'success');
                    });
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = orderNumber;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    this.showNotification('Número de pedido copiado', 'success');
                }
            });
        }
    }

    setupProductImageHandlers() {
        const productImages = document.querySelectorAll('.product-item img');
        
        productImages.forEach(img => {
            img.addEventListener('error', () => {
                img.src = '/static/img/products/default.jpg';
                img.alt = 'Imagen no disponible';
            });
            
            img.addEventListener('click', () => {
                this.openImageModal(img.src, img.alt);
            });
            
            // Add loading effect
            img.addEventListener('load', () => {
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    img.style.opacity = '1';
                }, 100);
            });
        });
    }

    openImageModal(imageSrc, imageAlt) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="relative max-w-4xl max-h-full">
                <img src="${imageSrc}" alt="${imageAlt}" class="max-w-full max-h-full object-contain rounded-lg">
                <button class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all">
                    <span class="material-icons">close</span>
                </button>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.closest('button')) {
                modal.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 200);
            }
        });
        
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.2s ease';
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }

    setupContactInteractions() {
        const contactItems = document.querySelectorAll('.contact-info');
        
        contactItems.forEach(item => {
            item.addEventListener('click', () => {
                const phone = item.textContent.includes('942') ? '942139788' : null;
                const email = item.textContent.includes('@') ? item.textContent.trim() : null;
                
                if (phone) {
                    window.open(`tel:${phone}`, '_self');
                } else if (email) {
                    window.open(`mailto:${email}`, '_self');
                }
            });
        });
    }

    setupProgressTracking() {
        // Track order confirmation view
        if (this.orderId) {
            console.log(`Order ${this.orderId} confirmation viewed`);
            
            // You could send analytics event here
            // analytics.track('order_confirmation_viewed', { orderId: this.orderId });
        }
    }

    updateCartUI() {
        // Clear cart from localStorage since order is completed
        if (typeof Storage !== 'undefined') {
            localStorage.removeItem('cart');
            localStorage.removeItem('cartCount');
        }
        
        // Update cart counter in navigation
        const cartCounters = document.querySelectorAll('.cart-count');
        cartCounters.forEach(counter => {
            counter.textContent = '0';
            counter.style.display = 'none';
        });
        
        // Dispatch custom event for other scripts
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { count: 0, items: [] }
        }));
    }

    setupAutoRedirect() {
        // Optional: Auto-redirect after certain time
        const autoRedirectDelay = 300000; // 5 minutes
        
        setTimeout(() => {
            if (confirm('¿Deseas ir a la página principal?')) {
                window.location.href = '/';
            }
        }, autoRedirectDelay);
    }

    trackOrderView() {
        // Send order view event to backend for analytics
        if (this.orderId) {
            fetch('/api/track-order-view', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: this.orderId,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                })
            }).catch(error => {
                console.log('Analytics tracking failed:', error);
            });
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Utility functions for order confirmation
const OrderConfirmationUtils = {
    formatOrderStatus: function(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'confirmed': 'Confirmado',
            'paid': 'Pagado',
            'shipped': 'Enviado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    },
    
    formatPaymentMethod: function(method) {
        const methodMap = {
            'yape': 'Yape',
            'transfer': 'Transferencia Bancaria',
            'cash': 'Efectivo',
            'card': 'Tarjeta'
        };
        return methodMap[method] || method;
    },
    
    shareOrder: function(orderId, platform) {
        const url = window.location.href;
        const text = `¡Acabo de realizar un pedido #${orderId} en Wawalu!`;
        
        switch (platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
                break;
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new OrderConfirmationManager();
});

// Export for potential external use
window.OrderConfirmationManager = OrderConfirmationManager;
window.OrderConfirmationUtils = OrderConfirmationUtils;