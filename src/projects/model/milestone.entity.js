import {ScheduleItem} from "./schedule-item.js";

export class Milestone {
    constructor({
                    id = new MilestoneId(),
                    name = '',
                    startDate = new Date(),
                    endDate = new Date(),
                    items = [],
                }) {
        if (!name || typeof name !== 'string') {
            throw new Error('Name is required and must be a non-empty string')
        }

        if (!(startDate instanceof Date)) {
            throw new Error('Start date must be a valid Date object');
        }

        if (!(endDate instanceof Date)) {
            throw new Error('End date must be a valid Date object');
        }

        if (endDate < startDate) {
            throw new Error('End date cannot be earlier than start date');
        }

        this.id = id
        this.name = name
        this.startDate = startDate
        this.endDate = endDate
        this.items = items
    }

    updateName(newName) {
        if (!newName || typeof newName !== 'string') {
            throw new Error('New name is required and must be a non-empty string')
        }
        this.name = newName
    }

    updateStartDate(newStartDate) {
        if (!(newStartDate instanceof Date)) {
            throw new Error('New start date is required and must be a Date object')
        }
        this.startDate = newStartDate
    }

    updateEndDate(newEndDate) {
        if (!(newEndDate instanceof Date)) {
            throw new Error('New end date is required and must be a Date object')
        }
        this.endDate = newEndDate
    }

    addItem(item) {
        if (!(item instanceof ScheduleItem)) {
            throw new Error('Item must be a valid ScheduleItem');
        }
        this.items.push(item);
    }

    removeItem(item) {
        const index = this.items.indexOf(item);
        if (index === -1) {
            throw new Error('Item not found in the milestone');
        }
        this.items.splice(index, 1);
    }

    toJSON() {
        console.log('Valor de this.id antes de serializar:', this.id);
        return {
            id: this.id?.value ?? null,
            name: this.name,
            startDate: this.startDate,
            endDate: this.endDate,
            items: this.items
        }
    }
}

export class MilestoneId {
    constructor(value) {
        this.value = value || crypto.randomUUID()
    }

    toJSON() {
        return this.value
    }
}