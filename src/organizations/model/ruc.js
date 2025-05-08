export class Ruc {
    constructor(value) {
        this.value = value
    }

    isValid() {
        const regex = /^\d{11}$/
        if (!regex.test(this.value)) return false

        const prefix = this.value.substring(0, 2)
        return ['10', '15', '16', '17', '20'].includes(prefix)
    }

    getError() {
        if (!/^\d{11}$/.test(this.value)) {
            return 'RUC must be exactly 11 digits'
        }

        const prefix = this.value.substring(0, 2)
        if (!['10', '15', '16', '17', '20'].includes(prefix)) {
            return 'RUC must start with a valid SUNAT prefix (10, 15, 16, 17, 20)'
        }

        return null
    }
}
