import type { GameContext } from '../api/types';

interface Props {
  ctx: GameContext;
  onContinue: () => void;
  loading: boolean;
}

export function MarketUpdateScreen({ ctx, onContinue, loading }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.icon}>📊</div>
      <h2 style={styles.title}>Market Update</h2>
      <p style={styles.desc}>Prices are fluctuating across all locations...</p>
      <div style={styles.turn}>Starting Turn {ctx.turnNumber + 1}</div>
      <button style={styles.btn} onClick={onContinue} disabled={loading}>
        {loading ? 'Updating...' : '→ Apply Market Update'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 500, margin: '80px auto', padding: '40px 20px', fontFamily: 'monospace', textAlign: 'center' },
  icon: { fontSize: 60, marginBottom: 16 },
  title: { color: '#fff', fontSize: 26, marginBottom: 12 },
  desc: { color: '#888', marginBottom: 8 },
  turn: { color: '#00ff88', fontSize: 20, fontWeight: 'bold', marginBottom: 32 },
  btn: { padding: '14px 48px', background: '#00ff88', color: '#000', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace' },
};
