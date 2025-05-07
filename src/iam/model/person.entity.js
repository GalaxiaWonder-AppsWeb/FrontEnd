import ProfessionalId from './professional-id.entity.js'

export class Person {
    constructor(name, lastName, email, phoneNumber, profession = '', professionalId = null) {
        this.name = name
        this.lastName = lastName
        this.email = email
        this.phoneNumber = phoneNumber
        this.profession = profession

        if (professionalId !== null && !(professionalId instanceof ProfessionalId)) {
            throw new Error('professionalId must be an instance of ProfessionalId')
        }

        this.professionalId = professionalId
    }
}
