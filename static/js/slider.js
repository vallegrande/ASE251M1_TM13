class Slider {
    constructor(container) {
        this.container = container;
        this.slider = container.querySelector('.slider');
        this.slides = container.querySelectorAll('.slide');
        this.dotsContainer = container.querySelector('.slider-dots');
        this.prevButton = container.querySelector('.slider-prev');
        this.nextButton = container.querySelector('.slider-next');
        this.currentSlide = 0;
        this.slideCount = this.slides.length;
        this.interval = null;
        this.isAutoPlaying = true;
        this.autoPlayDuration = 7000;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        // Inicializar posiciones de slides
        this.slides.forEach((slide, index) => {
            slide.style.transform = `translateX(${index * 100}%)`;
            slide.setAttribute('aria-hidden', index !== 0);
        });

        // Crear indicadores
        this.createDots();
        
        // Configurar controles
        this.setupControls();
        
        // Iniciar autoplay
        this.startAutoPlay();
        
        // Eventos táctiles
        this.setupTouchEvents();
        
        // Eventos de teclado
        this.setupKeyboardEvents();

        // Pausar al perder el foco
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else if (this.isAutoPlaying) {
                this.startAutoPlay();
            }
        });
    }

    createDots() {
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('slider-dot');
            dot.setAttribute('aria-label', `Ir a slide ${index + 1}`);
            if (index === 0) {
                dot.classList.add('active');
                dot.setAttribute('aria-current', 'true');
            }
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
        this.dots = this.dotsContainer.querySelectorAll('.slider-dot');
    }

    setupControls() {
        this.prevButton.addEventListener('click', () => this.prevSlide());
        this.nextButton.addEventListener('click', () => this.nextSlide());
        
        // Eventos de hover para autoplay
        this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.container.addEventListener('mouseleave', () => {
            if (this.isAutoPlaying) this.startAutoPlay();
        });

        // Actualizar estado de los botones
        this.updateControlsState();
    }

    setupTouchEvents() {
        this.slider.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.pauseAutoPlay();
        }, { passive: true });

        this.slider.addEventListener('touchmove', (e) => {
            if (!this.touchStartX) return;
            
            const currentX = e.touches[0].clientX;
            const diff = this.touchStartX - currentX;
            
            // Prevenir scroll vertical si el deslizamiento es más horizontal
            if (Math.abs(diff) > 5) {
                e.preventDefault();
            }
        }, { passive: false });

        this.slider.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            const diff = this.touchStartX - this.touchEndX;

            if (Math.abs(diff) > 50) { // Umbral de 50px para considerar como swipe
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }

            if (this.isAutoPlaying) this.startAutoPlay();
            this.touchStartX = null;
            this.touchEndX = null;
        }, { passive: true });
    }

    setupKeyboardEvents() {
        this.container.setAttribute('tabindex', '0');
        this.container.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    this.prevSlide();
                    break;
                case 'ArrowRight':
                    this.nextSlide();
                    break;
                case ' ':
                    this.toggleAutoPlay();
                    break;
            }
        });
    }

    updateDots() {
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
            dot.setAttribute('aria-current', index === this.currentSlide);
        });
    }

    updateControlsState() {
        this.prevButton.disabled = this.currentSlide === 0;
        this.nextButton.disabled = this.currentSlide === this.slideCount - 1;
    }

    goToSlide(index, animate = true) {
        if (index < 0 || index >= this.slideCount) return;

        // Actualizar ARIA y visibilidad
        this.slides.forEach((slide, i) => {
            slide.setAttribute('aria-hidden', i !== index);
            if (animate) {
                slide.style.transform = `translateX(${100 * (i - index)}%)`;
            } else {
                slide.style.transition = 'none';
                slide.style.transform = `translateX(${100 * (i - index)}%)`;
                // Forzar reflow
                slide.offsetHeight;
                slide.style.transition = '';
            }
        });

        this.currentSlide = index;
        this.updateDots();
        this.updateControlsState();

        if (this.isAutoPlaying) this.resetAutoPlayTimer();
    }

    nextSlide() {
        if (this.currentSlide < this.slideCount - 1) {
            this.goToSlide(this.currentSlide + 1);
        } else {
            // Volver al principio con una transición suave
            this.slides.forEach((slide) => {
                slide.style.transition = 'none';
                slide.style.transform = `translateX(${100 * (this.slideCount)}%)`;
            });
            setTimeout(() => {
                this.slides.forEach((slide) => slide.style.transition = '');
                this.goToSlide(0);
            }, 50);
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    startAutoPlay() {
        this.isAutoPlaying = true;
        this.resetAutoPlayTimer();
    }

    pauseAutoPlay() {
        clearInterval(this.interval);
        this.interval = null;
    }

    toggleAutoPlay() {
        if (this.interval) {
            this.pauseAutoPlay();
            this.isAutoPlaying = false;
        } else {
            this.isAutoPlaying = true;
            this.startAutoPlay();
        }
    }

    resetAutoPlayTimer() {
        this.pauseAutoPlay();
        this.interval = setInterval(() => this.nextSlide(), this.autoPlayDuration);
    }
}

// Inicializar todos los sliders en la página
document.addEventListener('DOMContentLoaded', function() {
    const sliderContainers = document.querySelectorAll('.slider-container');
    sliderContainers.forEach(container => new Slider(container));
});