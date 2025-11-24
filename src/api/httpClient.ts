import { getToken } from "./tokenProvider";
import { ApiError } from "./ApiError";

export class HttpClient {
    constructor(
        private baseURL: string
    ) { }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = await getToken();

        const defaultHeaders: HeadersInit = {
            "Content-Type": "application/json"
        };

        if (token) {
            defaultHeaders["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(this.baseURL + endpoint, {
            ...options,
            headers: { ...defaultHeaders, ...options.headers }
        });

        if (!response.ok) {
            throw await ApiError.fromResponse(response);
        }

        return response.status === 204 ? ({} as T) : await response.json();
    }


    get<T>(endpoint: string): Promise<T> { return this.request<T>(endpoint); }

    post<T, B = unknown>(endpoint: string, body?: B): Promise<T> {
        return this.request<T>(endpoint, { method: "POST", body: JSON.stringify(body) });
    }

    put<T, B = unknown>(endpoint: string, body?: B): Promise<T> {
        return this.request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) });
    }

    delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "DELETE" });
    }
}


// Instancia singleton del cliente HTTP - fixme lo de local
export const httpClient = new HttpClient(process.env.VITE_API_BASE_URL || 'http://localhost:8082');
export const httpUserClient = new HttpClient(process.env.VITE_API_USER_BASE_URL || 'http://localhost:8082');
