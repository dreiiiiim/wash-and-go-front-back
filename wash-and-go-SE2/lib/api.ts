import { Booking } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options);
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
  // ── Services ──────────────────────────────────────────────
  getServices: () => request<any[]>('/services'),

  // ── Bookings ──────────────────────────────────────────────
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

  // ── Customer ───────────────────────────────────────────────
  getMyBookings: (token: string) =>
    request<Booking[]>('/bookings/my-bookings', { headers: authHeaders(token) }),
};
