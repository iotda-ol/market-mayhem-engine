import type { GameContext } from '../api/types';

const ALL_LOCATIONS = [
  { id: 'downtown', name: 'Downtown' },
  { id: 'harbor', name: 'Harbor District' },
  { id: 'eastside', name: 'East Side' },
  { id: 'westend', name: 'West End' },
  { id: 'suburbs', name: 'Suburbs' },
  { id: 'industrial', name: 'Industrial Zone' },
];

interface Props {
  ctx: GameContext;
  onTravel: (destinationId: string) => void;
  loading: boolean;
}

export function TravelScreen({ ctx, onTravel, loading }: Props) {
  const currentLoc = ctx.player?.location;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚗 Where to?</h2>
      <p style={styles.warning}>⚠️ 40% chance of encounter when traveling</p>

      <div style={styles.grid}>
        {ALL_LOCATIONS.map(loc => {
          const isCurrent = loc.id === currentLoc;
          return (
            <button
              key={loc.id}
              style={{
                ...styles.locBtn,
                ...(isCurrent ? styles.current : {}),
              }}
              onClick={() => !isCurrent && onTravel(loc.id)}
              disabled={loading || isCurrent}
            >
              {isCurrent ? '📍 Here' : '🏙️'} {loc.name}
              {isCurrent && <div style={styles.currentLabel}>Current Location</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 600, margin: '0 auto', padding: '40px 20px', fontFamily: 'monospace' },
  title: { color: '#fff', fontSize: 26, marginBottom: 8 },
  warning: { color: '#ff9900', fontSize: 13, marginBottom: 28 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  locBtn: { padding: '20px 16px', background: '#1a1a2e', border: '2px solid #333', borderRadius: 8, color: '#fff', fontSize: 15, cursor: 'pointer', fontFamily: 'monospace', textAlign: 'left', transition: 'border-color 0.2s' },
  current: { borderColor: '#00ff88', color: '#00ff88', cursor: 'default' },
  currentLabel: { fontSize: 11, color: '#00ff88', marginTop: 6 },
};
