import axios from 'axios'

import {UserAccount} from "../model/user-account.entity.js";
import {Credentials} from "../model/credentials.entity.js";
import {Person} from "../model/person.entity.js";
import {UserType} from "../model/user-type.js";

const propgmsApiUrl = import.meta.env.VITE_PROPGMS_API_URL

export class AuthService {
    constructor() {
        this.baseUrl = propgmsApiUrl
        this.httpOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    }

    async findUserByEmail(email) {
        const res = await axios.get(`${this.baseUrl}/users`, {
            params: { email },
            headers: this.httpOptions.headers
        })
        return res.data[0] || null
    }

    async register(account, person) {
        if (!(account instanceof UserAccount)) {
            throw new Error('Invalid account object')
        }

        if (!(person instanceof Person)) {
            throw new Error('Invalid person object')
        }

        try {
            const existingUser = await this.findUserByEmail(account.email)
            if (existingUser) {
                throw new Error('User already exists')
            }

            const personRes = await axios.post(
                `${this.baseUrl}/persons`,
                person.toJSON(),
                this.httpOptions
            )

            account.personId = personRes.data.id

            const createRes = await axios.post(
                `${this.baseUrl}/users`,
                account.toJSON(),
                this.httpOptions
            )

            return createRes.data
        } catch (error) {
            this.handleError('Register', error)
        }
    }

    async login(credentials) {
        if (!(credentials instanceof Credentials)) {
            throw new Error('Invalid credentials object')
        }

        try {
            console.log(propgmsApiUrl);
            console.log(credentials);
            const res = await axios.get(`${this.baseUrl}/users`, {
                params: {
                    email: credentials.email,
                    password: credentials.password
                },
                headers: this.httpOptions.headers
            })
            console.log(res)
            if (res.data.length === 0) {
                throw new Error('Invalid email or password')
            }

            const user = res.data[0]
            this.storeUser(user)
            return user
        } catch (error) {
            this.handleError('Login', error)
        }
    }

    logout() {
        localStorage.removeItem('user')
    }

    storeUser(user) {
        localStorage.setItem('user', JSON.stringify(user))
    }

    getCurrentUser() {
        const stored = localStorage.getItem('user')
        return stored ? JSON.parse(stored) : null
    }

    isLoggedIn() {
        return !!this.getCurrentUser()
    }

    handleError(context, error) {
        const msg = error.response?.data || error.message || 'Unexpected error'
        console.error(`[AuthService] ${context} error:`, msg)
        throw new Error(msg)
    }

    async getAllPersons() {
        try {
            const res = await axios.get(`
            ${this.baseUrl}/persons`,
              this.httpOptions)

            return res.data
        } catch (error) {
            this.handleError('GetAllPersons', error)
        }
    }
}
