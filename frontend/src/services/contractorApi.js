import { api } from './api.js';

export async function fetchContractors(params = {}) {
  const { data } = await api.get('/contractors', { params });
  return data.contractors;
}
