import { useState, useEffect } from 'react';
import { useStore } from './stores/useStore';
import Sidebar from './components/Sidebar';
import LeadsView from './components/LeadsView';
import SetupWizard from './components/SetupWizard';

type View = 'leads' | 'settings';

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
    if (config?.llmApiKey) {
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

  if (!config?.llmApiKey) {
    return <SetupWizard onComplete={loadLeads} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentView={view} onNavigate={setView} />
      <main className="flex-1 overflow-hidden">
        {view === 'leads' && <LeadsView />}
        {view === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-xl font-semibold text-cozy-text mb-6">Settings</h1>
      <div className="bg-white rounded-xl border border-cozy-border p-6 space-y-4">
        <div>
          <p className="text-sm font-medium text-cozy-text mb-1">About</p>
          <p className="text-sm text-cozy-muted">PubMetric CRM — your private, local lead tracker.</p>
          <p className="text-xs text-cozy-muted mt-1">All data is stored on your computer. Nothing is shared online.</p>
        </div>
        <div className="border-t border-cozy-border pt-4">
          <p className="text-sm font-medium text-cozy-text mb-1">Version</p>
          <p className="text-sm text-cozy-muted">0.1.0</p>
        </div>
      </div>
    </div>
  );
}
