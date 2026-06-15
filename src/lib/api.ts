import i18n from '../i18n';

const BASE = 'http://localhost:4000';

function getToken() {
  return localStorage.getItem('accessToken');
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = getToken();
  const lang = i18n.language || localStorage.getItem('i18nextLng') || 'en';
  const shortLang = lang.split('-')[0].toLowerCase();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': shortLang,
    'X-Locale': shortLang,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    if ((res.status === 401 || res.status === 403) && retry) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // retry with new token
        return request<T>(path, options, false);
      }
      throw new Error('Session expired. Please log in again.');
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string; user: { id: number; email: string; role: string; fullName: string } }>(
      '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }
    ),
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  sendOtp: (phone: string) =>
    request<{ message: string; otp?: string }>('/auth/otp/send', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, otp: string) =>
    request<{ accessToken: string; refreshToken: string; user: { id: number; email: string; role: string; phone?: string } }>(
      '/auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone, otp }) }
    ),
  register: (fullName: string, email: string, password: string) =>
    request<{ id: number; email: string; role: string }>('/auth/register', {
      method: 'POST', body: JSON.stringify({ fullName, email, password }),
    }),
  logout: (refreshToken: string) =>
    request<{ message: string }>('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  resetPassword: (token: string, password: string) =>
    request<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
};

// ── Bookings ─────────────────────────────────────────────────────────────────
export const bookingsApi = {
  getAll: () => request<any[]>('/bookings'),
  getById: (id: string | number) => request<any>(`/bookings/${id}`),
  create: (body: any) => request<any>('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  adminCreate: (body: any) => request<any>('/bookings/admin', { method: 'POST', body: JSON.stringify(body) }),
  updateStatus: (id: number, status: string) =>
    request<any>(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  cancel: (id: number) => request<any>(`/bookings/${id}/cancel`, { method: 'PATCH' }),
  getMeetingLink: (id: number) => request<{ meeting_link: string }>(`/bookings/${id}/meeting-link`, { method: 'POST' }),
};

// ── Suites ───────────────────────────────────────────────────────────────────
export const suitesApi = {
  getAll: () => request<any[]>('/suites'),
  create: (body: any) => request<any>('/suites', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: any) => request<any>(`/suites/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: number) => request<any>(`/suites/${id}`, { method: 'DELETE' }),
};

// ── Add-ons ──────────────────────────────────────────────────────────────────
export const addonsApi = {
  getAll: () => request<any[]>('/addons'),
  create: (body: any) => request<any>('/addons', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: any) => request<any>(`/addons/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: number) => request<any>(`/addons/${id}`, { method: 'DELETE' }),
};

// ── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => request<any[]>('/users'),
  me: () => request<any>('/users/me'),
  updateMe: (body: { fullName?: string; phone?: string; dateOfBirth?: string }) => request<any>('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  getById: (id: string) => request<any>(`/users/${id}`),
  create: (body: { fullName: string; email: string; phone?: string }) =>
    request<any>('/users', { method: 'POST', body: JSON.stringify(body) }),
  toggleStatus: (id: string) =>
    request<any>(`/users/${id}/status`, { method: 'PATCH' }),
  resendSetup: (id: string) =>
    request<any>(`/users/${id}/resend-setup`, { method: 'POST' }),
};

// ── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
  getAll: () => request<any[]>('/payments/all'),
  getMine: () => request<any[]>('/payments/me'),
  createOrder: (bookingId: number, amount: number, method: string) =>
    request<{ paymentId: number; orderId: string; amount: number; keyId: string }>(
      '/payments/create-order',
      { method: 'POST', body: JSON.stringify({ bookingId, amount, method }) }
    ),
  verifyPayment: (paymentId: number, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) =>
    request<{ success: boolean; payment: any }>(
      '/payments/verify-payment',
      { method: 'POST', body: JSON.stringify({ paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) }
    ),
};

// ── Celebration Packages ─────────────────────────────────────────────────────
export const celebrationPackagesApi = {
  getPublic: () => request<any[]>('/celebration-packages'),
  getAll: () => request<any[]>('/celebration-packages/all'),
  create: (body: any) => request<any>('/celebration-packages', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: any) => request<any>(`/celebration-packages/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: number) => request<any>(`/celebration-packages/${id}`, { method: 'DELETE' }),
};

// ── Reports ──────────────────────────────────────────────────────────────────
export const reportsApi = {
  revenue: (start?: string, end?: string) => {
    const q = new URLSearchParams();
    if (start) q.set('start', start);
    if (end) q.set('end', end);
    return request<any[]>(`/reports/revenue?${q}`);
  },
  bookings: (start?: string, end?: string) => {
    const q = new URLSearchParams();
    if (start) q.set('start', start);
    if (end) q.set('end', end);
    return request<any[]>(`/reports/bookings?${q}`);
  },
  customers: (start?: string, end?: string) => {
    const q = new URLSearchParams();
    if (start) q.set('start', start);
    if (end) q.set('end', end);
    return request<any>(`/reports/customers?${q}`);
  },
};

// ── Offers & Coupons ────────────────────────────────────────────────────────
export const offersApi = {
  getAll: () => request<{ data: any[]; total: number }>('/offers'),
  getActive: () => request<any[]>('/offers/active'),
  create: (body: any) => request<any>('/offers', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: any) => request<any>(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: number) => request<any>(`/offers/${id}`, { method: 'DELETE' }),
};

export const couponsApi = {
  getAll: () => request<{ data: any[]; total: number }>('/coupons'),
  getActive: () => request<any[]>('/coupons/active'),
  create: (body: any) => request<any>('/coupons', { method: 'POST', body: JSON.stringify(body) }),
  remove: (id: number) => request<any>(`/coupons/${id}`, { method: 'DELETE' }),
};

export const offerConfigsApi = {
  getMap: () => request<Record<string, string>>('/offer-configurations/map'),
  upsert: (body: { configKey: string; configValue: string; valueType?: string; label?: string; description?: string }) =>
    request<any>('/offer-configurations', { method: 'POST', body: JSON.stringify(body) }),
};

export const bookingRulesApi = {
  getMap: () => request<Record<string, string>>('/booking-rules/map'),
  upsert: (body: { ruleKey: string; ruleValue: string; valueType?: string; label?: string; description?: string }) =>
    request<any>('/booking-rules', { method: 'POST', body: JSON.stringify(body) }),
};

// Public: map for frontend
export const liveCelebrationSettingsApi = {
  getMap: () => request<Record<string, string>>('/live-celebration-settings/map'),
  upsert: (body: { settingKey: string; settingValue: string; valueType?: string; label?: string; description?: string }) =>
    request<any>('/live-celebration-settings', { method: 'POST', body: JSON.stringify(body) }),
};
