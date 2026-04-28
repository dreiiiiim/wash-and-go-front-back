import { Booking } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ShopSettings {
  id: string;
  setting_date?: string | null;
  open_time: string;
  close_time: string;
  updated_at?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const timeoutMs = 20000;
  const controller = options?.signal ? null : new AbortController();
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: options?.signal || controller?.signal,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg);
  }
  return res.json();
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export const api = {
  signup: (dto: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    redirectTo?: string;
  }) =>
    request<{ message: string }>('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }),

  requestPasswordReset: (dto: { email: string; redirectTo?: string }) =>
    request<{ message: string }>('/auth/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }),

  getServices: () => request<any[]>('/services'),

  getShopSettings: (date?: string) =>
    request<ShopSettings>(date ? `/shop-settings?date=${encodeURIComponent(date)}` : '/shop-settings'),

  updateShopSettings: (openTime: string, closeTime: string, token: string, date?: string) =>
    request<ShopSettings>('/shop-settings', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ open_time: openTime, close_time: closeTime, ...(date ? { date } : {}) }),
    }),

  createBooking: (dto: object, token?: string) =>
    request<Booking>('/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(dto),
    }),

  getBookingById: (id: string) =>
    request<Booking>(`/bookings/${id.toUpperCase()}`),

  getBookedSlots: (date: string, category?: string) => {
    const query = category ? `?date=${date}&category=${category}` : `?date=${date}`;
    return request<string[]>(`/bookings/booked-slots${query}`);
  },

  getAllBookings: (token: string) =>
    request<Booking[]>('/bookings', { headers: authHeaders(token) }),

  updateStatus: (id: string, status: string, token: string) =>
    request<Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ status }),
    }),

  updateService: (id: string, dto: object, token: string) =>
    request<any>(`/services/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(dto),
    }),

  addBookingUpdate: (id: string, message: string, imageUrls: string[], token: string) =>
    request<any>(`/bookings/${id}/updates`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ message, imageUrls }),
    }),

  getMyBookings: (token: string) =>
    request<Booking[]>('/bookings/my-bookings', { headers: authHeaders(token) }),

  requestEmailChange: (newEmail: string, token: string) =>
    request<{ message: string }>('/auth/request-email-change', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ newEmail }),
    }),
};
