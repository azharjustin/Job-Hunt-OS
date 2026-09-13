import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../lib/storage';
import { generateId, now } from '../lib/utils';
import { api, getToken } from '../services/api';
import type { Resume } from '../types';

interface ResumeStore {
  resumes: Resume[];
  load: () => Promise<void>;
  add: (resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>) => Resume;
  update: (id: string, updates: Partial<Resume>) => void;
  remove: (id: string) => void;
  getById: (id: string) => Resume | undefined;
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  resumes: [],

  load: async () => {
    if (getToken()) {
      try {
        const data = await api.getResumes();
        set({ resumes: data });
        return;
      } catch (e) {
        console.warn('API load resumes failed:', e);
      }
    }
    const data = storage.get<Resume[]>(STORAGE_KEYS.resumes) ?? [];
    set({ resumes: data });
  },

  add: (resumeData) => {
    const resume: Resume = {
      ...resumeData,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    set((s) => {
      const updated = [...s.resumes, resume];
      storage.set(STORAGE_KEYS.resumes, updated);
      return { resumes: updated };
    });

    if (getToken()) {
      api.createResume(resumeData)
        .then((created: Resume) => {
          set((s) => ({
            resumes: s.resumes.map((r) => (r.id === resume.id ? created : r)),
          }));
        })
        .catch((e) => console.warn('API create resume error:', e));
    }

    return resume;
  },

  update: (id, updates) => {
    set((s) => {
      const updated = s.resumes.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: now() } : r
      );
      storage.set(STORAGE_KEYS.resumes, updated);
      return { resumes: updated };
    });

    if (getToken()) {
      api.updateResume(id, updates).catch((e) => console.warn('API update resume error:', e));
    }
  },

  remove: (id) => {
    set((s) => {
      const updated = s.resumes.filter((r) => r.id !== id);
      storage.set(STORAGE_KEYS.resumes, updated);
      return { resumes: updated };
    });

    if (getToken()) {
      api.deleteResume(id).catch((e) => console.warn('API delete resume error:', e));
    }
  },

  getById: (id) => get().resumes.find((r) => r.id === id),
}));
