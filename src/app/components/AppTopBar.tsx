interface AppTopBarProps {
  onBack?: () => void;
  onLogout?: () => void;
}

export default function AppTopBar({ onBack, onLogout }: AppTopBarProps) {
  return (
    <div className="app-topbar">
      <div>
        {onBack && (
          <button onClick={onBack} className="btn-ghost" aria-label="Volver">
            ← Volver
          </button>
        )}
      </div>
      <div>
        {onLogout && (
          <button className="btn-link-logout" onClick={onLogout} aria-label="Desconectarse">
            Desconectarse
          </button>
        )}
      </div>
    </div>
  );
}
