class NotificationService {
    constructor() {
        this.notifications = [];
        this.listeners = [];
        this.nextId = 1;
    }

    showNotification(title, message, type = 'success', duration = 5000) {
        const id = this.nextId++;
        const notification = {
            id,
            title,
            message,
            type,
            timestamp: new Date(),
            duration
        };

        this.notifications.push(notification);
        this.notifyListeners();

        setTimeout(() => {
            this.removeNotification(id);
        }, duration);

        return id;
    }

    showEventCreated(event) {
        const daysUntil = this.calculateDaysUntil(event.start_date || event.startDate);

        return this.showNotification(
            '🎉 Evento Creado Exitosamente',
            `${event.title}\n📅 ${new Date(event.start_date || event.startDate).toLocaleDateString()}\n👤 ${event.responsible_email}\n⏳ ${daysUntil} días restantes`,
            'success',
            7000
        );
    }

    calculateDaysUntil(startDate) {
        const eventDate = new Date(startDate);
        const today = new Date();
        const diffTime = eventDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.notifyListeners();
    }

    clearAll() {
        this.notifications = [];
        this.notifyListeners();
    }

    getAll() {
        return [...this.notifications];
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.notifications));
    }
}

export const notificationService = new NotificationService();