import { useState } from 'react';
import type { GameContext } from '../api/types';

interface Props {
  ctx: GameContext;
  onBuy: (stockId: string, qty: number) => void;
  onSell: (stockId: string, qty: number) => void;
  onEndMarket: () => void;
  loading: boolean;
}

export function MarketScreen({ ctx, onBuy, onSell, onEndMarket, loading }: Props) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const player = ctx.player!;
  const market = ctx.currentMarket!;

  const getQty = (id: string) => qty[id] ?? 1;

  const ownedStocks = player.inventory.filter(i =>
    market.stocks.some(s => s.id === i.itemId)
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <div style={styles.location}>📍 {market.locationName}</div>
          <div style={styles.turn}>Turn {ctx.turnNumber}</div>
        </div>
        <div style={styles.stats}>
          <span style={styles.cash}>💰 ${player.cash.toLocaleString()}</span>
          <span style={styles.health}>❤️ {player.health} HP</span>
        </div>
      </div>

      {ownedStocks.length > 0 && (
        <div style={styles.portfolio}>
          <div style={styles.sectionTitle}>Your Portfolio</div>
          <div style={styles.portfolioItems}>
            {ownedStocks.map(i => (
              <span key={i.itemId} style={styles.portfolioItem}>
                {i.itemId}: {i.quantity}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={styles.sectionTitle}>📊 Stocks at {market.locationName}</div>
      <div style={styles.stockList}>
        {market.stocks.map((stock) => {
          const owned = player.inventory.find(i => i.itemId === stock.id)?.quantity ?? 0;
          return (
            <div key={stock.id} style={styles.stockRow}>
              <div style={styles.stockInfo}>
                <span style={styles.stockName}>{stock.name}</span>
                <span style={styles.stockId}>({stock.id})</span>
                <span style={styles.stockPrice}>${stock.price}</span>
                <span style={styles.volatility}>±{Math.round(stock.volatility * 100)}%</span>
                {owned > 0 && <span style={styles.owned}>Owned: {owned}</span>}
              </div>
              <div style={styles.actions}>
                <input
                  type="number"
                  min={1}
                  style={styles.qtyInput}
                  value={getQty(stock.id)}
                  onChange={e => setQty({ ...qty, [stock.id]: Math.max(1, Number(e.target.value)) })}
                />
                <button
                  style={styles.buyBtn}
                  onClick={() => onBuy(stock.id, getQty(stock.id))}
                  disabled={loading || player.cash < stock.price * getQty(stock.id)}
                >
                  Buy
                </button>
                <button
                  style={{
                    ...styles.sellBtn,
                    ...(owned < getQty(stock.id) ? styles.btnDisabled : {})
                  }}
                  onClick={() => onSell(stock.id, getQty(stock.id))}
                  disabled={loading || owned < getQty(stock.id)}
                >
                  Sell
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button style={styles.travelBtn} onClick={onEndMarket} disabled={loading}>
        {loading ? 'Processing...' : '🚗 Travel to Next Location →'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 800, margin: '0 auto', padding: '24px 20px', fontFamily: 'monospace' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: '#1a1a2e', padding: '16px 20px', borderRadius: 8, border: '1px solid #333' },
  location: { color: '#00ff88', fontSize: 18, fontWeight: 'bold' },
  turn: { color: '#666', fontSize: 13, marginTop: 4 },
  stats: { display: 'flex', gap: 20 },
  cash: { color: '#ffd700', fontSize: 16, fontWeight: 'bold' },
  health: { color: '#ff6b6b', fontSize: 16, fontWeight: 'bold' },
  portfolio: { background: '#0d2010', border: '1px solid #1a4a20', borderRadius: 8, padding: '12px 16px', marginBottom: 20 },
  portfolioItems: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 },
  portfolioItem: { background: '#1a3a20', color: '#00ff88', padding: '4px 10px', borderRadius: 4, fontSize: 13 },
  sectionTitle: { color: '#aaa', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  stockList: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  stockRow: { background: '#1a1a2e', border: '1px solid #2a2a4e', borderRadius: 8, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  stockInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  stockName: { color: '#fff', fontWeight: 'bold' },
  stockId: { color: '#666', fontSize: 12 },
  stockPrice: { color: '#ffd700', fontWeight: 'bold', fontSize: 16 },
  volatility: { color: '#888', fontSize: 12 },
  owned: { color: '#00ff88', fontSize: 12, background: '#0d2010', padding: '2px 8px', borderRadius: 4 },
  actions: { display: 'flex', alignItems: 'center', gap: 8 },
  qtyInput: { width: 60, padding: '6px 8px', background: '#0d0d1a', border: '1px solid #444', borderRadius: 6, color: '#fff', textAlign: 'center', fontFamily: 'monospace' },
  buyBtn: { padding: '6px 16px', background: '#00ff88', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' },
  sellBtn: { padding: '6px 16px', background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' },
  btnDisabled: { background: '#333', color: '#666', cursor: 'not-allowed' },
  travelBtn: { width: '100%', padding: 14, background: '#4a4aff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace' },
};
