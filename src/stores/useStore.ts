import { create } from 'zustand';
import { Lead, Contact, Settings } from '../types';

interface AppState {
  leads: Lead[];
  contacts: Contact[];
  settings: Settings;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  updateSettings: (updates: Partial<Settings>) => void;
}

export const useStore = create<AppState>((set) => ({
  leads: [],
  contacts: [],
  settings: {
    llmApiKey: '',
    dbPath: '',
    theme: 'light',
  },
  addLead: (lead) => set((state) => ({
    leads: [...state.leads, {
      ...lead,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }],
  })),
  updateLead: (id, updates) => set((state) => ({
    leads: state.leads.map((l) =>
      l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
    ),
  })),
  deleteLead: (id) => set((state) => ({
    leads: state.leads.filter((l) => l.id !== id),
  })),
  addContact: (contact) => set((state) => ({
    contacts: [...state.contacts, {
      ...contact,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }],
  })),
  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates },
  })),
}));
