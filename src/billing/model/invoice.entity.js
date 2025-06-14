import { PaymentStatus } from './payment-status.js'
import { Money } from '../../shared/model/money.js'
import { BillingItem } from './billing-item.entity.js'

export class Invoice {
    constructor({
                    id = null,
                    payer = null,
                    status = PaymentStatus.PENDING,
                    issuedDate = new Date(),
                    dueDate = new Date(),
                    items = []
                }) {
        this.id = typeof id === 'number' ? id : null
        this.payer = typeof payer === 'number' ? payer : null
        this.status = status
        this.issuedDate = issuedDate
        this.dueDate = dueDate
        this.items = items
        this.totalAmount = this.calculateTotalAmount()
    }

    addItem(item) {
        if (!(item instanceof BillingItem)) {
            throw new Error('Item must be an instance of BillingItem')
        }
        item.invoiceId = this.id
        item.subtotal = item.calculateSubtotal()
        this.items.push(item)
        this.totalAmount = this.calculateTotalAmount()
    }

    calculateTotalAmount() {
        const sum = this.items.reduce((acc, item) => acc + item.subtotal.amount, 0)
        const currency = this.items[0]?.subtotal?.currency ?? 'PEN'
        return new Money(sum, currency)
    }

    markAsPaid() {
        this.status = PaymentStatus.PAID
    }

    isOverdue(currentDate = new Date()) {
        return this.status !== PaymentStatus.PAID && new Date(this.dueDate) < currentDate
    }

    toJSON() {
        return {
            id: this.id,
            payer: this.payer,
            status: this.status,
            issuedDate: this.issuedDate,
            dueDate: this.dueDate,
            totalAmount: this.totalAmount.toJSON(),
            items: this.items.map(i => i.toJSON())
        }
    }
}
