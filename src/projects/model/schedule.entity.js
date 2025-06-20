import {Milestone} from './milestone.entity.js';

export class Schedule {
    constructor({ milestones = [] } = {}) {
        if (!Array.isArray(milestones)) {
            throw new Error('Milestones must be an array.');
        }
        this.milestones = milestones;
    }

    addMilestone(milestone) {
        if (!(milestone instanceof Milestone)) {
            throw new Error('Milestone must be a valid instance of Milestone.');
        }

        this.milestones.push(milestone);
    }

    removeMilestone(milestoneId) {
        if (typeof milestoneId !== 'number' || isNaN(milestoneId)) {
            throw new Error('MilestoneId must be a valid instance of MilestoneId.');
        }

        this.milestones = this.milestones.filter(
            milestone => milestone.id.value !== milestoneId.value
        );
    }

    toJSON() {
        return {
            milestones: this.milestones.map(milestone => milestone.toJSON())
        };
    }
}