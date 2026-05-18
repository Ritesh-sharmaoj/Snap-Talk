import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export default function SnapLogo({ compact = false }) {
  return (
    <View style={styles.wrap}>
      <LinearGradient colors={[colors.mint, colors.coral]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mark}>
        <Text style={styles.markText}>S</Text>
      </LinearGradient>
      {!compact && (
        <View>
          <Text style={styles.name}>Snap Talk</Text>
          <Text style={styles.sub}>share the moment</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  mark: {
    alignItems: 'center',
    borderRadius: 15,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  markText: {
    color: colors.card,
    fontSize: 23,
    fontWeight: '900',
  },
  name: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 0,
  },
  sub: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: -2,
    textTransform: 'uppercase',
  },
});
