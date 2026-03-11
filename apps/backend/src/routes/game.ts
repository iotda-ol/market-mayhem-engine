import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GameSessionService } from '../services/GameSessionService';
import { LOADOUTS } from 'market-mayhem-engine';
import { EncounterChoice } from 'market-mayhem-engine';
import { asyncHandler } from '../middleware/asyncHandler';

export function createGameRouter(sessionService: GameSessionService): Router {
  const router = Router();

  // Helper to get the serializable context snapshot
  function ctxSnapshot(engine: ReturnType<GameSessionService['createEngine']>) {
    const ctx = engine.getContext();
    const player = ctx.player
      ? {
          id: ctx.player.id,
          name: ctx.player.name,
          cash: ctx.player.cash,
          health: ctx.player.health,
          location: ctx.player.location,
          loadout: ctx.player.loadout.name,
          inventory: ctx.player.inventory.listItems(),
        }
      : null;
    const currentMarket = ctx.currentMarket
      ? {
          locationId: ctx.currentMarket.locationId,
          locationName: ctx.currentMarket.locationName,
          stocks: ctx.currentMarket.getStockList(),
        }
      : null;
    const markets = Array.from(ctx.markets.values()).map((m) => ({
      locationId: m.locationId,
      locationName: m.locationName,
      stocks: m.getStockList(),
    }));
    return {
      phase: ctx.phase,
      turnNumber: ctx.turnNumber,
      isGameOver: ctx.isGameOver,
      pendingEncounter: ctx.pendingEncounter,
      player,
      currentMarket,
      markets,
    };
  }

  // POST /api/game — create a new session
  router.post('/', asyncHandler(async (_req: Request, res: Response) => {
    const sessionId = uuidv4();
    const engine = sessionService.createEngine();
    await sessionService.saveEngine(sessionId, engine);
    res.status(201).json({ sessionId, context: ctxSnapshot(engine) });
  }));

  // GET /api/game/:id/state
  router.get('/:id/state', asyncHandler(async (req: Request, res: Response) => {
    const engine = await sessionService.getEngine(req.params.id);
    if (!engine) return res.status(404).json({ error: 'Session not found' });
    res.json({ context: ctxSnapshot(engine) });
  }));

  // GET /api/game/:id/log
  router.get('/:id/log', asyncHandler(async (req: Request, res: Response) => {
    const engine = await sessionService.getEngine(req.params.id);
    if (!engine) return res.status(404).json({ error: 'Session not found' });
    res.json({ log: engine.getLog() });
  }));

  // GET /api/game/:id/shop-items
  router.get('/:id/shop-items', asyncHandler(async (req: Request, res: Response) => {
    const engine = await sessionService.getEngine(req.params.id);
    if (!engine) return res.status(404).json({ error: 'Session not found' });
    res.json({ items: engine.getShopItems() });
  }));

  // POST /api/game/:id/join
  router.post('/:id/join', asyncHandler(async (req: Request, res: Response) => {
    const engine = await sessionService.getEngine(req.params.id);
    if (!engine) return res.status(404).json({ error: 'Session not found' });
    const { name, loadoutKey, entryFee = 200 } = req.body;
    if (!name || !loadoutKey) {
      return res.status(400).json({ error: 'name and loadoutKey required' });
    }
    const loadout = LOADOUTS[loadoutKey as keyof typeof LOADOUTS];
    if (!loadout) {
      return res.status(400).json({ error: `Unknown loadout: ${loadoutKey}. Use MERCHANT, STREET_FIGHTER, or RUNNER` });
    }
    const playerId = uuidv4();
    const success = engine.joinLobby(playerId, name, loadout, entryFee);
    await sessionService.saveEngine(req.params.id, engine);
    res.json({ success, context: ctxSnapshot(engine) });
  }));

  // POST /api/game/:id/buy-stock
  router.post('/:id/buy-stock', asyncHandler(async (req: Request, res: Response) => {
    const engine = await sessionService.getEngine(req.params.id);
    if (!engine) return res.status(404).json({ error: 'Session not found' });
    const { stockId, quantity } = req.body;
    if (!stockId || quantity == null) {
      return res.status(400).json({ error: 'stockId and quantity required' });
    }
    const success = engine.buyStock(stockId, Number(quantity));
    await sessionService.saveEngine(req.params.id, engine);
    res.json({ success, context: ctxSnapshot(engine) });
  }));

  // POST /api/game/:id/sell-stock
  router.post('/:id/sell-stock', asyncHandler(async (req: Request, res: Response) => {
    const engine = await sessionService.getEngine(req.params.id);
    if (!engine) return res.status(404).json({ error: 'Session not found' });
    const { stockId, quantity } = req.body;
    if (!stockId || quantity == null) {
      return res.status(400).json({ error: 'stockId and quantity required' });
    }
    const success = engine.sellStock(stockId, Number(quantity));
    await sessionService.saveEngine(req.params.id, engine);
    res.json({ success, context: ctxSnapshot(engine) });
  }));

  // POST /api/game/:id/end-market
  router.post('/:id/end-market', asyncHandler(async (req: Request, res: Response) => {
    const engine = await sessionService.getEngine(req.params.id);
    if (!engine) return res.status(404).json({ error: 'Session not found' });
    engine.endMarketPhase();
    await sessionService.saveEngine(req.params.id, engine);
    res.json({ context: ctxSnapshot(engine) });
  }));

  // POST /api/game/:id/travel
  router.post('/:id/travel', asyncHandler(async (req: Request, res: Response) => {
    const engine = await sessionService.getEngine(req.params.id);
    if (!engine) return res.status(404).json({ error: 'Session not found' });
    const { destinationId } = req.body;
    if (!destinationId) {
      return res.status(400).json({ error: 'destinationId required' });
    }
    const success = engine.travel(destinationId);
    await sessionService.saveEngine(req.params.id, engine);
    res.json({ success, context: ctxSnapshot(engine) });
  }));

  // POST /api/game/:id/encounter
  router.post('/:id/encounter', asyncHandler(async (req: Request, res: Response) => {
    const engine = await sessionService.getEngine(req.params.id);
    if (!engine) return res.status(404).json({ error: 'Session not found' });
    const { choice } = req.body;
    if (!['pay', 'run', 'fight'].includes(choice)) {
      return res.status(400).json({ error: 'choice must be pay, run, or fight' });
    }
    engine.resolveEncounter(choice as EncounterChoice);
    await sessionService.saveEngine(req.params.id, engine);
    res.json({ context: ctxSnapshot(engine) });
  }));

  // POST /api/game/:id/buy-item
  router.post('/:id/buy-item', asyncHandler(async (req: Request, res: Response) => {
    const engine = await sessionService.getEngine(req.params.id);
    if (!engine) return res.status(404).json({ error: 'Session not found' });
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: 'itemId required' });
    const success = engine.buyItem(itemId);
    await sessionService.saveEngine(req.params.id, engine);
    res.json({ success, context: ctxSnapshot(engine) });
  }));

  // POST /api/game/:id/skip-shop
  router.post('/:id/skip-shop', asyncHandler(async (req: Request, res: Response) => {
    const engine = await sessionService.getEngine(req.params.id);
    if (!engine) return res.status(404).json({ error: 'Session not found' });
    engine.skipShop();
    await sessionService.saveEngine(req.params.id, engine);
    res.json({ context: ctxSnapshot(engine) });
  }));

  // POST /api/game/:id/market-update
  router.post('/:id/market-update', asyncHandler(async (req: Request, res: Response) => {
    const engine = await sessionService.getEngine(req.params.id);
    if (!engine) return res.status(404).json({ error: 'Session not found' });
    engine.applyMarketUpdate();
    await sessionService.saveEngine(req.params.id, engine);
    res.json({ context: ctxSnapshot(engine) });
  }));

  return router;
}
