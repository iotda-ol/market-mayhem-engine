import type { EncounterChoice, GameContext } from '../api/types';

interface Props {
  ctx: GameContext;
  onResolve: (choice: EncounterChoice) => void;
  loading: boolean;
}

const CHOICES: { key: EncounterChoice; label: string; emoji: string; desc: string; color: string }[] = [
  { key: 'pay', label: 'Pay', emoji: '💸', desc: 'Lose 20–40% cash. Safe but costly.', color: '#ffd700' },
  { key: 'run', label: 'Run', emoji: '🏃', desc: '60% escape chance (+30% with Speed Boots). Teleport if successful.', color: '#00ff88' },
  { key: 'fight', label: 'Fight', emoji: '⚔️', desc: '50% win (+20% with Body Armor). Win = $100–600. Lose = 10–40 damage.', color: '#ff6b6b' },
];

export function EncounterScreen({ ctx, onResolve, loading }: Props) {
  const player = ctx.player!;
  const hasSpeedBoots = player.inventory.some(i => i.itemId === 'speedboots' && i.quantity > 0);
  const hasBodyArmor = player.inventory.some(i => i.itemId === 'bodyarmor' && i.quantity > 0);

  return (
    <div style={styles.container}>
      <div style={styles.alert}>⚠️ ENCOUNTER!</div>
      <h2 style={styles.title}>You've been stopped by Gangs or Cops!</h2>

      <div style={styles.bonuses}>
        {hasSpeedBoots && <span style={styles.bonus}>👟 Speed Boots: +30% run chance</span>}
        {hasBodyArmor && <span style={styles.bonus}>🛡️ Body Armor: +20% fight chance, -20% damage</span>}
      </div>

      <div style={styles.choices}>
        {CHOICES.map(c => (
          <button
            key={c.key}
            style={{ ...styles.choiceBtn, borderColor: c.color }}
            onClick={() => onResolve(c.key)}
            disabled={loading}
          >
            <span style={styles.choiceEmoji}>{c.emoji}</span>
            <span style={{ ...styles.choiceLabel, color: c.color }}>{c.label}</span>
            <span style={styles.choiceDesc}>{c.desc}</span>
          </button>
        ))}
      </div>

      <div style={styles.playerInfo}>
        ❤️ {player.health} HP &nbsp;|&nbsp; 💰 ${player.cash.toLocaleString()}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 600, margin: '0 auto', padding: '40px 20px', fontFamily: 'monospace', textAlign: 'center' },
  alert: { color: '#ff4444', fontSize: 20, fontWeight: 'bold', letterSpacing: 4, marginBottom: 12 },
  title: { color: '#fff', fontSize: 20, marginBottom: 16 },
  bonuses: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 28 },
  bonus: { background: '#1a2a1a', color: '#00ff88', padding: '4px 12px', borderRadius: 4, fontSize: 13 },
  choices: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 },
  choiceBtn: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, padding: '18px 24px', background: '#1a1a2e', border: '2px solid #333', borderRadius: 10, cursor: 'pointer', fontFamily: 'monospace', textAlign: 'left', transition: 'background 0.15s' },
  choiceEmoji: { fontSize: 28 },
  choiceLabel: { fontSize: 18, fontWeight: 'bold' },
  choiceDesc: { color: '#aaa', fontSize: 13 },
  playerInfo: { color: '#888', fontSize: 14 },
};
