import { Credentials } from './credentials.entity.js'
import { UserType } from './user-type.js'

export class UserAccount {
    constructor({
                    id = null,
                    credentials = new Credentials(),
                    userType = UserType.CLIENT,
                    createdAt = new Date(),
                    lastLoginAt = null,
                    personId = null
                }) {        // Aseguramos que id sea numérico o null
        this.id = typeof id === 'number' ? id : null
        this.email = credentials.email
        this.password = credentials.password
        this.userType = userType
        this.createdAt = createdAt
        this.lastLoginAt = lastLoginAt
        // Aseguramos que personId sea numérico o null
        this.personId = typeof personId === 'number' ? personId : null
    }    toJSON() {
        return {
            // Solo incluir id si no es null
            ...(this.id !== null && { id: this.id }),
            email: this.email,
            password: this.password,
            userType: this.userType,
            createdAt: this.createdAt,
            lastLoginAt: this.lastLoginAt,
            // Solo incluir personId si no es null
            ...(this.personId !== null && { personId: this.personId })
        }
    }
}