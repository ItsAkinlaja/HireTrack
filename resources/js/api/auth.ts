import client from './client';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export async function login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const { data } = await client.post('/auth/login', { email, password });
  return data;
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await client.get('/auth/me');
  return data.user;
}
