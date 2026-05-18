import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  round: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
};

export const typography = {
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
  },
  h2: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0,
  },
  h3: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0,
  },
  body: {
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
};

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  shadow: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
});
