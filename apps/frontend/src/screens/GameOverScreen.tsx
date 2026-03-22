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

  // Calculate final net worth if we have market data
  let portfolioValue = player?.cash ?? 0;
  if (player && ctx.currentMarket) {
    for (const inv of player.inventory) {
      const stock = ctx.currentMarket.stocks.find(s => s.id === inv.itemId);
      if (stock && inv.quantity > 0) {
        portfolioValue += stock.price * inv.quantity;
      }
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.icon}>{isWin ? '🏆' : '💀'}</div>
      <h1 style={{ ...styles.title, color: isWin ? '#ffd700' : '#ff4444' }}>
        {isWin ? 'VICTORY!' : 'GAME OVER'}
      </h1>
      <p style={{ ...styles.subtitle, color: isWin ? '#00ff88' : '#ff6b6b' }}>
        {isWin
          ? `You reached the $${targetCash.toLocaleString()} target!`
          : player?.health === 0
            ? 'You were eliminated in the streets.'
            : `You ran out of time. Goal was $${targetCash.toLocaleString()}.`}
      </p>

      {player && (
        <div style={styles.stats}>
          <div style={styles.stat}>👤 {player.name} ({player.loadout})</div>
          <div style={styles.stat}>🏁 Survived {ctx.turnNumber} / {ctx.maxTurns ?? 15} turns</div>
          <div style={styles.stat}>💰 Final cash: ${player.cash.toLocaleString()}</div>
          {portfolioValue !== player.cash && (
            <div style={styles.stat}>📦 Net worth (incl. stocks): ${portfolioValue.toLocaleString()}</div>
          )}
          <div style={{ ...styles.stat, color: portfolioValue >= targetCash ? '#00ff88' : '#ff6b6b' }}>
            🎯 Goal: ${targetCash.toLocaleString()} — {portfolioValue >= targetCash ? '✓ ACHIEVED' : `${Math.round((portfolioValue / targetCash) * 100)}% reached`}
          </div>
          <div style={styles.stat}>📍 Last location: {ctx.currentMarket?.locationName ?? player.location}</div>
        </div>
      )}

      <div style={styles.logBox}>
        <div style={styles.logTitle}>Recent Events</div>
        <div style={styles.logEntries}>
          {log.slice(-15).reverse().map((entry, i) => (
            <div key={i} style={styles.logEntry}>{entry}</div>
          ))}
        </div>
      </div>

      <button style={{ ...styles.btn, background: isWin ? '#ffd700' : '#4a4aff', color: isWin ? '#000' : '#fff' }} onClick={onRestart}>
        🔄 Play Again
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 600, margin: '0 auto', padding: '40px 20px', fontFamily: 'monospace', textAlign: 'center' },
  icon: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 36, letterSpacing: 6, marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  stats: { background: '#1a1a2e', border: '1px solid #333', borderRadius: 10, padding: '20px 24px', marginBottom: 24, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 },
  stat: { color: '#ccc', fontSize: 15 },
  logBox: { background: '#0d0d1a', border: '1px solid #222', borderRadius: 8, padding: '16px', marginBottom: 28, textAlign: 'left', maxHeight: 200, overflowY: 'auto' },
  logTitle: { color: '#555', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  logEntries: { display: 'flex', flexDirection: 'column', gap: 6 },
  logEntry: { color: '#666', fontSize: 12 },
  btn: { padding: '14px 48px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace' },
};
