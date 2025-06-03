import { PersonId } from '../../iam/model/person.entity.js'
import { PaymentMethodType } from './payment-method-type.js'

export class RecurringPaymentAgreement {
    constructor({
                    id = new RecurringPaymentAgreementId(),
                    isActive = true,
                    paymentMethod,
                    startDate = new Date(),
                    nextPaymentDate = null,
                    personId
                }) {
        if (!Object.values(PaymentMethodType).includes(paymentMethod)) {
            throw new Error('Invalid payment method')
        }

        if (!(personId instanceof PersonId)) {
            throw new Error('personId must be an instance of PersonId')
        }

        this.id = id
        this.isActive = isActive
        this.paymentMethod = paymentMethod
        this.startDate = new Date(startDate)
        this.nextPaymentDate = nextPaymentDate ? new Date(nextPaymentDate) : null
        this.personId = personId
    }

    deactivate() {
        this.isActive = false
    }

    reactivate() {
        this.isActive = true
    }

    scheduleNextPayment(date) {
        if (!(date instanceof Date)) {
            throw new Error('Next payment date must be a Date')
        }
        this.nextPaymentDate = date
    }

    toJSON() {
        return {
            id: this.id?.value,
            isActive: this.isActive,
            paymentMethod: this.paymentMethod,
            startDate: this.startDate,
            nextPaymentDate: this.nextPaymentDate,
            personId: this.personId?.value
        }
    }
}

export class RecurringPaymentAgreementId {
    constructor() {
        this.value = crypto.randomUUID()
    }
}
