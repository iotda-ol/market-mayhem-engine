import { Player } from '../player/Player';
import { Loadout } from '../player/Loadout';
import { Market, LOCATIONS } from '../market/Market';
import { DEFAULT_STOCKS } from '../market/Stock';
import { EncounterSystem, EncounterChoice } from '../encounter/EncounterSystem';
import { SHOP_ITEMS, Item } from '../inventory/Item';
import { GameState } from './states/GameState';

export type GamePhase =
  | 'lobby'
  | 'market'
  | 'travel'
  | 'encounter'
  | 'shop'
  | 'market_update'
  | 'game_over'
  | 'game_won';

export interface GameContext {
  player: Player | null;
  markets: Map<string, Market>;
  currentMarket: Market | null;
  turnNumber: number;
  shopTurnInterval: number;
  maxTurns: number;
  targetCash: number;
  encounterSystem: EncounterSystem;
  pendingEncounter: boolean;
  lastEncounterChoice?: EncounterChoice;
  phase: GamePhase;
  log: string[];
  isGameOver: boolean;
  isGameWon: boolean;
}

export class GameEngine {
  private context: GameContext;
  private currentState: GameState | null = null;

  constructor(shopTurnInterval: number = 5, maxTurns: number = 15, targetCash: number = 5000) {
    const locationIds = LOCATIONS.map((l) => l.id);
    this.context = {
      player: null,
      markets: new Map(),
      currentMarket: null,
      turnNumber: 0,
      shopTurnInterval,
      maxTurns,
      targetCash,
      encounterSystem: new EncounterSystem(0.3, locationIds),
      pendingEncounter: false,
      phase: 'lobby',
      log: [],
      isGameOver: false,
      isGameWon: false,
    };
  }

  public getContext(): GameContext {
    return this.context;
  }

  public setState(state: GameState): void {
    if (this.currentState) {
      this.currentState.exit(this.context);
    }
    this.currentState = state;
    this.context.phase = state.name as GamePhase;
    this.currentState.enter(this.context);
  }

  public restoreState(state: GameState): void {
    this.currentState = state;
    // NOTE: does not call enter() — used for deserialization only
  }

  public addLog(message: string): void {
    this.context.log.push(`[Turn ${this.context.turnNumber}] ${message}`);
  }

  public getLog(): string[] {
    return [...this.context.log];
  }

  // --- Lobby Phase ---
  public joinLobby(
    playerId: string,
    playerName: string,
    loadout: Loadout,
    entryFee: number
  ): boolean {
    if (this.context.phase !== 'lobby') return false;
    if (loadout.startingCash < entryFee) return false;

    for (const loc of LOCATIONS) {
      const stocks = DEFAULT_STOCKS.map((s) => ({ ...s }));
      this.context.markets.set(loc.id, new Market(loc.id, loc.name, stocks));
    }

    const player = new Player(playerId, playerName, loadout);
    player.spendCash(entryFee);

    const startLocation = LOCATIONS[0].id;
    player.location = startLocation;
    this.context.player = player;
    this.context.currentMarket = this.context.markets.get(startLocation) ?? null;

    this.addLog(`${playerName} joined the lobby with loadout "${loadout.name}". Entry fee: $${entryFee}.`);
    this.setState(new MarketPhaseState());
    return true;
  }

  // --- Market Phase ---
  public buyStock(stockId: string, quantity: number): boolean {
    if (this.context.phase !== 'market' || !this.context.player || !this.context.currentMarket)
      return false;
    const result = this.context.currentMarket.buyStock(
      this.context.player,
      stockId,
      quantity
    );
    this.addLog(result.message);
    return result.success;
  }

  public sellStock(stockId: string, quantity: number): boolean {
    if (this.context.phase !== 'market' || !this.context.player || !this.context.currentMarket)
      return false;
    const result = this.context.currentMarket.sellStock(
      this.context.player,
      stockId,
      quantity
    );
    this.addLog(result.message);
    return result.success;
  }

  public endMarketPhase(): void {
    if (this.context.phase !== 'market') return;
    this.setState(new TravelPhaseState());
  }

  // --- Travel Phase ---
  public travel(destinationId: string): boolean {
    if (this.context.phase !== 'travel' || !this.context.player) return false;
    const destination = this.context.markets.get(destinationId);
    if (!destination) return false;

    this.addLog(`Traveling to ${destination.locationName}...`);

    if (this.context.encounterSystem.checkForEncounter()) {
      this.context.pendingEncounter = true;
      this.context.player.location = destinationId;
      this.context.currentMarket = destination;
      this.addLog('You were stopped by Gangs or Cops!');
      this.setState(new EncounterState());
    } else {
      this.context.player.location = destinationId;
      this.context.currentMarket = destination;
      this.addLog(`Arrived at ${destination.locationName}.`);
      this.context.pendingEncounter = false;
      this.checkShopOrUpdate();
    }
    return true;
  }

