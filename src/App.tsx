import { useState, useEffect } from 'react';
import { useStore } from './stores/useStore';
import Sidebar from './components/Sidebar';
import LeadsView from './components/LeadsView';
import SetupWizard from './components/SetupWizard';
import { MetricsView } from './components/MetricsView';

type View = 'leads' | 'settings' | 'metrics';

export default function App() {
  const [view, setView] = useState<View>('leads');
  const { loadLeads, config, loadConfig } = useStore();
  const [checkingConfig, setCheckingConfig] = useState(true);

  useEffect(() => {
    async function init() {
      await loadConfig();
      setCheckingConfig(false);
    }
    init();
  }, [loadConfig]);

  useEffect(() => {
    if (config) {
      loadLeads();
    }
  }, [config, loadLeads]);

  if (checkingConfig) {
    return (
      <div className="h-screen flex items-center justify-center bg-warm-50">
        <div className="w-8 h-8 border-4 border-warm-200 border-t-warm-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!config) {
    return <SetupWizard onComplete={loadLeads} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentView={view} onNavigate={setView} />
      <main className="flex-1 overflow-hidden">
        {view === 'leads' && <LeadsView />}
        {view === 'metrics' && <MetricsView />}
        {view === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

function SettingsView() {
  const { config, saveConfig } = useStore();
  const [editing, setEditing] = useState(false);
  const [provider, setProvider] = useState(config?.llmProvider || 'anthropic');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveConfig(provider, apiKey || (config?.llmApiKey === '********' ? '' : '')); 
      // If they didn't enter a new key but we have one stored, we might need more logic
      // for now, assume they enter it if they change it.
      await saveConfig(provider, apiKey);
      setEditing(false);
    } catch (e) {
      alert(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl overflow-auto h-full">
      <h1 className="text-xl font-semibold text-cozy-text mb-6">Settings</h1>
      
      <div className="space-y-6">
        <section className="bg-white rounded-2xl border border-cozy-border overflow-hidden shadow-sm">
          <div className="p-5 border-b border-cozy-border bg-warm-50/30 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-cozy-text">AI Configuration</h2>
              <p className="text-xs text-cozy-muted">Manage your AI provider and connection.</p>
            </div>
            {!editing && (
              <button 
                onClick={() => {
                  setEditing(true);
                  setProvider(config?.llmProvider || 'anthropic');
                }}
                className="text-xs font-semibold text-warm-700 bg-warm-100 px-3 py-1.5 rounded-lg hover:bg-warm-200 transition-colors"
              >
                Change Provider
              </button>
            )}
          </div>
          
          <div className="p-6">
            {editing ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['anthropic', 'openai', 'gemini', 'lmstudio'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setProvider(p)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                        provider === p 
                        ? 'bg-warm-600 border-warm-600 text-white shadow-md shadow-warm-100' 
                        : 'bg-white border-cozy-border text-cozy-muted hover:border-warm-300'
                      }`}
                    >
                      {p === 'lmstudio' ? 'LM Studio' : p}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-cozy-text uppercase tracking-wide">
                    {provider === 'lmstudio' ? 'Local Connection' : 'New API Key'}
                  </label>
                  {provider === 'lmstudio' ? (
                    <div className="text-[11px] text-cozy-muted bg-warm-50 p-3 rounded-lg border border-warm-100">
                      PubMetric will connect to <code>http://127.0.0.1:1234</code>. Ensure LM Studio server is running.
                    </div>
                  ) : (
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your new key..."
                      className="input"
                    />
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 px-4 py-2 rounded-xl border border-cozy-border text-cozy-text text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-4 py-2 rounded-xl bg-warm-600 hover:bg-warm-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="px-3 py-1.5 bg-warm-100 text-warm-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {config?.llmProvider === 'none' ? 'Disabled' : config?.llmProvider}
                </div>
                <div className="text-sm text-cozy-muted">
                  {config?.llmProvider === 'none' 
                    ? 'AI features are currently turned off.' 
                    : config?.llmProvider === 'lmstudio' 
                      ? 'Connected to local server at localhost:1234'
                      : 'API Key is configured and secured.'}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-cozy-border p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="font-semibold text-cozy-text mb-1">About PubMetric</h2>
            <p className="text-sm text-cozy-muted">Your private, local lead tracker.</p>
            <p className="text-xs text-cozy-muted mt-1 italic">All data is stored on your computer. Nothing is shared online.</p>
          </div>
          <div className="border-t border-cozy-border pt-4 flex justify-between items-center">
            <p className="text-sm font-medium text-cozy-text">Version</p>
            <p className="text-sm text-cozy-muted font-mono bg-gray-50 px-2 py-1 rounded">0.1.0</p>
          </div>
        </section>
      </div>
    </div>
  );
}
