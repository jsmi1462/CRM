import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Lead, LeadFormData } from '../types';

interface AppState {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  loadLeads: () => Promise<void>;
  addLead: (data: LeadFormData) => Promise<void>;
  updateLead: (id: string, data: LeadFormData, lastContacted?: string | null) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  logContact: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  leads: [],
  isLoading: false,
  error: null,

  loadLeads: async () => {
    set({ isLoading: true, error: null });
    try {
      const leads = await invoke<Lead[]>('get_leads');
      set({ leads, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: String(e) });
    }
  },

  addLead: async (data) => {
    const lead = await invoke<Lead>('create_lead', {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      status: data.status,
      notes: data.notes || null,
    });
    set((state) => ({ leads: [lead, ...state.leads] }));
  },

  updateLead: async (id, data, lastContacted) => {
    const existing = get().leads.find((l) => l.id === id);
    const lead = await invoke<Lead>('update_lead', {
      id,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      status: data.status,
      notes: data.notes || null,
      lastContacted: lastContacted !== undefined ? lastContacted : (existing?.lastContacted ?? null),
    });
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? lead : l)),
    }));
  },

  deleteLead: async (id) => {
    await invoke('delete_lead', { id });
    set((state) => ({ leads: state.leads.filter((l) => l.id !== id) }));
  },

  logContact: async (id) => {
    const existing = get().leads.find((l) => l.id === id);
    if (!existing) return;
    const now = new Date().toISOString();
    const lead = await invoke<Lead>('update_lead', {
      id,
      name: existing.name,
      email: existing.email,
      phone: existing.phone,
      status: existing.status,
      notes: existing.notes,
      lastContacted: now,
    });
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? lead : l)),
    }));
  },
}));