  // --- Encounter Phase ---
  public resolveEncounter(choice: EncounterChoice): void {
    if (this.context.phase !== 'encounter' || !this.context.player) return;
    const result = this.context.encounterSystem.resolveEncounter(
      this.context.player,
      choice
    );
    this.addLog(result.message);

    if (result.outcome === 'escaped' && result.newLocation) {
      this.context.player.location = result.newLocation;
      this.context.currentMarket =
        this.context.markets.get(result.newLocation) ?? this.context.currentMarket;
      this.addLog(`You escaped to ${this.context.currentMarket?.locationName ?? result.newLocation}.`);
    }

    if (!this.context.player.isAlive()) {
      this.setState(new GameOverState());
      return;
    }

    this.context.pendingEncounter = false;
    this.checkShopOrUpdate();
  }

  // --- Shop Phase ---
  public buyItem(itemId: string): boolean {
    if (this.context.phase !== 'shop' || !this.context.player) return false;
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return false;

    if (!this.context.player.spendCash(item.price)) {
      this.addLog(`Cannot afford ${item.name} ($${item.price}).`);
      return false;
    }

    this.context.player.inventory.addItem(item.id, 1);
    if (item.effect?.type === 'health') {
      this.context.player.heal(item.effect.value);
    }

    this.addLog(`Purchased ${item.name} for $${item.price}.`);
    return true;
  }

  public skipShop(): void {
    if (this.context.phase !== 'shop') return;
    this.setState(new MarketUpdateState());
  }

  public endShopPhase(): void {
    if (this.context.phase !== 'shop') return;
    this.setState(new MarketUpdateState());
  }

  // --- Market Update Phase ---
  public applyMarketUpdate(): void {
    if (this.context.phase !== 'market_update') return;
    for (const [, market] of this.context.markets) {
      market.updatePrices();
    }
    this.context.turnNumber++;
    this.addLog('Market prices updated. New turn begins.');

    // Check win condition: survive all turns with enough cash
    if (this.context.turnNumber >= this.context.maxTurns) {
      const player = this.context.player;
      if (player) {
        // Calculate portfolio value: cash + stocks at current market prices
        let portfolioValue = player.cash;
        if (this.context.currentMarket) {
          for (const { itemId, quantity } of player.inventory.listItems()) {
            const stock = this.context.currentMarket.stocks.get(itemId);
            if (stock && quantity > 0) {
              portfolioValue += stock.price * quantity;
            }
          }
        }
        if (portfolioValue >= this.context.targetCash) {
          this.setState(new GameWonState());
          return;
        }
      }
      this.setState(new GameOverState());
      return;
    }

    this.setState(new MarketPhaseState());
  }

  // --- Available Shop Items ---
  public getShopItems(): Item[] {
    return [...SHOP_ITEMS];
  }

  private checkShopOrUpdate(): void {
    const { turnNumber, shopTurnInterval } = this.context;
    if (shopTurnInterval > 0 && (turnNumber + 1) % shopTurnInterval === 0) {
      this.addLog('A shop is open!');
      this.setState(new ShopState());
    } else {
      this.setState(new MarketUpdateState());
    }
  }
}

// --- State Implementations ---

class LobbyState implements GameState {
  readonly name = 'lobby';
  enter(_context: GameContext): void {}
  exit(_context: GameContext): void {}
}

class MarketPhaseState implements GameState {
  readonly name = 'market';
  enter(context: GameContext): void {
    context.log.push(`[Turn ${context.turnNumber}] Market Phase started at ${context.currentMarket?.locationName ?? 'unknown'}.`);
  }
  exit(_context: GameContext): void {}
}

class TravelPhaseState implements GameState {
  readonly name = 'travel';
  enter(context: GameContext): void {
    context.log.push(`[Turn ${context.turnNumber}] Travel Phase started.`);
  }
  exit(_context: GameContext): void {}
}

class EncounterState implements GameState {
  readonly name = 'encounter';
  enter(context: GameContext): void {
    context.log.push(`[Turn ${context.turnNumber}] Encounter! Choose: pay, run, or fight.`);
  }
  exit(_context: GameContext): void {}
}

class ShopState implements GameState {
  readonly name = 'shop';
  enter(context: GameContext): void {
    context.log.push(`[Turn ${context.turnNumber}] Shop is open! Available items: ${SHOP_ITEMS.map((i) => i.name).join(', ')}.`);
  }
  exit(_context: GameContext): void {}
}

class MarketUpdateState implements GameState {
  readonly name = 'market_update';
  enter(context: GameContext): void {
    context.log.push(`[Turn ${context.turnNumber}] Market Update Phase.`);
  }
  exit(_context: GameContext): void {}
}

class GameOverState implements GameState {
  readonly name = 'game_over';
  enter(context: GameContext): void {
    context.isGameOver = true;
    context.log.push(`[Turn ${context.turnNumber}] GAME OVER! ${context.player?.name ?? 'Player'} has been eliminated.`);
  }
  exit(_context: GameContext): void {}
}

class GameWonState implements GameState {
  readonly name = 'game_won';
  enter(context: GameContext): void {
    context.isGameWon = true;
    context.log.push(`[Turn ${context.turnNumber}] 🏆 VICTORY! ${context.player?.name ?? 'Player'} reached the target!`);
  }
  exit(_context: GameContext): void {}
}

// Export state classes for external use / testing
export {
  LobbyState,
  MarketPhaseState,
  TravelPhaseState,
  EncounterState,
  ShopState,
  MarketUpdateState,
  GameOverState,
  GameWonState,
};
