import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../lib/storage';
import { generateId, now } from '../lib/utils';
import { api, getToken } from '../services/api';
import type { FollowUp } from '../types';

interface FollowUpStore {
  followUps: FollowUp[];
  load: () => Promise<void>;
  add: (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => FollowUp;
  update: (id: string, updates: Partial<FollowUp>) => void;
  remove: (id: string) => void;
  complete: (id: string) => void;
  getByApplication: (applicationId: string) => FollowUp[];
  getPending: () => FollowUp[];
  getOverdue: () => FollowUp[];
}

export const useFollowUpStore = create<FollowUpStore>((set, get) => ({
  followUps: [],

  load: async () => {
    if (getToken()) {
      try {
        const data = await api.getFollowUps();
        set({ followUps: data });
        return;
      } catch (e) {
        console.warn('API load followUps failed:', e);
      }
    }
    const data = storage.get<FollowUp[]>(STORAGE_KEYS.followUps) ?? [];
    set({ followUps: data });
  },

  add: (followUpData) => {
    const followUp: FollowUp = {
      ...followUpData,
      id: generateId(),
      createdAt: now(),
    };
    set((s) => {
      const updated = [...s.followUps, followUp];
      storage.set(STORAGE_KEYS.followUps, updated);
      return { followUps: updated };
    });

    if (getToken()) {
      api.createFollowUp(followUpData)
        .then((created: FollowUp) => {
          set((s) => ({
            followUps: s.followUps.map((f) => (f.id === followUp.id ? created : f)),
          }));
        })
        .catch((e) => console.warn('API create followUp error:', e));
    }

    return followUp;
  },

  update: (id, updates) => {
    set((s) => {
      const updated = s.followUps.map((f) => (f.id === id ? { ...f, ...updates } : f));
      storage.set(STORAGE_KEYS.followUps, updated);
      return { followUps: updated };
    });

    if (getToken()) {
      api.updateFollowUp(id, updates).catch((e) => console.warn('API update followUp error:', e));
    }
  },

  remove: (id) => {
    set((s) => {
      const updated = s.followUps.filter((f) => f.id !== id);
      storage.set(STORAGE_KEYS.followUps, updated);
      return { followUps: updated };
    });

    if (getToken()) {
      api.deleteFollowUp(id).catch((e) => console.warn('API delete followUp error:', e));
    }
  },

  complete: (id) => {
    get().update(id, { completed: true });
  },

  getByApplication: (applicationId) =>
    get().followUps.filter((f) => f.applicationId === applicationId),

  getPending: () =>
    get()
      .followUps.filter((f) => !f.completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),

  getOverdue: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return get().followUps.filter(
      (f) => !f.completed && new Date(f.dueDate) < today
    );
  },
}));
