import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { timeAgo } from '../utils/timeAgo';

export default function ChatBubble({ message, mine }) {
  const isImage = message.type === 'image';

  return (
    <View style={[styles.wrap, mine ? styles.mineWrap : styles.theirWrap]}>
      <View style={[styles.bubble, mine ? styles.mine : styles.their, isImage && styles.imageBubble]}>
        {isImage ? (
          <Image source={{ uri: message.mediaUrl }} style={styles.image} />
        ) : (
          <Text style={[styles.text, mine ? styles.mineText : styles.theirText]}>{message.text}</Text>
        )}
      </View>
      <Text style={[styles.time, mine && styles.mineTime]}>
        {timeAgo(message.createdAt)}
        {mine && (message.sending ? ' - sending...' : message.seen ? ' - seen' : ' - sent')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginVertical: 7,
    maxWidth: '78%',
  },
  mineWrap: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirWrap: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  imageBubble: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 12,
  },
  image: {
    borderRadius: 8,
    height: 180,
    width: 240,
  },
  mine: {
    backgroundColor: colors.ink,
    borderBottomRightRadius: 6,
  },
  their: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  mineText: {
    color: colors.card,
  },
  theirText: {
    color: colors.ink,
  },
  time: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  mineTime: {
    textAlign: 'right',
  },
});
