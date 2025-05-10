import { SubscriptionStatus } from './subscription-status.js'
import { PersonId } from '../../iam/model/person.entity.js'
import { SubscriptionPlanId } from './subscription-plan.entity.js'

export class Subscription {
    constructor({
                    id = new SubscriptionId(),
                    startDate = new Date(),
                    endDate = new Date(),
                    status = SubscriptionStatus.ACTIVE,
                    personId = new PersonId(),
                    subscriptionPlan = new SubscriptionPlanId(),
                    isAutoRenew = false
                }) {
        this.id = id
        this.startDate = new Date(startDate)
        this.endDate = new Date(endDate)
        this.status = status
        this.personId = personId
        this.subscriptionPlan = subscriptionPlan
        this.isAutoRenew = isAutoRenew
    }

    cancel() {
        if (this.status !== SubscriptionStatus.ACTIVE) {
            throw new Error('Only active subscriptions can be cancelled.')
        }
        this.status = SubscriptionStatus.CANCELLED
    }

    isActive() {
        const now = new Date()
        return (
            this.status === SubscriptionStatus.ACTIVE &&
            this.startDate <= now &&
            this.endDate >= now
        )
    }

    extend(newEndDate) {
        if (newEndDate <= this.endDate) {
            throw new Error('New end date must be after current end date.')
        }
        this.endDate = new Date(newEndDate)
    }

    toJSON() {
        return {
            id: this.id?.value,
            startDate: this.startDate,
            endDate: this.endDate,
            status: this.status,
            personId: this.personId?.value,
            subscriptionPlan: this.subscriptionPlan?.value,
            isAutoRenew: this.isAutoRenew
        }
    }
}

export class SubscriptionId {
    constructor() {
        this.value = crypto.randomUUID()
    }
}
