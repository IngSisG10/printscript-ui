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

        if (response.status === 204) {
            return {} as T;
        }

        // Check Content-Type to handle both JSON and text/plain responses
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            // Handle text/plain responses (e.g., "success" or "fail")
            const text = await response.text();
            // Try to parse as JSON first, fallback to text
            try {
                return JSON.parse(text) as T;
            } catch {
                return text as T;
            }
        }
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


export const httpClient = new HttpClient(import.meta.env.VITE_NGINX_URL || 'http://localhost:8082');
export const httpUserClient = new HttpClient(import.meta.env.VITE_NGINX_URL || 'http://localhost:8082');
