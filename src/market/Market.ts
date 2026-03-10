import { Stock } from './Stock';
import { Player } from '../player/Player';

export interface TradeResult {
  success: boolean;
  message: string;
  quantityTraded?: number;
  totalValue?: number;
}

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
      const change = (Math.random() * 2 - 1) * stock.volatility;
      const newPrice = Math.round(stock.price * (1 + change));
      stock.price = Math.max(stock.minPrice, Math.min(stock.maxPrice, newPrice));
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
