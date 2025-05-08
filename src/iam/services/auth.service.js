import axios from 'axios'

import {UserAccount} from "../model/user-account.entity.js";
import {Credentials} from "../model/credentials.entity.js";
import {Person} from "../model/person.entity.js";

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

    async register(credentials, person, role) {
        if (!(credentials instanceof Credentials)) {
            throw new Error('Invalid credentials object')
        }

        if (!(person instanceof Person)) {
            throw new Error('Invalid person object')
        }

        try {
            const existingUser = await this.findUserByEmail(credentials.email)
            if (existingUser) {
                throw new Error('User already exists')
            }

            const personRes = await axios.post(
                `${this.baseUrl}/persons`,
                person,
                this.httpOptions
            )

            const userAcc = new UserAccount({
                id: personRes.data.id,
                credentials,
                userType: role,
                personId: personRes.data.id
            })

            const createRes = await axios.post(
                `${this.baseUrl}/users`,
                userAcc,
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
            const res = await axios.get(`${this.baseUrl}/users`, {
                params: {
                    email: credentials.email,
                    password: credentials.password
                },
                headers: this.httpOptions.headers
            })

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
}
