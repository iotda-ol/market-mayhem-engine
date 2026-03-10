export interface LoadoutItem {
  itemId: string;
  quantity: number;
}

export interface Loadout {
  name: string;
  startingCash: number;
  startingHealth: number;
  items: LoadoutItem[];
}

export const LOADOUTS: Record<string, Loadout> = {
  MERCHANT: {
    name: 'Merchant',
    startingCash: 2000,
    startingHealth: 80,
    items: [{ itemId: 'briefcase', quantity: 1 }],
  },
  STREET_FIGHTER: {
    name: 'Street Fighter',
    startingCash: 1000,
    startingHealth: 120,
    items: [{ itemId: 'knuckles', quantity: 1 }],
  },
  RUNNER: {
    name: 'Runner',
    startingCash: 1500,
    startingHealth: 100,
    items: [{ itemId: 'sneakers', quantity: 1 }],
  },
};
