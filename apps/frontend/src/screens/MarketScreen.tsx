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

  // Calculate portfolio value: cash + all owned stocks at current market prices
  const portfolioValue = market.stocks.reduce((total, stock) => {
    const owned = player.inventory.find(i => i.itemId === stock.id)?.quantity ?? 0;
    return total + owned * stock.price;
  }, player.cash);

  const ownedStocks = player.inventory.filter(i =>
    market.stocks.some(s => s.id === i.itemId)
  );

  const newsEvents = market.stocks.filter(s => s.newsEvent);

  const turnsLeft = (ctx.maxTurns ?? 15) - ctx.turnNumber;
  const isLastTurn = turnsLeft <= 1;
  const progress = ctx.turnNumber / (ctx.maxTurns ?? 15);
  const targetCash = ctx.targetCash ?? 5000;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.location}>📍 {market.locationName}</div>
          <div style={styles.turn}>
            Turn {ctx.turnNumber} / {ctx.maxTurns ?? 15}
            {isLastTurn && <span style={styles.lastTurnBadge}> ⚠️ LAST TURN</span>}
          </div>
        </div>
        <div style={styles.stats}>
          <span style={styles.cash}>💰 ${player.cash.toLocaleString()}</span>
          <span style={styles.health}>❤️ {player.health} HP</span>
        </div>
      </div>

      {/* Turn Progress Bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressRow}>
          <span style={styles.progressLabel}>Progress</span>
          <span style={styles.progressLabel}>Goal: ${targetCash.toLocaleString()}</span>
        </div>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${Math.min(100, progress * 100)}%` }} />
        </div>
        <div style={styles.progressRow}>
          <span style={{ ...styles.progressLabel, color: portfolioValue >= targetCash ? '#00ff88' : '#ffd700' }}>
            Net Worth: ${portfolioValue.toLocaleString()}
            {portfolioValue >= targetCash && ' ✓ TARGET!'}
          </span>
          <span style={styles.progressLabel}>{turnsLeft} turn{turnsLeft !== 1 ? 's' : ''} left</span>
        </div>
      </div>

      {/* News Events Banner */}
      {newsEvents.length > 0 && (
        <div style={styles.newsSection}>
          <div style={styles.newsTitle}>📰 BREAKING NEWS</div>
          {newsEvents.map(s => (
            <div key={s.id} style={{
              ...styles.newsItem,
              color: (s.changePercent ?? 0) >= 0 ? '#00ff88' : '#ff6b6b',
            }}>
              {s.newsEvent}
            </div>
          ))}
        </div>
      )}

      {/* Portfolio Summary */}
      {ownedStocks.length > 0 && (
        <div style={styles.portfolio}>
          <div style={styles.sectionTitle}>Your Portfolio</div>
          <div style={styles.portfolioItems}>
            {ownedStocks.map(i => {
              const stock = market.stocks.find(s => s.id === i.itemId);
              const value = stock ? stock.price * i.quantity : 0;
              return (
                <span key={i.itemId} style={styles.portfolioItem}>
                  {i.itemId}: {i.quantity} <span style={{ color: '#ffd700' }}>(${value.toLocaleString()})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Stocks List */}
      <div style={styles.sectionTitle}>📊 Stocks at {market.locationName}</div>
      <div style={styles.stockList}>
        {market.stocks.map((stock) => {
          const owned = player.inventory.find(i => i.itemId === stock.id)?.quantity ?? 0;
          const change = stock.changePercent ?? 0;
          const changeColor = change > 0 ? '#00ff88' : change < 0 ? '#ff6b6b' : '#888';
          const changeArrow = change > 0 ? '▲' : change < 0 ? '▼' : '–';
          const hasNews = !!stock.newsEvent;

          return (
            <div key={stock.id} style={{
              ...styles.stockRow,
              ...(hasNews ? styles.stockRowNews : {}),
            }}>
              <div style={styles.stockInfo}>
                <div>
                  <div style={styles.stockNameRow}>
                    <span style={styles.stockName}>{stock.name}</span>
                    <span style={styles.stockId}>({stock.id})</span>
                    {hasNews && <span style={styles.newsBadge}>NEWS</span>}
                  </div>
                  <div style={styles.volatilityRow}>
                    <span style={styles.volatility}>±{Math.round(stock.volatility * 100)}% vol</span>
                    {owned > 0 && <span style={styles.owned}>Held: {owned}</span>}
                  </div>
                </div>
                <div style={styles.priceBlock}>
                  <span style={styles.stockPrice}>${stock.price.toLocaleString()}</span>
                  <span style={{ ...styles.changePercent, color: changeColor }}>
                    {changeArrow} {Math.abs(change)}%
                  </span>
                </div>
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
  container: { maxWidth: 820, margin: '0 auto', padding: '24px 20px', fontFamily: 'monospace' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, background: '#1a1a2e', padding: '16px 20px', borderRadius: 8, border: '1px solid #333' },
  location: { color: '#00ff88', fontSize: 18, fontWeight: 'bold' },
  turn: { color: '#666', fontSize: 13, marginTop: 4 },
  lastTurnBadge: { color: '#ff9900', fontWeight: 'bold' },
  stats: { display: 'flex', gap: 20 },
  cash: { color: '#ffd700', fontSize: 16, fontWeight: 'bold' },
  health: { color: '#ff6b6b', fontSize: 16, fontWeight: 'bold' },
  progressSection: { background: '#0a0a1a', border: '1px solid #222', borderRadius: 8, padding: '12px 16px', marginBottom: 16 },
  progressRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { color: '#888', fontSize: 12 },
  progressTrack: { height: 8, background: '#1a1a2e', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #00ff88, #4a4aff)', borderRadius: 4, transition: 'width 0.3s' },
  newsSection: { background: '#1a1200', border: '1px solid #443300', borderRadius: 8, padding: '12px 16px', marginBottom: 16 },
  newsTitle: { color: '#ffd700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, fontWeight: 'bold' },
  newsItem: { fontSize: 13, marginBottom: 4, fontWeight: 'bold' },
  portfolio: { background: '#0d2010', border: '1px solid #1a4a20', borderRadius: 8, padding: '12px 16px', marginBottom: 16 },
  portfolioItems: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 },
  portfolioItem: { background: '#1a3a20', color: '#00ff88', padding: '4px 10px', borderRadius: 4, fontSize: 13 },
  sectionTitle: { color: '#aaa', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  stockList: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  stockRow: { background: '#1a1a2e', border: '1px solid #2a2a4e', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  stockRowNews: { border: '1px solid #554400', background: '#1a1600' },
  stockInfo: { display: 'flex', alignItems: 'center', gap: 20, flex: 1 },
  stockNameRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  stockName: { color: '#fff', fontWeight: 'bold' },
  stockId: { color: '#666', fontSize: 12 },
  newsBadge: { background: '#ffd700', color: '#000', fontSize: 10, fontWeight: 'bold', padding: '1px 6px', borderRadius: 3, letterSpacing: 1 },
  volatilityRow: { display: 'flex', gap: 12 },
  volatility: { color: '#888', fontSize: 12 },
  owned: { color: '#00ff88', fontSize: 12, background: '#0d2010', padding: '1px 6px', borderRadius: 4 },
  priceBlock: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 80 },
  stockPrice: { color: '#ffd700', fontWeight: 'bold', fontSize: 16 },
  changePercent: { fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  actions: { display: 'flex', alignItems: 'center', gap: 8 },
  qtyInput: { width: 60, padding: '6px 8px', background: '#0d0d1a', border: '1px solid #444', borderRadius: 6, color: '#fff', textAlign: 'center', fontFamily: 'monospace' },
  buyBtn: { padding: '6px 16px', background: '#00ff88', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' },
  sellBtn: { padding: '6px 16px', background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' },
  btnDisabled: { background: '#333', color: '#666', cursor: 'not-allowed' },
  travelBtn: { width: '100%', padding: 14, background: '#4a4aff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace' },
};
