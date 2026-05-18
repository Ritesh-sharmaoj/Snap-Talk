import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function LoadingOverlay({ text = 'Loading Snap Talk...' }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.mintDark} size="large" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
  },
});
