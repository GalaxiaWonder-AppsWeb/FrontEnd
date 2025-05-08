import { ProfessionalIdType } from './professional-id.type.js'

export class ProfessionalId {
    constructor(value = '', type = ProfessionalIdType.CIP) {
        this.value = value
        this.type = type
    }

    isValid() {
        if (!this.value || typeof this.value !== 'string') return false

        switch (this.type) {
            case ProfessionalIdType.CIP:
                // Solo dígitos, 6-8 caracteres
                return /^\d{6,8}$/.test(this.value)

            case ProfessionalIdType.CAP:
                // Solo dígitos, 5-7 caracteres
                return /^\d{5,7}$/.test(this.value)

            default:
                return false
        }
    }

    getError() {
        if (this.isValid()) return null

        switch (this.type) {
            case ProfessionalIdType.CIP:
                return 'CIP ID must be 6 to 8 numeric digits'

            case ProfessionalIdType.CAP:
                return 'CAP ID must be 5 to 7 numeric digits'

            default:
                return 'Invalid professional ID type'
        }
    }
}
