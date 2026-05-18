import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export default function Avatar({ user, size = 44, ring = false }) {
  const initials = (user?.fullName || user?.username || 'ST')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <LinearGradient
      colors={ring ? [colors.mint, colors.coral, colors.saffron] : ['transparent', 'transparent']}
      style={[styles.ring, { height: size + (ring ? 6 : 0), width: size + (ring ? 6 : 0), borderRadius: size }]}
    >
      <View style={[styles.avatar, { height: size, width: size, borderRadius: size / 2 }]}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={StyleSheet.absoluteFillObject} />
        ) : (
          <Text style={[styles.initials, { fontSize: Math.max(12, size * 0.35) }]}>{initials}</Text>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderColor: colors.card,
    borderWidth: 2,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: colors.card,
    fontWeight: '900',
  },
});
