export class Money {
    constructor(amount = 0, currency = 'PEN') {
        if (typeof amount !== 'number' || isNaN(amount)) {
            throw new Error('Amount must be a valid number')
        }

        if (typeof currency !== 'string' || currency.trim() === '') {
            throw new Error('Currency must be a non-empty string')
        }

        this.amount = amount
        this.currency = currency.toUpperCase()
    }

    add(other) {
        this.#validateCurrencyMatch(other)
        return new Money(this.amount + other.amount, this.currency)
    }

    subtract(other) {
        this.#validateCurrencyMatch(other)
        return new Money(this.amount - other.amount, this.currency)
    }

    multiply(factor) {
        if (typeof factor !== 'number' || isNaN(factor)) {
            throw new Error('Factor must be a valid number')
        }
        return new Money(this.amount * factor, this.currency)
    }

    equals(other) {
        return (
            other instanceof Money &&
            this.currency === other.currency &&
            this.amount === other.amount
        )
    }

    toJSON() {
        return {
            amount: this.amount,
            currency: this.currency
        }
    }

    #validateCurrencyMatch(other) {
        if (!(other instanceof Money)) {
            throw new Error('Argument must be a Money instance')
        }
        if (this.currency !== other.currency) {
            throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`)
        }
    }
}
