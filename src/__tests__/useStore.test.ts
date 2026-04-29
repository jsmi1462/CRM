import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../stores/useStore';
import type { Lead } from '../types';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
const mockInvoke = vi.mocked(invoke);

const makeLead = (overrides: Partial<Lead> = {}): Lead => ({
  id: 'lead-1',
  name: 'Dr. Smith',
  email: 'dr.smith@example.com',
  phone: '123-456-7890',
  status: 'new' as const,
  notes: 'Initial contact',
  lastContacted: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState({ leads: [], isLoading: false, error: null });
    vi.clearAllMocks();
  });

  it('initializes with empty leads', () => {
    expect(useStore.getState().leads).toEqual([]);
  });

  it('loads leads from backend', async () => {
    const lead = makeLead();
    mockInvoke.mockResolvedValueOnce([lead]);

    await useStore.getState().loadLeads();

    expect(useStore.getState().leads).toHaveLength(1);
    expect(useStore.getState().leads[0].name).toBe('Dr. Smith');
  });

  it('adds a new lead', async () => {
    const lead = makeLead();
    mockInvoke.mockResolvedValueOnce(lead);

    await useStore.getState().addLead({
      name: 'Dr. Smith',
      email: 'dr.smith@example.com',
      phone: '123-456-7890',
      status: 'new',
      notes: 'Initial contact',
    });

    expect(useStore.getState().leads).toHaveLength(1);
    expect(useStore.getState().leads[0].id).toBe('lead-1');
  });

  it('deletes a lead', async () => {
    useStore.setState({ leads: [makeLead()] });
    mockInvoke.mockResolvedValueOnce(undefined);

    await useStore.getState().deleteLead('lead-1');

    expect(useStore.getState().leads).toHaveLength(0);
  });

  it('updates a lead', async () => {
    const original = makeLead();
    useStore.setState({ leads: [original] });
    const updated = makeLead({ status: 'contacted' });
    mockInvoke.mockResolvedValueOnce(updated);

    await useStore.getState().updateLead('lead-1', {
      name: 'Dr. Smith',
      email: 'dr.smith@example.com',
      phone: '123-456-7890',
      status: 'contacted',
      notes: 'Initial contact',
    });

    expect(useStore.getState().leads[0].status).toBe('contacted');
  });
});
