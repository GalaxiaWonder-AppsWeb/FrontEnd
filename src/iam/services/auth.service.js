import axios from 'axios';

const propgmsApiUrl = import.meta.env.VITE_PROPGMS_API_URL;

export class AuthService {
    constructor() {
        this.baseUrl = propgmsApiUrl;
        this.httpOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }

    async register({ email, password }) {
        try {
            const res = await axios.get(`${this.baseUrl}/users`, {
                params: { email },
                headers: this.httpOptions.headers
            });

            if (res.data.length > 0) {
                throw new Error('User already exists');
            }

            const createRes = await axios.post(
                `${this.baseUrl}/users`,
                { email, password },
                this.httpOptions
            );

            return createRes.data;
        } catch (error) {
            console.error('[AuthService] Register error:', error.message);
            throw error;
        }
    }

    async login({ email, password }) {
        try {
            const res = await axios.get(`${this.baseUrl}/users`, {
                params: { email, password },
                headers: this.httpOptions.headers
            });

            const users = res.data;

            if (users.length === 0) {
                throw new Error('Invalid email or password');
            }

            localStorage.setItem('user', JSON.stringify(users[0]));
            return users[0];
        } catch (error) {
            console.error('[AuthService] Login error:', error.message);
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('user');
    }

    getCurrentUser() {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    }

    isLoggedIn() {
        return !!this.getCurrentUser();
    }
}
