import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../lib/storage';
import type { Settings } from '../types';

interface SettingsStore {
  settings: Settings;
  load: () => void;
  update: (updates: Partial<Settings>) => void;
  setTheme: (theme: Settings['theme']) => void;
}

const DEFAULTS: Settings = {
  theme: 'dark',
  userName: 'there',
  userSkills: ['React', 'TypeScript', 'Node.js', 'JavaScript', 'Git', 'CSS', 'HTML'],
  currency: 'USD',
};

const getInitialSettings = (): Settings => {
  const data = storage.get<Settings>(STORAGE_KEYS.settings);
  const settings = data ? { ...DEFAULTS, ...data } : DEFAULTS;
  if ((settings.theme as string) === 'system') settings.theme = 'dark';

  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }

  return settings;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: getInitialSettings(),

  load: () => {
    const data = storage.get<Settings>(STORAGE_KEYS.settings);
    const settings = data ? { ...DEFAULTS, ...data } : DEFAULTS;
    if ((settings.theme as string) === 'system') settings.theme = 'dark';
    set({ settings });

    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  },

  update: (updates) => {
    set((s) => {
      const updated = { ...s.settings, ...updates };
      storage.set(STORAGE_KEYS.settings, updated);
      return { settings: updated };
    });
  },

  setTheme: (theme) => {
    const validTheme: Settings['theme'] = theme === 'light' ? 'light' : 'dark';
    set((s) => {
      const updated = { ...s.settings, theme: validTheme };
      storage.set(STORAGE_KEYS.settings, updated);
      const root = document.documentElement;
      if (validTheme === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
      }
      return { settings: updated };
    });
  },
}));
