import { useState } from 'react';
import { useStore } from '../stores/useStore';
import { invoke } from '@tauri-apps/api/core';

interface SetupWizardProps {
  onComplete: () => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const { saveConfig } = useStore();
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState<'anthropic' | 'gemini' | 'lmstudio'>('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleNext = async () => {
    if (provider !== 'lmstudio' && !apiKey.trim()) {
      setError('Please enter an API key.');
      return;
    }
    setValidating(true);
    setError('');
    try {
      await saveConfig(provider, provider === 'lmstudio' ? 'local' : apiKey);
      setStep(2);
    } catch (err) {
      setError(String(err));
    } finally {
      setValidating(false);
    }
  };

  const handleSkip = async () => {
    try {
      await saveConfig('none', '');
      onComplete();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleTestLocal = async () => {
    setTestStatus('testing');
    try {
      const success = await invoke<boolean>('test_lmstudio_connection');
      if (success) {
        setTestStatus('success');
        setTestMessage('Connection successful!');
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage(String(err));
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
                <h2 className="text-lg font-semibold text-cozy-text">Connect to AI</h2>
                <p className="text-sm text-cozy-muted">
                  PubMetric uses AI to help you draft emails and summarize notes.
                  Choose your provider below.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 justify-center">
                  <label className="flex items-center gap-2 text-sm font-medium text-cozy-text cursor-pointer">
                    <input
                      type="radio"
                      checked={provider === 'anthropic'}
                      onChange={() => setProvider('anthropic')}
                      className="text-warm-600 focus:ring-warm-400"
                    />
                    Claude
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-cozy-text cursor-pointer">
                    <input
                      type="radio"
                      checked={provider === 'gemini'}
                      onChange={() => setProvider('gemini')}
                      className="text-warm-600 focus:ring-warm-400"
                    />
                    Gemini
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-cozy-text cursor-pointer">
                    <input
                      type="radio"
                      checked={provider === 'lmstudio'}
                      onChange={() => {
                        setProvider('lmstudio');
                        setTestStatus('idle');
                        setError('');
                      }}
                      className="text-warm-600 focus:ring-warm-400"
                    />
                    Local (LM Studio)
                  </label>
                </div>

                {provider === 'lmstudio' ? (
                  <div className="space-y-4">
                    <div className="bg-warm-50 p-4 rounded-xl border border-warm-200 text-left text-sm space-y-2.5 shadow-inner">
                      <p><strong>1.</strong> Download and install <a href="https://lmstudio.ai" target="_blank" rel="noreferrer" className="text-warm-600 hover:underline">LM Studio</a>.</p>
                      <p><strong>2.</strong> Open LM Studio and search for <strong>Llama-3.2-3B-Instruct</strong> (ideal for 8GB RAM systems).</p>
                      <p><strong>3.</strong> Download the <strong>Q4_K_M</strong> GGUF version of the model.</p>
                      <p><strong>4.</strong> Go to the <strong>Local Server</strong> tab (the <code>↔️</code> icon).</p>
                      <p><strong>5.</strong> Load the model at the top, then click <strong>Start Server</strong>.</p>
                    </div>
                    
                    {testStatus !== 'idle' && (
                      <div className={`text-sm p-3 rounded-lg ${testStatus === 'success' ? 'bg-green-50 text-green-700' : testStatus === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                        {testStatus === 'testing' ? 'Testing connection to localhost:1234...' : testMessage}
                      </div>
                    )}

                    <button
                      onClick={handleTestLocal}
                      disabled={testStatus === 'testing'}
                      className="w-full py-2.5 rounded-xl border border-warm-600 text-warm-600 font-medium hover:bg-warm-50 transition-colors disabled:opacity-50"
                    >
                      Test Connection
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-cozy-text">
                      {provider === 'anthropic' ? 'Anthropic API Key' : 'Google AI Studio API Key'}
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={provider === 'anthropic' ? 'sk-ant-api03-...' : 'AIzaSy...'}
                      className="w-full px-4 py-3 rounded-xl border border-cozy-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent font-mono"
                      autoFocus
                    />
                    {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                    <p className="text-[11px] text-cozy-muted italic">
                      Your key is stored locally on your device and never shared.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleNext}
                disabled={validating}
                className="w-full bg-warm-600 hover:bg-warm-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-warm-200 disabled:opacity-50"
              >
                {validating ? 'Saving...' : (provider === 'lmstudio' ? 'Save & Continue' : 'Connect & Continue')}
              </button>

              <div className="text-center space-y-3">
                {provider !== 'lmstudio' && (
                  <a
                    href={provider === 'anthropic' ? 'https://console.anthropic.com/' : 'https://aistudio.google.com/app/apikey'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-warm-600 hover:underline font-medium"
                  >
                    Don't have an API key? Get one here.
                  </a>
                )}
                
                <button
                  onClick={handleSkip}
                  className="text-xs text-cozy-muted hover:text-cozy-text transition-colors underline"
                >
                  Skip for now (Proceed without AI features)
                </button>
              </div>
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
