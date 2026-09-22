import { createContext, useContext, useEffect, useState } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  updateProfile as apiUpdateProfile,
  updateEmail as apiUpdateEmail,
  updatePassword as apiUpdatePassword,
  deleteAccount as apiDeleteAccount,
  createBooking as apiCreateBooking,
  getBookings as apiGetBookings,
  cancelBooking as apiCancelBooking,
} from '../services/api.js';

const TOKEN_KEY = 'nightfall_token';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  // 'loading' tant qu'on vérifie un token déjà présent (évite un redirect prématuré
  // vers /connexion au premier rendu) ; 'ready' une fois l'état connu.
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!token) { setUser(null); setStatus('ready'); return; }
    getMe(token)
      .then((u) => { setUser(u); setStatus('ready'); })
      .catch(() => { setToken(null); localStorage.removeItem(TOKEN_KEY); setUser(null); setStatus('ready'); });
  }, [token]);

  const persistToken = (t) => {
    setToken(t);
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  };

  const login = async (credentials) => {
    const { user: u, token: t } = await apiLogin(credentials);
    persistToken(t);
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const { user: u, token: t } = await apiRegister(data);
    persistToken(t);
    setUser(u);
    return u;
  };

  const logout = () => {
    persistToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const u = await apiUpdateProfile(data, token);
    setUser(u);
    return u;
  };

  const updateEmail = async (data) => {
    const u = await apiUpdateEmail(data, token);
    setUser(u);
    return u;
  };

  const updatePassword = (data) => apiUpdatePassword(data, token);

  const deleteAccount = async () => {
    await apiDeleteAccount(token);
    persistToken(null);
    setUser(null);
  };

  const createBooking = (data) => apiCreateBooking(data, token);
  const getBookings = () => apiGetBookings(token);
  const cancelBooking = (id) => apiCancelBooking(id, token);

  const value = {
    user, status, isAuthenticated: Boolean(user),
    login, register, logout, updateProfile, updateEmail, updatePassword, deleteAccount,
    createBooking, getBookings, cancelBooking,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
