import { useState } from 'react';
import { RulesWriting } from './components/RulesWriting/RulesWriting';
import { ArmyBuilding } from './components/ArmyBuilding/ArmyBuilding';
import { AuthPage } from './components/AuthPage/AuthPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

type Tab = 'rules' | 'army';

function AppShell() {
  const { user, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('rules');

  if (isLoading) {
    return <div className="app-loading">Loading…</div>;
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1>SufferNot Workshop</h1>
          <div className="app-user">
            <span className="app-username">{user.username}</span>
            <button className="app-logout" onClick={logout}>Sign out</button>
          </div>
        </div>
        <nav className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'rules'}
            className={`tab ${activeTab === 'rules' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            Rules Writing
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'army'}
            className={`tab ${activeTab === 'army' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('army')}
          >
            Army Building
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'rules' && (
          <section aria-label="Rules Writing">
            <RulesWriting />
          </section>
        )}
        {activeTab === 'army' && (
          <section aria-label="Army Building">
            <ArmyBuilding />
          </section>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
