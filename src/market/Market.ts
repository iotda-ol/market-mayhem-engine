import { Stock } from './Stock';
import { Player } from '../player/Player';

export interface TradeResult {
  success: boolean;
  message: string;
  quantityTraded?: number;
  totalValue?: number;
}

// News events: [headline, priceChangeMin, priceChangeMax] (as fractions, e.g. 0.4 = +40%)
const NEWS_EVENTS: Record<string, Array<[string, number, number]>> = {
  TECH: [
    ['🚀 TechCorp announces revolutionary AI product!', 0.4, 0.8],
    ['💥 TechCorp data breach scandal rocks markets!', -0.5, -0.25],
    ['📈 TechCorp beats earnings expectations!', 0.2, 0.4],
    ['📉 TechCorp misses revenue targets badly.', -0.4, -0.15],
  ],
  DRUG: [
    ['💊 PharmaCo blockbuster drug gets FDA approval!', 0.5, 0.9],
    ['⚠️ PharmaCo drug recalled over safety concerns!', -0.6, -0.3],
    ['🔬 PharmaCo cancer trial shows promising results!', 0.3, 0.6],
    ['📋 PharmaCo patent expires — generics flood market.', -0.35, -0.15],
  ],
  ARMS: [
    ['🎖️ ArmsInc wins massive defense contract!', 0.5, 1.0],
    ['🕊️ Peace treaty threatens ArmsInc demand.', -0.55, -0.25],
    ['💣 International tension spikes ArmsInc value!', 0.4, 0.8],
    ['🔍 ArmsInc under investigation for corruption.', -0.45, -0.2],
  ],
  FOOD: [
    ['🌾 Crop failure causes FoodChain shortage!', 0.3, 0.5],
    ['🐄 FoodChain recall — contamination found!', -0.4, -0.2],
    ['🌍 FoodChain expands to 50 new cities!', 0.2, 0.35],
    ['💸 FoodChain hit by labor strike nationwide.', -0.3, -0.1],
  ],
  ENERGY: [
    ['⚡ EnergyCo discovers massive oil reserve!', 0.4, 0.7],
    ['🌱 Green energy bill slashes EnergyCo profits.', -0.45, -0.2],
    ['🔥 Energy crisis drives EnergyCo prices up!', 0.35, 0.65],
    ['💧 Pipeline accident halts EnergyCo operations.', -0.5, -0.25],
  ],
};

export class Market {
  public readonly locationId: string;
  public readonly locationName: string;
  public stocks: Map<string, Stock>;

  constructor(locationId: string, locationName: string, stocks: Stock[]) {
    this.locationId = locationId;
    this.locationName = locationName;
    this.stocks = new Map(stocks.map((s) => [s.id, { ...s }]));
  }

  public buyStock(
    player: Player,
    stockId: string,
    quantity: number
  ): TradeResult {
    const stock = this.stocks.get(stockId);
    if (!stock) {
      return { success: false, message: `Stock ${stockId} not found in this market.` };
    }
    const totalCost = stock.price * quantity;
    if (player.cash < totalCost) {
      return {
        success: false,
        message: `Insufficient funds. Need $${totalCost}, have $${player.cash}.`,
      };
    }
    player.spendCash(totalCost);
    player.inventory.addItem(stockId, quantity);
    return {
      success: true,
      message: `Bought ${quantity} shares of ${stock.name} for $${totalCost}.`,
      quantityTraded: quantity,
      totalValue: totalCost,
    };
  }

  public sellStock(
    player: Player,
    stockId: string,
    quantity: number
  ): TradeResult {
    const stock = this.stocks.get(stockId);
    if (!stock) {
      return { success: false, message: `Stock ${stockId} not found in this market.` };
    }
    if (!player.inventory.removeItem(stockId, quantity)) {
      return {
        success: false,
        message: `Insufficient shares. Need ${quantity} of ${stock.name}.`,
      };
    }
    const totalValue = stock.price * quantity;
    player.gainCash(totalValue);
    return {
      success: true,
      message: `Sold ${quantity} shares of ${stock.name} for $${totalValue}.`,
      quantityTraded: quantity,
      totalValue,
    };
  }

  public updatePrices(): void {
    for (const [, stock] of this.stocks) {
      const oldPrice = stock.price;

      // Push current price into history (keep last 5)
      stock.priceHistory = [oldPrice, ...(stock.priceHistory ?? [])].slice(0, 5);

      // Clear previous news
      stock.newsEvent = undefined;

      let changeMultiplier: number;

      // 8% chance of a news event causing a dramatic price swing
      if (Math.random() < 0.08) {
        const events = NEWS_EVENTS[stock.id];
        if (events && events.length > 0) {
          const [headline, minPct, maxPct] = events[Math.floor(Math.random() * events.length)];
          stock.newsEvent = headline;
          const swingPct = minPct + Math.random() * (maxPct - minPct);
          changeMultiplier = 1 + swingPct;
        } else {
          changeMultiplier = 1 + (Math.random() * 2 - 1) * stock.volatility;
        }
      } else {
        changeMultiplier = 1 + (Math.random() * 2 - 1) * stock.volatility;
      }

      const rawNewPrice = Math.round(oldPrice * changeMultiplier);
      const newPrice = Math.max(stock.minPrice, Math.min(stock.maxPrice, rawNewPrice));

      stock.changePercent = oldPrice > 0
        ? Math.round(((newPrice - oldPrice) / oldPrice) * 100)
        : 0;
      stock.price = newPrice;
    }
  }

  public getStockList(): Stock[] {
    return Array.from(this.stocks.values());
  }
}

export const LOCATIONS = [
  { id: 'downtown', name: 'Downtown' },
  { id: 'harbor', name: 'Harbor District' },
  { id: 'eastside', name: 'East Side' },
  { id: 'westend', name: 'West End' },
  { id: 'suburbs', name: 'Suburbs' },
  { id: 'industrial', name: 'Industrial Zone' },
];
