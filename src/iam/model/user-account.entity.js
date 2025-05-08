import { Credentials } from './credentials.entity.js'
import { UserType } from './user-type.js'

export class UserAccount {
    constructor({
                    id,
                    credentials = new Credentials(),
                    userType = UserType.CLIENT,
                    createdAt = new Date(),
                    lastLoginAt = null,
                    personId = null
                }) {
        this.id = id
        this.email = credentials.email
        this.password = credentials.password
        this.userType = userType
        this.createdAt = createdAt
        this.lastLoginAt = lastLoginAt
        this.personId = personId
    }
}