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
};

// ── Bookings ─────────────────────────────────────────────────────────────────
export const bookingsApi = {
  getAll: () => request<any[]>('/bookings'),
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
};

// ── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
  getAll: () => request<any[]>('/payments/all'),
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
