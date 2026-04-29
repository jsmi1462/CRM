import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue([]),
}));

vi.mock('@tauri-apps/plugin-shell', () => ({
  open: vi.fn(),
}));

describe('App', () => {
  it('renders the PubMetric sidebar brand', () => {
    render(<App />);
    expect(screen.getByText('PubMetric')).toBeInTheDocument();
  });

  it('renders the Leads navigation item', () => {
    render(<App />);
    expect(screen.getAllByText('Leads').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the Add Lead button', () => {
    render(<App />);
    expect(screen.getByText('Add Lead')).toBeInTheDocument();
  });
});
