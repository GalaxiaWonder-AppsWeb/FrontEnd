import {Money} from "../../shared/model/money.js";

export class SubscriptionPlan {
    constructor({
                    id = new SubscriptionPlanId(),
                    name = '',
                    description = '',
                    durationInDays = 0,
                    price = new Money(),
                    features = [],
                    planType = '',
                    maxMembers = 0,
                    maxStorage = 0,
                    maxProjects = 0
                }) {
        if (!SubscriptionPlan.isValidName(name)) {
            throw new Error('Plan name must be a non-empty string')
        }

        if (!(price instanceof Money)) {
            throw new Error('Price must be an instance of Money')
        }

        if (typeof durationInDays !== 'number' || durationInDays < 0) {
            throw new Error('Duration must be a non-negative number')
        }

        this.id = id
        this.name = name
        this.description = description
        this.durationInDays = durationInDays
        this.price = price
        this.features = features
        this.planType = planType
        this.maxMembers = maxMembers
        this.maxStorage = maxStorage
        this.maxProjects = maxProjects
    }

    static isValidName(name) {
        return typeof name === 'string' && name.trim().length > 0
    }

    isTrial() {
        return this.durationInDays === 0 || this.price.amount === 0
    }

    isFree() {
        return this.price.amount === 0
    }

    isPaid() {
        return this.price.amount > 0
    }

    hasFeature(featureKey) {
        return this.features.includes(featureKey)
    }

    toJSON() {
        return {
            id: this.id?.value,
            name: this.name,
            description: this.description,
            durationInDays: this.durationInDays,
            price: this.price?.toJSON(),
            features: this.features,
            planType: this.planType,
            maxMembers: this.maxMembers,
            maxStorage: this.maxStorage,
            maxProjects: this.maxProjects
        }
    }
}

export class SubscriptionPlanId {
    constructor() {
        this.value = crypto.randomUUID()
    }
}