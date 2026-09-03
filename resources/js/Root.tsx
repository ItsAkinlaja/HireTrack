import { useState } from 'react';
import { AuthPage } from '@/components/AuthPage';
import HireTrackApp from './HireTrackApp';

interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export default function Root() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ht_token'));
  const [user, setUser]   = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('ht_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  function handleAuthenticated(newToken: string, newUser: AuthUser) {
    setToken(newToken);
    setUser(newUser);
  }

  function handleLogout() {
    localStorage.removeItem('ht_token');
    localStorage.removeItem('ht_user');
    setToken(null);
    setUser(null);
  }

  if (!token || !user) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return <HireTrackApp user={user} onLogout={handleLogout} />;
}
