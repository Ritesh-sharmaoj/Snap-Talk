import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export default function AppButton({ label, onPress, loading, variant = 'primary', icon, style }) {
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';
  const gradient = isDanger ? [colors.danger, colors.coral] : [colors.ink, colors.mintDark];

  if (isGhost) {
    return (
      <Pressable style={[styles.ghost, style]} onPress={onPress} disabled={loading}>
        {icon}
        <Text style={styles.ghostText}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={loading} style={[styles.pressable, style]}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        {loading ? <ActivityIndicator color={colors.card} /> : icon}
        {!loading && <Text style={styles.text}>{label}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    height: 54,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  text: {
    color: colors.card,
    fontSize: 15,
    fontWeight: '800',
  },
  ghost: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  ghostText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
});
