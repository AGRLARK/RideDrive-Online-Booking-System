interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    // Get token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(email: string, password: string, name: string, userType: 'rider' | 'driver') {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, userType }),
    });
  }

  async logout() {
    const response = await this.request('/auth/logout', { method: 'POST' });
    this.removeToken();
    return response;
  }

  // Rider endpoints
  async requestRide(pickup: any, dropoff: any) {
    return this.request('/rides/request', {
      method: 'POST',
      body: JSON.stringify({ pickup, dropoff }),
    });
  }

  async getRideStatus(rideId: string) {
    return this.request(`/rides/${rideId}/status`);
  }

  async cancelRide(rideId: string) {
    return this.request(`/rides/${rideId}/cancel`, { method: 'POST' });
  }

  // Driver endpoints
  async updateDriverStatus(isOnline: boolean) {
    return this.request('/driver/status', {
      method: 'POST',
      body: JSON.stringify({ isOnline }),
    });
  }

  async acceptRide(rideId: string) {
    return this.request(`/rides/${rideId}/accept`, { method: 'POST' });
  }

  async declineRide(rideId: string) {
    return this.request(`/rides/${rideId}/decline`, { method: 'POST' });
  }

  async startRide(rideId: string) {
    return this.request(`/rides/${rideId}/start`, { method: 'POST' });
  }

  async endRide(rideId: string) {
    return this.request(`/rides/${rideId}/end`, { method: 'POST' });
  }

  async updateLocation(latitude: number, longitude: number) {
    return this.request('/driver/location', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    });
  }
}

export const apiClient = new ApiClient();