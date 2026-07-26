import { ApiResponse, SearchFilters, Train, Station, Route, Booking, AuditLog, User, Coach, Payment, Coupon, Notification, Passenger } from '../types';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('railway_jwt_token');
  }

  public setToken(token: string) {
    localStorage.setItem('railway_jwt_token', token);
  }

  public clearToken() {
    localStorage.removeItem('railway_jwt_token');
    localStorage.removeItem('railway_refresh_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const json: ApiResponse<T> = await response.json();
      if (!response.ok && !json.message) {
        return {
          success: false,
          message: `HTTP Error ${response.status}`,
          errors: [response.statusText]
        };
      }
      return json;
    } catch (err: any) {
      return {
        success: false,
        message: 'Network connection failed',
        errors: [err.message || 'Unable to connect to Railway server']
      };
    }
  }

  // --- Auth APIs ---
  public async login(credentials: { email: string; password: string }) {
    return this.request<{ user: User; token: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  public async register(userData: { name: string; email: string; password: string; role?: string; phone?: string }) {
    return this.request<{ user: User; token: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  public async getCurrentUser() {
    return this.request<{ user: User }>('/auth/me');
  }

  public async forgotPassword(email: string) {
    return this.request<{ status: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // --- Trains APIs ---
  public async searchTrains(filters: SearchFilters = {}) {
    const params = new URLSearchParams();
    if (filters.fromCode) params.append('from', filters.fromCode);
    if (filters.toCode) params.append('to', filters.toCode);
    if (filters.trainNumberOrName) params.append('search', filters.trainNumberOrName);
    if (filters.trainType) params.append('type', filters.trainType);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ trains: Train[]; total: number }>(`/trains${query}`);
  }

  public async getTrainDetails(idOrNumber: string) {
    return this.request<{ train: Train; route?: Route }>(`/trains/${idOrNumber}`);
  }

  public async createTrain(trainData: Partial<Train>) {
    return this.request<{ train: Train }>('/trains', {
      method: 'POST',
      body: JSON.stringify(trainData)
    });
  }

  public async updateTrain(id: string, updates: Partial<Train>) {
    return this.request<{ train: Train }>(`/trains/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public async deleteTrain(id: string) {
    return this.request<{ id: string }>(`/trains/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Stations APIs ---
  public async getStations(search?: string, zone?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (zone) params.append('zone', zone);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ stations: Station[]; total: number }>(`/stations${query}`);
  }

  public async getStationDetails(code: string) {
    return this.request<{ station: Station }>(`/stations/${code}`);
  }

  public async createStation(stationData: Partial<Station>) {
    return this.request<{ station: Station }>('/stations', {
      method: 'POST',
      body: JSON.stringify(stationData)
    });
  }

  public async updateStation(id: string, updates: Partial<Station>) {
    return this.request<{ station: Station }>(`/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public async deleteStation(id: string) {
    return this.request<{ id: string }>(`/stations/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Routes APIs ---
  public async getRoutes() {
    return this.request<{ routes: Route[] }>('/routes');
  }

  public async createRoute(routeData: Partial<Route>) {
    return this.request<{ route: Route }>('/routes', {
      method: 'POST',
      body: JSON.stringify(routeData)
    });
  }

  // --- Bookings APIs ---
  public async getMyBookings() {
    return this.request<{ bookings: Booking[] }>('/bookings/my-bookings');
  }

  public async getPNRStatus(pnr: string) {
    return this.request<{ booking: Booking; payment?: Payment }>(`/bookings/pnr/${pnr}`);
  }

  public async getTrainSeats(trainNumber: string, classType: string) {
    return this.request<{ coaches: Coach[] }>(`/bookings/seats/${trainNumber}/${classType}`);
  }

  public async createBooking(bookingData: {
    trainNumber: string;
    trainName?: string;
    fromStationCode: string;
    fromStationName?: string;
    toStationCode: string;
    toStationName?: string;
    journeyDate: string;
    travelClass: string;
    passengers?: Passenger[];
    selectedSeatIds?: string[];
    paymentMethod?: string;
    couponCode?: string;
    fare?: number;
  }) {
    return this.request<{ booking: Booking; payment: Payment }>('/bookings/create', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  public async cancelBooking(bookingId: string, reason?: string) {
    return this.request<{ refundAmount: number; cancellationFee: number; booking: Booking }>(`/bookings/cancel/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // --- Payments & Coupon APIs ---
  public async validateCoupon(code: string, fare: number) {
    return this.request<{ valid: boolean; discount: number; coupon?: Coupon }>('/payments/coupon/validate', {
      method: 'POST',
      body: JSON.stringify({ code, fare })
    });
  }

  public async getCoupons() {
    return this.request<{ coupons: Coupon[] }>('/payments/coupons');
  }

  public async getReceipt(paymentOrPnrId: string) {
    return this.request<{ payment: Payment }>(`/payments/receipt/${paymentOrPnrId}`);
  }

  // --- Notifications APIs ---
  public async getMyNotifications() {
    return this.request<{ notifications: Notification[]; unreadCount: number }>('/notifications/my-notifications');
  }

  public async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }

  public async markAllNotificationsRead() {
    return this.request<{ success: boolean }>('/notifications/read-all', {
      method: 'PATCH'
    });
  }

  public async sendBroadcastNotification(data: { title: string; message: string; priority?: string; type?: string }) {
    return this.request<{ success: boolean }>('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // --- Tracking APIs ---
  public async getLiveTracking(trainIdOrNum: string) {
    return this.request<{ tracking: any }>(`/tracking/live/${trainIdOrNum}`);
  }

  // --- Admin APIs ---
  public async getAdminMetrics() {
    return this.request<{ metrics: any }>('/admin/metrics');
  }

  public async getAdminUsers() {
    return this.request<{ users: User[] }>('/admin/users');
  }

  public async updateUserStatus(userId: string, status: 'active' | 'suspended') {
    return this.request<{ user: User }>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  public async updateUserRole(userId: string, role: 'passenger' | 'admin') {
    return this.request<{ user: User }>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  }

  public async getAuditLogs() {
    return this.request<{ auditLogs: AuditLog[] }>('/admin/audit-logs');
  }

  // --- AI Intelligence APIs ---
  public async sendAiChat(message: string, mode: 'passenger' | 'admin' = 'passenger', context?: any) {
    return this.request<{ reply: string; timestamp: string; mode: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, mode, context })
    });
  }

  public async getPublicMetrics() {
    return this.request<{ trainsCount: number; stationsCount: number; telemetryPrecision: number; passengersServed: string; }>('/analytics/public-metrics');
  }

  // --- Analytics & Reports APIs ---
  public async getAnalyticsOverview() {
    return this.request<{
      metrics: any;
      revenueTrends: any[];
      popularRoutes: any[];
      classDistribution: any[];
      stationTraffic: any[];
      delayStats: any;
    }>('/analytics/overview');
  }

  public async downloadReport(type: string = 'revenue') {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/analytics/reports/download?type=${type}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `railway_report_${type}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const api = new ApiClient();
