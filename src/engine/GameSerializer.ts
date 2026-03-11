import { GameEngine, GamePhase } from './GameEngine';
import { Player } from '../player/Player';
import { LOADOUTS } from '../player/Loadout';
import { Market, LOCATIONS } from '../market/Market';
import { Stock } from '../market/Stock';
import { Inventory } from '../inventory/Inventory';
import { EncounterSystem } from '../encounter/EncounterSystem';
import {
  MarketPhaseState,
  TravelPhaseState,
  EncounterState,
  ShopState,
  MarketUpdateState,
  GameOverState,
  LobbyState,
} from './GameEngine';

export interface SerializedInventory {
  items: Array<{ itemId: string; quantity: number }>;
}

export interface SerializedPlayer {
  id: string;
  name: string;
  cash: number;
  health: number;
  location: string;
  loadoutName: string;
  inventory: SerializedInventory;
}

export interface SerializedMarket {
  locationId: string;
  locationName: string;
  stocks: Stock[];
}

export interface SerializedGameState {
  phase: GamePhase;
  turnNumber: number;
  shopTurnInterval: number;
  pendingEncounter: boolean;
  isGameOver: boolean;
  log: string[];
  player: SerializedPlayer | null;
  markets: SerializedMarket[];
  currentMarketId: string | null;
  encounterProbability: number;
  availableLocations: string[];
}

function serializeInventory(inv: Inventory): SerializedInventory {
  return { items: inv.listItems() };
}

function serializePlayer(player: Player): SerializedPlayer {
  return {
    id: player.id,
    name: player.name,
    cash: player.cash,
    health: player.health,
    location: player.location,
    loadoutName: player.loadout.name,
    inventory: serializeInventory(player.inventory),
  };
}

function deserializePlayer(data: SerializedPlayer): Player {
  const loadout = Object.values(LOADOUTS).find(
    (l) => l.name === data.loadoutName
  );
  if (!loadout) {
    throw new Error(`Unknown loadout: ${data.loadoutName}`);
  }
  const player = new Player(data.id, data.name, loadout);
  player.cash = data.cash;
  player.health = data.health;
  player.location = data.location;
  player.inventory.clear();
  for (const { itemId, quantity } of data.inventory.items) {
    player.inventory.addItem(itemId, quantity);
  }
  return player;
}

function serializeMarket(market: Market): SerializedMarket {
  return {
    locationId: market.locationId,
    locationName: market.locationName,
    stocks: market.getStockList(),
  };
}

function deserializeMarket(data: SerializedMarket): Market {
  return new Market(data.locationId, data.locationName, data.stocks);
}

function phaseToState(phase: GamePhase) {
  switch (phase) {
    case 'market': return new MarketPhaseState();
    case 'travel': return new TravelPhaseState();
    case 'encounter': return new EncounterState();
    case 'shop': return new ShopState();
    case 'market_update': return new MarketUpdateState();
    case 'game_over': return new GameOverState();
    default: return new LobbyState();
  }
}

export function serializeGameEngine(engine: GameEngine): SerializedGameState {
  const ctx = engine.getContext();
  const markets = Array.from(ctx.markets.values()).map(serializeMarket);
  return {
    phase: ctx.phase,
    turnNumber: ctx.turnNumber,
    shopTurnInterval: ctx.shopTurnInterval,
    pendingEncounter: ctx.pendingEncounter,
    isGameOver: ctx.isGameOver,
    log: [...ctx.log],
    player: ctx.player ? serializePlayer(ctx.player) : null,
    markets,
    currentMarketId: ctx.currentMarket?.locationId ?? null,
    encounterProbability: 0.4,
    availableLocations: LOCATIONS.map((l) => l.id),
  };
}

export function deserializeGameEngine(data: SerializedGameState): GameEngine {
  const engine = new GameEngine(data.shopTurnInterval);
  const ctx = engine.getContext();

  // Restore log
  ctx.log = [...data.log];

  // Restore turn number
  ctx.turnNumber = data.turnNumber;

  // Restore flags
  ctx.pendingEncounter = data.pendingEncounter;
  ctx.isGameOver = data.isGameOver;

  // Restore markets
  ctx.markets.clear();
  for (const m of data.markets) {
    ctx.markets.set(m.locationId, deserializeMarket(m));
  }

  // Restore player
  if (data.player) {
    ctx.player = deserializePlayer(data.player);
  }

  // Restore current market
  if (data.currentMarketId) {
    ctx.currentMarket = ctx.markets.get(data.currentMarketId) ?? null;
  }

  // Restore encounter system
  ctx.encounterSystem = new EncounterSystem(
    data.encounterProbability,
    data.availableLocations
  );

  // Restore phase (set state without triggering enter() side effects)
  ctx.phase = data.phase;
  engine.restoreState(phaseToState(data.phase));

  return engine;
}
