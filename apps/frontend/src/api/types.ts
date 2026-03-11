export type GamePhase =
  | 'lobby'
  | 'market'
  | 'travel'
  | 'encounter'
  | 'shop'
  | 'market_update'
  | 'game_over'
  | 'game_won';

export interface Stock {
  id: string;
  name: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  volatility: number;
  priceHistory: number[];
  changePercent: number;
  newsEvent?: string;
}

export interface MarketSnapshot {
  locationId: string;
  locationName: string;
  stocks: Stock[];
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface PlayerSnapshot {
  id: string;
  name: string;
  cash: number;
  health: number;
  location: string;
  loadout: string;
  inventory: InventoryItem[];
}

export interface GameContext {
  phase: GamePhase;
  turnNumber: number;
  maxTurns: number;
  targetCash: number;
  isGameOver: boolean;
  isGameWon: boolean;
  pendingEncounter: boolean;
  player: PlayerSnapshot | null;
  currentMarket: MarketSnapshot | null;
  markets: MarketSnapshot[];
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  effect?: {
    type: string;
    value: number;
  };
}

export type LoadoutKey = 'MERCHANT' | 'STREET_FIGHTER' | 'RUNNER';
export type EncounterChoice = 'pay' | 'run' | 'fight';
