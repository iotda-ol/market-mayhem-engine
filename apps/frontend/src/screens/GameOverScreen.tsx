import type { GameContext } from '../api/types';

interface Props {
  ctx: GameContext;
  log: string[];
  onRestart: () => void;
}

export function GameOverScreen({ ctx, log, onRestart }: Props) {
  const player = ctx.player;

  return (
    <div style={styles.container}>
      <div style={styles.skull}>💀</div>
      <h1 style={styles.title}>GAME OVER</h1>
      {player && (
        <div style={styles.stats}>
          <div style={styles.stat}>👤 {player.name}</div>
          <div style={styles.stat}>🏁 Survived {ctx.turnNumber} turns</div>
          <div style={styles.stat}>💰 Final cash: ${player.cash.toLocaleString()}</div>
          <div style={styles.stat}>📍 Last location: {ctx.currentMarket?.locationName ?? player.location}</div>
        </div>
      )}

      <div style={styles.logBox}>
        <div style={styles.logTitle}>Event Log</div>
        <div style={styles.logEntries}>
          {log.slice(-15).reverse().map((entry, i) => (
            <div key={i} style={styles.logEntry}>{entry}</div>
          ))}
        </div>
      </div>

      <button style={styles.btn} onClick={onRestart}>
        🔄 Play Again
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 600, margin: '0 auto', padding: '40px 20px', fontFamily: 'monospace', textAlign: 'center' },
  skull: { fontSize: 64, marginBottom: 12 },
  title: { color: '#ff4444', fontSize: 36, letterSpacing: 6, marginBottom: 24 },
  stats: { background: '#1a1a2e', border: '1px solid #333', borderRadius: 10, padding: '20px 24px', marginBottom: 24, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 },
  stat: { color: '#ccc', fontSize: 15 },
  logBox: { background: '#0d0d1a', border: '1px solid #222', borderRadius: 8, padding: '16px', marginBottom: 28, textAlign: 'left', maxHeight: 200, overflowY: 'auto' },
  logTitle: { color: '#555', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  logEntries: { display: 'flex', flexDirection: 'column', gap: 6 },
  logEntry: { color: '#666', fontSize: 12 },
  btn: { padding: '14px 48px', background: '#4a4aff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace' },
};
