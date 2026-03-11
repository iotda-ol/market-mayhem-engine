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

  // Stocks that have news events or significant changes
  const notableStocks = market?.stocks.filter(
    s => s.newsEvent || Math.abs(s.changePercent ?? 0) >= 10
  ) ?? [];

  return (
    <div style={styles.container}>
      <div style={styles.icon}>📊</div>
      <h2 style={styles.title}>Market Update</h2>
      <p style={styles.desc}>Prices are fluctuating across all locations...</p>
      <div style={styles.turn}>
        {isLastTurn
          ? <span style={{ color: '#ff9900' }}>⚠️ Starting FINAL Turn {nextTurn} / {maxTurns}</span>
          : `Starting Turn ${nextTurn} / ${maxTurns}`}
      </div>

      {notableStocks.length > 0 && (
        <div style={styles.changesBox}>
          <div style={styles.changesTitle}>Price Movements</div>
          {notableStocks.map(stock => {
            const change = stock.changePercent ?? 0;
            const color = change > 0 ? '#00ff88' : change < 0 ? '#ff6b6b' : '#888';
            const arrow = change > 0 ? '▲' : change < 0 ? '▼' : '–';
            return (
              <div key={stock.id} style={styles.changeRow}>
                <span style={styles.changeName}>{stock.name}</span>
                {stock.newsEvent && (
                  <span style={styles.newsTag}>📰</span>
                )}
                <span style={{ ...styles.changeVal, color }}>
                  {arrow} {Math.abs(change)}%
                </span>
                <span style={styles.changePrice}>${stock.price.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}

      {isLastTurn && (
        <div style={styles.finalWarning}>
          💡 This is your last turn — sell your stocks to maximize your net worth!
        </div>
      )}

      <button style={styles.btn} onClick={onContinue} disabled={loading}>
        {loading ? 'Updating...' : '→ Apply Market Update'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 560, margin: '40px auto', padding: '40px 20px', fontFamily: 'monospace', textAlign: 'center' },
  icon: { fontSize: 60, marginBottom: 16 },
  title: { color: '#fff', fontSize: 26, marginBottom: 12 },
  desc: { color: '#888', marginBottom: 8 },
  turn: { color: '#00ff88', fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
  changesBox: { background: '#0d0d1a', border: '1px solid #222', borderRadius: 8, padding: 16, marginBottom: 20, textAlign: 'left' },
  changesTitle: { color: '#555', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  changeRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  changeName: { color: '#ccc', fontSize: 13, flex: 1 },
  newsTag: { fontSize: 12 },
  changeVal: { fontSize: 13, fontWeight: 'bold', minWidth: 50, textAlign: 'right' },
  changePrice: { color: '#ffd700', fontSize: 13, minWidth: 70, textAlign: 'right' },
  finalWarning: { background: '#1a0d00', border: '1px solid #553300', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#ff9900', fontSize: 13 },
  btn: { padding: '14px 48px', background: '#00ff88', color: '#000', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace' },
};
