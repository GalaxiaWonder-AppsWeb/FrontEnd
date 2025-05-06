const propgmsApiUrl = import.meta.env.VITE_PROPGMS_API_URL;

export class BaseService {
    constructor(resourceEndpoint = '/resources') {
        this.resourceEndpoint = resourceEndpoint;
        this.serverBaseUrl = propgmsApiUrl;
        this.httpOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }

    // Constructs the full resource URL
    resourcePath() {
        return `${this.serverBaseUrl}${this.resourceEndpoint}`;
    }

    // Handles client/server errors
    handleError(error) {
        if (error instanceof Error) {
            console.error('Client-side error:', error.message);
        } else {
            console.error(`Server returned error (${error.status}):`, error);
        }
        throw new Error('Something went wrong. Please try again later.');
    }

    // Creates a new resource
    async create(resource) {
        try {
            const res = await fetch(this.resourcePath(), {
                method: 'POST',
                headers: this.httpOptions.headers,
                body: JSON.stringify(resource)
            });
            return await res.json();
        } catch (error) {
            this.handleError(error);
        }
    }

    // Deletes a resource by ID
    async delete(id) {
        try {
            const res = await fetch(`${this.resourcePath()}/${id}`, {
                method: 'DELETE',
                headers: this.httpOptions.headers
            });
            return await res.json();
        } catch (error) {
            this.handleError(error);
        }
    }

    // Updates a resource by ID
    async update(id, resource) {
        try {
            const res = await fetch(`${this.resourcePath()}/${id}`, {
                method: 'PUT',
                headers: this.httpOptions.headers,
                body: JSON.stringify(resource)
            });
            return await res.json();
        } catch (error) {
            this.handleError(error);
        }
    }

    // Retrieves all resources
    async getAll() {
        try {
            const res = await fetch(this.resourcePath(), {
                method: 'GET',
                headers: this.httpOptions.headers
            });
            return await res.json();
        } catch (error) {
            this.handleError(error);
        }
    }

    // Retrieves a resource by ID
    async getById(id) {
        try {
            const res = await fetch(`${this.resourcePath()}/${id}`, {
                method: 'GET',
                headers: this.httpOptions.headers
            });
            return await res.json();
        } catch (error) {
            this.handleError(error);
        }
    }
}