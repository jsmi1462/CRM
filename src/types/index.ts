export type LeadStatus = 'new' | 'contacted' | 'interested' | 'converted' | 'lost';

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  lastContacted: string | null;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: 'B2B' | 'B2C';
  createdAt: string;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  notes: string;
}

export const STATUS_CONFIG: Record<LeadStatus, { label: string; badgeBg: string; badgeText: string; borderColor: string; tabActive: string }> = {
  new:        { label: 'New',        badgeBg: 'bg-blue-50',    badgeText: 'text-blue-700',    borderColor: 'border-l-blue-400',    tabActive: 'bg-blue-50 text-blue-700 border-blue-200' },
  contacted:  { label: 'Contacted',  badgeBg: 'bg-amber-50',   badgeText: 'text-amber-700',   borderColor: 'border-l-amber-400',   tabActive: 'bg-amber-50 text-amber-700 border-amber-200' },
  interested: { label: 'Interested', badgeBg: 'bg-green-50',   badgeText: 'text-green-700',   borderColor: 'border-l-green-500',   tabActive: 'bg-green-50 text-green-700 border-green-200' },
  converted:  { label: 'Converted',  badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', borderColor: 'border-l-emerald-500', tabActive: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  lost:       { label: 'Lost',       badgeBg: 'bg-gray-100',   badgeText: 'text-gray-500',    borderColor: 'border-l-gray-300',    tabActive: 'bg-gray-100 text-gray-600 border-gray-200' },
};
