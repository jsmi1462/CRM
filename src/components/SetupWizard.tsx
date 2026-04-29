import { useState } from 'react';
import { useStore } from '../stores/useStore';

interface SetupWizardProps {
  onComplete: () => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const { saveConfig } = useStore();
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key.');
      return;
    }
    setValidating(true);
    setError('');
    try {
      // In a real app, we'd validate the key with the provider here or via backend
      await saveConfig(apiKey);
      setStep(2);
    } catch (err) {
      setError(String(err));
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-warm-50 z-[100] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-warm-200 overflow-hidden">
        <div className="p-8 pb-4 text-center">
          <div className="w-16 h-16 bg-warm-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-warm-600 w-8 h-8"><AppIcon /></span>
          </div>
          <h1 className="text-2xl font-bold text-cozy-text mb-2">Welcome to PubMetric</h1>
          <p className="text-cozy-muted">Let's get you set up in just two steps.</p>
        </div>

        <div className="p-8 pt-4">
          <div className="flex justify-center gap-2 mb-8">
            <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-warm-600' : 'bg-warm-200'}`} />
            <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-warm-600' : 'bg-warm-200'}`} />
          </div>

          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2 text-center">
                <h2 className="text-lg font-semibold text-cozy-text">Connect to Claude</h2>
                <p className="text-sm text-cozy-muted">
                  PubMetric uses Claude to help you draft emails and summarize notes.
                  Paste your Anthropic API key below.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-cozy-text">Anthropic API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full px-4 py-3 rounded-xl border border-cozy-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent font-mono"
                  autoFocus
                />
                {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                <p className="text-[11px] text-cozy-muted italic">
                  Your key is stored locally on your device and never shared.
                </p>
              </div>

              <button
                onClick={handleNext}
                disabled={validating}
                className="w-full bg-warm-600 hover:bg-warm-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-warm-200 disabled:opacity-50"
              >
                {validating ? 'Validating...' : 'Connect & Continue'}
              </button>

              <p className="text-center">
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-warm-600 hover:underline font-medium"
                >
                  Don't have an API key? Get one here.
                </a>
              </p>
            </div>
          ) : (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 w-8 h-8"><CheckIcon /></span>
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-cozy-text">All Set!</h2>
                <p className="text-sm text-cozy-muted">
                  Your CRM is ready to use. We've initialized your local database and connected to Claude.
                </p>
              </div>

              <div className="bg-warm-50 rounded-2xl p-4 text-left border border-warm-100">
                <h3 className="text-xs font-bold text-warm-800 uppercase tracking-wider mb-2">Quick Tips</h3>
                <ul className="text-xs text-warm-700 space-y-2">
                  <li className="flex gap-2"><span>•</span> Add leads via the "Add Lead" button.</li>
                  <li className="flex gap-2"><span>•</span> Use "Draft" to have AI write your follow-ups.</li>
                  <li className="flex gap-2"><span>•</span> All your data stays private and local.</li>
                </ul>
              </div>

              <button
                onClick={onComplete}
                className="w-full bg-warm-600 hover:bg-warm-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-warm-200"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
