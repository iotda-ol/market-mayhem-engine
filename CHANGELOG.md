# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-03-10

### Added

- **GameEngine** — Core turn-based state machine with 7 game phases:
  `lobby`, `market`, `travel`, `encounter`, `shop`, `market_update`, `game_over`
- **Player** — Health, cash, inventory, and location management
- **Loadout system** — Three built-in archetypes: Merchant, Street Fighter, Runner
- **Market** — Per-location stock trading (buy/sell) with procedural price updates
- **Stock** — 5 default stocks (TECH, DRUG, ARMS, FOOD, ENERGY) with configurable volatility
- **Inventory** — Generic item management supporting stocks and consumable items
- **Item / Shop system** — 3 purchasable items (Med Kit, Body Armor, Speed Boots)
  spawning on a configurable *n*th-turn interval
- **EncounterSystem** — Probabilistic Pay / Run / Fight resolution with item bonuses
- **Event log** — Turn-stamped message history for UI and analytics integration
- Comprehensive test suite (97 tests across 5 modules)
- Full TypeScript strict-mode typings and barrel exports from `src/index.ts`

[1.0.0]: https://github.com/iotda-ol/market-mayhem-engine/releases/tag/v1.0.0
