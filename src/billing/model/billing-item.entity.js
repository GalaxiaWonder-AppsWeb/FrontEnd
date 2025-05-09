import { BillingItemId } from './billing-item.entity.js'
import { Money } from '../../shared/model/money.js'

export class BillingItem {
    constructor({
                    id = new BillingItemId(),
                    description = '',
                    unitPrice = new Money(0),
                    subtotal = null,
                    invoiceId = null
                }) {
        if (!(unitPrice instanceof Money)) {
            throw new Error('unitPrice must be an instance of Money')
        }

        this.id = id
        this.description = description
        this.unitPrice = unitPrice
        this.subtotal = subtotal || this.calculateSubtotal()
        this.invoiceId = invoiceId // puede ser null si aún no está asignado
    }

    calculateSubtotal() {
        return new Money(this.unitPrice.amount, this.unitPrice.currency)
    }

    toJSON() {
        return {
            id: this.id?.value,
            description: this.description,
            unitPrice: this.unitPrice?.toJSON(),
            subtotal: this.subtotal?.toJSON(),
            invoiceId: this.invoiceId?.value ?? null
        }
    }
}

export class BillingItemId {
    constructor() {
        this.value = crypto.randomUUID()
    }
}