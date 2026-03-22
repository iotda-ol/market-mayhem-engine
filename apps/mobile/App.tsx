import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './src/api/client';
import type { GameContext, EncounterChoice, LoadoutKey } from './src/api/types';
import {
  LobbyScreen,
  MarketScreen,
  TravelScreen,
  EncounterScreen,
  ShopScreen,
  MarketUpdateScreen,
  GameOverScreen,
} from './src/screens';

const SESSION_KEY = 'market_mayhem_session';

export default function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ctx, setCtx] = useState<GameContext | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const updateCtx = (newCtx: GameContext, sid: string) => {
    setCtx(newCtx);
    if (newCtx.phase === 'game_over' || newCtx.phase === 'game_won') {
      api.getLog(sid).then((r) => setLog(r.log)).catch(() => {});
    }
  };

  // Restore session from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((storedId) => {
        if (!storedId) {
          setInitialLoading(false);
          return;
        }
        return api
          .getState(storedId)
          .then((r) => {
            setSessionId(storedId);
            setCtx(r.context);
            if (r.context.phase === 'game_over' || r.context.phase === 'game_won') {
              api.getLog(storedId).then((lr) => setLog(lr.log)).catch(() => {});
            }
          })
          .catch(() => {
            return AsyncStorage.removeItem(SESSION_KEY);
          });
      })
      .finally(() => setInitialLoading(false));
  }, []);

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
    const created = await withLoading(() => api.createSession());
    if (!created) return;
    const sid = created.sessionId;
    await AsyncStorage.setItem(SESSION_KEY, sid);
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
    await AsyncStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    setCtx(null);
    setLog([]);
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff88" />
          <Text style={styles.loadingText}>Loading session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sid = sessionIdRef.current;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d1a" />

      {error && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.errorDismiss}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {(!ctx || ctx.phase === 'lobby') && (
        <LobbyScreen onJoin={handleJoin} loading={loading} />
      )}

      {ctx?.phase === 'market' && sid && (
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

      {ctx?.phase === 'travel' && sid && (
        <TravelScreen
          ctx={ctx}
          onTravel={async (dest) => {
            const res = await withLoading(() => api.travel(sid, dest));
            if (res) updateCtx(res.context, sid);
          }}
          loading={loading}
        />
      )}

      {ctx?.phase === 'encounter' && sid && (
        <EncounterScreen
          ctx={ctx}
          onResolve={async (choice: EncounterChoice) => {
            const res = await withLoading(() => api.resolveEncounter(sid, choice));
            if (res) updateCtx(res.context, sid);
          }}
          loading={loading}
        />
      )}

      {ctx?.phase === 'shop' && sid && (
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

      {ctx?.phase === 'market_update' && sid && (
        <MarketUpdateScreen
          ctx={ctx}
          onContinue={async () => {
            const res = await withLoading(() => api.marketUpdate(sid));
            if (res) updateCtx(res.context, sid);
          }}
          loading={loading}
        />
      )}

      {(ctx?.phase === 'game_over' || ctx?.phase === 'game_won') && (
        <GameOverScreen ctx={ctx} log={log} onRestart={handleRestart} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0d0d1a' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: '#00ff88', fontFamily: 'monospace' as const, fontSize: 16 },
  errorBar: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
  },
  errorText: { color: '#fff', fontFamily: 'monospace' as const, flex: 1 },
  errorDismiss: { color: '#fff', fontSize: 18, paddingLeft: 12 },
});
