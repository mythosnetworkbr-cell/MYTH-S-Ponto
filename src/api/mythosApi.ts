import { API_URL } from '../config';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function api<T>(body: Record<string, unknown>, accessToken?: string): Promise<ApiResult<T>> {
  if (!API_URL) return { ok: false, error: 'API não configurada neste build.' };
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, accessToken }),
    });
    const json = await response.json();
    if (!response.ok || !json.ok) return { ok: false, error: json.error || `HTTP ${response.status}` };
    return { ok: true, data: json };
  } catch {
    return { ok: false, error: 'Não foi possível conectar ao servidor.' };
  }
}
