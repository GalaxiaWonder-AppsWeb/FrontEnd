import { Credentials } from './credentials.entity.js'
import { UserType } from './user-type.js'

export class UserAccount {
    constructor({
                    credentials = new Credentials(),
                    userType = UserType.CLIENT,
                    createdAt = new Date(),
                    lastLoginAt = null,
                    personId = null
                }) {
        this.id = new UserAccountId()
        this.email = credentials.email
        this.password = credentials.password
        this.userType = userType
        this.createdAt = createdAt
        this.lastLoginAt = lastLoginAt
        this.personId = personId
    }

    toJSON() {
        return {
            id: this.id.value,
            email: this.email,
            password: this.password,
            userType: this.userType,
            createdAt: this.createdAt,
            lastLoginAt: this.lastLoginAt,
            personId: this.personId
        }
    }
}

export class UserAccountId {
    constructor() {
        this.value = crypto.randomUUID()
    }
}