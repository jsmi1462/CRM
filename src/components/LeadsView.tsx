import { useState, useMemo } from 'react';
import { useStore } from '../stores/useStore';
import type { Lead, LeadStatus } from '../types';
import { STATUS_CONFIG } from '../types';
import LeadCard from './LeadCard';
import AddEditLeadModal from './AddEditLeadModal';

type FilterTab = 'all' | LeadStatus;

export default function LeadsView() {
  const { leads, isLoading } = useStore();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [modalLead, setModalLead] = useState<Lead | null | undefined>(undefined);

  const filtered = useMemo(() => {
    let result = leads;
    if (filter !== 'all') result = result.filter((l) => l.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.includes(q) ||
          l.notes?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [leads, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'new', label: 'New' },
    { id: 'contacted', label: 'Contacted' },
    { id: 'interested', label: 'Interested' },
    { id: 'converted', label: 'Converted' },
    { id: 'lost', label: 'Lost' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4 border-b border-cozy-border bg-cozy-bg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-cozy-text">Leads</h1>
          <button
            onClick={() => setModalLead(null)}
            className="flex items-center gap-2 bg-warm-600 hover:bg-warm-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <PlusIcon />
            Add Lead
          </button>
        </div>

        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cozy-muted w-4 h-4">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-cozy-border bg-white focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent placeholder:text-cozy-muted"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cozy-muted hover:text-cozy-text"
            >
              <CloseSmallIcon />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const count = counts[tab.id] ?? 0;
            const isActive = filter === tab.id;
            const cfg = tab.id !== 'all' ? STATUS_CONFIG[tab.id as LeadStatus] : null;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap border transition-colors ${
                  isActive
                    ? cfg
                      ? cfg.tabActive
                      : 'bg-warm-100 text-warm-800 border-warm-200'
                    : 'bg-transparent text-cozy-muted border-transparent hover:bg-warm-100 hover:text-cozy-text'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/60' : 'bg-warm-100 text-warm-700'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-cozy-muted text-sm">Loading leads…</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            hasLeads={leads.length > 0}
            search={search}
            onAdd={() => setModalLead(null)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onEdit={setModalLead} />
            ))}
          </div>
        )}
      </div>

      {modalLead !== undefined && (
        <AddEditLeadModal
          lead={modalLead}
          onClose={() => setModalLead(undefined)}
        />
      )}
    </div>
  );
}

function EmptyState({ hasLeads, search, onAdd }: { hasLeads: boolean; search: string; onAdd: () => void }) {
  if (search) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <p className="text-cozy-muted text-sm">No leads match "<strong>{search}</strong>"</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
      <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center">
        <span className="text-warm-600 w-6 h-6"><LeadsEmptyIcon /></span>
      </div>
      <div>
        <p className="font-medium text-cozy-text">
          {hasLeads ? 'No leads in this category' : 'No leads yet'}
        </p>
        <p className="text-sm text-cozy-muted mt-1">
          {hasLeads ? 'Try switching to a different tab.' : 'Add your first lead to get started.'}
        </p>
      </div>
      {!hasLeads && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-warm-600 hover:bg-warm-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors mt-1"
        >
          <PlusIcon />
          Add Your First Lead
        </button>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
    </svg>
  );
}

function CloseSmallIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function LeadsEmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-8.185 9.5h16.37c.837 0 1.463-.773 1.182-1.561A9.003 9.003 0 0 0 12 14a9.003 9.003 0 0 0-9.367 5.939c-.28.788.345 1.561 1.182 1.561Z" />
    </svg>
  );
}
