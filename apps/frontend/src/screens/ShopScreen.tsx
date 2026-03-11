import { useEffect, useState } from 'react';
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
    api.getShopItems(sessionId).then(r => setItems(r.items));
  }, [sessionId]);

  const owned = (id: string) =>
    player.inventory.find(i => i.itemId === id)?.quantity ?? 0;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛒 Black Market Shop</h2>
      <div style={styles.cash}>💰 Your Cash: ${player.cash.toLocaleString()}</div>

      <div style={styles.itemGrid}>
        {items.map(item => (
          <div key={item.id} style={styles.itemCard}>
            <div style={styles.itemName}>{item.name}</div>
            <div style={styles.itemPrice}>${item.price}</div>
            <div style={styles.itemDesc}>{item.description}</div>
            {owned(item.id) > 0 && (
              <div style={styles.owned}>Owned: {owned(item.id)}</div>
            )}
            <button
              style={{
                ...styles.buyBtn,
                ...(player.cash < item.price ? styles.btnDisabled : {}),
              }}
              onClick={() => onBuyItem(item.id)}
              disabled={loading || player.cash < item.price}
            >
              {loading ? '...' : 'Buy'}
            </button>
          </div>
        ))}
      </div>

      <button style={styles.skipBtn} onClick={onSkip} disabled={loading}>
        Skip Shop →
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 700, margin: '0 auto', padding: '40px 20px', fontFamily: 'monospace' },
  title: { color: '#ffd700', fontSize: 24, marginBottom: 8 },
  cash: { color: '#ffd700', marginBottom: 28, fontSize: 16 },
  itemGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 },
  itemCard: { background: '#1a1a2e', border: '2px solid #333', borderRadius: 10, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 8 },
  itemName: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  itemPrice: { color: '#ffd700', fontWeight: 'bold', fontSize: 18 },
  itemDesc: { color: '#888', fontSize: 12, flex: 1 },
  owned: { color: '#00ff88', fontSize: 12 },
  buyBtn: { padding: '8px 0', background: '#ffd700', color: '#000', border: 'none', borderRadius: 6, fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer' },
  btnDisabled: { background: '#333', color: '#666', cursor: 'not-allowed' },
  skipBtn: { width: '100%', padding: 14, background: '#333', color: '#aaa', border: 'none', borderRadius: 8, fontFamily: 'monospace', fontSize: 14, cursor: 'pointer' },
};
