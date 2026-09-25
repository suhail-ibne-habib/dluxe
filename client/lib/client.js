import { API_BASE_URL, fetchWithTimeout } from './api';

export async function getFromServer(path, init = {}) {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    ...init,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}
