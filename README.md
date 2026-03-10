# 📈 Market Mayhem Engine

[![Build](https://img.shields.io/badge/build-passing-brightgreen)](#getting-started)
[![Tests](https://img.shields.io/badge/tests-97%20passing-brightgreen)](#testing)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](#)

> A modular, turn-based state machine engine for a trading strategy game. Features a dynamic **Loadout** system, procedural market fluctuations, and a branching encounter engine (Fight / Run / Pay). Includes automated health-check logic for Game Over states and an *n*th-turn shop-spawning algorithm. Clean, extensible, and ready for UI integration.

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
- [Game Flow](#game-flow)
- [Modules](#modules)
  - [GameEngine](#gameengine)
  - [Player & Loadouts](#player--loadouts)
  - [Market & Stocks](#market--stocks)
  - [Inventory & Items](#inventory--items)
  - [Encounter System](#encounter-system)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

---

## Features

- 🎮 **Turn-based state machine** — 7 clearly defined game phases with clean enter/exit hooks
- 📊 **Procedural market simulation** — 5 stocks across 6 locations, each with configurable volatility
- 🎒 **Loadout system** — 3 player archetypes (Merchant, Street Fighter, Runner) with unique starting stats
- ⚔️ **Branching encounter engine** — Probabilistic outcomes for Pay, Run, and Fight choices
- 🛒 **Dynamic shop system** — Items spawn on a configurable *n*th-turn interval
- 🏪 **Rich inventory management** — Generic item system supporting stocks and consumable items
- 📝 **Full event log** — Turn-stamped game history for UI/analytics integration
- 🔒 **Strict TypeScript** — Fully typed, zero implicit `any`, ready to embed in any frontend or backend
- ✅ **97 tests** — Comprehensive test coverage across all modules

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                       GameEngine                        │
│                   (State Orchestrator)                  │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Lobby   │→ │  Market  │→ │  Travel  │              │
│  └──────────┘  └──────────┘  └────┬─────┘              │
│                    ↑              │                     │
│              ┌─────┴────┐   40% chance                 │
│              │  Market  │         │                     │
│              │  Update  │    ┌────▼─────┐               │
│              └─────┬────┘    │Encounter │               │
│                    │         └────┬─────┘               │
│               ┌────┴────┐        │                     │
│               │  Shop   │←───────┘                     │
│               │(nth turn)│                              │
│               └─────────┘                              │
│                                                         │
│              ┌───────────┐                              │
│              │ Game Over │  (health reaches 0)          │
│              └───────────┘                              │
└─────────────────────────────────────────────────────────┘
```

### State Machine

The engine uses the **State design pattern**. Each `GamePhase` has a corresponding state class implementing `enter()` and `exit()` hooks. The `GameContext` object is shared across all states, ensuring consistent data flow.

| Phase | Description |
|-------|-------------|
| `lobby` | Pre-game setup, player creation |
| `market` | Buy and sell stocks at current location |
| `travel` | Move to another location (may trigger encounter) |
| `encounter` | Resolve a random event (Pay / Run / Fight) |
| `shop` | Purchase items (spawns every *n* turns) |
| `market_update` | Prices randomize, turn counter increments |
| `game_over` | Player health reached 0 |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [npm](https://www.npmjs.com/) ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/iotda-ol/market-mayhem-engine.git
cd market-mayhem-engine

# Install dependencies
npm install
```

### Build

```bash
npm run build
# Compiled output goes to dist/
```

### Quick Start

```typescript
import {
  GameEngine,
  LOADOUTS,
} from './dist';  // or from 'market-mayhem-engine' if installed as a package

// 1. Create engine (shop spawns every 5 turns by default)
const engine = new GameEngine();

// 2. Join with the Merchant loadout, paying a $200 entry fee
engine.joinLobby('p1', 'Alice', LOADOUTS.MERCHANT, 200);

// 3. Buy 3 shares of TECH stock
engine.buyStock('TECH', 3);

// 4. Sell 1 share of TECH
engine.sellStock('TECH', 1);

// 5. End the market phase and prepare to travel
engine.endMarketPhase();

// 6. Travel to the harbor district
const moved = engine.travel('harbor');

// 7. If an encounter was triggered, resolve it
const ctx = engine.getContext();
if (ctx.phase === 'encounter') {
  engine.resolveEncounter('fight');
}

// 8. If the shop opened, buy an item
if (ctx.phase === 'shop') {
  engine.buyItem('medkit');
  engine.endShopPhase();
}

// 9. Apply the market update to start the next turn
engine.applyMarketUpdate();

// 10. Inspect the full event log
console.log(engine.getLog());
```

---

## Game Flow

A typical turn follows this sequence:

```
joinLobby()
    │
    ▼
[market phase]
  buyStock() / sellStock()
  endMarketPhase()
    │
    ▼
[travel phase]
  travel(destinationId)
    │
    ├─ 40% chance ──▶ [encounter phase]
    │                   resolveEncounter('pay' | 'run' | 'fight')
    │                       │ health == 0? ──▶ [game_over]
    │                       │
    ▼                       ▼
[shop phase]  ◀── every nth turn ──┤
  buyItem() / skipShop()           │
    │                              │
    └──────────────────────────────┘
              │
              ▼
      [market_update phase]
        applyMarketUpdate()
              │
              ▼
        [market phase]  ← next turn begins
```

---

## Modules

### GameEngine

The central orchestrator. Manages phase transitions, routes actions to the correct phase, and maintains the shared `GameContext`.

```typescript
const engine = new GameEngine(shopTurnInterval?: number);
```

| Method | Phase | Description |
|--------|-------|-------------|
| `joinLobby(id, name, loadout, fee)` | `lobby` | Initialize game and transition to market |
| `buyStock(stockId, qty)` | `market` | Purchase shares at current location |
| `sellStock(stockId, qty)` | `market` | Sell shares for cash |
| `endMarketPhase()` | `market` | Move to travel phase |
| `travel(destinationId)` | `travel` | Travel, possibly triggering an encounter |
| `resolveEncounter(choice)` | `encounter` | Resolve Pay / Run / Fight |
| `buyItem(itemId)` | `shop` | Purchase a shop item |
| `skipShop()` / `endShopPhase()` | `shop` | Skip or close the shop |
| `getShopItems()` | any | Returns available shop items |
| `applyMarketUpdate()` | `market_update` | Randomize prices, start new turn |
| `getContext()` | any | Returns the full `GameContext` |
| `getLog()` | any | Returns copy of the event log |

### Player & Loadouts

```typescript
import { Player, LOADOUTS, Loadout } from './dist';
```

Three built-in loadouts provide distinct playstyles:

| Loadout | Starting Cash | Starting Health | Starting Item |
|---------|:-------------:|:---------------:|:-------------:|
| `MERCHANT` | $2,000 | 80 HP | Briefcase |
| `STREET_FIGHTER` | $1,000 | 120 HP | Knuckles |
| `RUNNER` | $1,500 | 100 HP | Sneakers |

**Player API:**

```typescript
player.takeDamage(amount: number): void   // health cannot go below 0
player.heal(amount: number): void          // health cannot exceed loadout.startingHealth
player.isAlive(): boolean                  // health > 0
player.spendCash(amount: number): boolean  // returns false if insufficient funds
player.gainCash(amount: number): void
```

### Market & Stocks

```typescript
import { Market, LOCATIONS, DEFAULT_STOCKS } from './dist';
```

**6 Locations** — each with its own independent `Market` instance:

| ID | Name |
|----|------|
| `downtown` | Downtown |
| `harbor` | Harbor |
| `eastside` | East Side |
| `westend` | West End |
| `suburbs` | Suburbs |
| `industrial` | Industrial |

**5 Default Stocks:**

| ID | Name | Base Price | Volatility |
|----|------|:----------:|:----------:|
| `TECH` | TechCorp | $100 | 0.30 |
| `DRUG` | PharmaCo | $200 | 0.50 |
| `ARMS` | ArmsInc | $500 | 0.70 |
| `FOOD` | FoodChain | $50 | 0.10 |
| `ENERGY` | EnergyCo | $150 | 0.40 |

**Price Update Formula:**

```
newPrice = clamp(
  round(currentPrice × (1 + rand(-1, 1) × volatility)),
  minPrice,
  maxPrice
)

where:
  minPrice = floor(basePrice × 0.1)
  maxPrice = floor(basePrice × 5)
```

**Market API:**

```typescript
market.buyStock(player, stockId, quantity): TradeResult
market.sellStock(player, stockId, quantity): TradeResult
market.updatePrices(): void
market.getStockList(): Stock[]
```

### Inventory & Items

```typescript
import { Inventory, SHOP_ITEMS } from './dist';
```

**3 Shop Items:**

| ID | Name | Price | Effect |
|----|------|:-----:|--------|
| `medkit` | Med Kit | $200 | Restore 30 HP immediately |
| `bodyarmor` | Body Armor | $500 | +20% fight victory chance; −20% damage taken |
| `speedboots` | Speed Boots | $350 | +30% escape success chance |

**Inventory API:**

```typescript
inventory.addItem(itemId: string, quantity: number): void
inventory.removeItem(itemId: string, quantity: number): void
inventory.getQuantity(itemId: string): number
inventory.hasItem(itemId: string): boolean
inventory.listItems(): Array<{ itemId: string; quantity: number }>
inventory.clear(): void
```

### Encounter System

```typescript
import { EncounterSystem, EncounterChoice, EncounterOutcome } from './dist';
```

The encounter system resolves random events when traveling. Base probabilities can be adjusted via constructor:

```typescript
const system = new EncounterSystem(
  encounterChance: number = 0.4,  // probability of triggering an encounter
  locationIds: string[]           // pool of locations for escape teleport
);
```

**Resolution Mechanics:**

| Choice | Base Success | Item Bonus | On Success | On Failure |
|--------|:-----------:|:----------:|-----------|-----------|
| **Pay** | Always | — | Lose 20–40% cash + possible stock loss | — |
| **Run** | 60% | +30% (speedboots → 90%) | Teleport to random location | Falls back to Pay |
| **Fight** | 50% | +20% (bodyarmor → 70%) | Gain $100–600 | Take 10–40 damage (−20% with armor) |

**EncounterResult:**

```typescript
interface EncounterResult {
  outcome: 'escaped' | 'victorious' | 'captured' | 'paid' | 'no_encounter';
  message: string;
  newLocation?: string;   // set when outcome is 'escaped'
  cashChange?: number;
  healthChange?: number;
}
```

---

## API Reference

### Types

```typescript
type GamePhase =
  | 'lobby'
  | 'market'
  | 'travel'
  | 'encounter'
  | 'shop'
  | 'market_update'
  | 'game_over';

type EncounterChoice = 'pay' | 'run' | 'fight';

type EncounterOutcome =
  | 'escaped'
  | 'victorious'
  | 'captured'
  | 'paid'
  | 'no_encounter';

interface GameContext {
  player: Player | null;
  markets: Map<string, Market>;
  currentMarket: Market | null;
  turnNumber: number;
  shopTurnInterval: number;
  encounterSystem: EncounterSystem;
  pendingEncounter: boolean;
  phase: GamePhase;
  log: string[];
  isGameOver: boolean;
}

interface TradeResult {
  success: boolean;
  message: string;
  quantityTraded?: number;
  totalValue?: number;
}

interface Stock {
  id: string;
  name: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  volatility: number;
}

interface Loadout {
  name: string;
  startingCash: number;
  startingHealth: number;
  items: Array<{ itemId: string; quantity: number }>;
}

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  effect?: ItemEffect;
}

interface ItemEffect {
  type: 'health' | 'cash_multiplier' | 'escape_bonus' | 'fight_bonus';
  value: number;
}
```

---

## Configuration

| Option | Default | Description |
|--------|:-------:|-------------|
| `shopTurnInterval` | `5` | Shop spawns every *n* turns. Set to `0` to disable. |
| `encounterChance` | `0.4` | Probability (0–1) of an encounter when traveling. |

```typescript
// Custom configuration example
const engine = new GameEngine(10); // shop every 10 turns
```

The `encounterChance` is set on `EncounterSystem` internally. To override it, use the exported `EncounterSystem` class directly:

```typescript
import { EncounterSystem, LOCATIONS } from './dist';
const locationIds = LOCATIONS.map(l => l.id);
const system = new EncounterSystem(0.2, locationIds); // 20% encounter chance
```

---

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run a specific test file
npm test -- tests/engine.test.ts

# Watch mode (re-run on file change)
npm test -- --watch
```

**Test coverage by module:**

| Test File | Module | Tests |
|-----------|--------|:-----:|
| `engine.test.ts` | GameEngine (full state machine) | ~40 |
| `player.test.ts` | Player, Loadout | ~20 |
| `market.test.ts` | Market, Stock, LOCATIONS | ~20 |
| `inventory.test.ts` | Inventory, Item | ~10 |
| `encounter.test.ts` | EncounterSystem | ~7 |
| **Total** | | **~97** |

---

## Project Structure

```
market-mayhem-engine/
├── src/
│   ├── index.ts                    # Public exports (barrel file)
│   ├── engine/
│   │   ├── GameEngine.ts           # Core state machine & orchestration
│   │   └── states/
│   │       └── GameState.ts        # GameState interface
│   ├── player/
│   │   ├── Player.ts               # Player class (health, cash, inventory)
│   │   └── Loadout.ts              # Loadout definitions & LOADOUTS map
│   ├── market/
│   │   ├── Market.ts               # Market class & LOCATIONS
│   │   └── Stock.ts                # Stock interface, createStock, DEFAULT_STOCKS
│   ├── inventory/
│   │   ├── Inventory.ts            # Inventory management
│   │   └── Item.ts                 # Item definitions & SHOP_ITEMS
│   └── encounter/
│       └── EncounterSystem.ts      # Encounter logic (pay/run/fight)
├── tests/
│   ├── engine.test.ts
│   ├── player.test.ts
│   ├── market.test.ts
│   ├── inventory.test.ts
│   └── encounter.test.ts
├── dist/                           # Compiled output (git-ignored)
├── jest.config.js
├── tsconfig.json
├── package.json
├── CONTRIBUTING.md
├── CHANGELOG.md
└── README.md
```

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Reporting bugs and requesting features
- Setting up the development environment
- Code style and commit conventions
- Submitting pull requests

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full history of changes.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">Built with ❤️ and TypeScript · <a href="#table-of-contents">Back to top ↑</a></p>
