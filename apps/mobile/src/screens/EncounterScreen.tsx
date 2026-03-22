import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { EncounterChoice, GameContext } from '../api/types';

const CHOICES: {
  key: EncounterChoice;
  label: string;
  emoji: string;
  desc: string;
  color: string;
}[] = [
  {
    key: 'pay',
    label: 'Pay',
    emoji: '💸',
    desc: 'Lose 20–40% cash. Safe but costly.',
    color: '#ffd700',
  },
  {
    key: 'run',
    label: 'Run',
    emoji: '🏃',
    desc: '60% escape chance (+30% with Speed Boots). Teleport if successful.',
    color: '#00ff88',
  },
  {
    key: 'fight',
    label: 'Fight',
    emoji: '⚔️',
    desc: '50% win (+20% with Body Armor). Win = $100–600. Lose = 10–40 damage.',
    color: '#ff6b6b',
  },
];

interface Props {
  ctx: GameContext;
  onResolve: (choice: EncounterChoice) => void;
  loading: boolean;
}

export function EncounterScreen({ ctx, onResolve, loading }: Props) {
  const player = ctx.player!;
  const hasSpeedBoots = player.inventory.some(
    (i) => i.itemId === 'speedboots' && i.quantity > 0
  );
  const hasBodyArmor = player.inventory.some(
    (i) => i.itemId === 'bodyarmor' && i.quantity > 0
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.alert}>⚠️ ENCOUNTER!</Text>
      <Text style={styles.title}>You've been stopped by Gangs or Cops!</Text>

      {(hasSpeedBoots || hasBodyArmor) && (
        <View style={styles.bonuses}>
          {hasSpeedBoots && (
            <View style={styles.bonus}>
              <Text style={styles.bonusText}>👟 Speed Boots: +30% run chance</Text>
            </View>
          )}
          {hasBodyArmor && (
            <View style={styles.bonus}>
              <Text style={styles.bonusText}>🛡️ Body Armor: +20% fight chance, -20% damage</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.choices}>
        {CHOICES.map((c) => (
          <TouchableOpacity
            key={c.key}
            style={[styles.choiceBtn, { borderColor: c.color }]}
            onPress={() => onResolve(c.key)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.choiceEmoji}>{c.emoji}</Text>
            <Text style={[styles.choiceLabel, { color: c.color }]}>{c.label}</Text>
            <Text style={styles.choiceDesc}>{c.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.playerInfo}>
        ❤️ {player.health} HP  |  💰 ${player.cash.toLocaleString()}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0d0d1a' },
  container: { padding: 20, paddingBottom: 40, alignItems: 'center' },
  alert: {
    color: '#ff4444',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 12,
    fontFamily: 'monospace' as const,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'monospace' as const,
  },
  bonuses: { width: '100%', gap: 8, marginBottom: 24 },
  bonus: {
    backgroundColor: '#1a2a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  bonusText: { color: '#00ff88', fontSize: 13, fontFamily: 'monospace' as const },
  choices: { width: '100%', gap: 14, marginBottom: 24 },
  choiceBtn: {
    width: '100%',
    padding: 18,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 10,
    gap: 4,
  },
  choiceEmoji: { fontSize: 28 },
  choiceLabel: { fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace' as const },
  choiceDesc: { color: '#aaa', fontSize: 12, fontFamily: 'monospace' as const },
  playerInfo: { color: '#888', fontSize: 14, fontFamily: 'monospace' as const },
});
