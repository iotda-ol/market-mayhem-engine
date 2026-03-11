import { useState, useEffect, useRef } from 'react';
import { api } from './api';
import type { GameContext, EncounterChoice, LoadoutKey } from './api';
import {
  LobbyScreen,
  MarketScreen,
  TravelScreen,
  EncounterScreen,
  ShopScreen,
  MarketUpdateScreen,
  GameOverScreen,
} from './screens';

const SESSION_KEY = 'market_mayhem_session';

export function App() {
  const [sessionId, setSessionId] = useState<string | null>(
    () => localStorage.getItem(SESSION_KEY)
  );
  const [ctx, setCtx] = useState<GameContext | null>(null);
  const [initialLoading, setInitialLoading] = useState(
    () => !!localStorage.getItem(SESSION_KEY)
  );
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Keep a stable ref to sessionId so callbacks always see the latest value
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const updateCtx = (newCtx: GameContext, sid: string) => {
    setCtx(newCtx);
    if (newCtx.phase === 'game_over') {
      api.getLog(sid).then(r => setLog(r.log)).catch(() => {});
    }
  };

  // Load existing session on mount
  useEffect(() => {
    const storedId = localStorage.getItem(SESSION_KEY);
    if (!storedId) return;
    api.getState(storedId)
      .then(r => {
        setSessionId(storedId);
        updateCtx(r.context, storedId);
      })
      .catch(() => {
        localStorage.removeItem(SESSION_KEY);
        setSessionId(null);
      })
      .finally(() => setInitialLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const withLoading = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (name: string, loadoutKey: LoadoutKey) => {
    // Always start a fresh session when joining from lobby
    const created = await withLoading(() => api.createSession());
    if (!created) return;
    const sid = created.sessionId;
    localStorage.setItem(SESSION_KEY, sid);
    setSessionId(sid);
    const res = await withLoading(() => api.join(sid, name, loadoutKey, 200));
    if (!res) return;
    if (!res.success) {
      setError('Failed to join game. Please try again.');
      return;
    }
    updateCtx(res.context, sid);
  };

  const handleRestart = async () => {
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    setCtx(null);
    setLog([]);
    // New session starts in lobby — show the lobby screen immediately
  };

  if (initialLoading) {
    return (
      <div style={{ ...pageStyles, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#00ff88', fontFamily: 'monospace', fontSize: 18 }}>Loading session...</div>
      </div>
    );
  }

  if (!ctx || ctx.phase === 'lobby') {
    return (
      <div style={pageStyles}>
        <LobbyScreen onJoin={handleJoin} loading={loading} />
        {error && <ErrorBar message={error} onDismiss={() => setError(null)} />}
      </div>
    );
  }

  // Use ref so callbacks always use the latest sessionId without stale closures
  const sid = sessionIdRef.current!;

  return (
    <div style={pageStyles}>
      {error && <ErrorBar message={error} onDismiss={() => setError(null)} />}

      {ctx.phase === 'market' && (
        <MarketScreen
          ctx={ctx}
          onBuy={async (stockId, qty) => {
            const res = await withLoading(() => api.buyStock(sid, stockId, qty));
            if (res) updateCtx(res.context, sid);
          }}
          onSell={async (stockId, qty) => {
            const res = await withLoading(() => api.sellStock(sid, stockId, qty));
            if (res) updateCtx(res.context, sid);
          }}
          onEndMarket={async () => {
            const res = await withLoading(() => api.endMarket(sid));
            if (res) updateCtx(res.context, sid);
          }}
          loading={loading}
        />
      )}

      {ctx.phase === 'travel' && (
        <TravelScreen
          ctx={ctx}
          onTravel={async (dest) => {
            const res = await withLoading(() => api.travel(sid, dest));
            if (res) updateCtx(res.context, sid);
          }}
          loading={loading}
        />
      )}

      {ctx.phase === 'encounter' && (
        <EncounterScreen
          ctx={ctx}
          onResolve={async (choice: EncounterChoice) => {
            const res = await withLoading(() => api.resolveEncounter(sid, choice));
            if (res) updateCtx(res.context, sid);
          }}
          loading={loading}
        />
      )}

      {ctx.phase === 'shop' && (
        <ShopScreen
          ctx={ctx}
          sessionId={sid}
          onBuyItem={async (itemId) => {
            const res = await withLoading(() => api.buyItem(sid, itemId));
            if (res) updateCtx(res.context, sid);
          }}
          onSkip={async () => {
            const res = await withLoading(() => api.skipShop(sid));
            if (res) updateCtx(res.context, sid);
          }}
          loading={loading}
        />
      )}

      {ctx.phase === 'market_update' && (
        <MarketUpdateScreen
          ctx={ctx}
          onContinue={async () => {
            const res = await withLoading(() => api.marketUpdate(sid));
            if (res) updateCtx(res.context, sid);
          }}
          loading={loading}
        />
      )}

      {ctx.phase === 'game_over' && (
        <GameOverScreen ctx={ctx} log={log} onRestart={handleRestart} />
      )}
    </div>
  );
}

function ErrorBar({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#ff4444', color: '#fff', padding: '10px 20px', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', zIndex: 1000 }}>
      <span>⚠️ {message}</span>
      {onDismiss && <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}>×</button>}
    </div>
  );
}

const pageStyles: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0d0d1a',
  color: '#fff',
  padding: '20px',
};
