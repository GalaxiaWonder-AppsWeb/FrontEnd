import {ProjectStatus} from './project-status.js'
import {Schedule} from './schedule.entity.js'
import {ProjectTeamMember} from './project-team-member.entity.js'

export class Project {
    constructor({
                    id = null,
                    name = '',
                    description = '',
                    status = ProjectStatus.BASIC_STUDIES,
                    schedule = new Schedule(),
                    budget = Number,
                    startingDate = new Date(),
                    endingDate = new Date(),
                    team = [],
                    organizationId = null,
                    contractor = null,
                    contractingEntityId = null,
                    createdBy = null,
                    createdAt = new Date()
                }) {
        if (!name || typeof name !== 'string') {
            throw new Error('Legal name is required and must be a non-empty string')
        }

        if (!description || typeof description !== 'string') {
            throw new Error('Description is required and must be a non-empty string')
        }

        if (!budget || typeof budget !== 'number') {
            throw new Error('Budget is required and must be a number')
        }

        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.schedule = schedule;
        this.budget = budget;
        this.startingDate = startingDate;
        this.endingDate = endingDate;
        this.team = team;
        this.organizationId = organizationId;
        this.contractor = contractor;
        this.contractingEntityId = contractingEntityId;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    updateStatus(status) {
        if (!Object.values(ProjectStatus).includes(status)) {
            throw new Error('Invalid project status')
        }
        this.status = status
    }

    updateDescription(description) {
        if (!description || typeof description !== 'string') {
            throw new Error('Description is required and must be a non-empty string')
        }
        this.description = description
    }

    addTeamMember(member) {
        if (!(member instanceof ProjectTeamMember)) {
            throw new Error('Member must be a valid ProjectTeamMember instance.');
        }

        this.team.push(member);
    }


    removeTeamMember(memberId) {
        if (typeof memberId !== 'number') {
            throw new Error('memberId must be a number')
        }

        this.team = this.team.filter(member => member.memberId !== memberId)
    }    
    
    toJSON() {
        console.log('Valor de this.id antes de serializar:', this.id);
        console.log('Valor de contractor antes de serializar:', this.contractor);
        
        // Asegurarnos de que el valor de contractor se serialice correctamente
        let contractorValue = null;
        if (this.contractor) {
            contractorValue = typeof this.contractor === 'object' && this.contractor.value !== undefined 
                ? this.contractor.value 
                : this.contractor;
        }
        
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            status: this.status,
            schedule: this.schedule,
            budget: this.budget,
            startingDate: this.startingDate,
            endingDate: this.endingDate,
            team: this.team,
            organizationId: this.organizationId,
            contractor: contractorValue,
            contractingEntityId: this.contractingEntityId,
            createdBy: this.createdBy,
            createdAt: this.createdAt
        }
    }
}