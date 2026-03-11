import Redis from 'ioredis';
import { GameEngine, LOADOUTS } from 'market-mayhem-engine';
import {
  serializeGameEngine,
  deserializeGameEngine,
  SerializedGameState,
} from 'market-mayhem-engine';

const SESSION_TTL = 60 * 60 * 24; // 24 hours in seconds

export class GameSessionService {
  private redis: Redis;
  // In-memory cache for hot sessions
  private sessions: Map<string, GameEngine> = new Map();

  constructor(redis: Redis) {
    this.redis = redis;
  }

  private key(sessionId: string): string {
    return `game:session:${sessionId}`;
  }

  async getEngine(sessionId: string): Promise<GameEngine | null> {
    // Check in-memory first
    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }
    // Load from Redis (best-effort)
    try {
      const raw = await this.redis.get(this.key(sessionId));
      if (!raw) return null;
      const data: SerializedGameState = JSON.parse(raw);
      const engine = deserializeGameEngine(data);
      this.sessions.set(sessionId, engine);
      return engine;
    } catch {
      return null;
    }
  }

  async saveEngine(sessionId: string, engine: GameEngine): Promise<void> {
    this.sessions.set(sessionId, engine);
    try {
      const data = serializeGameEngine(engine);
      await this.redis.set(
        this.key(sessionId),
        JSON.stringify(data),
        'EX',
        SESSION_TTL
      );
    } catch {
      // Redis unavailable — in-memory cache only for this session
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    try {
      await this.redis.del(this.key(sessionId));
    } catch {
      // Redis unavailable — session already removed from memory
    }
  }

  createEngine(shopTurnInterval = 5): GameEngine {
    return new GameEngine(shopTurnInterval);
  }
}

export { LOADOUTS };
