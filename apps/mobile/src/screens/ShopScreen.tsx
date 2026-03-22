import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { GameContext, ShopItem } from '../api/types';
import { api } from '../api/client';

interface Props {
  ctx: GameContext;
  sessionId: string;
  onBuyItem: (itemId: string) => void;
  onSkip: () => void;
  loading: boolean;
}

export function ShopScreen({ ctx, sessionId, onBuyItem, onSkip, loading }: Props) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const player = ctx.player!;

  useEffect(() => {
    api.getShopItems(sessionId).then((r) => setItems(r.items)).catch(() => {});
  }, [sessionId]);

  const owned = (id: string) =>
    player.inventory.find((i) => i.itemId === id)?.quantity ?? 0;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>🛒 Black Market Shop</Text>
      <Text style={styles.cash}>💰 Your Cash: ${player.cash.toLocaleString()}</Text>

      <View style={styles.itemGrid}>
        {items.map((item) => {
          const canAfford = player.cash >= item.price;
          return (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>${item.price}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
              {owned(item.id) > 0 && (
                <Text style={styles.ownedText}>Owned: {owned(item.id)}</Text>
              )}
              <TouchableOpacity
                style={[styles.buyBtn, (!canAfford || loading) && styles.btnDisabled]}
                onPress={() => onBuyItem(item.id)}
                disabled={loading || !canAfford}
                activeOpacity={0.7}
              >
                <Text style={[styles.buyBtnText, (!canAfford || loading) && styles.buyBtnTextDisabled]}>
                  {loading ? '...' : 'Buy'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.skipBtn, loading && styles.btnDisabled]}
        onPress={onSkip}
        disabled={loading}
        activeOpacity={0.7}
      >
        <Text style={styles.skipBtnText}>Skip Shop →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0d0d1a' },
  container: { padding: 20, paddingBottom: 40 },
  title: { color: '#ffd700', fontSize: 22, marginBottom: 8, fontFamily: 'monospace' as const, fontWeight: 'bold' },
  cash: { color: '#ffd700', marginBottom: 24, fontSize: 15, fontFamily: 'monospace' as const },
  itemGrid: { flexDirection: 'column', gap: 16, marginBottom: 24 },
  itemCard: {
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 10,
    padding: 20,
    gap: 8,
  },
  itemName: { color: '#fff', fontWeight: 'bold', fontSize: 15, fontFamily: 'monospace' as const },
  itemPrice: { color: '#ffd700', fontWeight: 'bold', fontSize: 18, fontFamily: 'monospace' as const },
  itemDesc: { color: '#888', fontSize: 12, fontFamily: 'monospace' as const },
  ownedText: { color: '#00ff88', fontSize: 12, fontFamily: 'monospace' as const },
  buyBtn: {
    padding: 10,
    backgroundColor: '#ffd700',
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  buyBtnText: { color: '#000', fontWeight: 'bold', fontFamily: 'monospace' as const },
  buyBtnTextDisabled: { color: '#666' },
  btnDisabled: { backgroundColor: '#333' },
  skipBtn: {
    width: '100%',
    padding: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
  },
  skipBtnText: { color: '#aaa', fontSize: 14, fontFamily: 'monospace' as const },
});
