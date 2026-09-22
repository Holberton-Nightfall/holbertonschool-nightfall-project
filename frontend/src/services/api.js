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

export const getExperiences = () => request('/experiences');
export const getExperienceById = (id) => request(`/experiences/${id}`);

const withAuth = (token) => ({ Authorization: `Bearer ${token}` });

export const register = (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const login = (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const getMe = (token) => request('/auth/me', { headers: withAuth(token) });

// ⚠️ Routes pas encore définies dans docs/routesAPI.md ni implémentées côté backend :
// à ajouter au contrat d'API (PUT /api/auth/me, /auth/email, /auth/password) avant que
// la page Mon compte (modification profil / email / mot de passe) fonctionne réellement.
export const updateProfile = (data, token) => request('/auth/me', { method: 'PUT', headers: withAuth(token), body: JSON.stringify(data) });
export const updateEmail = (data, token) => request('/auth/email', { method: 'PUT', headers: withAuth(token), body: JSON.stringify(data) });
export const updatePassword = (data, token) => request('/auth/password', { method: 'PUT', headers: withAuth(token), body: JSON.stringify(data) });
export const deleteAccount = (token) => request('/auth/me', { method: 'DELETE', headers: withAuth(token) });

// ⚠️ POST/GET/DELETE /api/bookings sont documentés dans docs/routesAPI.md mais
// pas encore implémentés côté backend (bookings.routes.js est vide) : ces
// appels échoueront tant que le backend n'est pas fait.
export const createBooking = (data, token) => request('/bookings', { method: 'POST', headers: withAuth(token), body: JSON.stringify(data) });
export const getBookings = (token) => request('/bookings', { headers: withAuth(token) });
export const cancelBooking = (id, token) => request(`/bookings/${id}`, { method: 'DELETE', headers: withAuth(token) });
