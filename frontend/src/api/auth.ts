export interface UserResponse {
  id: string;
  username: string;
  email: string;
}

export async function apiRegister(username: string, email: string, password: string): Promise<UserResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Registration failed (${res.status})`);
  }
  return res.json();
}

export async function apiLogin(username: string, password: string): Promise<UserResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid username or password');
  return res.json();
}

export async function apiLogout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function apiGetMe(): Promise<UserResponse> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}
