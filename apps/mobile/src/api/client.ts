import type { GameContext, ShopItem, EncounterChoice, LoadoutKey } from './types';

// Set EXPO_PUBLIC_API_URL in your environment for production.
// For local dev on a physical device, replace with your machine's LAN IP, e.g.:
//   EXPO_PUBLIC_API_URL=http://192.168.1.10:3001
const BASE_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3001';
const BASE = `${BASE_URL}/api/game`;

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  createSession: (): Promise<{ sessionId: string; context: GameContext }> =>
    post(`${BASE}`),

  getState: (id: string): Promise<{ context: GameContext }> =>
    get(`${BASE}/${id}/state`),

  getLog: (id: string): Promise<{ log: string[] }> =>
    get(`${BASE}/${id}/log`),

  getShopItems: (id: string): Promise<{ items: ShopItem[] }> =>
    get(`${BASE}/${id}/shop-items`),

  join: (
    id: string,
    name: string,
    loadoutKey: LoadoutKey,
    entryFee = 200
  ): Promise<{ success: boolean; context: GameContext }> =>
    post(`${BASE}/${id}/join`, { name, loadoutKey, entryFee }),

  buyStock: (
    id: string,
    stockId: string,
    quantity: number
  ): Promise<{ success: boolean; context: GameContext }> =>
    post(`${BASE}/${id}/buy-stock`, { stockId, quantity }),

  sellStock: (
    id: string,
    stockId: string,
    quantity: number
  ): Promise<{ success: boolean; context: GameContext }> =>
    post(`${BASE}/${id}/sell-stock`, { stockId, quantity }),

  endMarket: (id: string): Promise<{ context: GameContext }> =>
    post(`${BASE}/${id}/end-market`),

  travel: (
    id: string,
    destinationId: string
  ): Promise<{ success: boolean; context: GameContext }> =>
    post(`${BASE}/${id}/travel`, { destinationId }),

  resolveEncounter: (
    id: string,
    choice: EncounterChoice
  ): Promise<{ context: GameContext }> =>
    post(`${BASE}/${id}/encounter`, { choice }),

  buyItem: (
    id: string,
    itemId: string
  ): Promise<{ success: boolean; context: GameContext }> =>
    post(`${BASE}/${id}/buy-item`, { itemId }),

  skipShop: (id: string): Promise<{ context: GameContext }> =>
    post(`${BASE}/${id}/skip-shop`),

  marketUpdate: (id: string): Promise<{ context: GameContext }> =>
    post(`${BASE}/${id}/market-update`),
};
