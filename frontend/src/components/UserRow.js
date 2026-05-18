import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import Avatar from './Avatar';

export default function UserRow({ user, right, onPress }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Avatar user={user} size={48} />
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.name}>
          {user.fullName}
        </Text>
        <Text numberOfLines={1} style={styles.username}>
          @{user.username}
        </Text>
      </View>
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 11,
  },
  meta: {
    flex: 1,
  },
  name: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  username: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
});
