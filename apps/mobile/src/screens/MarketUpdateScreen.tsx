import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { GameContext } from '../api/types';

interface Props {
  ctx: GameContext;
  onContinue: () => void;
  loading: boolean;
}

export function MarketUpdateScreen({ ctx, onContinue, loading }: Props) {
  const market = ctx.currentMarket;
  const nextTurn = ctx.turnNumber + 1;
  const maxTurns = ctx.maxTurns ?? 15;
  const isLastTurn = nextTurn >= maxTurns;

  const notableStocks =
    market?.stocks.filter(
      (s) => s.newsEvent || Math.abs(s.changePercent ?? 0) >= 10
    ) ?? [];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.icon}>📊</Text>
      <Text style={styles.title}>Market Update</Text>
      <Text style={styles.desc}>Prices are fluctuating across all locations...</Text>
      <Text style={[styles.turn, isLastTurn && styles.lastTurn]}>
        {isLastTurn
          ? `⚠️ Starting FINAL Turn ${nextTurn} / ${maxTurns}`
          : `Starting Turn ${nextTurn} / ${maxTurns}`}
      </Text>

      {notableStocks.length > 0 && (
        <View style={styles.changesBox}>
          <Text style={styles.changesTitle}>Price Movements</Text>
          {notableStocks.map((stock) => {
            const change = stock.changePercent ?? 0;
            const color = change > 0 ? '#00ff88' : change < 0 ? '#ff6b6b' : '#888';
            const arrow = change > 0 ? '▲' : change < 0 ? '▼' : '–';
            return (
              <View key={stock.id} style={styles.changeRow}>
                <Text style={styles.changeName}>{stock.name}</Text>
                {stock.newsEvent ? <Text style={styles.newsTag}>📰</Text> : null}
                <Text style={[styles.changeVal, { color }]}>
                  {arrow} {Math.abs(change)}%
                </Text>
                <Text style={styles.changePrice}>${stock.price.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>
      )}

      {isLastTurn && (
        <View style={styles.finalWarning}>
          <Text style={styles.finalWarningText}>
            💡 This is your last turn — sell your stocks to maximize your net worth!
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={onContinue}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>
          {loading ? 'Updating...' : '→ Apply Market Update'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0d0d1a' },
  container: { padding: 20, paddingBottom: 40, alignItems: 'center' },
  icon: { fontSize: 56, marginBottom: 12 },
  title: { color: '#fff', fontSize: 24, marginBottom: 10, fontFamily: 'monospace' as const, fontWeight: 'bold' },
  desc: { color: '#888', marginBottom: 8, fontFamily: 'monospace' as const, textAlign: 'center' },
  turn: { color: '#00ff88', fontSize: 18, fontWeight: 'bold', marginBottom: 20, fontFamily: 'monospace' as const, textAlign: 'center' },
  lastTurn: { color: '#ff9900' },
  changesBox: {
    width: '100%',
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  changesTitle: {
    color: '#555',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    fontFamily: 'monospace' as const,
  },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  changeName: { color: '#ccc', fontSize: 12, flex: 1, fontFamily: 'monospace' as const },
  newsTag: { fontSize: 12 },
  changeVal: { fontSize: 12, fontWeight: 'bold', minWidth: 50, textAlign: 'right', fontFamily: 'monospace' as const },
  changePrice: { color: '#ffd700', fontSize: 12, minWidth: 70, textAlign: 'right', fontFamily: 'monospace' as const },
  finalWarning: {
    width: '100%',
    backgroundColor: '#1a0d00',
    borderWidth: 1,
    borderColor: '#553300',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  finalWarningText: { color: '#ff9900', fontSize: 13, fontFamily: 'monospace' as const, textAlign: 'center' },
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    backgroundColor: '#00ff88',
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  btnDisabled: { backgroundColor: '#333' },
  btnText: { color: '#000', fontSize: 15, fontWeight: 'bold', fontFamily: 'monospace' as const },
});
