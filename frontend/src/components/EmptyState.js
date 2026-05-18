import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function EmptyState({ icon = 'inbox', title, text }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Feather name={icon} size={24} color={colors.mintDark} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    padding: 30,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: '#E6FBF5',
    borderRadius: 22,
    height: 52,
    justifyContent: 'center',
    marginBottom: 14,
    width: 52,
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  text: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
});
