import { api } from './api.js';

export async function registerRequest(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function loginRequest(payload) {
  const { data } = await api.post('/auth/login', payload);
  return data;
}

export async function googleLoginRequest({ idToken, role }) {
  const { data } = await api.post('/auth/google', { idToken, role });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me');
  return data;
}
