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

    updateContact({ email, phoneNumber }) {
        if (email) this.email = email
        if (phoneNumber) this.phoneNumber = phoneNumber
    }

    updateIdentity({ name, lastName }) {
        if (name) this.name = name
        if (lastName) this.lastName = lastName
    }

    updateProfession(profession) {
        this.profession = profession
    }

    assignProfessionalId(professionalId) {
        if (!(professionalId instanceof ProfessionalId)) {
            throw new Error('professionalId must be an instance of ProfessionalId')
        }
        this.professionalId = professionalId
    }

    removeProfessionalId() {
        this.professionalId = null
    }

    hasProfessionalId() {
        return this.professionalId !== null
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
