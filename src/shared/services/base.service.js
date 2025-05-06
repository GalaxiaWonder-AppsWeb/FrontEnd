const propgmsApiUrl = import.meta.env.VITE_PROPGMS_API_URL;

export class BaseService {
    constructor(resourceEndpoint = '/resources', options = {}) {
        this.resourceEndpoint = resourceEndpoint;
        this.serverBaseUrl = propgmsApiUrl;
        this.httpOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (options.create) this.create = this._create;
        if (options.getAll) this.getAll = this._getAll;
        if (options.getById) this.getById = this._getById;
        if (options.update) this.update = this._update;
        if (options.delete) this.delete = this._delete;
    }

    resourcePath() {
        return `${this.serverBaseUrl}${this.resourceEndpoint}`;
    }

    handleError(error) {
        if (error instanceof Error) {
            console.error('Client-side error:', error.message);
        } else {
            console.error(`Server returned error (${error.status}):`, error);
        }
        throw new Error('Something went wrong. Please try again later.');
    }

    async _create(resource) {
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

    async _delete(id) {
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

    async _update(id, resource) {
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

    async _getAll() {
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

    async _getById(id) {
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