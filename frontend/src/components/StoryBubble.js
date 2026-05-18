import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import Avatar from './Avatar';

export default function StoryBubble({ story, onPress }) {
  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      <Avatar user={story.author} size={62} ring />
      <Text numberOfLines={1} style={styles.name}>
        {story.author.username}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginRight: 14,
    width: 76,
  },
  name: {
    color: colors.inkSoft,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
});
