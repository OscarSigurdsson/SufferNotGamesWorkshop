import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthPage.css';

type AuthTab = 'login' | 'register';

export function AuthPage() {
  const [tab, setTab] = useState<AuthTab>('login');

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">SufferNot Workshop</h1>
        <nav className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'login'}
            className={`tab ${tab === 'login' ? 'tab--active' : ''}`}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
          <button
            role="tab"
            aria-selected={tab === 'register'}
            className={`tab ${tab === 'register' ? 'tab--active' : ''}`}
            onClick={() => setTab('register')}
          >
            Create Account
          </button>
        </nav>
        <div className="auth-form-area">
          {tab === 'login' ? <LoginForm /> : <RegisterForm onSuccess={() => setTab('login')} />}
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setPending(true);
    setError(null);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="rw-form auth-inner-form" onSubmit={handleSubmit}>
      <label className="rw-label">
        Username
        <input
          className="rw-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          autoComplete="username"
        />
      </label>
      <label className="rw-label">
        Password
        <input
          className="rw-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      {error && <p className="rw-error">{error}</p>}
      <button className="rw-btn rw-btn-primary" type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) return;
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setPending(true);
    setError(null);
    try {
      await register(username.trim(), email.trim(), password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="rw-form auth-inner-form" onSubmit={handleSubmit}>
      <label className="rw-label">
        Username
        <input
          className="rw-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          autoComplete="username"
        />
      </label>
      <label className="rw-label">
        Email
        <input
          className="rw-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>
      <label className="rw-label">
        Password
        <input
          className="rw-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </label>
      <label className="rw-label">
        Confirm Password
        <input
          className="rw-input"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </label>
      {error && <p className="rw-error">{error}</p>}
      <button className="rw-btn rw-btn-primary" type="submit" disabled={pending}>
        {pending ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}
