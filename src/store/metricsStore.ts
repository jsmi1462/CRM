import { create } from 'zustand';
import { Lead } from '../types';

interface MetricsState {
  conversionRate: number;
  avgResponseTime: number;
  contactFrequency: number;
  updateMetrics: (leads: Lead[]) => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  conversionRate: 0,
  avgResponseTime: 0,
  contactFrequency: 0,
  updateMetrics: (leads: Lead[]) => {
    const total = leads.length;
    const converted = leads.filter((l) => l.status === 'converted').length;
    const conversionRate = total > 0 ? (converted / total) * 100 : 0;
    
    // Placeholder for avg response time and contact frequency logic
    set({ conversionRate });
  },
}));
