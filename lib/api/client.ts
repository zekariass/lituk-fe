import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8085';
const REFRESH_ENDPOINT = '/api/v1/auth/refresh';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string | null> | null = null;
  private isRedirectingToPricing = false;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (this.isRefreshRequest(config)) {
          return config;
        }

        const token = await this.ensureValidAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // If the request data is FormData and Content-Type is multipart/form-data,
        // remove it so axios can automatically set it with the correct boundary
        if (config.data instanceof FormData && config.headers) {
          const contentType = config.headers['Content-Type'];
          if (contentType === 'multipart/form-data' || contentType === 'application/json') {
            delete config.headers['Content-Type'];
          }
          // Use a much longer timeout for file uploads (5 minutes)
          if (!config.timeout || config.timeout <= 30000) {
            config.timeout = 5 * 60 * 1000;
          }
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        // Debug: Log all errors in development
        console.log('[API Interceptor] ===== ERROR CAUGHT =====');
        console.log('[API Interceptor] Status:', error.response?.status);
        console.log('[API Interceptor] URL:', error.config?.url);
        console.log('[API Interceptor] Full Response Data:', JSON.stringify(error.response?.data, null, 2));
        console.log('[API Interceptor] Error Message:', error.message);
        console.log('[API Interceptor] ===========================');

        // Handle subscription errors first - if handled, don't propagate the error
        const isSubscriptionErrorHandled = this.handleSubscriptionErrors(error);
        if (isSubscriptionErrorHandled) {
          console.log('[API Interceptor] ✅ SUBSCRIPTION ERROR HANDLED - REDIRECTING TO PRICING');
          // Return a never-resolving promise to prevent component error handlers from executing
          // The page will redirect before this matters
          return new Promise(() => {});
        }

        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !this.isRefreshRequest(originalRequest)
        ) {
          originalRequest._retry = true;

          const accessToken = await this.refreshAccessToken();
          if (accessToken) {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            return this.client(originalRequest);
          }

          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );
  }

  private decodeJwtPayload(token: string): { exp?: number } | null {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        return null;
      }

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const json = atob(padded);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeJwtPayload(token);
    if (!payload?.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  }

  private async ensureValidAccessToken(): Promise<string | null> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return null;
    }

    if (!this.isTokenExpired(accessToken)) {
      return accessToken;
    }

    return this.refreshAccessToken();
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken || this.isTokenExpired(refreshToken)) {
        this.handleAuthFailure();
        return null;
      }

      try {
        const response = await axios.post(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        this.setTokens(accessToken, newRefreshToken ?? refreshToken);

        return accessToken;
      } catch {
        this.handleAuthFailure();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private isRefreshRequest(config?: InternalAxiosRequestConfig): boolean {
    return config?.url?.includes(REFRESH_ENDPOINT) ?? false;
  }

  private handleSubscriptionErrors(error: AxiosError): boolean {
    console.log('[Subscription Handler] Starting check...');
    console.log('[Subscription Handler] Window undefined?', typeof window === 'undefined');
    console.log('[Subscription Handler] Already redirecting?', this.isRedirectingToPricing);
    
    if (typeof window === 'undefined' || this.isRedirectingToPricing) {
      console.log('[Subscription Handler] ❌ Skipping - window undefined or already redirecting');
      return false;
    }

    const errorData = error.response?.data as { 
      errorCode?: string; 
      code?: string;
      exception?: string;
      message?: string;
      error?: {
        code?: string;
        message?: string;
      };
    } | undefined;

    // Check multiple possible error code locations
    const errorCode = errorData?.errorCode || errorData?.code || errorData?.error?.code;
    const exceptionType = errorData?.exception;
    const message = errorData?.message || errorData?.error?.message;

    console.log('[Subscription Handler] ===== CHECKING ERROR =====');
    console.log('[Subscription Handler] errorCode:', errorCode);
    console.log('[Subscription Handler] exceptionType:', exceptionType);
    console.log('[Subscription Handler] message:', message);
    console.log('[Subscription Handler] Full errorData:', errorData);
    console.log('[Subscription Handler] Status:', error.response?.status);

    // Check for subscription-related error codes
    const checks = {
      errorCodeFreeUsage: errorCode === 'FREE_USAGE_EXCEEDED',
      errorCodeSubscription: errorCode === 'SUBSCRIPTION_REQUIRED',
      exceptionMatch: exceptionType?.includes('SubscriptionRequiredException'),
      messageFreeLimit: message?.toLowerCase().includes('free mock test limit'),
      messageSubscribe: message?.toLowerCase().includes('subscribe to continue')
    };

    console.log('[Subscription Handler] Checks:', checks);

    const isSubscriptionError = 
      checks.errorCodeFreeUsage ||
      checks.errorCodeSubscription ||
      checks.exceptionMatch ||
      checks.messageFreeLimit ||
      checks.messageSubscribe;

    console.log('[Subscription Handler] Is subscription error?', isSubscriptionError);

    if (isSubscriptionError) {
      console.log('[Subscription Handler] ✅ SUBSCRIPTION ERROR DETECTED!');
      this.isRedirectingToPricing = true;

      const reason = errorCode === 'FREE_USAGE_EXCEEDED' || message?.toLowerCase().includes('free')
        ? 'free_usage_exceeded' 
        : 'subscription_required';

      console.log('[Subscription Handler] Redirecting to:', `/practice/pricing?reason=${reason}`);
      
      // Replace-style navigation (no back navigation)
      window.location.replace(`/practice/pricing?reason=${reason}`);
      
      return true; // Signal that we handled this error
    }

    console.log('[Subscription Handler] ❌ Not a subscription error');
    return false;
  }

  private handleAuthFailure(): void {
    this.clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('auth-storage');
    }
  }

  public getClient(): AxiosInstance {
    return this.client;
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  public async ensureSession(): Promise<boolean> {
    const accessToken = this.getAccessToken();
    if (accessToken && !this.isTokenExpired(accessToken)) {
      return true;
    }

    const refreshedToken = await this.refreshAccessToken();
    return !!refreshedToken;
  }

  public logout(): void {
    this.clearTokens();
  }
}

export const apiClient = new ApiClient();
export default apiClient.getClient();
