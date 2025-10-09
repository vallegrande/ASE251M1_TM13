/**
 * Order Detail Page JavaScript
 * Handles order detail interactions, timeline animations, and actions
 */

class OrderDetailManager {
    constructor() {
        this.orderId = this.getOrderIdFromUrl();
        this.init();
    }

    init() {
        this.setupPrintFunctionality();
        this.setupOrderActions();
        this.setupTimelineAnimations();
        this.setupProductImageHandlers();
        this.initializeTooltips();
    }

    getOrderIdFromUrl() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    }

    setupPrintFunctionality() {
        const printButton = document.querySelector('[data-action="print"]');
        if (printButton) {
            printButton.addEventListener('click', () => {
                window.print();
            });
        }

        // Handle print events
        window.addEventListener('beforeprint', () => {
            document.body.classList.add('printing');
        });

        window.addEventListener('afterprint', () => {
            document.body.classList.remove('printing');
        });
    }

    setupOrderActions() {
        // Cancel order
        const cancelButton = document.querySelector('[data-action="cancel-order"]');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => this.handleCancelOrder());
        }

        // Reorder
        const reorderButton = document.querySelector('[data-action="reorder"]');
        if (reorderButton) {
            reorderButton.addEventListener('click', () => this.handleReorder());
        }

        // Leave review
        const reviewButton = document.querySelector('[data-action="review"]');
        if (reviewButton) {
            reviewButton.addEventListener('click', () => this.handleLeaveReview());
        }

        // Contact support
        const supportButton = document.querySelector('[data-action="contact-support"]');
        if (supportButton) {
            supportButton.addEventListener('click', () => this.handleContactSupport());
        }
    }

    async handleCancelOrder() {
        const confirmation = await this.showConfirmDialog(
            '¿Cancelar Pedido?',
            '¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer.',
            'Sí, Cancelar',
            'No, Mantener'
        );

        if (confirmation) {
            try {
                this.showLoadingState('cancel-order', 'Cancelando...');
                
                // Simulate API call
                await this.simulateApiCall(2000);
                
                this.showSuccessMessage('Pedido cancelado exitosamente');
                
                // Reload page to show updated status
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                
            } catch (error) {
                this.showErrorMessage('Error al cancelar el pedido');
                this.hideLoadingState('cancel-order', 'Cancelar Pedido');
            }
        }
    }

    async handleReorder() {
        try {
            this.showLoadingState('reorder', 'Agregando al carrito...');
            
            // Simulate API call to add items to cart
            await this.simulateApiCall(1500);
            
            this.showSuccessMessage('Productos agregados al carrito');
            this.hideLoadingState('reorder', 'Reordenar');
            
            // Optionally redirect to cart
            setTimeout(() => {
                if (confirm('¿Deseas ir al carrito ahora?')) {
                    window.location.href = '/cart';
                }
            }, 1000);
            
        } catch (error) {
            this.showErrorMessage('Error al reordenar');
            this.hideLoadingState('reorder', 'Reordenar');
        }
    }

    handleLeaveReview() {
        // Redirect to review page or open modal
        window.location.href = `/review/${this.orderId}`;
    }

    handleContactSupport() {
        // Open support chat or redirect to contact page
        const subject = `Consulta sobre pedido #${this.orderId}`;
        const body = `Hola, tengo una consulta sobre mi pedido #${this.orderId}.`;
        
        const whatsappUrl = `https://wa.me/51942139788?text=${encodeURIComponent(body)}`;
        window.open(whatsappUrl, '_blank');
    }

    setupTimelineAnimations() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('fade-in');
                    }, index * 200);
                }
            });
        }, {
            threshold: 0.3
        });

        timelineItems.forEach(item => {
            observer.observe(item);
        });
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
        });
    }

    openImageModal(imageSrc, imageAlt) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="relative max-w-4xl max-h-full">
                <img src="${imageSrc}" alt="${imageAlt}" class="max-w-full max-h-full object-contain rounded-lg">
                <button class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75">
                    <span class="material-icons">close</span>
                </button>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.closest('button')) {
                document.body.removeChild(modal);
            }
        });
        
        document.body.appendChild(modal);
    }

    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.dataset.tooltip);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'absolute bg-black text-white text-xs rounded px-2 py-1 z-50';
        tooltip.textContent = text;
        tooltip.id = 'tooltip';
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
        tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
    }

    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // Utility methods
    showLoadingState(buttonDataAction, loadingText) {
        const button = document.querySelector(`[data-action="${buttonDataAction}"]`);
        if (button) {
            button.disabled = true;
            button.classList.add('loading');
            const originalContent = button.innerHTML;
            button.dataset.originalContent = originalContent;
            button.innerHTML = `
                <span class="material-icons animate-spin mr-2 text-sm">refresh</span>
                ${loadingText}
            `;
        }
    }

    hideLoadingState(buttonDataAction, originalText) {
        const button = document.querySelector(`[data-action="${buttonDataAction}"]`);
        if (button) {
            button.disabled = false;
            button.classList.remove('loading');
            button.innerHTML = button.dataset.originalContent || originalText;
        }
    }

    async showConfirmDialog(title, message, confirmText, cancelText) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 class="text-lg font-semibold mb-3">${title}</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <div class="flex space-x-3 justify-end">
                        <button class="cancel px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                            ${cancelText}
                        </button>
                        <button class="confirm px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;
            
            modal.querySelector('.cancel').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(false);
            });
            
            modal.querySelector('.confirm').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(true);
            });
            
            document.body.appendChild(modal);
        });
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
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

    simulateApiCall(delay = 1000) {
        return new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new OrderDetailManager();
});

// Export for potential external use
window.OrderDetailManager = OrderDetailManager;