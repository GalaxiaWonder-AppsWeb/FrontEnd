import { TransactionId } from './transaction.entity.js'
import { PaymentId } from './payment.entity.js'
import { TransactionStatus } from './transaction-status.js'

export class Transaction {
    constructor({
                    id = new TransactionId(),
                    paymentId,
                    attemptAt = new Date(),
                    status = TransactionStatus.INITIATED,
                    gatewayResponse = ''
                }) {
        if (!Object.values(TransactionStatus).includes(status)) {
            throw new Error('Invalid transaction status')
        }

        this.id = id
        this.paymentId = paymentId instanceof PaymentId ? paymentId : new PaymentId(paymentId)
        this.attemptAt = attemptAt
        this.status = status
        this.gatewayResponse = gatewayResponse
    }

    succeed(response = '') {
        this.status = TransactionStatus.SUCCESS
        this.gatewayResponse = response
    }

    fail(response = '') {
        this.status = TransactionStatus.FAILED
        this.gatewayResponse = response
    }

    isPending() {
        return this.status === TransactionStatus.PENDING
    }

    toJSON() {
        return {
            id: this.id?.value,
            paymentId: this.paymentId?.value,
            attemptAt: this.attemptAt,
            status: this.status,
            gatewayResponse: this.gatewayResponse
        }
    }
}


export class TransactionId {
    constructor() {
        this.value = crypto.randomUUID()
    }
}