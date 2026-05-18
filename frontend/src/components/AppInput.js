import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function AppInput({ icon, label, error, style, ...props }) {
  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, error && styles.fieldError]}>
        {icon ? <Feather name={icon} size={18} color={colors.muted} /> : null}
        <TextInput
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  field: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  input: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    minHeight: 48,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
});
