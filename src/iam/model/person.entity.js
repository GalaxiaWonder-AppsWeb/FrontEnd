import { ProfessionalId }  from './professional-id.entity.js'

export class Person {
    constructor(name, lastName, email, phoneNumber, profession = '', professionalId = null) {
        this.id = new PersonId()
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

    toJSON() {
        return {
            id: this.id.value,
            name: this.name,
            lastName: this.lastName,
            email: this.email,
            phoneNumber: this.phoneNumber,
            profession: this.profession,
            professionalId: this.professionalId ? this.professionalId.value : null
        }
    }
}

export class PersonId {
    constructor() {
        this.value = crypto.randomUUID()
    }
}
