import { useState } from 'react';
import type { LoadoutKey } from '../api/types';

const LOADOUTS: { key: LoadoutKey; name: string; cash: number; health: number; desc: string }[] = [
  { key: 'MERCHANT', name: 'Merchant', cash: 2000, health: 80, desc: 'High cash, low health. Best for trading.' },
  { key: 'STREET_FIGHTER', name: 'Street Fighter', cash: 1000, health: 120, desc: 'Low cash, high health. Win your way through encounters.' },
  { key: 'RUNNER', name: 'Runner', cash: 1500, health: 100, desc: 'Balanced. Great escape odds with Speed Boots.' },
];

interface Props {
  onJoin: (name: string, loadout: LoadoutKey) => void;
  loading: boolean;
}

export function LobbyScreen({ onJoin, loading }: Props) {
  const [name, setName] = useState('');
  const [selectedLoadout, setSelectedLoadout] = useState<LoadoutKey>('MERCHANT');

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📈 Market Mayhem</h1>
      <p style={styles.subtitle}>Trade stocks. Survive encounters. Build your empire.</p>

      <div style={styles.card}>
        <label style={styles.label}>Your Name</label>
        <input
          style={styles.input}
          placeholder="Enter your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
        />
      </div>

      <div style={styles.card}>
        <label style={styles.label}>Choose Loadout</label>
        <div style={styles.loadoutGrid}>
          {LOADOUTS.map((l) => (
            <div
              key={l.key}
              style={{
                ...styles.loadoutCard,
                ...(selectedLoadout === l.key ? styles.loadoutSelected : {}),
              }}
              onClick={() => setSelectedLoadout(l.key)}
            >
              <div style={styles.loadoutName}>{l.name}</div>
              <div style={styles.loadoutStat}>💰 ${l.cash.toLocaleString()}</div>
              <div style={styles.loadoutStat}>❤️ {l.health} HP</div>
              <div style={styles.loadoutDesc}>{l.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        style={{
          ...styles.button,
          ...(loading || !name.trim() ? styles.buttonDisabled : {}),
        }}
        onClick={() => name.trim() && onJoin(name.trim(), selectedLoadout)}
        disabled={loading || !name.trim()}
      >
        {loading ? 'Starting...' : '▶ Enter the Market'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 700, margin: '0 auto', padding: '40px 20px', fontFamily: 'monospace' },
  title: { textAlign: 'center', fontSize: 36, color: '#00ff88', margin: '0 0 8px' },
  subtitle: { textAlign: 'center', color: '#888', marginBottom: 32 },
  card: { background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, padding: 20, marginBottom: 20 },
  label: { display: 'block', color: '#aaa', marginBottom: 8, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  input: { width: '100%', padding: '10px 14px', background: '#0d0d1a', border: '1px solid #444', borderRadius: 6, color: '#fff', fontSize: 16, boxSizing: 'border-box' },
  loadoutGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  loadoutCard: { background: '#0d0d1a', border: '2px solid #333', borderRadius: 8, padding: 16, cursor: 'pointer', transition: 'border-color 0.2s' },
  loadoutSelected: { borderColor: '#00ff88' },
  loadoutName: { color: '#fff', fontWeight: 'bold', marginBottom: 8, fontSize: 15 },
  loadoutStat: { color: '#aaa', fontSize: 13, marginBottom: 4 },
  loadoutDesc: { color: '#666', fontSize: 12, marginTop: 8 },
  button: { width: '100%', padding: '14px 0', background: '#00ff88', color: '#000', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace' },
  buttonDisabled: { background: '#333', color: '#666', cursor: 'not-allowed' },
};
