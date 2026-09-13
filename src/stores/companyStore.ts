import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../lib/storage';
import { generateId, now } from '../lib/utils';
import { api, getToken } from '../services/api';
import type { Company } from '../types';

interface CompanyStore {
  companies: Company[];
  load: () => Promise<void>;
  add: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'contacts'>) => Company;
  update: (id: string, updates: Partial<Company>) => void;
  remove: (id: string) => void;
  getById: (id: string) => Company | undefined;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  companies: [],

  load: async () => {
    if (getToken()) {
      try {
        const data = await api.getCompanies();
        set({ companies: data });
        return;
      } catch (e) {
        console.warn('API load companies failed:', e);
      }
    }
    const data = storage.get<Company[]>(STORAGE_KEYS.companies) ?? [];
    set({ companies: data });
  },

  add: (companyData) => {
    const company: Company = {
      ...companyData,
      id: generateId(),
      contacts: [],
      createdAt: now(),
      updatedAt: now(),
    };
    set((s) => {
      const updated = [...s.companies, company];
      storage.set(STORAGE_KEYS.companies, updated);
      return { companies: updated };
    });

    if (getToken()) {
      api.createCompany({ ...companyData, contacts: [] })
        .then((created: Company) => {
          set((s) => ({
            companies: s.companies.map((c) => (c.id === company.id ? created : c)),
          }));
        })
        .catch((e) => console.warn('API create company error:', e));
    }

    return company;
  },

  update: (id, updates) => {
    set((s) => {
      const updated = s.companies.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: now() } : c
      );
      storage.set(STORAGE_KEYS.companies, updated);
      return { companies: updated };
    });

    if (getToken()) {
      api.updateCompany(id, updates).catch((e) => console.warn('API update company error:', e));
    }
  },

  remove: (id) => {
    set((s) => {
      const updated = s.companies.filter((c) => c.id !== id);
      storage.set(STORAGE_KEYS.companies, updated);
      return { companies: updated };
    });

    if (getToken()) {
      api.deleteCompany(id).catch((e) => console.warn('API delete company error:', e));
    }
  },

  getById: (id) => get().companies.find((c) => c.id === id),
}));
