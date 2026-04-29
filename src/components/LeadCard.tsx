import { useState } from 'react';
import { open } from '@tauri-apps/plugin-shell';
import type { Lead } from '../types';
import { STATUS_CONFIG } from '../types';
import { useStore } from '../stores/useStore';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
}

export default function LeadCard({ lead, onEdit }: LeadCardProps) {
  const { deleteLead, logContact } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cfg = STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.new;

  const lastContactedLabel = lead.lastContacted
    ? formatRelativeDate(lead.lastContacted)
    : 'Never contacted';

  const handleEmail = async () => {
    if (!lead.email) return;
    await logContact(lead.id);
    await open(`mailto:${lead.email}`);
  };

  const handleCall = async () => {
    if (!lead.phone) return;
    await logContact(lead.id);
    await open(`tel:${lead.phone.replace(/\D/g, '')}`);
  };

  const handleDelete = async () => {
    if (!confirm(`Remove ${lead.name} from your leads?`)) return;
    setDeleting(true);
    try {
      await deleteLead(lead.id);
    } finally {
      setDeleting(false);
    }
  };

  const initials = lead.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`bg-white rounded-xl border border-cozy-border border-l-4 ${cfg.borderColor} shadow-[var(--shadow-cozy)] hover:shadow-[var(--shadow-cozy-hover)] transition-shadow duration-200 flex flex-col`}>
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-warm-200 text-warm-800 flex items-center justify-center text-sm font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-cozy-text text-sm leading-tight truncate">{lead.name}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${cfg.badgeBg} ${cfg.badgeText}`}>
                {cfg.label}
              </span>
            </div>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1 rounded-lg text-cozy-muted hover:bg-gray-100 hover:text-cozy-text transition-colors"
            >
              <DotsIcon />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-7 bg-white border border-cozy-border rounded-xl shadow-lg z-10 py-1 min-w-28"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => { setMenuOpen(false); onEdit(lead); }}
                  className="w-full px-3 py-2 text-sm text-left text-cozy-text hover:bg-warm-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); handleDelete(); }}
                  disabled={deleting}
                  className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Removing…' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          {lead.email && (
            <ContactRow icon={<EmailIcon />} value={lead.email} />
          )}
          {lead.phone && (
            <ContactRow icon={<PhoneIcon />} value={lead.phone} />
          )}
          {!lead.email && !lead.phone && (
            <p className="text-xs text-cozy-muted italic">No contact info</p>
          )}
        </div>

        {lead.notes && (
          <p className="mt-3 text-xs text-cozy-muted line-clamp-2 leading-relaxed">{lead.notes}</p>
        )}
      </div>

      <div className="px-4 pb-4 space-y-2">
        <p className={`text-xs ${lead.lastContacted ? 'text-cozy-muted' : 'text-amber-600'}`}>
          {lastContactedLabel}
        </p>
        <div className="flex gap-2">
          <ActionButton
            onClick={handleEmail}
            disabled={!lead.email}
            icon={<EmailIcon />}
            label="Email"
          />
          <ActionButton
            onClick={handleCall}
            disabled={!lead.phone}
            icon={<PhoneIcon />}
            label="Call"
          />
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-cozy-muted">
      <span className="w-3.5 h-3.5 shrink-0">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

function ActionButton({ onClick, disabled, icon, label }: {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-cozy-border text-xs font-medium text-cozy-text hover:bg-warm-50 hover:border-warm-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <span className="w-3.5 h-3.5">{icon}</span>
      {label}
    </button>
  );
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Contacted today';
  if (days === 1) return 'Contacted yesterday';
  if (days < 30) return `Contacted ${days} days ago`;
  const months = Math.floor(days / 30);
  return `Contacted ${months} month${months !== 1 ? 's' : ''} ago`;
}

function DotsIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM1.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM14.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.251c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.569l-6.5 3.932-6.5-3.932v6.682Zm13-8.181v-.32a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v.32L8 7.88l6.5-3.81Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M1.5 4.25c0 5.937 4.813 10.75 10.75 10.75a.75.75 0 0 0 .75-.75v-2.28a.75.75 0 0 0-.5-.714l-2.5-.834a.75.75 0 0 0-.813.202l-.84.938a9.049 9.049 0 0 1-4.91-4.91l.938-.84a.75.75 0 0 0 .202-.813l-.834-2.5A.75.75 0 0 0 3.529 1h-2.28a.75.75 0 0 0-.75.75v2.5Z" />
    </svg>
  );
}
