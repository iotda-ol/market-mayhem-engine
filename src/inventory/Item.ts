export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  effect?: ItemEffect;
}

export interface ItemEffect {
  type: 'health' | 'cash_multiplier' | 'escape_bonus' | 'fight_bonus';
  value: number;
}

export const SHOP_ITEMS: Item[] = [
  {
    id: 'medkit',
    name: 'Med Kit',
    description: 'Restores 30 health points',
    price: 200,
    effect: { type: 'health', value: 30 },
  },
  {
    id: 'bodyarmor',
    name: 'Body Armor',
    description: 'Reduces damage taken in fights by 20%',
    price: 500,
    effect: { type: 'fight_bonus', value: 0.2 },
  },
  {
    id: 'speedboots',
    name: 'Speed Boots',
    description: 'Increases escape success rate by 30%',
    price: 350,
    effect: { type: 'escape_bonus', value: 0.3 },
  },
];
