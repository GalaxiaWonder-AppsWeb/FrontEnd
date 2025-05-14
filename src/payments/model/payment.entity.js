import {PaymentStatus} from "./payment-status.js";
import {PaymentMethodType} from "./payment-method-type.js";

export class Payment {
    constructor({
                    id = new PaymentId(),
                    amount,
                    status = PaymentStatus.PENDING,
                    paymentMethod,
                    paidAt = null,
                    invoiceId,
                    recurringAgreement = null
                }) {
        if (!(amount instanceof Money)) {
            throw new Error('amount must be an instance of Money')
        }

        if (!Object.values(PaymentStatus).includes(status)) {
            throw new Error('Invalid payment status')
        }

        if (!Object.values(PaymentMethodType).includes(paymentMethod)) {
            throw new Error('Invalid payment method')
        }

        this.id = id
        this.amount = amount
        this.status = status
        this.paymentMethod = paymentMethod
        this.paidAt = paidAt
        this.invoiceId = invoiceId
        this.recurringAgreement = recurringAgreement
    }

    markAsPaid(date = new Date()) {
        if (this.status === PaymentStatus.CONFIRMED) {
            throw new Error('Payment is already marked as paid')
        }
        this.status = PaymentStatus.CONFIRMED
        this.paidAt = date
    }

    cancel() {
        if (this.status !== PaymentStatus.PENDING) {
            throw new Error('Only pending payments can be cancelled')
        }
        this.status = PaymentStatus.FAILED
    }

    isPaid() {
        return this.status === PaymentStatus.CONFIRMED
    }

    toJSON() {
        return {
            id: this.id?.value,
            amount: this.amount?.toJSON(),
            status: this.status,
            paymentMethod: this.paymentMethod,
            paidAt: this.paidAt,
            invoiceId: this.invoiceId?.value ?? this.invoiceId,
            recurringAgreement: this.recurringAgreement?.toJSON?.() ?? null
        }
    }
}

export class PaymentId {
    constructor() {
        this.value = crypto.randomUUID()
    }
}