import { useState, useEffect } from 'react';
import type { Lead, LeadFormData, LeadStatus } from '../types';
import { useStore } from '../stores/useStore';

interface AddEditLeadModalProps {
  lead?: Lead | null;
  onClose: () => void;
}

const EMPTY_FORM: LeadFormData = {
  name: '',
  email: '',
  phone: '',
  status: 'new',
  notes: '',
};

export default function AddEditLeadModal({ lead, onClose }: AddEditLeadModalProps) {
  const { addLead, updateLead } = useStore();
  const [form, setForm] = useState<LeadFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!lead;

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name,
        email: lead.email ?? '',
        phone: lead.phone ?? '',
        status: lead.status as LeadStatus,
        notes: lead.notes ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (isEdit && lead) {
        await updateLead(lead.id, form);
      } else {
        await addLead(form);
      }
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-cozy-border">
          <h2 className="text-lg font-semibold text-cozy-text">
            {isEdit ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button
            onClick={onClose}
            className="text-cozy-muted hover:text-cozy-text transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Dr. Jane Smith"
              className="input"
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@hospital.com"
                className="input"
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(555) 000-0000"
                className="input"
              />
            </Field>
          </div>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}
              className="input"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </Field>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Met at conference, interested in cardiac monitoring..."
              rows={3}
              className="input resize-none"
            />
          </Field>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-cozy-border text-cozy-text text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-warm-600 hover:bg-warm-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-cozy-text">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
