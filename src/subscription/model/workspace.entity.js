import {OrganizationId} from "../../organizations/model/organization.entity.js";
import {PersonId} from "../../iam/model/person.entity.js";
import {SubscriptionId} from "./subscription.entity.js";

export class Workspace {
    constructor({
                    id = new WorkspaceId(),
                    organizationId = new OrganizationId(),
                    createdBy = new PersonId(),
                    createdAt = new Date(),
                    subscriptionId = new SubscriptionId(),
                    maxMembers = 0,
                    maxStorageSizeInBytes = 0,
                    maxProjects = 0
                }) {
        this.id = id
        this.organizationId = organizationId
        this.createdBy = createdBy
        this.createdAt = createdAt
        this.subscriptionId = subscriptionId
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
            id: this.id?.value,
            organizationId: this.organizationId?.value,
            createdBy: this.createdBy?.value,
            createdAt: this.createdAt,
            subscriptionId: this.subscriptionId?.value,
            maxMembers: this.maxMembers,
            maxStorageSizeInBytes: this.maxStorageSizeInBytes,
            maxProjects: this.maxProjects
        }
    }
}

export class WorkspaceId {
    constructor() {
        this.value = crypto.randomUUID()
    }
}
