class EventService {
    constructor() {
        this.events = [];
        this.listeners = [];
        this.loadFromStorage();
    }

    loadFromStorage() {
        try {
            const savedEvents = localStorage.getItem('onboarding_events');
            if (savedEvents) {
                this.events = JSON.parse(savedEvents);
                console.log(`✅ ${this.events.length} eventos cargados desde localStorage`);
            }
        } catch (error) {
            console.error('Error cargando eventos:', error);
            this.events = [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('onboarding_events', JSON.stringify(this.events));
        } catch (error) {
            console.error('Error guardando eventos:', error);
        }
    }

    getAllEvents() {
        return [...this.events];
    }

    getUpcomingEvents(days = 30) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        return this.events.filter(event => {
            const eventDate = new Date(event.startDate || event.start_date);
            return eventDate >= today && eventDate <= futureDate;
        });
    }

    createEvent(eventData) {
        const newEvent = {
            id: Date.now(),
            ...eventData,
            created_at: new Date().toISOString(),
            alert_scheduled: false,
            days_until: this.calculateDaysUntil(eventData.start_date || eventData.startDate)
        };

        this.events.push(newEvent);
        this.saveToStorage();
        this.notifyListeners();

        console.log('✅ Evento creado en memoria:', newEvent);
        return newEvent;
    }

    calculateDaysUntil(startDate) {
        const eventDate = new Date(startDate);
        const today = new Date();
        const diffTime = eventDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    deleteEvent(id) {
        const index = this.events.findIndex(event => event.id === id);
        if (index !== -1) {
            this.events.splice(index, 1);
            this.saveToStorage();
            this.notifyListeners();
            return true;
        }
        return false;
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.events));
    }

    getStats() {
        const today = new Date();
        const upcomingEvents = this.getUpcomingEvents(30);

        return {
            total_events: this.events.length,
            upcoming_events: upcomingEvents.length,
            events_today: this.events.filter(e => {
                const eventDate = new Date(e.start_date || e.startDate);
                return eventDate.toDateString() === today.toDateString();
            }).length,
            events_next_7_days: upcomingEvents.filter(e => e.days_until <= 7).length
        };
    }

    clearAll() {
        this.events = [];
        localStorage.removeItem('onboarding_events');
        this.notifyListeners();
    }
}

export const eventService = new EventService();