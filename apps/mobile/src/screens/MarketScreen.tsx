import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { GameContext } from '../api/types';

interface Props {
  ctx: GameContext;
  onBuy: (stockId: string, qty: number) => void;
  onSell: (stockId: string, qty: number) => void;
  onEndMarket: () => void;
  loading: boolean;
}

export function MarketScreen({ ctx, onBuy, onSell, onEndMarket, loading }: Props) {
  const [qty, setQty] = useState<Record<string, string>>({});
  const player = ctx.player!;
  const market = ctx.currentMarket!;

  const getQty = (id: string) => Math.max(1, Number(qty[id] ?? '1'));

  const portfolioValue = market.stocks.reduce((total, stock) => {
    const owned = player.inventory.find((i) => i.itemId === stock.id)?.quantity ?? 0;
    return total + owned * stock.price;
  }, player.cash);

  const ownedStocks = player.inventory.filter((i) =>
    market.stocks.some((s) => s.id === i.itemId)
  );

  const newsEvents = market.stocks.filter((s) => s.newsEvent);

  const turnsLeft = (ctx.maxTurns ?? 15) - ctx.turnNumber;
  const isLastTurn = turnsLeft <= 1;
  const progress = ctx.turnNumber / (ctx.maxTurns ?? 15);
  const targetCash = ctx.targetCash ?? 5000;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.location}>📍 {market.locationName}</Text>
          <Text style={styles.turn}>
            Turn {ctx.turnNumber} / {ctx.maxTurns ?? 15}
            {isLastTurn && <Text style={styles.lastTurnBadge}> ⚠️ LAST TURN</Text>}
          </Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.cash}>💰 ${player.cash.toLocaleString()}</Text>
          <Text style={styles.health}>❤️ {player.health} HP</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressLabel}>Goal: ${targetCash.toLocaleString()}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(100, progress * 100)}%` },
            ]}
          />
        </View>
        <View style={styles.progressRow}>
          <Text
            style={[
              styles.progressLabel,
              { color: portfolioValue >= targetCash ? '#00ff88' : '#ffd700' },
            ]}
          >
            Net Worth: ${portfolioValue.toLocaleString()}
            {portfolioValue >= targetCash ? ' ✓ TARGET!' : ''}
          </Text>
          <Text style={styles.progressLabel}>
            {turnsLeft} turn{turnsLeft !== 1 ? 's' : ''} left
          </Text>
        </View>
      </View>

      {/* News Events */}
      {newsEvents.length > 0 && (
        <View style={styles.newsSection}>
          <Text style={styles.newsTitle}>📰 BREAKING NEWS</Text>
          {newsEvents.map((s) => (
            <Text
              key={s.id}
              style={[
                styles.newsItem,
                { color: (s.changePercent ?? 0) >= 0 ? '#00ff88' : '#ff6b6b' },
              ]}
            >
              {s.newsEvent}
            </Text>
          ))}
        </View>
      )}

      {/* Portfolio Summary */}
      {ownedStocks.length > 0 && (
        <View style={styles.portfolio}>
          <Text style={styles.sectionTitle}>Your Portfolio</Text>
          <View style={styles.portfolioItems}>
            {ownedStocks.map((i) => {
              const stock = market.stocks.find((s) => s.id === i.itemId);
              const value = stock ? stock.price * i.quantity : 0;
              return (
                <View key={i.itemId} style={styles.portfolioItem}>
                  <Text style={styles.portfolioItemText}>
                    {i.itemId}: {i.quantity}{' '}
                    <Text style={{ color: '#ffd700' }}>(${value.toLocaleString()})</Text>
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Stocks */}
      <Text style={styles.sectionTitle}>📊 Stocks at {market.locationName}</Text>
      {market.stocks.map((stock) => {
        const owned = player.inventory.find((i) => i.itemId === stock.id)?.quantity ?? 0;
        const change = stock.changePercent ?? 0;
        const changeColor = change > 0 ? '#00ff88' : change < 0 ? '#ff6b6b' : '#888';
        const changeArrow = change > 0 ? '▲' : change < 0 ? '▼' : '–';
        const hasNews = !!stock.newsEvent;
        const stockQty = getQty(stock.id);
        const canBuy = player.cash >= stock.price * stockQty;
        const canSell = owned >= stockQty;

        return (
          <View key={stock.id} style={[styles.stockRow, hasNews && styles.stockRowNews]}>
            <View style={styles.stockHeader}>
              <View style={styles.stockNameRow}>
                <Text style={styles.stockName}>{stock.name}</Text>
                <Text style={styles.stockId}>({stock.id})</Text>
                {hasNews && (
                  <View style={styles.newsBadge}>
                    <Text style={styles.newsBadgeText}>NEWS</Text>
                  </View>
                )}
              </View>
              <View style={styles.priceBlock}>
                <Text style={styles.stockPrice}>${stock.price.toLocaleString()}</Text>
                <Text style={[styles.changePercent, { color: changeColor }]}>
                  {changeArrow} {Math.abs(change)}%
                </Text>
              </View>
            </View>
            <View style={styles.stockMeta}>
              <Text style={styles.volatility}>±{Math.round(stock.volatility * 100)}% vol</Text>
              {owned > 0 && <Text style={styles.ownedBadge}>Held: {owned}</Text>}
            </View>
            <View style={styles.actions}>
              <TextInput
                style={styles.qtyInput}
                value={qty[stock.id] ?? '1'}
                onChangeText={(v) => setQty({ ...qty, [stock.id]: v })}
                keyboardType="number-pad"
                selectTextOnFocus
              />
              <TouchableOpacity
                style={[styles.buyBtn, !canBuy && styles.btnDisabled]}
                onPress={() => onBuy(stock.id, stockQty)}
                disabled={loading || !canBuy}
                activeOpacity={0.7}
              >
                <Text style={styles.buyBtnText}>Buy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sellBtn, !canSell && styles.btnDisabled]}
                onPress={() => onSell(stock.id, stockQty)}
                disabled={loading || !canSell}
                activeOpacity={0.7}
              >
                <Text style={styles.sellBtnText}>Sell</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <TouchableOpacity
        style={[styles.travelBtn, loading && styles.btnDisabled]}
        onPress={onEndMarket}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.travelBtnText}>
          {loading ? 'Processing...' : '🚗 Travel to Next Location →'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0d0d1a' },
  container: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  location: { color: '#00ff88', fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace' as const },
  turn: { color: '#666', fontSize: 12, marginTop: 4, fontFamily: 'monospace' as const },
  lastTurnBadge: { color: '#ff9900', fontWeight: 'bold' },
  stats: { alignItems: 'flex-end', gap: 4 },
  cash: { color: '#ffd700', fontSize: 15, fontWeight: 'bold', fontFamily: 'monospace' as const },
  health: { color: '#ff6b6b', fontSize: 15, fontWeight: 'bold', fontFamily: 'monospace' as const },
  progressSection: {
    backgroundColor: '#0a0a1a',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { color: '#888', fontSize: 11, fontFamily: 'monospace' as const },
  progressTrack: {
    height: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 4,
  },
  newsSection: {
    backgroundColor: '#1a1200',
    borderWidth: 1,
    borderColor: '#443300',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  newsTitle: {
    color: '#ffd700',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
    fontWeight: 'bold',
    fontFamily: 'monospace' as const,
  },
  newsItem: { fontSize: 12, marginBottom: 4, fontWeight: 'bold', fontFamily: 'monospace' as const },
  portfolio: {
    backgroundColor: '#0d2010',
    borderWidth: 1,
    borderColor: '#1a4a20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  portfolioItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  portfolioItem: {
    backgroundColor: '#1a3a20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  portfolioItemText: { color: '#00ff88', fontSize: 12, fontFamily: 'monospace' as const },
  sectionTitle: {
    color: '#aaa',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    fontFamily: 'monospace' as const,
  },
  stockRow: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a4e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  stockRowNews: { borderColor: '#554400', backgroundColor: '#1a1600' },
  stockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  stockNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' },
  stockName: { color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' as const },
  stockId: { color: '#666', fontSize: 11, fontFamily: 'monospace' as const },
  newsBadge: { backgroundColor: '#ffd700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  newsBadgeText: { color: '#000', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  priceBlock: { alignItems: 'flex-end' },
  stockPrice: { color: '#ffd700', fontWeight: 'bold', fontSize: 15, fontFamily: 'monospace' as const },
  changePercent: { fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' as const },
  stockMeta: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  volatility: { color: '#888', fontSize: 11, fontFamily: 'monospace' as const },
  ownedBadge: {
    color: '#00ff88',
    fontSize: 11,
    backgroundColor: '#0d2010',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontFamily: 'monospace' as const,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyInput: {
    width: 56,
    padding: 8,
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 6,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'monospace' as const,
    fontSize: 14,
  },
  buyBtn: {
    flex: 1,
    padding: 8,
    backgroundColor: '#00ff88',
    borderRadius: 6,
    alignItems: 'center',
  },
  buyBtnText: { color: '#000', fontWeight: 'bold', fontFamily: 'monospace' as const, fontSize: 13 },
  sellBtn: {
    flex: 1,
    padding: 8,
    backgroundColor: '#ff6b6b',
    borderRadius: 6,
    alignItems: 'center',
  },
  sellBtnText: { color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' as const, fontSize: 13 },
  btnDisabled: { backgroundColor: '#333' },
  travelBtn: {
    width: '100%',
    padding: 16,
    backgroundColor: '#4a4aff',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  travelBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold', fontFamily: 'monospace' as const },
});
