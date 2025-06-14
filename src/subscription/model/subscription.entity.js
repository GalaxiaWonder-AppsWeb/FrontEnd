import { SubscriptionStatus } from './subscription-status.js'

export class Subscription {
    constructor({
                    id = null,
                    startDate = new Date(),
                    endDate = new Date(),
                    status = SubscriptionStatus.ACTIVE,
                    personId = null,
                    subscriptionPlan = null,
                    isAutoRenew = false
                }) {
        this.id = typeof id === 'number' ? id : null
        this.startDate = new Date(startDate)
        this.endDate = new Date(endDate)
        this.status = status
        this.personId = typeof personId === 'number' ? personId : null
        this.subscriptionPlan = typeof subscriptionPlan === 'number' ? subscriptionPlan : null
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
            id: this.id,
            startDate: this.startDate,
            endDate: this.endDate,
            status: this.status,
            personId: this.personId,
            subscriptionPlan: this.subscriptionPlan,
            isAutoRenew: this.isAutoRenew
        }
    }
}
