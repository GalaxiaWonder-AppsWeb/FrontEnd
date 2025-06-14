import { ProfessionalId }  from './professional-id.entity.js'

export class Person {    constructor(name, lastName, email, phoneNumber, profession = '', professionalId = null, profilePicture = '', id = null) {
        // Aseguramos que id sea numérico o null
        this.id = typeof id === 'number' ? id : null
        this.name = name
        this.lastName = lastName
        this.email = email
        this.phoneNumber = phoneNumber
        this.profession = profession
        this.profilePicture = profilePicture

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
            // Solo incluir id si no es null (el backend asignará uno)
            ...(this.id !== null && { id: this.id }),
            name: this.name,
            lastName: this.lastName,
            email: this.email,
            phoneNumber: this.phoneNumber,
            profession: this.profession,
            professionalId: this.professionalId ? this.professionalId.value : null,
            profilePicture: this.profilePicture || ''
        }
    }
}