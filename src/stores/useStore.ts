import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Lead, LeadFormData, AppConfig } from '../types';

interface AppState {
  leads: Lead[];
  config: AppConfig | null;
  isLoading: boolean;
  error: string | null;
  loadLeads: () => Promise<void>;
  addLead: (data: LeadFormData) => Promise<void>;
  updateLead: (id: string, data: LeadFormData, lastContacted?: string | null) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  logContact: (id: string) => Promise<void>;
  generateFollowUp: (id: string) => Promise<string>;
  summarizeNotes: (id: string) => Promise<string>;
  loadConfig: () => Promise<void>;
  saveConfig: (apiKey: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  leads: [],
  config: null,
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

  generateFollowUp: async (id) => {
    const lead = get().leads.find(l => l.id === id);
    if (!lead) throw new Error('Lead not found');
    return await invoke<string>('draft_followup_email', {
      leadName: lead.name,
      notes: lead.notes,
      lastContacted: lead.lastContacted
    });
  },

  summarizeNotes: async (id) => {
    const lead = get().leads.find(l => l.id === id);
    if (!lead) throw new Error('Lead not found');
    if (!lead.notes) return 'No notes to summarize.';
    return await invoke<string>('summarize_notes', { notes: lead.notes });
  },

  loadConfig: async () => {
    const hasKey = await invoke<boolean>('has_api_key');
    if (hasKey) {
      set({ config: { llmApiKey: '********', dbPath: 'pubmetric.db', theme: 'light' } });
    }
  },

  saveConfig: async (apiKey) => {
    await invoke('set_api_key', { key: apiKey });
    set({ config: { llmApiKey: '********', dbPath: 'pubmetric.db', theme: 'light' } });
  },
}));
