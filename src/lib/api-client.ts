import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { notFound } from 'next/navigation';
import Cookies from 'js-cookie';
import { decryptToken } from './encryption';

// Extend AxiosRequestConfig to include our custom property
declare module 'axios' {
    export interface AxiosRequestConfig {
        skipAuth?: boolean;
    }
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
const apiBase = baseUrl ? (baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`) : '';

const api = axios.create({
    baseURL: `${apiBase}admin/`,
    headers: {},
});

export const financialApi = axios.create({
    baseURL: `${apiBase}financial-manager/`,
    headers: {},
});

export const orderApi = axios.create({
    baseURL: `${apiBase}order-manager/`,
    headers: {},
});

const setupInterceptors = (instance: any) => {
    instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
        // During static export, we only care about client-side behavior
        const encryptedToken = typeof window !== 'undefined' ? Cookies.get('token') : undefined;

        if (encryptedToken && !config.skipAuth) {
            const token = decryptToken(encryptedToken);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    });

    instance.interceptors.response.use(
        (response: any) => response,
        (error: any) => {
            if (axios.isAxiosError(error)) {
                // Check if user account was deactivated by the backend (code 611)
                if (error.response?.data?.code === 611) {
                    console.warn("User account deactivated (611). Redirecting to inactive page...");
                    if (typeof window !== 'undefined') {
                        window.location.href = '/inactive';
                    }
                } else if (error.response?.status === 401) {
                    console.warn("Session expired. Redirecting to login...");

                    // Clear cookies
                    Cookies.remove('token');
                    Cookies.remove('user_role');

                    // Redirect to login if on client side
                    if (typeof window !== 'undefined') {
                        window.location.href = '/';
                    }
                }
            }
            return Promise.reject(error);
        }
    );
};

setupInterceptors(api);
setupInterceptors(financialApi);
setupInterceptors(orderApi);

/**
 * Handle API errors and return a consistent error structure
 */
export const handleApiError = (error: any) => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;

        if (axiosError.response) {
            const status = axiosError.response.status;
            const data = axiosError.response.data as any;

            if (status === 401) {
                return {
                    message: "Session expired. Please log in again.",
                    status,
                    data
                };
            }

            if (status === 403) {
                return {
                    message: "Access forbidden.",
                    status,
                    data
                };
            }

            if (status === 404) {
                notFound();
            }

            const serverMessage = (data?.errors && Array.isArray(data.errors) && data.errors.length > 0)
                ? data.errors[0]
                : data?.message || "Server error occurred. Please try again later.";

            const errorObj = {
                message: serverMessage,
                status,
                data
            };

            if (status >= 500) {
                throw error;
            }

            return errorObj;
        } else if (axiosError.request) {
            return {
                message: "Failed to connect to the server.",
                status: 0,
                data: null
            };
        }
    }

    return {
        message: error.message || "An unexpected error occurred.",
        status: 500,
        data: null
    };
};

export default api;
