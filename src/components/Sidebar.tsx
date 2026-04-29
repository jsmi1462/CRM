import { useStore } from '../stores/useStore';

type View = 'leads' | 'settings';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const leads = useStore((s) => s.leads);

  return (
    <aside className="w-52 bg-warm-100 border-r border-cozy-border flex flex-col shrink-0">
      <div className="p-4 border-b border-cozy-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-warm-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">PM</span>
          </div>
          <div>
            <p className="font-semibold text-cozy-text text-sm leading-tight">PubMetric</p>
            <p className="text-cozy-muted text-xs">CRM</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <NavItem
          active={currentView === 'leads'}
          onClick={() => onNavigate('leads')}
          icon={<LeadsIcon />}
          label="Leads"
          badge={leads.length > 0 ? leads.length : undefined}
        />
        <NavItem
          active={currentView === 'settings'}
          onClick={() => onNavigate('settings')}
          icon={<SettingsIcon />}
          label="Settings"
        />
      </nav>

      <div className="p-4 border-t border-cozy-border">
        <p className="text-xs text-cozy-muted">{leads.length} lead{leads.length !== 1 ? 's' : ''} total</p>
      </div>
    </aside>
  );
}

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

function NavItem({ active, onClick, icon, label, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
        active
          ? 'bg-warm-600 text-white'
          : 'text-cozy-muted hover:bg-warm-200 hover:text-cozy-text'
      }`}
    >
      <span className="w-4 h-4 shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-warm-200 text-warm-700'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function LeadsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.255 1.139.872 1.139h9.47Z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M6.955 1.45A.5.5 0 0 1 7.452 1h1.096a.5.5 0 0 1 .497.45l.17 1.699a5.482 5.482 0 0 1 1.04.596l1.544-.724a.5.5 0 0 1 .606.154l.548.774a.5.5 0 0 1-.03.644l-1.157 1.256a5.502 5.502 0 0 1 0 1.302l1.157 1.256a.5.5 0 0 1 .03.644l-.548.774a.5.5 0 0 1-.606.154l-1.544-.724a5.483 5.483 0 0 1-1.04.596l-.17 1.699a.5.5 0 0 1-.497.45H7.452a.5.5 0 0 1-.497-.45l-.17-1.699a5.483 5.483 0 0 1-1.04-.596l-1.544.724a.5.5 0 0 1-.606-.154l-.548-.774a.5.5 0 0 1 .03-.644l1.157-1.256a5.502 5.502 0 0 1 0-1.302L3.077 5.03a.5.5 0 0 1-.03-.644l.548-.774a.5.5 0 0 1 .606-.154l1.544.724a5.483 5.483 0 0 1 1.04-.596l.17-1.699ZM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" clipRule="evenodd" />
    </svg>
  );
}
