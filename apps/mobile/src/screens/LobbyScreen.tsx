import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { LoadoutKey } from '../api/types';

const LOADOUTS: {
  key: LoadoutKey;
  name: string;
  cash: number;
  health: number;
  desc: string;
  emoji: string;
}[] = [
  {
    key: 'MERCHANT',
    name: 'Merchant',
    cash: 2000,
    health: 80,
    desc: 'High cash, low health. Best for pure trading strategies.',
    emoji: '💼',
  },
  {
    key: 'STREET_FIGHTER',
    name: 'Street Fighter',
    cash: 1000,
    health: 120,
    desc: 'Low cash, high health. Win encounters for extra cash.',
    emoji: '🥊',
  },
  {
    key: 'RUNNER',
    name: 'Runner',
    cash: 1500,
    health: 100,
    desc: 'Balanced. +30% escape chance with Speed Boots.',
    emoji: '👟',
  },
];

interface Props {
  onJoin: (name: string, loadout: LoadoutKey) => void;
  loading: boolean;
}

export function LobbyScreen({ onJoin, loading }: Props) {
  const [name, setName] = useState('');
  const [selectedLoadout, setSelectedLoadout] = useState<LoadoutKey>('MERCHANT');

  const canSubmit = !loading && name.trim().length > 0;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>📈 Market Mayhem</Text>
      <Text style={styles.subtitle}>Trade stocks. Survive encounters. Build your empire.</Text>

      <View style={styles.goalBanner}>
        <Text style={styles.goalTitle}>🎯 OBJECTIVE</Text>
        <Text style={styles.goalText}>
          Reach <Text style={styles.gold}>$5,000 net worth</Text> in{' '}
          <Text style={styles.green}>15 turns</Text>
        </Text>
        <Text style={styles.goalHint}>
          Buy low, sell high. Watch out for news events and encounters!
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name..."
          placeholderTextColor="#555"
          value={name}
          onChangeText={setName}
          maxLength={30}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Choose Loadout</Text>
        <View style={styles.loadoutGrid}>
          {LOADOUTS.map((l) => (
            <TouchableOpacity
              key={l.key}
              style={[styles.loadoutCard, selectedLoadout === l.key && styles.loadoutSelected]}
              onPress={() => setSelectedLoadout(l.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.loadoutEmoji}>{l.emoji}</Text>
              <Text style={styles.loadoutName}>{l.name}</Text>
              <Text style={styles.loadoutStat}>💰 ${l.cash.toLocaleString()}</Text>
              <Text style={styles.loadoutStat}>❤️ {l.health} HP</Text>
              <Text style={styles.loadoutDesc}>{l.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        onPress={() => canSubmit && onJoin(name.trim(), selectedLoadout)}
        disabled={!canSubmit}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, !canSubmit && styles.buttonTextDisabled]}>
          {loading ? 'Starting...' : '▶ Enter the Market'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0d0d1a' },
  container: { padding: 20, paddingBottom: 40 },
  title: {
    textAlign: 'center',
    fontSize: 32,
    color: '#00ff88',
    fontFamily: 'monospace' as const,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: { textAlign: 'center', color: '#888', fontFamily: 'monospace' as const, marginBottom: 24 },
  goalBanner: {
    backgroundColor: '#0a1a0a',
    borderWidth: 1,
    borderColor: '#1a4a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  goalTitle: {
    color: '#00ff88',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
    fontFamily: 'monospace' as const,
  },
  goalText: { color: '#fff', fontSize: 15, marginBottom: 8, fontFamily: 'monospace' as const, textAlign: 'center' },
  gold: { color: '#ffd700', fontWeight: 'bold' },
  green: { color: '#00ff88', fontWeight: 'bold' },
  goalHint: { color: '#666', fontSize: 12, fontFamily: 'monospace' as const, textAlign: 'center' },
  card: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    color: '#aaa',
    marginBottom: 8,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'monospace' as const,
  },
  input: {
    width: '100%',
    padding: 12,
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 6,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'monospace' as const,
  },
  loadoutGrid: { flexDirection: 'row', gap: 10 },
  loadoutCard: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  loadoutSelected: { borderColor: '#00ff88' },
  loadoutEmoji: { fontSize: 24, marginBottom: 6 },
  loadoutName: { color: '#fff', fontWeight: 'bold', marginBottom: 6, fontSize: 13, fontFamily: 'monospace' as const, textAlign: 'center' },
  loadoutStat: { color: '#aaa', fontSize: 11, fontFamily: 'monospace' as const, marginBottom: 2 },
  loadoutDesc: { color: '#666', fontSize: 10, marginTop: 6, fontFamily: 'monospace' as const, textAlign: 'center' },
  button: {
    width: '100%',
    padding: 16,
    backgroundColor: '#00ff88',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#333' },
  buttonText: { color: '#000', fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace' as const },
  buttonTextDisabled: { color: '#666' },
});
