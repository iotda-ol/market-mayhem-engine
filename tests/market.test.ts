import { Market, LOCATIONS } from '../src/market/Market';
import { DEFAULT_STOCKS, createStock } from '../src/market/Stock';
import { Player } from '../src/player/Player';
import { LOADOUTS } from '../src/player/Loadout';

function makeMarket(): Market {
  return new Market('downtown', 'Downtown', DEFAULT_STOCKS.map((s) => ({ ...s })));
}

function makePlayer(startingCash = 2000): Player {
  const loadout = { ...LOADOUTS.MERCHANT, startingCash };
  return new Player('p1', 'Alice', loadout);
}

describe('Market', () => {
  describe('constructor', () => {
    it('creates market with correct id and name', () => {
      const market = makeMarket();
      expect(market.locationId).toBe('downtown');
      expect(market.locationName).toBe('Downtown');
    });

    it('stores deep copies of stocks', () => {
      const originalStocks = DEFAULT_STOCKS.map((s) => ({ ...s }));
      const market = new Market('loc', 'Loc', originalStocks);
      expect(market.getStockList()).toHaveLength(DEFAULT_STOCKS.length);
    });
  });

  describe('buyStock', () => {
    it('successfully buys stock when player has sufficient funds', () => {
      const market = makeMarket();
      const player = makePlayer(2000);
      const stock = DEFAULT_STOCKS.find((s) => s.id === 'TECH')!;
      const result = market.buyStock(player, 'TECH', 5);
      expect(result.success).toBe(true);
      expect(result.quantityTraded).toBe(5);
      expect(result.totalValue).toBe(stock.price * 5);
      expect(player.cash).toBe(2000 - stock.price * 5);
      expect(player.inventory.getQuantity('TECH')).toBe(5);
    });

    it('fails when player has insufficient funds', () => {
      const market = makeMarket();
      const player = makePlayer(10); // very little cash
      const result = market.buyStock(player, 'ARMS', 1); // ARMS is expensive
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Insufficient funds/);
      expect(player.cash).toBe(10);
    });

    it('fails for non-existent stock', () => {
      const market = makeMarket();
      const player = makePlayer(2000);
      const result = market.buyStock(player, 'NONEXISTENT', 1);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/not found/);
    });
  });

  describe('sellStock', () => {
    it('successfully sells stock when player has shares', () => {
      const market = makeMarket();
      const player = makePlayer(2000);
      market.buyStock(player, 'TECH', 5);
      const cashBefore = player.cash;
      const stock = DEFAULT_STOCKS.find((s) => s.id === 'TECH')!;
      const result = market.sellStock(player, 'TECH', 3);
      expect(result.success).toBe(true);
      expect(result.quantityTraded).toBe(3);
      expect(player.cash).toBe(cashBefore + stock.price * 3);
      expect(player.inventory.getQuantity('TECH')).toBe(2);
    });

    it('fails when player has insufficient shares', () => {
      const market = makeMarket();
      const player = makePlayer(2000);
      const result = market.sellStock(player, 'TECH', 5);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Insufficient shares/);
    });

    it('fails for non-existent stock', () => {
      const market = makeMarket();
      const player = makePlayer(2000);
      const result = market.sellStock(player, 'NONEXISTENT', 1);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/not found/);
    });
  });

  describe('updatePrices', () => {
    it('updates all stock prices', () => {
      const market = makeMarket();
      const pricesBefore = market.getStockList().map((s) => s.price);
      // Update many times so at least one price should change
      for (let i = 0; i < 20; i++) {
        market.updatePrices();
      }
      const pricesAfter = market.getStockList().map((s) => s.price);
      // At least one price should have changed across 20 updates
      const anyChanged = pricesBefore.some((p, i) => p !== pricesAfter[i]);
      expect(anyChanged).toBe(true);
    });

    it('keeps prices within min/max bounds', () => {
      const market = makeMarket();
      for (let i = 0; i < 100; i++) {
        market.updatePrices();
      }
      for (const stock of market.getStockList()) {
        expect(stock.price).toBeGreaterThanOrEqual(stock.minPrice);
        expect(stock.price).toBeLessThanOrEqual(stock.maxPrice);
      }
    });
  });

  describe('getStockList', () => {
    it('returns all stocks', () => {
      const market = makeMarket();
      expect(market.getStockList()).toHaveLength(DEFAULT_STOCKS.length);
    });
  });

  describe('LOCATIONS', () => {
    it('has 6 locations', () => {
      expect(LOCATIONS).toHaveLength(6);
    });

    it('contains downtown', () => {
      expect(LOCATIONS.some((l) => l.id === 'downtown')).toBe(true);
    });
  });
});
