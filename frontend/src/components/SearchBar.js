import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function SearchBar({ value, onChangeText, placeholder = 'Search Snap Talk' }) {
  return (
    <View style={styles.search}>
      <Feather name="search" size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 52,
    paddingHorizontal: 14,
  },
  input: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
});
