import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../stores/useStore';

describe('useStore', () => {
  beforeEach(() => {
    useStore.getState().leads = [];
    useStore.getState().contacts = [];
    useStore.setState({
      settings: { llmApiKey: '', dbPath: '', theme: 'light' },
    });
  });

  it('should initialize with empty leads and contacts', () => {
    const state = useStore.getState();
    expect(state.leads).toEqual([]);
    expect(state.contacts).toEqual([]);
  });

  it('should add a new lead', () => {
    useStore.getState().addLead({
      name: 'Dr. Smith',
      email: 'dr.smith@example.com',
      phone: '123-456-7890',
      status: 'new',
      notes: 'Initial contact',
    });
    const state = useStore.getState();
    expect(state.leads).toHaveLength(1);
    expect(state.leads[0].name).toBe('Dr. Smith');
    expect(state.leads[0].id).toBeDefined();
    expect(state.leads[0].createdAt).toBeDefined();
    expect(state.leads[0].updatedAt).toBeDefined();
  });

  it('should update a lead', () => {
    const lead = useStore.getState().leads[0];
    useStore.getState().updateLead(lead.id, { status: 'contacted' });
    const updatedLead = useStore.getState().leads.find((l) => l.id === lead.id);
    expect(updatedLead?.status).toBe('contacted');
    expect(updatedLead?.updatedAt).toBeDefined();
  });

  it('should delete a lead', () => {
    const lead = useStore.getState().leads[0];
    useStore.getState().deleteLead(lead.id);
    const state = useStore.getState();
    expect(state.leads).toHaveLength(0);
  });
});
