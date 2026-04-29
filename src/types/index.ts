export type LeadStatus = 'new' | 'contacted' | 'interested' | 'converted' | 'lost';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastContacted: string | null;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'B2B' | 'B2C';
  createdAt: string;
}

export interface Settings {
  llmApiKey: string;
  dbPath: string;
  theme: 'light' | 'dark';
}
