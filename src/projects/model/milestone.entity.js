import {ScheduleItem} from "./schedule-item.js";

export class Milestone {
    constructor({
                    id = null,
                    name = '',
                    startDate = new Date(),
                    endDate = new Date(),
                    projectId = null,
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
        
        // Parse id to number if it's a string that looks like a number
        if (typeof id === 'number') {
            this.id = id;
        } else if (typeof id === 'string' && !isNaN(Number(id))) {
            this.id = Number(id);
        } else {
            this.id = null;
        }
        
        this.name = name
        this.startDate = startDate
        this.endDate = endDate
        
        // Parse projectId to number if it's a string that looks like a number
        if (typeof projectId === 'number') {
            this.projectId = projectId;
        } else if (typeof projectId === 'string' && !isNaN(Number(projectId))) {
            this.projectId = Number(projectId);
        } else {
            this.projectId = projectId;
        }
        
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
    }    toJSON() {
        console.log('Serializing milestone:', this.id, this.name, 'projectId:', this.projectId);
        
        // Ensure id is numeric if it can be parsed
        const numericId = this.id ? (typeof this.id === 'string' && !isNaN(Number(this.id)) ? Number(this.id) : this.id) : null;
        const numericProjectId = this.projectId ? (typeof this.projectId === 'string' && !isNaN(Number(this.projectId)) ? Number(this.projectId) : this.projectId) : null;
        
        return {
            id: numericId,
            name: this.name,
            startDate: this.startDate,
            endDate: this.endDate,
            startingDate: this.startDate, // Include both formats for compatibility
            endingDate: this.endDate,     // Include both formats for compatibility
            projectId: numericProjectId,
            items: this.items
        }
    }
}