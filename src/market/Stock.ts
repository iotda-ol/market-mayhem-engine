export interface Stock {
  id: string;
  name: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  volatility: number; // 0-1, higher = more volatile
  priceHistory: number[]; // last 5 prices (most recent first)
  changePercent: number;  // % change from previous price (current turn)
  newsEvent?: string;     // active news headline affecting this stock
}

export function createStock(
  id: string,
  name: string,
  basePrice: number,
  volatility: number
): Stock {
  return {
    id,
    name,
    price: basePrice,
    minPrice: Math.floor(basePrice * 0.1),
    maxPrice: Math.floor(basePrice * 5),
    volatility,
    priceHistory: [],
    changePercent: 0,
  };
}

export const DEFAULT_STOCKS: Stock[] = [
  createStock('TECH', 'TechCorp', 100, 0.3),
  createStock('DRUG', 'PharmaCo', 200, 0.5),
  createStock('ARMS', 'ArmsInc', 500, 0.7),
  createStock('FOOD', 'FoodChain', 50, 0.1),
  createStock('ENERGY', 'EnergyCo', 150, 0.4),
];
