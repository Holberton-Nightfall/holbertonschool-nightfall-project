const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function request(path, { headers, ...options } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.details = body.details;
    throw err;
  }
  return res.json();
}

export const getExperiences = (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  const qs = query.toString();
  return request(`/experiences${qs ? `?${qs}` : ''}`);
};
export const getExperienceById = (id) => request(`/experiences/${id}`);
export const getCategories = () => request('/categories');

const withAuth = (token) => ({ Authorization: `Bearer ${token}` });

export const register = (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const login = (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const getMe = (token) => request('/auth/me', { headers: withAuth(token) });

export const updateProfile = (data, token) => request('/auth/me', { method: 'PUT', headers: withAuth(token), body: JSON.stringify(data) });
export const updateEmail = (data, token) => request('/auth/email', { method: 'PUT', headers: withAuth(token), body: JSON.stringify(data) });
export const updatePassword = (data, token) => request('/auth/password', { method: 'PUT', headers: withAuth(token), body: JSON.stringify(data) });
export const deleteAccount = (token) => request('/auth/me', { method: 'DELETE', headers: withAuth(token) });

export const createBooking = (data, token) => request('/bookings', { method: 'POST', headers: withAuth(token), body: JSON.stringify(data) });
export const getBookings = (token) => request('/bookings', { headers: withAuth(token) });
export const cancelBooking = (id, token) => request(`/bookings/${id}`, { method: 'DELETE', headers: withAuth(token) });

// Admin : inclut les expériences archivées, contrairement à getExperiences
export const getAdminExperiences = (token) => request('/admin/experiences', { headers: withAuth(token) });

// Archive (true) ou restaure (false) une expérience
export const setExperienceArchived = (id, isArchived, token) =>
  request(`/admin/experiences/${id}/archive`, {
    method: 'PATCH',
    headers: withAuth(token),
    body: JSON.stringify({ is_archived: isArchived }),
  });

export const getAllBookings = (token) => request('/admin/bookings', { headers: withAuth(token) });