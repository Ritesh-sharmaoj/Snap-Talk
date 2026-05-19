import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export default function Avatar({ user, size = 44, ring = false, showStatus = false }) {
  const initials = (user?.fullName || user?.username || 'ST')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View>
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
      {showStatus && user?.online && (
        <View
          style={[
            styles.status,
            {
              bottom: size * 0.05,
              right: size * 0.05,
              height: Math.max(10, size * 0.25),
              width: Math.max(10, size * 0.25),
              borderRadius: size * 0.15,
            },
          ]}
        />
      )}
    </View>
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
  status: {
    backgroundColor: colors.success,
    borderColor: colors.card,
    borderWidth: 2,
    position: 'absolute',
  },
});
