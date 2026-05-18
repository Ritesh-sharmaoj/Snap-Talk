import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import IconButton from './IconButton';

export default function ScreenHeader({ title, subtitle, onBack, right }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <View style={styles.side}>{onBack ? <IconButton name="chevron-left" onPress={onBack} /> : null}</View>
      <View style={styles.center}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  side: {
    alignItems: 'flex-start',
    minWidth: 46,
  },
  center: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
});
