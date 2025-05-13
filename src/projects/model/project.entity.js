import {ProjectStatus} from './project-status.js'
import {Schedule} from './schedule.entity.js'
import {OrganizationMemberId} from '../../organizations/model/organization-member.entity.js'
import {ContractingEntityId} from '../../shared/model/contracting-entity-id.js'
import {OrganizationId} from '../../organizations/model/organization.entity.js'
import {ProjectTeamMember, ProjectTeamMemberId} from './project-team-member.entity.js'

export class Organization {
    constructor({
                    id = new ProjectId(),
                    name = '',
                    description = '',
                    status = ProjectStatus.BASIC_STUDIES,
                    schedule = new Schedule(),
                    budget = Number,
                    startingDate = new Date(),
                    endingDate = new Date(),
                    team = [],
                    organizationId = new OrganizationId(),
                    contractor = new OrganizationMemberId(),
                    contractingEntityId = new ContractingEntityId()
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


        this.id = id
        this.name = name
        this.description = description
        this.status = status
        this.schedule = schedule
        this.budget = budget
        this.startingDate = startingDate
        this.endingDate = endingDate
        this.team = team
        this.organizationId = organizationId
        this.contractor = contractor
        this.contractingEntityId = contractingEntityId
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
        if (!(memberId instanceof ProjectTeamMemberId)) {
            throw new Error('MemberId must be a valid ProjectTeamMemberId instance.');
        }

        this.team = this.team.filter(member => member.memberId.value !== memberId.value);
    }


    toJSON() {
        console.log('Valor de this.id antes de serializar:', this.id);
        return {
            id: this.id?.value ?? null,
            name: this.name,
            description: this.description,
            status: this.status,
            schedule: this.schedule,
            budget: this.budget,
            startingDate: this.startingDate,
            endingDate: this.endingDate,
        }
    }
}

export class ProjectId {
    constructor(value) {
        // Si no se proporciona un valor, genera un UUID
        this.value = value || crypto.randomUUID();
    }
}