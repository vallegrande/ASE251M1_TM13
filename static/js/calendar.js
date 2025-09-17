// Data de ejemplo de eventos
const eventsData = {
    '2025-09': [
        { day: 5, title: 'Taller de música' },
        { day: 12, title: 'Día de huerto' },
        { day: 15, title: 'Reunión padres' },
        { day: 20, title: 'Juegos deportivos' },
        { day: 25, title: 'Taller de arte' },
        { day: 30, title: 'Día del deporte' }
    ],
    '2025-10': [
        { day: 3, title: 'Día de la mascota' },
        { day: 10, title: 'Taller de cocina' },
        { day: 17, title: 'Festival de música' },
        { day: 24, title: 'Día del arte' },
        { day: 31, title: 'Fiesta de disfraces' }
    ],
    '2025-11': [
        { day: 7, title: 'Taller de ciencias' },
        { day: 14, title: 'Día del deporte' },
        { day: 21, title: 'Exposición de arte' },
        { day: 28, title: 'Festival de talentos' }
    ]
};

// Clase principal del calendario
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        this.setupCalendar();
        this.addEventListeners();
        this.addAnimations();
    }

    setupCalendar() {
        this.updateCalendarHeader();
        this.renderCalendar();
    }

    updateCalendarHeader() {
        const headerTitle = document.querySelector('.calendar-header h2');
        if (headerTitle) {
            headerTitle.textContent = `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        }
    }

    getMonthEvents() {
        const yearMonth = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}`;
        return eventsData[yearMonth] || [];
    }

    renderCalendar() {
        const daysContainer = document.querySelector('.calendar-days');
        if (!daysContainer) return;

        // Limpiar el calendario actual
        daysContainer.innerHTML = '';

        // Obtener el primer día del mes y el total de días
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const totalDays = lastDay.getDate();
        const startingDay = firstDay.getDay();

        // Obtener eventos del mes actual
        const monthEvents = this.getMonthEvents();

        // Crear espacios vacíos para los días antes del primer día del mes
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'aspect-square';
            daysContainer.appendChild(emptyDay);
        }

        // Crear los días del mes
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'aspect-square relative group';
            
            const hasEvent = monthEvents.some(event => event.day === day);
            const eventDetails = monthEvents.find(event => event.day === day);
            
            dayElement.innerHTML = `
                <div class="absolute inset-0 rounded-lg ${hasEvent ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'} 
                     transition duration-300 transform hover:scale-105 cursor-pointer p-2 opacity-0">
                    <div class="text-right text-sm font-semibold text-gray-700 mb-2">${day}</div>
                    ${eventDetails ? `<div class="text-xs text-blue-600">${eventDetails.title}</div>` : ''}
                </div>
            `;

            // Agregar animación de entrada
            setTimeout(() => {
                dayElement.querySelector('div').classList.remove('opacity-0');
            }, 50 * day);

            daysContainer.appendChild(dayElement);
        }
    }

    addEventListeners() {
        // Botones de navegación
        const prevButton = document.querySelector('.calendar-nav-prev');
        const nextButton = document.querySelector('.calendar-nav-next');

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.updateCalendarWithAnimation('slide-right');
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.updateCalendarWithAnimation('slide-left');
            });
        }
    }

    updateCalendarWithAnimation(direction) {
        const calendarContent = document.querySelector('.calendar-container');
        if (!calendarContent) return;

        // Agregar clase de animación de salida
        calendarContent.classList.add(`${direction}-exit`);

        // Después de la animación de salida, actualizar el contenido
        setTimeout(() => {
            this.updateCalendarHeader();
            this.renderCalendar();
            calendarContent.classList.remove(`${direction}-exit`);
            calendarContent.classList.add(`${direction}-enter`);

            // Remover clase de animación de entrada
            setTimeout(() => {
                calendarContent.classList.remove(`${direction}-enter`);
            }, 300);
        }, 300);
    }

    addAnimations() {
        // Animaciones para eventos destacados
        const featuredEvents = document.querySelectorAll('.featured-event');
        this.setupIntersectionObserver(featuredEvents, 'fade-up');

        // Animaciones para actividades regulares
        const regularActivities = document.querySelectorAll('.regular-activity');
        this.setupIntersectionObserver(regularActivities, 'fade-in');
    }

    setupIntersectionObserver(elements, animationClass) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(animationClass);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px'
        });

        elements.forEach(element => {
            element.classList.add('opacity-0');
            observer.observe(element);
        });
    }
}

// Inicializar el calendario cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});