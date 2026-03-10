import { GameEngine } from '../src/engine/GameEngine';
import { LOADOUTS } from '../src/player/Loadout';

function makeEngine(shopTurnInterval = 5): GameEngine {
  return new GameEngine(shopTurnInterval);
}

const MERCHANT = LOADOUTS.MERCHANT;

describe('GameEngine', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('joinLobby', () => {
    it('transitions to market phase on successful join', () => {
      const engine = makeEngine();
      const joined = engine.joinLobby('p1', 'Alice', MERCHANT, 100);
      expect(joined).toBe(true);
      expect(engine.getContext().phase).toBe('market');
    });

    it('initializes player with loadout minus entry fee', () => {
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 100);
      const player = engine.getContext().player!;
      expect(player.cash).toBe(MERCHANT.startingCash - 100);
      expect(player.health).toBe(MERCHANT.startingHealth);
    });

    it('initializes markets for all locations', () => {
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      expect(engine.getContext().markets.size).toBe(6);
    });

    it('fails when already past lobby phase', () => {
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      const result = engine.joinLobby('p2', 'Bob', MERCHANT, 0);
      expect(result).toBe(false);
    });

    it('fails when entry fee exceeds starting cash', () => {
      const engine = makeEngine();
      const result = engine.joinLobby('p1', 'Alice', MERCHANT, MERCHANT.startingCash + 1);
      expect(result).toBe(false);
      expect(engine.getContext().phase).toBe('lobby');
    });

    it('sets player starting location', () => {
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      expect(engine.getContext().player!.location).toBe('downtown');
    });
  });

  describe('Market Phase - buyStock / sellStock', () => {
    it('buys stock in market phase', () => {
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      const result = engine.buyStock('TECH', 2);
      expect(result).toBe(true);
      expect(engine.getContext().player!.inventory.getQuantity('TECH')).toBe(2);
    });

    it('fails to buy with insufficient funds', () => {
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', { ...MERCHANT, startingCash: 1 }, 0);
      const result = engine.buyStock('ARMS', 100);
      expect(result).toBe(false);
    });

    it('sells stock in market phase', () => {
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      engine.buyStock('TECH', 5);
      const result = engine.sellStock('TECH', 3);
      expect(result).toBe(true);
      expect(engine.getContext().player!.inventory.getQuantity('TECH')).toBe(2);
    });

    it('fails to sell stock not owned', () => {
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      const result = engine.sellStock('TECH', 1);
      expect(result).toBe(false);
    });

    it('rejects buy/sell outside market phase', () => {
      const engine = makeEngine();
      expect(engine.buyStock('TECH', 1)).toBe(false);
      expect(engine.sellStock('TECH', 1)).toBe(false);
    });
  });

  describe('endMarketPhase', () => {
    it('transitions to travel phase', () => {
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      engine.endMarketPhase();
      expect(engine.getContext().phase).toBe('travel');
    });

    it('does nothing outside market phase', () => {
      const engine = makeEngine();
      engine.endMarketPhase();
      expect(engine.getContext().phase).toBe('lobby');
    });
  });

  describe('travel', () => {
    it('travels to valid location without encounter', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9); // above encounter probability (0.4)
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      engine.endMarketPhase();
      const result = engine.travel('harbor');
      expect(result).toBe(true);
      expect(engine.getContext().player!.location).toBe('harbor');
    });

    it('transitions to market_update phase after travel without encounter', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      engine.endMarketPhase();
      engine.travel('harbor');
      expect(engine.getContext().phase).toBe('market_update');
    });

    it('transitions to encounter phase when encounter triggered', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // below 0.4 → encounter
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      engine.endMarketPhase();
      engine.travel('harbor');
      expect(engine.getContext().phase).toBe('encounter');
      expect(engine.getContext().pendingEncounter).toBe(true);
    });

    it('fails for invalid destination', () => {
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      engine.endMarketPhase();
      const result = engine.travel('nonexistent');
      expect(result).toBe(false);
    });

    it('fails when not in travel phase', () => {
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      const result = engine.travel('harbor');
      expect(result).toBe(false);
    });
  });

  describe('resolveEncounter', () => {
    function setupEncounter(engine: GameEngine): void {
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      engine.endMarketPhase();
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // trigger encounter
      engine.travel('harbor');
    }

    it('resolves pay encounter and transitions to market_update', () => {
      const engine = makeEngine();
      setupEncounter(engine);
      jest.spyOn(Math, 'random').mockReturnValue(0); // 20% cash loss
      engine.resolveEncounter('pay');
      expect(engine.getContext().phase).toBe('market_update');
      expect(engine.getContext().pendingEncounter).toBe(false);
    });

    it('resolves run encounter (escaped) and transitions to market_update', () => {
      const engine = makeEngine();
      setupEncounter(engine);
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // < 0.6 → escape
      engine.resolveEncounter('run');
      expect(engine.getContext().phase).toBe('market_update');
    });

    it('resolves fight encounter (victorious) and transitions to market_update', () => {
      const engine = makeEngine();
      setupEncounter(engine);
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // < 0.5 → victorious
      engine.resolveEncounter('fight');
      expect(engine.getContext().phase).toBe('market_update');
    });

    it('transitions to game_over when health reaches zero', () => {
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', { ...MERCHANT, startingHealth: 5 }, 0);
      engine.endMarketPhase();
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // trigger encounter
      engine.travel('harbor');
      // fight + high random → captured with heavy damage
      jest.spyOn(Math, 'random').mockReturnValue(0.99);
      engine.resolveEncounter('fight');
      expect(engine.getContext().phase).toBe('game_over');
      expect(engine.getContext().isGameOver).toBe(true);
    });

    it('does nothing when not in encounter phase', () => {
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      expect(engine.getContext().phase).toBe('market');
      engine.resolveEncounter('pay'); // should do nothing
      expect(engine.getContext().phase).toBe('market');
    });
  });

  describe('Shop Phase', () => {
    function setupShopTurn(engine: GameEngine): void {
      // shopTurnInterval=1 means shop opens every turn
      // (turnNumber+1) % 1 === 0 → always opens
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      engine.endMarketPhase();
      jest.spyOn(Math, 'random').mockReturnValue(0.9); // no encounter
      engine.travel('harbor');
      // Now in market_update → shop should open
    }

    it('shop opens on nth turn (interval=1)', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const engine = makeEngine(1); // shop every turn
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      engine.endMarketPhase();
      engine.travel('harbor');
      expect(engine.getContext().phase).toBe('shop');
    });

    it('buyItem succeeds in shop phase', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const engine = makeEngine(1);
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      engine.endMarketPhase();
      engine.travel('harbor');
      const result = engine.buyItem('medkit');
      expect(result).toBe(true);
      expect(engine.getContext().player!.inventory.hasItem('medkit')).toBe(true);
    });

    it('buyItem fails with insufficient cash', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const engine = makeEngine(1);
      engine.joinLobby('p1', 'Alice', { ...MERCHANT, startingCash: 0 }, 0);
      engine.endMarketPhase();
      engine.travel('harbor');
      const result = engine.buyItem('medkit');
      expect(result).toBe(false);
    });

    it('skipShop transitions to market_update', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const engine = makeEngine(1);
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      engine.endMarketPhase();
      engine.travel('harbor');
      engine.skipShop();
      expect(engine.getContext().phase).toBe('market_update');
    });

    it('endShopPhase transitions to market_update', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const engine = makeEngine(1);
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      engine.endMarketPhase();
      engine.travel('harbor');
      engine.endShopPhase();
      expect(engine.getContext().phase).toBe('market_update');
    });

    it('getShopItems returns all shop items', () => {
      const engine = makeEngine();
      expect(engine.getShopItems()).toHaveLength(3);
    });
  });

  describe('applyMarketUpdate', () => {
    it('increments turn number', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      engine.endMarketPhase();
      engine.travel('harbor');
      expect(engine.getContext().turnNumber).toBe(0);
      engine.applyMarketUpdate();
      expect(engine.getContext().turnNumber).toBe(1);
    });

    it('transitions back to market phase', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      engine.endMarketPhase();
      engine.travel('harbor');
      engine.applyMarketUpdate();
      expect(engine.getContext().phase).toBe('market');
    });

    it('does nothing outside market_update phase', () => {
      const engine = makeEngine();
      engine.applyMarketUpdate(); // in lobby phase, should be no-op
      expect(engine.getContext().turnNumber).toBe(0);
    });
  });

  describe('getLog', () => {
    it('returns a copy of the log', () => {
      const engine = makeEngine();
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      const log = engine.getLog();
      expect(Array.isArray(log)).toBe(true);
      expect(log.length).toBeGreaterThan(0);
    });
  });

  describe('Full game loop integration', () => {
    it('completes a full turn cycle: market → travel → market_update → market', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9); // no encounters
      const engine = makeEngine(10); // shop every 10 turns
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);
      expect(engine.getContext().phase).toBe('market');

      engine.buyStock('FOOD', 5);
      engine.endMarketPhase();
      expect(engine.getContext().phase).toBe('travel');

      engine.travel('eastside');
      expect(engine.getContext().phase).toBe('market_update');

      engine.applyMarketUpdate();
      expect(engine.getContext().phase).toBe('market');
      expect(engine.getContext().turnNumber).toBe(1);
    });

    it('completes multiple turns correctly', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const engine = makeEngine(10);
      engine.joinLobby('p1', 'Alice', MERCHANT, 0);

      for (let i = 0; i < 3; i++) {
        engine.endMarketPhase();
        engine.travel('harbor');
        engine.applyMarketUpdate();
      }

      expect(engine.getContext().turnNumber).toBe(3);
      expect(engine.getContext().phase).toBe('market');
    });
  });
});
