import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../lib/storage';
import { generateId, now } from '../lib/utils';
import { api, getToken } from '../services/api';
import type { Application, ApplicationStatus } from '../types';

interface ApplicationFilters {
  search: string;
  status: ApplicationStatus | 'all';
  priority: string;
  workMode: string;
  employmentType: string;
}

interface ApplicationStore {
  applications: Application[];
  filters: ApplicationFilters;
  // Actions
  load: () => Promise<void>;
  add: (app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => Application;
  update: (id: string, updates: Partial<Application>) => void;
  remove: (id: string) => void;
  updateStatus: (id: string, status: ApplicationStatus) => void;
  setFilters: (filters: Partial<ApplicationFilters>) => void;
  clearFilters: () => void;
  getById: (id: string) => Application | undefined;
  getFiltered: () => Application[];
}

const DEFAULT_FILTERS: ApplicationFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  workMode: 'all',
  employmentType: 'all',
};

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
  applications: [],
  filters: DEFAULT_FILTERS,

  load: async () => {
    if (getToken()) {
      try {
        const data = await api.getApplications();
        set({ applications: data });
        return;
      } catch (e) {
        console.warn('API load applications failed, falling back to storage:', e);
      }
    }
    const data = storage.get<Application[]>(STORAGE_KEYS.applications) ?? [];
    set({ applications: data });
  },

  add: (appData) => {
    const app: Application = {
      ...appData,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };

    set((s) => {
      const updated = [app, ...s.applications];
      storage.set(STORAGE_KEYS.applications, updated);
      return { applications: updated };
    });

    if (getToken()) {
      api.createApplication(appData)
        .then((createdApp: Application) => {
          set((s) => ({
            applications: s.applications.map((a) => (a.id === app.id ? createdApp : a)),
          }));
        })
        .catch((e) => console.warn('API create application error:', e));
    }

    return app;
  },

  update: (id, updates) => {
    set((s) => {
      const updated = s.applications.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: now() } : a
      );
      storage.set(STORAGE_KEYS.applications, updated);
      return { applications: updated };
    });

    if (getToken()) {
      api.updateApplication(id, updates).catch((e) => console.warn('API update application error:', e));
    }
  },

  remove: (id) => {
    set((s) => {
      const updated = s.applications.filter((a) => a.id !== id);
      storage.set(STORAGE_KEYS.applications, updated);
      return { applications: updated };
    });

    if (getToken()) {
      api.deleteApplication(id).catch((e) => console.warn('API delete application error:', e));
    }
  },

  updateStatus: (id, status) => {
    get().update(id, { status });
  },

  setFilters: (filters) => {
    set((s) => ({ filters: { ...s.filters, ...filters } }));
  },

  clearFilters: () => set({ filters: DEFAULT_FILTERS }),

  getById: (id) => get().applications.find((a) => a.id === id),

  getFiltered: () => {
    const { applications, filters } = get();
    return applications.filter((a) => {
      if (filters.status !== 'all' && a.status !== filters.status) return false;
      if (filters.priority !== 'all' && a.priority !== filters.priority) return false;
      if (filters.workMode !== 'all' && a.workMode !== filters.workMode) return false;
      if (filters.employmentType !== 'all' && a.employmentType !== filters.employmentType) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return a.jobTitle.toLowerCase().includes(q) || a.notes?.toLowerCase().includes(q);
      }
      return true;
    });
  },
}));
