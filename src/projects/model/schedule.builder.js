import { Schedule } from './schedule.entity.js';
import { Milestone } from './milestone.entity.js';

export class ScheduleBuilder {
    constructor() {
        this.schedule = new Schedule(); // Instancia vacía de Schedule
    }

    /**
     * Añade un nuevo Milestone al Schedule.
     * @param {string} name - Nombre del nuevo Milestone.
     * @returns {ScheduleBuilder} - Retorna la instancia actual del builder para encadenar llamadas.
     */
    addMilestone(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Milestone name must be a non-empty string.');
        }

        const newMilestone = new Milestone({ name }); // Crear el Milestone
        this.schedule.addMilestone(newMilestone); // Añadirlo al Schedule existente
        return this; // Permitir encadenamiento
    }

    /**
     * Añade un nuevo ScheduleItem al último Milestone del Schedule utilizando el factory.
     * @param {ScheduleItemFactory} factory - El factory para crear el ScheduleItem.
     * @returns {ScheduleBuilder} - Retorna la instancia actual del builder para encadenar llamadas.
     */
    addItemToLastMilestone(factory) {
        if (!factory || typeof factory.create !== 'function') {
            throw new Error('A valid ScheduleItemFactory is required.');
        }

        const lastMilestone = this.getLastMilestone(); // Obtener el último Milestone añadido
        if (!lastMilestone) {
            throw new Error('You must add at least one milestone before adding items.');
        }

        const item = factory.create(); // Crear el ScheduleItem utilizando el factory
        lastMilestone.addItem(item); // Usar el método del Milestone para añadir el item

        return this; // Permitir encadenamiento
    }

    /**
     * Construye y retorna la instancia de Schedule.
     * @returns {Schedule} - La instancia final del Schedule construida.
     */
    build() {
        return this.schedule;
    }

    /**
     * Obtiene el último Milestone del Schedule.
     * @returns {Milestone|null} - El último Milestone o `null` si no existen hitos.
     */
    getLastMilestone() {
        const { milestones } = this.schedule;
        return milestones.length > 0 ? milestones[milestones.length - 1] : null;
    }
}