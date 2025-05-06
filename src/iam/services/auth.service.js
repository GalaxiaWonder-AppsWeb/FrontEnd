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
            // Primero verificar si ya existe el usuario
            const res = await fetch(`${this.baseUrl}/users?email=${email}`);
            const users = await res.json();
            if (users.length > 0) {
                throw new Error('User already exists');
            }

            // Crear nuevo usuario
            const createRes = await fetch(`${this.baseUrl}/users`, {
                method: 'POST',
                headers: this.httpOptions.headers,
                body: JSON.stringify({ email, password })
            });

            if (!createRes.ok) {
                const text = await createRes.text();
                throw new Error(`Failed to register: ${text}`);
            }

            return await createRes.json();
        } catch (error) {
            console.error('[AuthService] Register error:', error.message);
            throw error;
        }
    }

    async login({ email, password }) {
        try {
            const res = await fetch(`${this.baseUrl}/users?email=${email}&password=${password}`, {
                method: 'GET',
                headers: this.httpOptions.headers
            });

            if (!res.ok) {
                throw new Error('Login request failed');
            }

            const users = await res.json();

            if (users.length === 0) {
                throw new Error('Invalid email or password');
            }

            // Simulamos guardar un "token"
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
