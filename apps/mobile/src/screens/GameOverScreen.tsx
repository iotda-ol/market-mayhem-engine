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
  log: string[];
  onRestart: () => void;
}

export function GameOverScreen({ ctx, log, onRestart }: Props) {
  const player = ctx.player;
  const isWin = ctx.isGameWon;
  const targetCash = ctx.targetCash ?? 5000;

  let portfolioValue = player?.cash ?? 0;
  if (player && ctx.currentMarket) {
    for (const inv of player.inventory) {
      const stock = ctx.currentMarket.stocks.find((s) => s.id === inv.itemId);
      if (stock && inv.quantity > 0) {
        portfolioValue += stock.price * inv.quantity;
      }
    }
  }

  const endColor = isWin ? '#ffd700' : '#ff4444';
  const subColor = isWin ? '#00ff88' : '#ff6b6b';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.icon}>{isWin ? '🏆' : '💀'}</Text>
      <Text style={[styles.title, { color: endColor }]}>
        {isWin ? 'VICTORY!' : 'GAME OVER'}
      </Text>
      <Text style={[styles.subtitle, { color: subColor }]}>
        {isWin
          ? `You reached the $${targetCash.toLocaleString()} target!`
          : player?.health === 0
          ? 'You were eliminated in the streets.'
          : `You ran out of time. Goal was $${targetCash.toLocaleString()}.`}
      </Text>

      {player && (
        <View style={styles.stats}>
          <Text style={styles.stat}>👤 {player.name} ({player.loadout})</Text>
          <Text style={styles.stat}>
            🏁 Survived {ctx.turnNumber} / {ctx.maxTurns ?? 15} turns
          </Text>
          <Text style={styles.stat}>💰 Final cash: ${player.cash.toLocaleString()}</Text>
          {portfolioValue !== player.cash && (
            <Text style={styles.stat}>
              📦 Net worth (incl. stocks): ${portfolioValue.toLocaleString()}
            </Text>
          )}
          <Text
            style={[
              styles.stat,
              { color: portfolioValue >= targetCash ? '#00ff88' : '#ff6b6b' },
            ]}
          >
            🎯 Goal: ${targetCash.toLocaleString()} —{' '}
            {portfolioValue >= targetCash
              ? '✓ ACHIEVED'
              : `${Math.round((portfolioValue / targetCash) * 100)}% reached`}
          </Text>
          <Text style={styles.stat}>
            📍 Last location: {ctx.currentMarket?.locationName ?? player.location}
          </Text>
        </View>
      )}

      <View style={styles.logBox}>
        <Text style={styles.logTitle}>Recent Events</Text>
        {log
          .slice(-15)
          .reverse()
          .map((entry, i) => (
            <Text key={i} style={styles.logEntry}>
              {entry}
            </Text>
          ))}
      </View>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: isWin ? '#ffd700' : '#4a4aff' }]}
        onPress={onRestart}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnText, { color: isWin ? '#000' : '#fff' }]}>
          🔄 Play Again
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0d0d1a' },
  container: { padding: 20, paddingBottom: 40, alignItems: 'center' },
  icon: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 32, letterSpacing: 6, marginBottom: 8, fontFamily: 'monospace' as const, fontWeight: 'bold' },
  subtitle: { fontSize: 15, marginBottom: 24, textAlign: 'center', fontFamily: 'monospace' as const },
  stats: {
    width: '100%',
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    gap: 10,
  },
  stat: { color: '#ccc', fontSize: 14, fontFamily: 'monospace' as const },
  logBox: {
    width: '100%',
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    maxHeight: 220,
  },
  logTitle: {
    color: '#555',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    fontFamily: 'monospace' as const,
  },
  logEntry: { color: '#666', fontSize: 11, fontFamily: 'monospace' as const, marginBottom: 4 },
  btn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { fontSize: 15, fontWeight: 'bold', fontFamily: 'monospace' as const },
});
