import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>🚗 Where to?</Text>
      <Text style={styles.warning}>⚠️ 30% chance of encounter when traveling</Text>

      <View style={styles.grid}>
        {ALL_LOCATIONS.map((loc) => {
          const isCurrent = loc.id === currentLoc;
          return (
            <TouchableOpacity
              key={loc.id}
              style={[styles.locBtn, isCurrent && styles.current]}
              onPress={() => !isCurrent && onTravel(loc.id)}
              disabled={loading || isCurrent}
              activeOpacity={0.7}
            >
              <Text style={[styles.locBtnText, isCurrent && styles.currentText]}>
                {isCurrent ? '📍 Here' : '🏙️'} {loc.name}
              </Text>
              {isCurrent && <Text style={styles.currentLabel}>Current Location</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0d0d1a' },
  container: { padding: 20, paddingBottom: 40 },
  title: { color: '#fff', fontSize: 24, marginBottom: 8, fontFamily: 'monospace' as const, fontWeight: 'bold' },
  warning: { color: '#ff9900', fontSize: 13, marginBottom: 24, fontFamily: 'monospace' as const },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  locBtn: {
    width: '47%',
    padding: 20,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 8,
  },
  current: { borderColor: '#00ff88' },
  locBtnText: { color: '#fff', fontSize: 14, fontFamily: 'monospace' as const },
  currentText: { color: '#00ff88' },
  currentLabel: { fontSize: 11, color: '#00ff88', marginTop: 6, fontFamily: 'monospace' as const },
});
