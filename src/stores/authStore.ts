import { create } from 'zustand';
import { api, getToken, setToken, removeToken, isTokenExpired } from '../services/api';
import { useSettingsStore } from './settingsStore';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  userSkills: string[];
  currency: string;
  theme: 'dark' | 'light';
}

interface AuthStore {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: (reason?: string) => void;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile> & { password?: string }) => Promise<boolean>;
  clearError: () => void;
}

let expirationCheckTimer: any = null;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: getToken(),
  isAuthenticated: !!getToken() && !isTokenExpired(getToken() || ''),
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      if (token) {
        removeToken();
      }
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: token ? 'Session expired (2 hours limit). Please log in again.' : null,
      });
      return;
    }

    set({ isLoading: true });
    try {
      const user: any = await api.getProfile();
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });

      if (user?.theme) {
        useSettingsStore.getState().setTheme(user.theme);
      }

      // Start automatic expiration polling (check every 30 seconds)
      if (expirationCheckTimer) clearInterval(expirationCheckTimer);
      expirationCheckTimer = setInterval(() => {
        const currentToken = getToken();
        if (!currentToken || isTokenExpired(currentToken)) {
          if (expirationCheckTimer) clearInterval(expirationCheckTimer);
          get().logout('Session expired (2 hours limit). Please log in again.');
        }
      }, 30000);

    } catch (err: any) {
      removeToken();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: err.message });
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const data: any = await api.login({ email, password });
      setToken(data.token);
      set({
        user: {
          _id: data._id,
          name: data.name,
          email: data.email,
          userSkills: data.userSkills,
          currency: data.currency,
          theme: data.theme,
        },
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      if (data.theme) {
        useSettingsStore.getState().setTheme(data.theme);
      }

      // Start automatic expiration check
      if (expirationCheckTimer) clearInterval(expirationCheckTimer);
      expirationCheckTimer = setInterval(() => {
        const currentToken = getToken();
        if (!currentToken || isTokenExpired(currentToken)) {
          if (expirationCheckTimer) clearInterval(expirationCheckTimer);
          get().logout('Session expired (2 hours limit). Please log in again.');
        }
      }, 30000);

      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to login' });
      return false;
    }
  },

  register: async ({ name, email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const data: any = await api.register({ name, email, password });
      setToken(data.token);
      set({
        user: {
          _id: data._id,
          name: data.name,
          email: data.email,
          userSkills: data.userSkills,
          currency: data.currency,
          theme: data.theme,
        },
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      if (data.theme) {
        useSettingsStore.getState().setTheme(data.theme);
      }

      if (expirationCheckTimer) clearInterval(expirationCheckTimer);
      expirationCheckTimer = setInterval(() => {
        const currentToken = getToken();
        if (!currentToken || isTokenExpired(currentToken)) {
          if (expirationCheckTimer) clearInterval(expirationCheckTimer);
          get().logout('Session expired (2 hours limit). Please log in again.');
        }
      }, 30000);

      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to register' });
      return false;
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const data: any = await api.updateProfile(updates);
      if (data.token) {
        setToken(data.token);
      }
      set({
        user: {
          _id: data._id,
          name: data.name,
          email: data.email,
          userSkills: data.userSkills,
          currency: data.currency,
          theme: data.theme,
        },
        token: data.token || get().token,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to update profile' });
      return false;
    }
  },

  logout: (reason?: string) => {
    if (expirationCheckTimer) {
      clearInterval(expirationCheckTimer);
      expirationCheckTimer = null;
    }
    removeToken();
    set({ user: null, token: null, isAuthenticated: false, error: reason || null });
  },
}));
