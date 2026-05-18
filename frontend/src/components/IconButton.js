import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function IconButton({ name, onPress, color = colors.ink, bg = colors.card, size = 42 }) {
  return (
    <Pressable style={[styles.button, { backgroundColor: bg, height: size, width: size, borderRadius: size / 2 }]} onPress={onPress}>
      <Feather name={name} size={20} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderColor: colors.line,
    borderWidth: 1,
    justifyContent: 'center',
  },
});
