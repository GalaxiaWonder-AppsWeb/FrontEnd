export class Workspace {
    constructor({
                    id = null,
                    organizationId = null,
                    createdBy = null,
                    createdAt = new Date(),
                    subscriptionId = null,
                    maxMembers = 0,
                    maxStorageSizeInBytes = 0,
                    maxProjects = 0
                }) {

        if (typeof organizationId !== 'number') {
            throw new Error('organizationId must be a number')
        }

        if (typeof createdBy !== 'number') {
            throw new Error('createdBy must be a number')
        }

        this.id = typeof id === 'number' ? id : null
        this.organizationId = organizationId
        this.createdBy = createdBy
        this.createdAt = createdAt
        this.subscriptionId = typeof subscriptionId === 'number' ? subscriptionId : null
        this.maxMembers = maxMembers
        this.maxStorageSizeInBytes = maxStorageSizeInBytes
        this.maxProjects = maxProjects
    }

    applySubscriptionPlan(plan) {
        this.maxMembers = plan.maxMembers
        this.maxStorageSizeInBytes = plan.maxStorageSizeInBytes
        this.maxProjects = plan.maxProjects
        this.subscriptionId = plan.id
    }

    setLimits({ members = null, storage = null, projects = null }) {
        if (members !== null) this.maxMembers = members
        if (storage !== null) this.maxStorageSizeInBytes = storage
        if (projects !== null) this.maxProjects = projects
    }

    getLimits() {
        return {
            maxMembers: this.maxMembers,
            maxStorageSizeInBytes: this.maxStorageSizeInBytes,
            maxProjects: this.maxProjects
        }
    }

    toJSON() {
        return {
            id: this.id,
            organizationId: this.organizationId,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            subscriptionId: this.subscriptionId,
            maxMembers: this.maxMembers,
            maxStorageSizeInBytes: this.maxStorageSizeInBytes,
            maxProjects: this.maxProjects
        }
    }
}
