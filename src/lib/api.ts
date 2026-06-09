const BASE = 'http://localhost:4000';

function getToken() {
  return localStorage.getItem('accessToken');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) {
      const userRaw = localStorage.getItem('authUser');
      const user = userRaw ? JSON.parse(userRaw) : null;
      if (!user || user.role !== 'admin') {
        throw new Error('Access denied: admin login required');
      }
      throw new Error('Session expired. Please log in again.');
    }
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
  create: (body: any) => request<any>('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  adminCreate: (body: any) => request<any>('/bookings/admin', { method: 'POST', body: JSON.stringify(body) }),
  updateStatus: (id: number, status: string) =>
    request<any>(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  cancel: (id: number) => request<any>(`/bookings/${id}/cancel`, { method: 'PATCH' }),
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
